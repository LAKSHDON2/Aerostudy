/**
 * AI provider adapters — one interface, five providers, straight from the browser.
 *
 * CORS notes (why this works with no backend):
 * - OpenAI + OpenRouter allow browser requests with a Bearer key.
 * - Anthropic requires the `anthropic-dangerous-direct-browser-access` header.
 * - Gemini accepts the key as a query parameter.
 * - `custom` targets any OpenAI-compatible endpoint (e.g. a local gateway that
 *   fronts a Kiro `ksk_` key, or Ollama at http://localhost:11434/v1).
 */

export type ProviderId = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'custom'

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
  /** Data URLs (data:image/…) sent to vision-capable models. */
  images?: string[]
}

export interface ChatArgs {
  system: string
  turns: ChatTurn[]
  model: string
  key: string
  /** Base URL override (required for `custom`). */
  baseUrl?: string
  signal?: AbortSignal
  maxTokens?: number
}

export interface ProviderInfo {
  id: ProviderId
  label: string
  hint: string
  keyUrl?: string
  /** Static starter list; live lists come from listModels(). */
  staticModels: string[]
  defaultModel: string
  needsBaseUrl?: boolean
}

const OPENAI_BASE = 'https://api.openai.com/v1'
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const ANTHROPIC_BASE = 'https://api.anthropic.com/v1'
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    hint: 'Works directly from the browser with a Bearer key.',
    keyUrl: 'https://platform.openai.com/api-keys',
    staticModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'],
    defaultModel: 'gpt-4o-mini',
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    hint: 'Sent with the browser-access header — no proxy needed.',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    staticModels: ['claude-sonnet-4-5', 'claude-haiku-4-5', 'claude-3-5-haiku-latest'],
    defaultModel: 'claude-sonnet-4-5',
  },
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    hint: 'Google AI Studio keys have a free tier — great for students.',
    keyUrl: 'https://aistudio.google.com/apikey',
    staticModels: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
    defaultModel: 'gemini-2.5-flash',
  },
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    hint: 'One key, hundreds of models — including free ones (:free).',
    keyUrl: 'https://openrouter.ai/settings/keys',
    staticModels: ['openrouter/auto'],
    defaultModel: 'openrouter/auto',
  },
  custom: {
    id: 'custom',
    label: 'Custom (OpenAI-compatible)',
    hint:
      'Any OpenAI-compatible base URL. For a Kiro (ksk_) key, run a local gateway such as ' +
      'kiro-gateway or AIClient2API and use its http://localhost:<port>/v1 URL. ' +
      'Also works with Ollama / LM Studio for fully local models.',
    staticModels: [],
    defaultModel: '',
    needsBaseUrl: true,
  },
}

/** Typed error carrying the HTTP status so friendlyError() can translate. */
export class AiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function httpError(res: Response): Promise<never> {
  let detail = ''
  try {
    const body = await res.json()
    detail = body?.error?.message ?? body?.message ?? ''
  } catch {
    try { detail = await res.text() } catch { /* ignore */ }
  }
  throw new AiError(res.status, detail || `HTTP ${res.status}`)
}

/** Merge consecutive same-role turns (Anthropic/Gemini require alternation). */
function mergeTurns(turns: ChatTurn[]): ChatTurn[] {
  const out: ChatTurn[] = []
  for (const t of turns) {
    const last = out[out.length - 1]
    if (last && last.role === t.role) last.content += '\n\n' + t.content
    else out.push({ ...t })
  }
  if (out[0]?.role === 'assistant') out.unshift({ role: 'user', content: '(continue)' })
  return out
}

function splitDataUrl(dataUrl: string): { mime: string; data: string } {
  const m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl)
  if (!m) throw new AiError(0, 'Invalid image data URL')
  return { mime: m[1], data: m[2] }
}

/* ── OpenAI-compatible (OpenAI, OpenRouter, custom gateways) ─────────────── */

async function chatOpenAICompatible(args: ChatArgs, base: string): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (args.key) headers.Authorization = `Bearer ${args.key}`
  const res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers,
    signal: args.signal,
    body: JSON.stringify({
      model: args.model,
      max_tokens: args.maxTokens ?? 2048,
      messages: [
        { role: 'system', content: args.system },
        ...args.turns.map((t) => ({
          role: t.role,
          content: t.images?.length
            ? [
                { type: 'text', text: t.content },
                ...t.images.map((url) => ({ type: 'image_url', image_url: { url } })),
              ]
            : t.content,
        })),
      ],
    }),
  })
  if (!res.ok) await httpError(res)
  const data = await res.json()
  const text: string | undefined = data?.choices?.[0]?.message?.content
  if (!text) throw new AiError(0, 'Empty response from provider')
  return text
}

/* ── Anthropic Messages API ──────────────────────────────────────────────── */

async function chatAnthropic(args: ChatArgs): Promise<string> {
  const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
    method: 'POST',
    signal: args.signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': args.key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: args.model,
      max_tokens: args.maxTokens ?? 2048,
      system: args.system,
      messages: mergeTurns(args.turns).map((t) => ({
        role: t.role,
        content: [
          ...(t.images ?? []).map((d) => {
            const { mime, data } = splitDataUrl(d)
            return { type: 'image', source: { type: 'base64', media_type: mime, data } }
          }),
          { type: 'text', text: t.content },
        ],
      })),
    }),
  })
  if (!res.ok) await httpError(res)
  const data = await res.json()
  const text = (data?.content ?? [])
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('')
  if (!text) throw new AiError(0, 'Empty response from provider')
  return text
}

/* ── Google Gemini ───────────────────────────────────────────────────────── */

async function chatGemini(args: ChatArgs): Promise<string> {
  const url = `${GEMINI_BASE}/models/${encodeURIComponent(args.model)}:generateContent?key=${encodeURIComponent(args.key)}`
  const res = await fetch(url, {
    method: 'POST',
    signal: args.signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: args.system }] },
      contents: mergeTurns(args.turns).map((t) => ({
        role: t.role === 'assistant' ? 'model' : 'user',
        parts: [
          { text: t.content },
          ...(t.images ?? []).map((d) => {
            const { mime, data } = splitDataUrl(d)
            return { inline_data: { mime_type: mime, data } }
          }),
        ],
      })),
      generationConfig: { maxOutputTokens: args.maxTokens ?? 2048, temperature: 0.4 },
    }),
  })
  if (!res.ok) await httpError(res)
  const data = await res.json()
  const block = data?.promptFeedback?.blockReason
  if (block) throw new AiError(0, `Blocked by provider safety filter: ${block}`)
  const text = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? '')
    .join('')
  if (!text) throw new AiError(0, 'Empty response from provider')
  return text
}

/** Send a chat request through the given provider, returning the reply text. */
export async function chat(provider: ProviderId, args: ChatArgs): Promise<string> {
  switch (provider) {
    case 'openai':
      return chatOpenAICompatible(args, OPENAI_BASE)
    case 'openrouter':
      return chatOpenAICompatible(args, OPENROUTER_BASE)
    case 'custom': {
      if (!args.baseUrl) throw new AiError(0, 'Set a base URL for the custom provider in AI settings')
      return chatOpenAICompatible(args, args.baseUrl)
    }
    case 'anthropic':
      return chatAnthropic(args)
    case 'gemini':
      return chatGemini(args)
  }
}

/* ── Live model lists ────────────────────────────────────────────────────── */

export async function listModels(provider: ProviderId, key: string, baseUrl?: string): Promise<string[]> {
  if (provider === 'anthropic') {
    const res = await fetch(`${ANTHROPIC_BASE}/models?limit=100`, {
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    })
    if (!res.ok) await httpError(res)
    const data = await res.json()
    return (data?.data ?? []).map((m: { id: string }) => m.id)
  }
  if (provider === 'gemini') {
    const res = await fetch(`${GEMINI_BASE}/models?pageSize=1000&key=${encodeURIComponent(key)}`)
    if (!res.ok) await httpError(res)
    const data = await res.json()
    return (data?.models ?? [])
      .filter((m: { supportedGenerationMethods?: string[] }) => !m.supportedGenerationMethods || m.supportedGenerationMethods.includes('generateContent'))
      .map((m: { name: string }) => m.name.replace(/^models\//, ''))
  }
  // OpenAI-compatible: /models
  const base = provider === 'openai' ? OPENAI_BASE : provider === 'openrouter' ? OPENROUTER_BASE : baseUrl
  if (!base) throw new AiError(0, 'Set a base URL first')
  const headers: Record<string, string> = {}
  if (key) headers.Authorization = `Bearer ${key}`
  const res = await fetch(`${base.replace(/\/$/, '')}/models`, { headers })
  if (!res.ok) await httpError(res)
  const data = await res.json()
  return (data?.data ?? []).map((m: { id: string }) => m.id).sort()
}

/* ── Error translation ───────────────────────────────────────────────────── */

/** Turn any thrown error into a short, human message for the chat UI. */
export function friendlyError(e: unknown): string {
  if (e instanceof AiError) {
    if (e.status === 401 || e.status === 403) return 'Key rejected by the provider — check it in AI settings (and that it has credit/quota).'
    if (e.status === 404) return 'Model or endpoint not found — check the model id (some gateways need exact ids).'
    if (e.status === 429) return 'Rate limited or out of quota — wait a moment or check your plan.'
    if (e.status >= 500) return 'The provider is having trouble right now — try again shortly.'
    if (e.status === 0) return e.message
    return e.message || `Request failed (HTTP ${e.status}).`
  }
  if (e instanceof DOMException && e.name === 'AbortError') return 'Cancelled.'
  if (e instanceof TypeError) {
    return 'Network request blocked — for custom/localhost providers make sure the gateway is running and permits browser calls (CORS).'
  }
  return e instanceof Error ? e.message : String(e)
}
