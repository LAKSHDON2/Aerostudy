import { describe, expect, it } from 'vitest'
import { formatHash, parseHash } from '../src/services/deepLink'

describe('deep links', () => {
  it('parses a plain view hash', () => {
    expect(parseHash('#/v/graph')).toEqual({ view: 'graph', window: null })
    expect(parseHash('#/v/chat')).toEqual({ view: 'chat', window: null })
    expect(parseHash('#/v/home')).toEqual({ view: 'home', window: null })
  })

  it('tolerates a missing slash after #', () => {
    expect(parseHash('#v/home')).toEqual({ view: 'home', window: null })
  })

  it('parses view + open window', () => {
    expect(parseHash('#/v/graph/w/formula/f-lift')).toEqual({
      view: 'graph',
      window: { kind: 'formula', id: 'f-lift' },
    })
    expect(parseHash('#/v/list/w/variable/v-rho')).toEqual({
      view: 'list',
      window: { kind: 'variable', id: 'v-rho' },
    })
  })

  it('rejects garbage safely', () => {
    expect(parseHash('')).toBeNull()
    expect(parseHash('#')).toBeNull()
    expect(parseHash('#/v/nope')).toBeNull()
    expect(parseHash('#/x/graph')).toBeNull()
    expect(parseHash('#/v/graph/w/nope/f-lift')).toBeNull()
    expect(parseHash('#/v/graph/w/formula')).toBeNull() // truncated
    expect(parseHash('#/v/graph/w/formula/f lift')).toBeNull() // space not allowed
    expect(parseHash('#/v/graph/extra')).toBeNull()
  })

  it('formatHash → parseHash round-trips', () => {
    const cases = [
      { view: 'graph' as const, window: null },
      { view: 'chat' as const, window: { kind: 'formula' as const, id: 'f-lift' } },
      { view: 'quiz' as const, window: { kind: 'variable' as const, id: 'v-rho' } },
    ]
    for (const c of cases) expect(parseHash(formatHash(c))).toEqual(c)
  })
})
