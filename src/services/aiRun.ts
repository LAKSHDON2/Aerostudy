/**
 * Fallback chain + local usage accounting.
 *
 * runWithFallback(): try the active provider first; on retryable failures
 * (429 rate-limit, 5xx, network) walk the other configured providers in the
 * saved order. The UI learns which provider actually answered.
 *
 * addUsage(): per-provider, per-day request/character counters in localStorage
 * (`asw:<subject>:ai-usage`) — powers the Settings "usage" view. Local-only,
 * an estimate: real billing lives at the provider.
 */

import { chat, type ChatArgs, type ProviderId } from './ai'
import { getAiSettings, type AiSettings } from './aiSettings'
import { storage } from './storage'

export interface FallbackAttempt {
  provider: ProviderId
  ok: boolean
  /** Short reason on failure (status + message). */
  error?: string
}

export interface FallbackResult {
  text: string
  /** Provider that produced the successful reply. */
  provider: ProviderId
  attempts: FallbackAttempt[]
}

function isRetryable(status: number): boolean {
  return status === 0 || status === 429 || status >= 500
}

/** Providers with everything they need to be called right now. */
export function configuredProviders(settings: AiSettings): ProviderId[] {
  const out: ProviderId[] = []
  for (const id of Object.keys(settings.providers) as ProviderId[]) {
    const cfg = settings.providers[id]
    if (id === 'custom') {
      if (cfg.baseUrl) out.push(id)
    } else if (cfg.key && cfg.model) {
      out.push(id)
    }
  }
  return out
}

/** [active (if configured), then other configured providers in saved order]. */
export function fallbackChain(settings: AiSettings): ProviderId[] {
  const configured = configuredProviders(settings)
  const chain: ProviderId[] = []
  if (configured.includes(settings.activeProvider)) chain.push(settings.activeProvider)
  const order = settings.fallbackOrder ?? []
  for (const id of order) if (configured.includes(id) && !chain.includes(id)) chain.push(id)
  for (const id of configured) if (!chain.includes(id)) chain.push(id)
  return chain
}

/**
 * Run a chat() call with the fallback chain. onProgress is notified before
 * each provider attempt ("trying OpenAI…"). Non-retryable errors on the
 * FIRST provider abort immediately (bad key → fix the key, don't silently
 * burn another provider's quota).
 */
export async function runWithFallback(
  args: ChatArgs,
  onProgress?: (attempt: number, provider: ProviderId, total: number) => void,
): Promise<FallbackResult> {
  const settings = getAiSettings()
  const chain = settings.fallbackEnabled === false ? [settings.activeProvider] : fallbackChain(settings)
  if (chain.length === 0) throw Object.assign(new Error('No provider is fully configured — add a key in AI settings.'), { status: 0 })

  const attempts: FallbackAttempt[] = []
  for (let i = 0; i < chain.length; i++) {
    const provider = chain[i]
    const cfg = settings.providers[provider]
    onProgress?.(i, provider, chain.length)
    try {
      const text = await chat(provider, { ...args, key: cfg.key, model: cfg.model, baseUrl: cfg.baseUrl })
      attempts.push({ provider, ok: true })
      return { text, provider, attempts }
    } catch (e) {
      const status = (e as { status?: number }).status ?? 0
      const msg = e instanceof Error ? e.message : String(e)
      attempts.push({ provider, ok: false, error: `HTTP ${status}: ${msg}`.slice(0, 200) })
      const last = i === chain.length - 1
      if (last || !isRetryable(status)) throw e
    }
  }
  throw Object.assign(new Error('unreachable'), { status: 0 })
}

/* ── Usage accounting ─────────────────────────────────────────────────────── */

export interface DayUsage {
  requests: number
  charsIn: number
  charsOut: number
}

type UsageStore = Record<string, Record<ProviderId, DayUsage>> // 'YYYY-MM-DD' → provider → usage

const FIELD = 'ai-usage'
const MAX_DAYS = 30

function todayKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10)
}

function loadUsage(subjectId: string): UsageStore {
  const raw = storage.load<UsageStore>(subjectId, FIELD, {})
  const out: UsageStore = {}
  for (const [day, providers] of Object.entries(raw)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !providers || typeof providers !== 'object') continue
    const clean: Record<ProviderId, DayUsage> = {} as Record<ProviderId, DayUsage>
    for (const [pid, u] of Object.entries(providers)) {
      if (!u || typeof u !== 'object') continue
      clean[pid as ProviderId] = {
        requests: Number.isFinite(u.requests) ? u.requests : 0,
        charsIn: Number.isFinite(u.charsIn) ? u.charsIn : 0,
        charsOut: Number.isFinite(u.charsOut) ? u.charsOut : 0,
      }
    }
    out[day] = clean
  }
  return out
}

function saveUsage(subjectId: string, usage: UsageStore): void {
  // Keep only the newest MAX_DAYS days.
  const days = Object.keys(usage).sort().reverse().slice(0, MAX_DAYS)
  const trimmed: UsageStore = {}
  for (const d of days) trimmed[d] = usage[d]
  storage.save(subjectId, FIELD, trimmed)
}

/** Record one successful request (chars in ≈ prompt size, out ≈ reply size). */
export function addUsage(subjectId: string, provider: ProviderId, charsIn: number, charsOut: number, now = Date.now()): void {
  if (charsIn <= 0 && charsOut <= 0) return
  const usage = loadUsage(subjectId)
  const day = usage[todayKey(now)] ?? ({} as Record<ProviderId, DayUsage>)
  const u = day[provider] ?? { requests: 0, charsIn: 0, charsOut: 0 }
  u.requests += 1
  u.charsIn += Math.max(0, Math.floor(charsIn))
  u.charsOut += Math.max(0, Math.floor(charsOut))
  day[provider] = u
  usage[todayKey(now)] = day
  saveUsage(subjectId, usage)
}

export interface UsageRow {
  provider: ProviderId
  requests: number
  charsIn: number
  charsOut: number
  /** Rough paid-tier estimate in US cents (free tiers → $0.00). */
  estCostCents: number
}

/** Rough public price list for the estimate view (US$ per 1M tokens in/out). */
const PRICE_PER_MTOK: Partial<Record<ProviderId, [number, number]>> = {
  openai: [0.15, 0.6], // gpt-4o-mini class
  anthropic: [3, 15], // sonnet class
  gemini: [0.1, 0.4], // flash class
  openrouter: [0.2, 0.8], // mixed; many :free models
}

function estimateCents(pid: ProviderId, u: DayUsage): number {
  const price = PRICE_PER_MTOK[pid]
  if (!price) return 0 // custom/local = free
  const tin = (u.charsIn / 4) / 1e6
  const tout = (u.charsOut / 4) / 1e6
  return tin * price[0] * 100 + tout * price[1] * 100
}

/** Aggregated usage rows over the last `days` days, sorted by requests desc. */
export function usageSummary(subjectId: string, days = 7, now = Date.now()): UsageRow[] {
  const usage = loadUsage(subjectId)
  const from = new Date(now - (days - 1) * 86400000).toISOString().slice(0, 10)
  const acc = new Map<ProviderId, DayUsage>()
  for (const [day, providers] of Object.entries(usage)) {
    if (day < from) continue
    for (const [pid, u] of Object.entries(providers)) {
      const p = pid as ProviderId
      const cur = acc.get(p) ?? { requests: 0, charsIn: 0, charsOut: 0 }
      cur.requests += u.requests
      cur.charsIn += u.charsIn
      cur.charsOut += u.charsOut
      acc.set(p, cur)
    }
  }
  return [...acc.entries()]
    .map(([provider, u]) => ({ provider, ...u, estCostCents: estimateCents(provider, u) }))
    .sort((a, b) => b.requests - a.requests)
}
