import { describe, expect, it } from 'vitest'
import { collectLocalEntries, parseBackup, restoreLocalEntries } from '../src/services/backup'

class FakeStorage implements Storage {
  private m = new Map<string, string>()
  get length(): number { return this.m.size }
  key(i: number): string | null { return [...this.m.keys()][i] ?? null }
  getItem(k: string): string | null { return this.m.get(k) ?? null }
  setItem(k: string, v: string): void { this.m.set(k, String(v)) }
  removeItem(k: string): void { this.m.delete(k) }
  clear(): void { this.m.clear() }
}

const SUBJECT = 'aero2687'

describe('collectLocalEntries', () => {
  it('captures only this subject’s asw: keys', () => {
    const s = new FakeStorage()
    s.setItem(`asw:${SUBJECT}:theme`, '"dark"')
    s.setItem(`asw:${SUBJECT}:mastered`, '["f-lift"]')
    s.setItem(`asw:other-subject:theme`, '"light"')
    s.setItem('unrelated', 'x')
    const out = collectLocalEntries(SUBJECT, s)
    expect(Object.keys(out).sort()).toEqual([`asw:${SUBJECT}:mastered`, `asw:${SUBJECT}:theme`])
    expect(out[`asw:${SUBJECT}:theme`]).toBe('"dark"')
  })
})

describe('restoreLocalEntries', () => {
  it('writes entries back under the subject prefix only', () => {
    const src = { [`asw:${SUBJECT}:theme`]: '"light"', 'evil:key': '1' }
    const dst = new FakeStorage()
    dst.setItem('keep', 'me')
    const n = restoreLocalEntries(src, SUBJECT, dst)
    expect(n).toBe(1)
    expect(dst.getItem(`asw:${SUBJECT}:theme`)).toBe('"light"')
    expect(dst.getItem('keep')).toBe('me')
    expect(dst.getItem('evil:key')).toBeNull()
  })
})

describe('parseBackup', () => {
  const valid = { app: 'aero2687-study-web', version: 1, exportedAt: '2026-10-05T00:00:00Z', subjectId: SUBJECT, entries: {}, files: [], chats: [] }

  it('accepts a valid payload', () => {
    expect(parseBackup(JSON.stringify(valid)).subjectId).toBe(SUBJECT)
  })
  it('rejects foreign files', () => {
    expect(() => parseBackup('{"hello":1}')).toThrow(/not an AERO2687/)
    expect(() => parseBackup('not json')).toThrow()
  })
  it('rejects newer backup versions', () => {
    expect(() => parseBackup(JSON.stringify({ ...valid, version: 99 }))).toThrow(/newer app version/)
  })
})
