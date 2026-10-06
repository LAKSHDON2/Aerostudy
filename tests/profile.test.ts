import { describe, expect, it } from 'vitest'
import {
  buildLearnerBlock,
  daysUntilExam,
  DEFAULT_PROFILE,
  seedFromActivity,
} from '../src/services/profile'
import type { Subject } from '../src/data/schema'

const subject = {
  topics: [
    { id: 'wings', name: 'Wings', hue: 200 },
    { id: 'structures', name: 'Structures', hue: 30 },
  ],
  formulas: [
    { id: 'f-lift', examPriority: 'core' },
    { id: 'f-drag', examPriority: 'high' },
    { id: 'f-misc', examPriority: 'medium' },
  ],
} as unknown as Subject

describe('learner profile', () => {
  it('daysUntilExam counts up to the exam and ignores bad/past dates', () => {
    const now = Date.parse('2026-10-06T12:00:00')
    expect(daysUntilExam({ ...DEFAULT_PROFILE, examDate: '2026-10-07' }, now)).toBe(1)
    expect(daysUntilExam({ ...DEFAULT_PROFILE, examDate: '2026-10-06' }, now)).toBe(0)
    expect(daysUntilExam({ ...DEFAULT_PROFILE, examDate: '2020-01-01' }, now)).toBeNull()
    expect(daysUntilExam({ ...DEFAULT_PROFILE, examDate: 'not-a-date' }, now)).toBeNull()
    expect(daysUntilExam({ ...DEFAULT_PROFILE }, now)).toBeNull()
  })

  it('buildLearnerBlock renders goal, countdown and topic names', () => {
    const now = Date.parse('2026-10-06T12:00:00')
    const block = buildLearnerBlock(
      { ...DEFAULT_PROFILE, goal: 'HD', weakTopics: ['wings'], strongTopics: ['structures'], examDate: '2026-10-07', sessions: 3 },
      subject,
      now,
    )
    expect(block).toContain('Goal: HD')
    expect(block).toContain('Exam in 1 day')
    expect(block).toContain('Finds difficult: Wings')
    expect(block).toContain('Confident with: Structures')
    expect(block).toContain('sessions so far: 3')
    expect(block.endsWith('=== END LEARNER PROFILE ===')).toBe(true)
  })

  it('empty profile asks the tutor to learn the student naturally', () => {
    const block = buildLearnerBlock(DEFAULT_PROFILE, subject)
    expect(block).toContain('learn it naturally')
  })

  it('seedFromActivity flags weak quiz recall and unmastered core', () => {
    const weak = seedFromActivity(subject, [{ score: 3, total: 10 }], new Set())
    expect(weak.weak).toContain('quiz-recall')
    expect(weak.weak).toContain('core-formulas')
    const strong = seedFromActivity(subject, [{ score: 9, total: 10 }], new Set(['f-lift', 'f-drag']))
    expect(strong.strong).toContain('quiz-recall')
    expect(strong.strong).toContain('core-formulas')
  })
})
