import { describe, expect, it } from 'vitest'
import { getSubject } from '../src/data/registry'
import { buildCourseDigest, buildFileContext, buildSystemPrompt, trim } from '../src/services/aiContext'
import type { StoredFile } from '../src/services/fileStore'

const subject = getSubject('aero2687')

function file(over: Partial<StoredFile>): StoredFile {
  return {
    id: 'f1',
    subjectId: 'aero2687',
    name: 'Week4.pptx',
    kind: 'pptx',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 1234,
    description: 'Week 4 lecture on lift and drag',
    text: 'L = C_L q S',
    included: true,
    addedAt: Date.now(),
    ...over,
  }
}

describe('buildCourseDigest', () => {
  const digest = buildCourseDigest(subject)

  it('contains the course identity, formulas, variables, ISA and radar', () => {
    expect(digest).toContain('AERO2687')
    expect(digest).toContain('f-lift')
    expect(digest).toContain('2-hour closed-book')
    expect(digest).toContain('ISA TABLE')
    expect(digest).toContain('101325')
    expect(digest).toContain('EXAM RADAR')
    expect(digest).toContain('Reynolds number')
  })

  it('stays within the default budget', () => {
    expect(digest.length).toBeLessThanOrEqual(36000)
  })

  it('a tight budget truncates but never overflows', () => {
    expect(buildCourseDigest(subject, 15000).length).toBeLessThanOrEqual(15000)
  })
})

describe('trim', () => {
  it('cuts on a word boundary with an ellipsis', () => {
    const out = trim('a'.repeat(50) + ' ' + 'b'.repeat(50), 60)
    expect(out.length).toBeLessThanOrEqual(61)
    expect(out.endsWith('…')).toBe(true)
    expect(trim('short', 10)).toBe('short')
  })
})

describe('buildFileContext', () => {
  it('labels files with descriptions and includes text', () => {
    const ctx = buildFileContext([file({})])
    expect(ctx).toContain('[FILE: Week4.pptx — Week 4 lecture on lift and drag]')
    expect(ctx).toContain('L = C_L q S')
  })

  it('images say so (pixels travel as attachments)', () => {
    const ctx = buildFileContext([file({ name: 'scan.png', kind: 'image', text: undefined })])
    expect(ctx).toContain('(no extractable text)')
  })

  it('truncates per-file and honours the total budget', () => {
    const long = 'x'.repeat(5000)
    const ctx = buildFileContext([file({ text: long }), file({ id: 'f2', name: 'b.pdf', text: long })], 2000, 2000)
    expect(ctx).toContain('…')
    expect(ctx).toContain('omitted: context budget reached')
  })

  it('returns empty string for no files', () => {
    expect(buildFileContext([])).toBe('')
  })
})

describe('buildSystemPrompt', () => {
  it('includes persona, rules, course reference and uploaded materials', () => {
    const p = buildSystemPrompt(subject, [file({})], true)
    expect(p).toMatch(/Study Tutor/)
    expect(p).toMatch(/\$…\$ inline/)
    expect(p).toContain('=== COURSE REFERENCE ===')
    expect(p).toContain('f-lift')
    expect(p).toContain('=== UPLOADED MATERIALS ===')
    expect(p).toContain('Week 4 lecture on lift and drag')
  })

  it('can omit the course digest', () => {
    const p = buildSystemPrompt(subject, [], false)
    expect(p).not.toContain('=== COURSE REFERENCE ===')
    expect(p).not.toContain('=== UPLOADED MATERIALS ===')
  })
})
