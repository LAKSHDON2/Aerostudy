import { describe, expect, it } from 'vitest'
import {
  buildWorksheetPrompt,
  parseWorksheet,
  worksheetFilename,
  worksheetToMarkdown,
} from '../src/services/worksheet'

const SAMPLE = `TITLE: Week 4 Lift Quiz
META: Week 4 · mixed · 6 marks

## Section A — Recall
State what each symbol means.

1. Define $q$ and give its units. [2 marks]
   - Sol: $q = \\tfrac{1}{2}\\rho V^2$ — dynamic pressure, units Pa.
2. Write the lift equation. [4 marks]
   - Sol: $L = C_L q S$
   - Sol: Carry units: [C_L]·[Pa]·[m^2] = N.

## Section B — Numbers

3. An aerofoil at sea level... (3 marks)
`

describe('worksheet parser', () => {
  it('parses title, meta, sections, questions, marks and solutions', () => {
    const ws = parseWorksheet(SAMPLE)
    expect(ws.title).toBe('Week 4 Lift Quiz')
    expect(ws.meta).toContain('mixed')
    expect(ws.sections.map((s) => s.letter)).toEqual(['A', 'B'])
    const a = ws.sections[0]
    expect(a.title).toBe('Recall')
    expect(a.intro).toContain('State what each symbol means')
    expect(a.questions[0]).toMatchObject({ n: 1, marks: 2 })
    expect(a.questions[0].solution).toContain('dynamic pressure')
    // second Sol line appends to the solution
    expect(a.questions[1].solution).toContain('Carry units')
    // "(3 marks)" parenthesised style also parses
    expect(ws.sections[1].questions[0].marks).toBe(3)
    expect(ws.totalMarks).toBe(9)
  })

  it('is NaN-safe on malformed marks and tolerates garbage input', () => {
    const bad = parseWorksheet('hello world\nno structure here')
    expect(bad.sections).toEqual([])
    const noMarks = parseWorksheet('TITLE: T\nMETA: M\n## Section A — X\n1. question without marks')
    expect(noMarks.sections[0].questions[0].marks).toBe(0)
    expect(noMarks.totalMarks).toBe(1) // falls back to counting questions
  })

  it('round-trips through markdown export with solutions', () => {
    const ws = parseWorksheet(SAMPLE)
    const md = worksheetToMarkdown(ws, 'AERO2687')
    expect(md).toContain('# Week 4 Lift Quiz')
    expect(md).toContain('**Solution.**')
    expect(md).toContain('(2 marks)')
    expect(worksheetFilename(ws)).toMatch(/^week-4-lift-quiz-\d{4}-\d{2}-\d{2}\.md$/)
  })

  it('prompt demands solutions only when requested', () => {
    const withSol = buildWorksheetPrompt('AERO2687', { scope: 'Week 4', count: 8, difficulty: 'mixed', includeSolutions: true })
    expect(withSol).toContain('full worked solution')
    const noSol = buildWorksheetPrompt('AERO2687', { scope: 'Week 4', count: 8, difficulty: 'mixed', includeSolutions: false })
    expect(noSol).toContain('Do NOT include solutions')
    const clamped = buildWorksheetPrompt('AERO2687', { scope: 'x', count: 99, difficulty: 'hard', includeSolutions: true })
    expect(clamped).toContain('Exactly 15 questions')
  })
})
