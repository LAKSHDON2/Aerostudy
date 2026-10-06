/**
 * AI worksheet/quiz generation — strict prompt + tolerant parser.
 *
 * The model returns Markdown with a fixed structure (SECTIONS, questions,
 * marks, SOLUTIONS). parseWorksheet() is NaN-safe: malformed marks become 0,
 * missing sections/questions are skipped, and the UI always gets a shape it
 * can render, print and download.
 */

export interface WorksheetQuestion {
  n: number
  prompt: string
  marks: number
  /** Worked solution (may contain LaTeX). Empty when solutions were off. */
  solution: string
}

export interface WorksheetSection {
  letter: string
  title: string
  intro: string
  questions: WorksheetQuestion[]
}

export interface AiWorksheet {
  title: string
  meta: string
  sections: WorksheetSection[]
  /** Total marks across parsed questions. */
  totalMarks: number
}

export interface WorksheetOptions {
  /** "Week 3" / "Weeks 4-6" / "full-exam mix". Free text shown to the model. */
  scope: string
  count: number
  difficulty: 'easy' | 'mixed' | 'hard'
  includeSolutions: boolean
  focus?: string
}

export const WORKSHEET_MAX_TOKENS = 4000

export function buildWorksheetPrompt(subjectCode: string, opts: WorksheetOptions): string {
  const count = Math.min(15, Math.max(5, Math.round(opts.count) || 8))
  const lines = [
    `Create a practice ${count > 10 ? 'worksheet' : 'quiz'} for a university aerospace engineering student studying ${subjectCode}.`,
    `Scope: ${opts.scope}.`,
    opts.focus ? `Extra focus: ${opts.focus}.` : '',
    `Difficulty: ${opts.difficulty}. Exactly ${count} questions total.`,
    opts.includeSolutions
      ? 'Include a full worked solution for every question: numbered steps, units carried through every line, final answer boxed as **Answer:** …'
      : 'Do NOT include solutions — questions only.',
    '',
    'OUTPUT FORMAT (Markdown, follow exactly):',
    'TITLE: <short title>',
    'META: <one line: scope · difficulty · total marks>',
    '',
    '## Section A — <section title>',
    '<optional one-line intro>',
    '1. <question text> [4 marks]',
    '   - Sol: <worked solution; omit entirely if solutions were not requested>',
    '2. …',
    '',
    'Rules: math in LaTeX with $…$ / $$…$$; mix numerical word problems (show given/find), symbol questions and one explain-in-words question; marks as integers in [n marks]; sections A, B, C…; no preamble before TITLE.',
  ]
  return lines.filter((l) => l !== '').join('\n')
}

/** "4 marks" | "[4 marks]" | "(4)" at the end of a question line. */
function parseMarks(line: string): { text: string; marks: number } {
  const m = /\[?\((\d+)\s*marks?\)\]?\s*$/i.exec(line) ?? /\[(\d+)\s*marks?\]\s*$/i.exec(line) ?? /\((\d+)\s*marks?\)\s*$/i.exec(line)
  if (!m) return { text: line.trim(), marks: 0 }
  const n = Number(m[1])
  return { text: line.slice(0, m.index).trim(), marks: Number.isFinite(n) ? n : 0 }
}

/**
 * Parse model output into an AiWorksheet. Tolerant: unknown lines are ignored,
 * solution lines attach to the current question, malformed marks → 0.
 */
export function parseWorksheet(md: string): AiWorksheet {
  const ws: AiWorksheet = { title: 'Practice worksheet', meta: '', sections: [], totalMarks: 0 }
  let section: WorksheetSection | null = null
  let q: WorksheetQuestion | null = null
  let inTitle = true

  for (const raw of md.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    const titleM = /^TITLE:\s*(.+)$/i.exec(line)
    if (titleM && inTitle) {
      ws.title = titleM[1].trim()
      continue
    }
    const metaM = /^META:\s*(.+)$/i.exec(line)
    if (metaM) {
      ws.meta = metaM[1].trim()
      if (ws.meta) inTitle = false
      continue
    }

    const secM = /^#{2,4}\s*(?:Section\s+)?([A-F])\s*[—–-]?\s*(.*)$/i.exec(line)
    if (secM) {
      inTitle = false
      section = { letter: secM[1].toUpperCase(), title: secM[2].trim() || `Section ${secM[1].toUpperCase()}`, intro: '', questions: [] }
      ws.sections.push(section)
      q = null
      continue
    }

    const qM = /^(\d{1,2})[.)]\s*(.+)$/.exec(line)
    if (qM && section) {
      inTitle = false
      const { text, marks } = parseMarks(qM[2])
      q = { n: Number(qM[1]), prompt: text, marks, solution: '' }
      ws.totalMarks += q.marks
      section.questions.push(q)
      continue
    }

    const solM = /^[-*]?\s*(?:\*\*)?Sol(?:ution)?(?:\*\*)?\s*:\s*(.*)$/i.exec(line)
    if (solM && q) {
      q.solution = solM[1].trim()
      continue
    }

    // Continuation lines
    if (q && (line.startsWith('- ') || line.startsWith('* ')) && q.solution) {
      q.solution += '\n' + line.replace(/^[-*]\s*/, '').trim()
      continue
    }
    if (q && !q.solution) {
      q.prompt += ' ' + line
      continue
    }
    if (section && !q) {
      section.intro = section.intro ? section.intro + ' ' + line : line
    }
  }

  ws.sections = ws.sections.filter((s) => s.questions.length > 0)
  if (ws.totalMarks === 0) {
    // Model omitted marks entirely — count questions instead so the UI still sums.
    ws.totalMarks = ws.sections.reduce((n, s) => n + s.questions.length, 0)
  }
  return ws
}

/** Worksheet → standalone Markdown (for download / printing source). */
export function worksheetToMarkdown(ws: AiWorksheet, subjectCode: string): string {
  const out: string[] = [`# ${ws.title}`, '', `_${ws.meta || subjectCode}_`, '']
  for (const s of ws.sections) {
    out.push(`## Section ${s.letter} — ${s.title}`)
    if (s.intro) out.push('', s.intro)
    out.push('')
    for (const q of s.questions) {
      out.push(`**${q.n}.** ${q.prompt}${q.marks ? ` _(${q.marks} marks)_` : ''}`)
      if (q.solution) out.push('', '> **Solution.** ' + q.solution.replace(/\n/g, '\n> '))
      out.push('')
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

/** Filename-safe slug for downloads. */
export function worksheetFilename(ws: AiWorksheet): string {
  const slug = ws.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
  return `${slug || 'worksheet'}-${new Date().toISOString().slice(0, 10)}.md`
}
