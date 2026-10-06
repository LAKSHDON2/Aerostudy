import { describe, expect, it } from 'vitest'
import { fallbackChain, type FallbackAttempt } from '../src/services/aiRun'
import { DEFAULT_SETTINGS, type AiSettings, type ProviderId } from '../src/services/aiSettings'

function settingsWith(keys: Partial<Record<ProviderId, string>>, active: ProviderId = 'openai', order?: ProviderId[]): AiSettings {
  const s: AiSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
  s.activeProvider = active
  for (const [pid, key] of Object.entries(keys)) s.providers[pid as ProviderId].key = key as string
  if (order) s.fallbackOrder = order
  return s
}

describe('fallback chain', () => {
  it('puts the active provider first, then follows the saved order', () => {
    const s = settingsWith({ openai: 'k1', gemini: 'k2', openrouter: 'k3' }, 'gemini', ['anthropic', 'openai'])
    // anthropic has no key → skipped
    expect(fallbackChain(s)).toEqual(['gemini', 'openai', 'openrouter'])
  })

  it('skips unconfigured providers entirely', () => {
    const s = settingsWith({ gemini: 'k' }, 'openai')
    expect(fallbackChain(s)).toEqual(['gemini'])
  })

  it('returns empty when nothing is configured', () => {
    expect(fallbackChain(DEFAULT_SETTINGS)).toEqual([])
  })
})

describe('fallback attempts', () => {
  it('records provider outcomes (shape used by runWithFallback)', () => {
    const attempts: FallbackAttempt[] = [
      { provider: 'openai', ok: false, error: 'HTTP 429: rate limited' },
      { provider: 'gemini', ok: true },
    ]
    expect(attempts.filter((a) => a.ok).map((a) => a.provider)).toEqual(['gemini'])
    expect(attempts[0].error).toContain('429')
  })
})
