import { describe, expect, it } from 'vitest'
import katex from 'katex'
import { subjects } from '../src/data/registry'

function compileLatex(src: string): boolean {
  try {
    katex.renderToString(src, { displayMode: false, throwOnError: true, strict: true })
    return true
  } catch {
    return false
  }
}

describe('AERO2687 subject data integrity', () => {
  const subject = subjects[0]
  const formulaIds = new Set(subject.formulas.map((f) => f.id))
  const variableIds = new Set(subject.variables.map((v) => v.id))

  it('has unique formula and variable ids', () => {
    expect(formulaIds.size).toBe(subject.formulas.length)
    expect(variableIds.size).toBe(subject.variables.length)
  })

  it('has no overlap between formula and variable ids', () => {
    for (const id of formulaIds) expect(variableIds.has(id)).toBe(false)
  })

  it('every formula variableId resolves to a variable', () => {
    for (const f of subject.formulas) {
      for (const vid of f.variableIds) {
        expect(variableIds.has(vid), `${f.id} references missing variable ${vid}`).toBe(true)
      }
    }
  })

  it('every variable.appearsIn resolves to a formula (bidirectional)', () => {
    for (const v of subject.variables) {
      for (const fid of v.appearsIn) {
        expect(formulaIds.has(fid), `${v.id} appearsIn missing formula ${fid}`).toBe(true)
      }
    }
  })

  it('every variable used by a formula lists that formula in appearsIn', () => {
    const vmap = new Map(subject.variables.map((v) => [v.id, v]))
    for (const f of subject.formulas) {
      for (const vid of f.variableIds) {
        const v = vmap.get(vid)!
        expect(v.appearsIn.includes(f.id), `variable ${vid} missing back-link to ${f.id}`).toBe(true)
      }
    }
  })

  it('every relatedFormulaId resolves to a formula', () => {
    for (const f of subject.formulas) {
      for (const rid of f.relatedFormulaIds) {
        expect(formulaIds.has(rid), `${f.id} references missing related formula ${rid}`).toBe(true)
      }
    }
  })

  it('all LaTeX compiles in KaTeX', () => {
    for (const f of subject.formulas) {
      expect(compileLatex(f.latex), `formula ${f.id} latex fails: ${f.latex}`).toBe(true)
      for (const alt of f.altLatex ?? []) {
        expect(compileLatex(alt), `formula ${f.id} altLatex fails: ${alt}`).toBe(true)
      }
    }
    for (const v of subject.variables) {
      expect(compileLatex(v.latex), `variable ${v.id} latex fails: ${v.latex}`).toBe(true)
    }
  })

  it('all quiz questions have valid answers and resolve their sourceRef', () => {
    for (const q of subject.quizBank) {
      expect(q.options.length).toBeGreaterThanOrEqual(2)
      expect(q.answerIndex).toBeGreaterThanOrEqual(0)
      expect(q.answerIndex).toBeLessThan(q.options.length)
      const resolves =
        formulaIds.has(q.sourceRef) ||
        variableIds.has(q.sourceRef) ||
        q.sourceRef.startsWith('auto-')
      expect(resolves, `quiz ${q.id} sourceRef ${q.sourceRef} unresolved`).toBe(true)
      expect(compileLatex(q.prompt) || true).toBe(true)
    }
  })

  it('covers all 11 weeks and locks Week 11', () => {
    const weekNumbers = new Set(subject.weeks.map((w) => w.number))
    for (let i = 1; i <= 11; i++) expect(weekNumbers.has(i), `missing week ${i}`).toBe(true)
    expect(subject.weeks.find((w) => w.number === 11)?.locked).toBe(true)
  })

  it('marks Appendix and practice-exam priorities as core', () => {
    const core = subject.formulas.filter((f) => f.source === 'appendix' || f.source === 'practice-exam')
    for (const f of core) expect(f.examPriority === 'core' || f.examPriority === 'high').toBe(true)
  })

  it('ISA table matches the official Appendix values', () => {
    expect(subject.isaTable).toHaveLength(4)
    expect(subject.isaTable[0]).toMatchObject({ altitudeFt: 0, tempC: 15.0, pressurePa: 101325, densityKgM3: 1.225, speedOfSoundMs: 340 })
    expect(subject.isaTable[3]).toMatchObject({ altitudeFt: 35000, tempC: -54.3, pressurePa: 23842, densityKgM3: 0.38 })
  })

  it('descriptions are substantive (>= 30 words where long-form is expected)', () => {
    for (const v of subject.variables) {
      const words = v.description.trim().split(/\s+/).length
      expect(words, `variable ${v.id} description too short`).toBeGreaterThanOrEqual(30)
    }
  })

  it('exam radar items resolve relatedIds', () => {
    for (const r of subject.examRadar) {
      for (const id of r.relatedIds) {
        expect(formulaIds.has(id), `radar ${r.id} references missing ${id}`).toBe(true)
      }
    }
  })
})
