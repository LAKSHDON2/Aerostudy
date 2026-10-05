import type { Subject, TopicId } from '../../data/schema'
import type { ForceGraph3DInstance } from '3d-force-graph'

export interface GNode {
  id: string
  kind: 'formula' | 'variable'
  name: string
  weekTags: number[]
  topicIds: TopicId[]
  priority?: 'core' | 'high' | 'medium'
  val: number
  color: string
  dim: boolean
  x?: number
  y?: number
  z?: number
  __labelObj?: unknown
}

export interface GLink {
  source: string | GNode
  target: string | GNode
  relation: 'uses' | 'related'
}

const DEFAULT_HUE = 217

export function topicColor(subject: Subject, topicIds: TopicId[]): string {
  const first = topicIds[0]
  const topic = subject.topics.find((t) => t.id === first)
  const hue = topic?.hue ?? DEFAULT_HUE
  return `hsl(${hue} 85% 66%)`
}

export function buildGraphData(subject: Subject) {
  const nodes: GNode[] = []
  const links: GLink[] = []
  const degree = new Map<string, number>()

  for (const f of subject.formulas) {
    for (const vid of f.variableIds) degree.set(vid, (degree.get(vid) ?? 0) + 1)
    for (const rid of f.relatedFormulaIds) {
      degree.set(rid, (degree.get(rid) ?? 0) + 1)
      degree.set(f.id, (degree.get(f.id) ?? 0) + 1)
    }
  }

  for (const f of subject.formulas) {
    const size = f.examPriority === 'core' ? 9 : f.examPriority === 'high' ? 6.5 : 4.5
    nodes.push({
      id: f.id,
      kind: 'formula',
      name: f.name,
      weekTags: f.weekTags,
      topicIds: f.topicIds,
      priority: f.examPriority,
      val: size + (degree.get(f.id) ?? 0) * 0.35,
      color: topicColor(subject, f.topicIds),
      dim: false,
    })
    for (const vid of f.variableIds) links.push({ source: f.id, target: vid, relation: 'uses' })
    for (const rid of f.relatedFormulaIds) {
      if (f.id < rid) links.push({ source: f.id, target: rid, relation: 'related' })
    }
  }

  for (const v of subject.variables) {
    nodes.push({
      id: v.id,
      kind: 'variable',
      name: v.name,
      weekTags: v.weekTags,
      topicIds: [firstTopicOf(subject, v)],
      val: 2 + (degree.get(v.id) ?? 0) * 0.55,
      color: v.weekTags.includes(11) ? '#94a3b8' : 'rgba(148,163,184,0.9)',
      dim: false,
    })
  }

  return { nodes, links }
}

function firstTopicOf(subject: Subject, v: { id: string }): TopicId {
  const f = subject.formulas.find((x) => x.variableIds.includes(v.id))
  return f?.topicIds[0] ?? 'aerodynamics'
}

/** Filter + search → dim flags. Fades, never removes, so layout stays stable. */
export function applyDimming(
  nodes: GNode[],
  subject: Subject,
  weekFilter: number | 'all',
  topicFilter: string | 'all',
  matchIds: Set<string> | null,
) {
  for (const n of nodes) {
    let visible = true
    if (weekFilter !== 'all') visible = visible && n.weekTags.includes(weekFilter as number)
    if (topicFilter !== 'all') {
      const topicWeeks = subject.weeks
        .filter((w) => w.topicIds.includes(topicFilter as TopicId))
        .map((w) => w.number)
      visible = visible && (n.topicIds.includes(topicFilter as TopicId) || n.weekTags.some((w) => topicWeeks.includes(w)))
    }
    if (matchIds) visible = visible && matchIds.has(n.id)
    n.dim = !visible
  }
}

export type FG = ForceGraph3DInstance
