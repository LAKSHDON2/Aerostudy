/**
 * AERO2687 Study Web — core data schema.
 *
 * One `Subject` package is the single source of truth for every view:
 * graph, list, search, quiz and progress all render from these records.
 * Adding a new subject later = adding a new folder under data/subjects/
 * and registering it in data/registry.ts. No rewrites.
 */

export type TopicId =
  | 'atmosphere'
  | 'aerodynamics'
  | 'airfoils'
  | 'wings'
  | 'performance'
  | 'materials'
  | 'structures'
  | 'propulsion'
  | 'uas'
  | 'rotary'
  | 'simulation'
  | 'space'

export type SourceBadge = 'appendix' | 'practice-exam' | 'lectures' | 'expanded'

export type ExamPriority = 'core' | 'high' | 'medium'

export interface Topic {
  id: TopicId
  name: string
  /** Base hue (0-360) used to derive node/link colours in both themes */
  hue: number
}

export interface Week {
  number: number
  title: string
  topicIds: TopicId[]
  /** High-yield reminders shown on the week card / list view */
  examFocus: string[]
  /** Locked weeks render as a teaser placeholder (Week 11 — Space) */
  locked?: boolean
}

export interface Formula {
  id: string
  name: string
  /** KaTeX display source, e.g. "L = C_L\\,q\\,S" */
  latex: string
  /** Supporting KaTeX variants (alternative forms worth memorising) */
  altLatex?: string[]
  weekTags: number[]
  topicIds: TopicId[]
  /** Plain-English explanation, exam-oriented (2-5 sentences) */
  explanation: string
  /** Exam-grade insight lines (the "they ask this" notes) */
  insights?: string[]
  /** ids of variables, in the order they appear in the formula */
  variableIds: string[]
  relatedFormulaIds: string[]
  examPriority: ExamPriority
  source: SourceBadge
}

export interface VariableTypical {
  context: string
  range: string
}

export interface Variable {
  id: string
  name: string
  /** KaTeX symbol, e.g. "\\rho" */
  latex: string
  /** ~50-word plain-English description */
  description: string
  units: { si: string; other?: string[] }
  /** Shown only inside the expandable toggle */
  typicalValues?: VariableTypical[]
  weekTags: number[]
  /** Derived at build/assemble time, but stored for graph edges */
  appearsIn: string[]
}

export type QuizType = 'symbol-to-name' | 'formula-meaning' | 'unit-check' | 'exam-style'

export interface QuizQuestion {
  id: string
  type: QuizType
  weekTags: number[]
  topicIds: TopicId[]
  prompt: string
  /** KaTeX allowed inline via $...$ delimiters */
  options: string[]
  answerIndex: number
  explanation: string
  /** id of the formula/variable this question tests */
  sourceRef: string
}

export interface IsaRow {
  altitudeFt: number
  tempC: number
  pressurePa: number
  densityKgM3: number
  speedOfSoundMs: number
  viscosityPaS: number
}

export interface ExamRadarItem {
  id: string
  title: string
  detail: string
  /** formula/variable ids worth revising for this item */
  relatedIds: string[]
  source: SourceBadge
}

export interface Subject {
  id: string
  code: string
  title: string
  institution: string
  examMeta: string
  weeks: Week[]
  topics: Topic[]
  formulas: Formula[]
  variables: Variable[]
  quizBank: QuizQuestion[]
  isaTable: IsaRow[]
  examRadar: ExamRadarItem[]
}

/** Every graph entity is a formula or a variable node */
export type GraphNodeData =
  | ({ kind: 'formula' } & Formula)
  | ({ kind: 'variable' } & Variable)

export interface GraphLink {
  source: string
  target: string
  /** variable → formula membership, or formula ↔ formula relation */
  relation: 'uses' | 'related'
}
