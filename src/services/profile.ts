/**
 * Learner profile — what the tutor knows about THE STUDENT (not the course).
 *
 * Stored locally (`asw:<subject>:profile`), seeded from app activity (quiz
 * attempts, mastered formulas) and editable by the student (Chat card / orb).
 * Everything here feeds the personalized LEARNER PROFILE block appended to
 * the tutor's system prompt in aiContext.ts.
 */

import { storage } from './storage'
import type { Subject } from '../data/schema'

export interface LearnerProfile {
  /** What the student is aiming for, e.g. "a comfortable pass" or "HD". */
  goal: string
  /** Topic ids the student finds hard (drives examples + difficulty). */
  weakTopics: string[]
  /** Topic ids the student is confident in. */
  strongTopics: string[]
  /** Exam date, ISO yyyy-mm-dd (empty = unset). */
  examDate: string
  /** How many personalized tutoring sessions have happened. */
  sessions: number
}

const FIELD = 'profile'

export const DEFAULT_PROFILE: LearnerProfile = {
  goal: '',
  weakTopics: [],
  strongTopics: [],
  examDate: '',
  sessions: 0,
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

export function loadProfile(subjectId: string): LearnerProfile {
  const p = storage.load<Partial<LearnerProfile>>(subjectId, FIELD, {})
  return {
    goal: typeof p.goal === 'string' ? p.goal : '',
    weakTopics: strArray(p.weakTopics).filter((t) => !strArray(p.strongTopics).includes(t)),
    strongTopics: strArray(p.strongTopics).filter((t) => !strArray(p.weakTopics).includes(t)),
    examDate: typeof p.examDate === 'string' ? p.examDate : '',
    sessions: typeof p.sessions === 'number' && Number.isFinite(p.sessions) ? Math.max(0, Math.floor(p.sessions)) : 0,
  }
}

export function saveProfile(subjectId: string, profile: LearnerProfile): void {
  storage.save(subjectId, FIELD, profile)
}

/** Toggle a topic in the weak list (and remove it from strong). */
export function toggleWeakTopic(subjectId: string, topicId: string): LearnerProfile {
  const p = loadProfile(subjectId)
  p.weakTopics = p.weakTopics.includes(topicId)
    ? p.weakTopics.filter((t) => t !== topicId)
    : [...p.weakTopics, topicId]
  p.strongTopics = p.strongTopics.filter((t) => t !== topicId)
  saveProfile(subjectId, p)
  return p
}

/** Toggle a topic in the strong list (and remove it from weak). */
export function toggleStrongTopic(subjectId: string, topicId: string): LearnerProfile {
  const p = loadProfile(subjectId)
  p.strongTopics = p.strongTopics.includes(topicId)
    ? p.strongTopics.filter((t) => t !== topicId)
    : [...p.strongTopics, topicId]
  p.weakTopics = p.weakTopics.filter((t) => t !== topicId)
  saveProfile(subjectId, p)
  return p
}

/** Count one more personalized tutoring session (called on first AI reply). */
export function recordSession(subjectId: string): void {
  const p = loadProfile(subjectId)
  p.sessions += 1
  saveProfile(subjectId, p)
}

/** Days until the exam (null when unset, unparseable, or already past). */
export function daysUntilExam(profile: LearnerProfile, now = Date.now()): number | null {
  if (!profile.examDate) return null
  const t = Date.parse(profile.examDate + 'T00:00:00')
  if (!Number.isFinite(t)) return null
  const days = Math.ceil((t - now) / 86400000)
  return days >= 0 ? Math.max(0, days) : null // Math.max normalises -0 → 0
}

/**
 * What the app already knows: average quiz score and mastered core formulas
 * become seed hints for weak/strong. Manual edits are never overwritten by
 * this — callers merge.
 */
export function seedFromActivity(
  subject: Subject,
  attempts: { score: number; total: number }[],
  mastered: Set<string>,
): { weak: string[]; strong: string[] } {
  const totalQ = attempts.reduce((n, a) => n + a.total, 0)
  const totalS = attempts.reduce((n, a) => n + a.score, 0)
  const quizRatio = totalQ > 0 ? totalS / totalQ : null
  const core = subject.formulas.filter((f) => f.examPriority !== 'medium')
  const coreRatio = core.length > 0 ? core.filter((f) => mastered.has(f.id)).length / core.length : null
  const weak: string[] = []
  const strong: string[] = []
  if (quizRatio !== null) (quizRatio < 0.6 ? weak : strong).push('quiz-recall')
  if (coreRatio !== null) (coreRatio < 0.5 ? weak : strong).push('core-formulas')
  return { weak: [...new Set(weak)], strong: [...new Set(strong)] }
}

/** The personalized block appended to the tutor's system prompt. */
export function buildLearnerBlock(profile: LearnerProfile, subject: Subject, now = Date.now()): string {
  const topicName = (id: string) => subject.topics.find((t) => t.id === id)?.name ?? id.replace(/-/g, ' ')
  const lines: string[] = ['=== LEARNER PROFILE ===']
  lines.push(`Goal: ${profile.goal || 'not set — ask about it once, casually, then remember'}`)
  const days = daysUntilExam(profile, now)
  if (days !== null) lines.push(`Exam in ${days} day${days === 1 ? '' : 's'} — prioritise high-yield revision.`)
  if (profile.weakTopics.length > 0)
    lines.push(`Finds difficult: ${profile.weakTopics.map(topicName).join(', ')} — go gentler, more worked steps, analogies.`)
  if (profile.strongTopics.length > 0)
    lines.push(`Confident with: ${profile.strongTopics.map(topicName).join(', ')} — skip basics, stretch with harder questions.`)
  if (profile.sessions > 0) lines.push(`Personalised sessions so far: ${profile.sessions}.`)
  lines.push(
    'Adapt to this profile: pick examples from weak areas, check understanding there first.',
    profile.goal || profile.weakTopics.length
      ? ''
      : 'If the profile is empty, learn it naturally: one short question about goal or confidence — never an interrogation.',
  )
  return lines.filter((l) => l !== '').join('\n') + '\n=== END LEARNER PROFILE ==='
}
