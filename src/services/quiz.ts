import type { QuizQuestion, Subject } from '../data/schema'

/**
 * Quiz engine. Sessions are assembled from the handwritten bank plus
 * auto-generated questions derived from the data (symbol→name, unit checks),
 * weighted so core/high-priority Appendix and practice-exam material dominates.
 */

export type QuizMode = 'quick10' | 'mock' | 'week'

export interface QuizSession {
  id: string
  mode: QuizMode
  questions: QuizQuestion[]
  startedAt: number
}

let counter = 0

/** Auto-generated symbol→name and unit questions from variable records. */
function generateFromVariables(subject: Subject, count: number): QuizQuestion[] {
  const pool: QuizQuestion[] = []
  const candidates = [...subject.variables].sort(() => Math.random() - 0.5)

  for (const v of candidates.slice(0, count)) {
    const distractors = subject.variables
      .filter((o) => o.id !== v.id && o.units.si === v.units.si)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((o) => o.name)
    const others = subject.variables.filter((o) => o.id !== v.id).sort(() => Math.random() - 0.5)
    while (distractors.length < 3 && others.length) {
      const pick = others.pop()!
      if (!distractors.includes(pick.name)) distractors.push(pick.name)
    }
    if (distractors.length < 3) continue

    const options = [v.name, ...distractors].sort(() => Math.random() - 0.5)
    const answerIndex = options.indexOf(v.name)
    pool.push({
      id: `auto-sym-${v.id}`,
      type: 'symbol-to-name',
      weekTags: v.weekTags,
      topicIds: [],
      prompt: `What quantity does the symbol $${v.latex}$ denote?`,
      options,
      answerIndex,
      explanation: `${v.name} — ${v.description.slice(0, 120)}… (SI unit: ${v.units.si})`,
      sourceRef: v.id,
    })

    // Unit check for non-dimensionless quantities
    if (v.units.si !== '– (dimensionless)') {
      const wrongUnits = subject.variables
        .filter((o) => o.id !== v.id && o.units.si !== v.units.si && !o.units.si.includes('dimensionless'))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((o) => o.units.si)
      if (wrongUnits.length === 3) {
        const unitOptions = [v.units.si, ...wrongUnits].sort(() => Math.random() - 0.5)
        pool.push({
          id: `auto-unit-${v.id}`,
          type: 'unit-check',
          weekTags: v.weekTags,
          topicIds: [],
          prompt: `What are the SI units of $${v.latex}$ (${v.name})?`,
          options: unitOptions,
          answerIndex: unitOptions.indexOf(v.units.si),
          explanation: `${v.name} is measured in ${v.units.si}.`,
          sourceRef: v.id,
        })
      }
    }
  }
  return pool.slice(0, count * 2)
}

/** Weight: core ×3, high ×2, medium ×1. */
function weightedPool(subject: Subject): QuizQuestion[] {
  const pool: QuizQuestion[] = []
  for (const q of subject.quizBank) {
    pool.push(q)
    const f = subject.formulas.find((x) => x.id === q.sourceRef)
    const weight = f ? (f.examPriority === 'core' ? 2 : f.examPriority === 'high' ? 1 : 0) : 1
    for (let i = 0; i < weight; i++) pool.push(q)
  }
  return pool
}

export function buildSession(subject: Subject, mode: QuizMode, week?: number): QuizSession {
  let questions: QuizQuestion[]

  if (mode === 'week' && week != null) {
    questions = subject.quizBank.filter((q) => q.weekTags.includes(week))
    questions = [...questions].sort(() => Math.random() - 0.5).slice(0, 10)
  } else if (mode === 'mock') {
    const pool = [...weightedPool(subject)].sort(() => Math.random() - 0.5)
    questions = pool.slice(0, 20)
  } else {
    const handwritten = [...subject.quizBank].sort(() => Math.random() - 0.5).slice(0, 7)
    const generated = generateFromVariables(subject, 5)
    questions = [...handwritten, ...generated].sort(() => Math.random() - 0.5).slice(0, 10)
  }

  return {
    id: `sess-${Date.now()}-${counter++}`,
    mode,
    questions,
    startedAt: Date.now(),
  }
}

export function scoreSession(questions: QuizQuestion[], answers: (number | null)[]): { score: number; total: number } {
  let score = 0
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].answerIndex) score++
  }
  return { score, total: questions.length }
}
