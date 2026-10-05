/**
 * Context builder — compiles the app's subject data + uploaded files into the
 * tutor's system prompt, with char budgets so requests stay sane.
 */

import type { Subject } from '../data/schema'
import type { StoredFile } from './fileStore'

/** Hard cap for the course digest (progressively trimmed to fit). */
export const DIGEST_MAX = 36000
/** Per-file text cap inside the prompt. */
export const FILE_BUDGET = 12000
/** Total cap across all files. */
export const FILES_TOTAL = 40000

export function trim(s: string, max: number): string {
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const sp = cut.lastIndexOf(' ')
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trimEnd() + '…'
}

/** Compact, budgeted dump of everything the app knows about the subject. */
export function buildCourseDigest(subject: Subject, max = DIGEST_MAX): string {
  const deep = max >= 26000
  const lines: string[] = []

  lines.push(`COURSE: ${subject.code} — ${subject.title} (${subject.institution})`)
  lines.push(`EXAM: ${subject.examMeta}`)

  lines.push('\nWEEKS')
  for (const w of subject.weeks) {
    const focus = trim(w.examFocus.slice(0, deep ? 3 : 2).join('; '), 170)
    lines.push(`W${w.number}: ${w.title} — focus: ${focus}`)
  }

  lines.push(`\nFORMULAS (${subject.formulas.length})`)
  for (const f of subject.formulas) {
    const weeks = `W${f.weekTags.join(',W')}`
    const prio = f.examPriority === 'core' ? '★core' : f.examPriority === 'high' ? 'high' : ''
    let entry = `[${f.id}] ${f.name} — ${f.latex} (${weeks}${prio ? ', ' + prio : ''})`
    if (deep) entry += ` ${trim(f.explanation, 150)}`
    const insight = deep && f.examPriority !== 'medium' ? f.insights?.[0] : undefined
    if (insight) entry += ` | ${trim(insight, 100)}`
    lines.push(entry)
  }

  lines.push(`\nVARIABLES (${subject.variables.length})`)
  for (const v of subject.variables) {
    const units = v.units.si
    const desc = trim(v.description, deep ? 80 : 50)
    lines.push(`[${v.id}] ${v.latex} = ${v.name} (${units}) — ${desc}`)
  }

  lines.push('\nISA TABLE (Appendix)')
  lines.push('ft | °C | Pa | kg/m³ | m/s | Pa·s')
  for (const r of subject.isaTable) {
    lines.push(`${r.altitudeFt} | ${r.tempC} | ${r.pressurePa} | ${r.densityKgM3} | ${r.speedOfSoundMs} | ${r.viscosityPaS}`)
  }

  lines.push('\nEXAM RADAR (practice-exam focus areas)')
  for (const r of subject.examRadar) {
    lines.push(`${r.id}: ${r.title} — ${deep ? trim(r.detail, 170) : ''} [see: ${r.relatedIds.slice(0, 4).join(', ')}]`)
  }

  let digest = lines.join('\n')
  if (digest.length > max) {
    // Hard fallback: cut at the last whole line under budget (suffix included).
    const suffix = '\n…[reference trimmed to fit context]'
    const budget = max - suffix.length
    const cut = digest.slice(0, Math.max(0, budget))
    const nl = cut.lastIndexOf('\n')
    digest = cut.slice(0, nl > budget * 0.5 ? nl : budget).trimEnd() + suffix
  }
  return digest
}

/**
 * Selected uploaded files as labelled text blocks. Images contribute their
 * description only — the pixels travel as vision attachments on the turn.
 */
export function buildFileContext(files: StoredFile[], perFile = FILE_BUDGET, total = FILES_TOTAL): string {
  if (files.length === 0) return ''
  const blocks: string[] = []
  let used = 0
  for (const f of files) {
    if (used >= total) {
      blocks.push(`[FILE: ${f.name} — omitted: context budget reached]`)
      continue
    }
    const head = `[FILE: ${f.name}${f.description ? ' — ' + f.description : ''}]`
    const body = f.text ? trim(f.text, Math.min(perFile, total - used)) : '(no extractable text)'
    blocks.push(`${head}\n${body}`)
    used += head.length + body.length
  }
  return blocks.join('\n\n')
}

/** Rough context size for the UI estimate (~4 chars ≈ 1 token). */
export function estimateContextChars(digest: string, files: StoredFile[]): number {
  return digest.length + files.reduce((n, f) => n + (f.text?.length ?? 0), 0)
}

/** The tutor persona + reference material, as one system prompt. */
export function buildSystemPrompt(subject: Subject, files: StoredFile[], includeCourse: boolean): string {
  const parts: string[] = [
    `You are the ${subject.code} Study Tutor — a patient, exam-focused aerospace engineering tutor for "${subject.title}" at ${subject.institution}.`,
    `Assessment: ${subject.examMeta}. The student must understand and recall formulas, variables, units and problem-solving methods WITHOUT notes.`,
    '',
    'Teaching style:',
    '- Teach step by step; worked examples must carry units through every line.',
    '- Be Socratic when the student is exploring (ask what comes next), but direct and complete when they ask for an answer or exam prep.',
    '- Write all math as LaTeX: $…$ inline, $$…$$ display — the app renders it.',
    '- Ground truth is the COURSE REFERENCE below plus any UPLOADED MATERIALS. Prefer them; if something is not covered there, say so and reason from fundamentals.',
    '- Use SI units and the reference notation (q dynamic pressure, S wing area, ρ density…).',
    '- After teaching a concept, finish with one quick check question unless the student asked for something else.',
    '- Never invent course content: week numbers and formulas must come from the reference.',
  ]
  if (includeCourse) parts.push('', '=== COURSE REFERENCE ===', buildCourseDigest(subject), '=== END COURSE REFERENCE ===')
  const fileCtx = buildFileContext(files)
  if (fileCtx) parts.push('', '=== UPLOADED MATERIALS ===', fileCtx, '=== END UPLOADED MATERIALS ===')
  return parts.join('\n')
}
