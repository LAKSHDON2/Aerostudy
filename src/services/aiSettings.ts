/**
 * AI settings — which provider is active, plus per-provider API key + model.
 *
 * BYOK (bring your own key): everything lives in localStorage on this machine
 * (`asw:<subject>:ai`) and is sent directly from the browser to the chosen
 * provider. Nothing is ever uploaded anywhere else. The `custom` provider
 * covers any OpenAI-compatible endpoint (local gateways for Kiro keys,
 * OpenRouter-style aggregators, Ollama, LM Studio…).
 */

import { useSyncExternalStore } from 'react'
import { storage } from './storage'

export type ProviderId = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'custom'

export interface ProviderConfig {
  /** API key (empty = none saved). Not required by some local gateways. */
  key: string
  /** Model id, e.g. "gpt-4o-mini" or "gemini-2.5-flash" */
  model: string
  /** OpenAI-compatible base URL — required for `custom`, e.g. http://localhost:8080/v1 */
  baseUrl?: string
}

export interface AiSettings {
  activeProvider: ProviderId
  providers: Record<ProviderId, ProviderConfig>
  /** When a provider rate-limits/fails, try the next configured one. */
  fallbackEnabled: boolean
  /** Preferred fallback order (provider ids; missing ones are skipped). */
  fallbackOrder: ProviderId[]
}

const subjectId = 'aero2687'
const FIELD = 'ai'

export const DEFAULT_MODELS: Record<ProviderId, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-sonnet-4-5',
  gemini: 'gemini-2.5-flash',
  openrouter: 'openrouter/auto',
  custom: '',
}

const emptyProvider = (id: ProviderId): ProviderConfig => ({ key: '', model: DEFAULT_MODELS[id], baseUrl: id === 'custom' ? '' : undefined })

export const DEFAULT_SETTINGS: AiSettings = {
  activeProvider: 'openai',
  providers: {
    openai: emptyProvider('openai'),
    anthropic: emptyProvider('anthropic'),
    gemini: emptyProvider('gemini'),
    openrouter: emptyProvider('openrouter'),
    custom: emptyProvider('custom'),
  },
  fallbackEnabled: true,
  fallbackOrder: ['gemini', 'openrouter', 'openai', 'anthropic', 'custom'],
}

function load(): AiSettings {
  const saved = storage.load<Partial<AiSettings>>(subjectId, FIELD, {})
  const order = Array.isArray(saved.fallbackOrder)
    ? saved.fallbackOrder.filter((p): p is ProviderId => (DEFAULT_SETTINGS.fallbackOrder as string[]).includes(p))
    : DEFAULT_SETTINGS.fallbackOrder
  // Any provider missing from a saved order keeps a sensible trailing position.
  for (const p of DEFAULT_SETTINGS.fallbackOrder) if (!order.includes(p)) order.push(p)
  return {
    fallbackEnabled: saved.fallbackEnabled !== false,
    fallbackOrder: order,
    activeProvider: saved.activeProvider ?? DEFAULT_SETTINGS.activeProvider,
    providers: {
      openai: { ...DEFAULT_SETTINGS.providers.openai, ...saved.providers?.openai },
      anthropic: { ...DEFAULT_SETTINGS.providers.anthropic, ...saved.providers?.anthropic },
      gemini: { ...DEFAULT_SETTINGS.providers.gemini, ...saved.providers?.gemini },
      openrouter: { ...DEFAULT_SETTINGS.providers.openrouter, ...saved.providers?.openrouter },
      custom: { ...DEFAULT_SETTINGS.providers.custom, ...saved.providers?.custom },
    },
  }
}

/* Tiny external store so any component can react to settings changes. */
let current: AiSettings = load()
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

export function getAiSettings(): AiSettings {
  return current
}

export function updateSettings(patch: (s: AiSettings) => AiSettings): void {
  current = patch(current)
  storage.save(subjectId, FIELD, current)
  emit()
}

export function setActiveProvider(id: ProviderId): void {
  updateSettings((s) => ({ ...s, activeProvider: id }))
}

export function setFallbackEnabled(enabled: boolean): void {
  updateSettings((s) => ({ ...s, fallbackEnabled: enabled }))
}

export function setFallbackOrder(order: ProviderId[]): void {
  updateSettings((s) => ({ ...s, fallbackOrder: order }))
}

export function updateProvider(id: ProviderId, patch: Partial<ProviderConfig>): void {
  updateSettings((s) => ({ ...s, providers: { ...s.providers, [id]: { ...s.providers[id], ...patch } } }))
}

export function isConfigured(settings: AiSettings = current): boolean {
  const cfg = settings.providers[settings.activeProvider]
  if (!cfg.model) return false
  if (settings.activeProvider === 'custom') return !!cfg.baseUrl
  return !!cfg.key
}

export function useAiSettings(): AiSettings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
  )
}
