import type { Subject, TopicId } from '../data/schema'

/**
 * Global search across formulas and variables: id, name, plain-text
 * description/explanation and a symbol alias map (e.g. "rho" → ρ).
 * Returns ranked matches; the UI dims non-matching graph nodes.
 */

export interface SearchHit {
  kind: 'formula' | 'variable'
  id: string
  name: string
  weekTags: number[]
  topicIds: TopicId[]
  score: number
}

const SYMBOL_ALIASES: Record<string, string> = {
  rho: 'ρ', theta: 'θ', alpha: 'α', gamma: 'γ', sigma: 'σ', tau: 'τ', lambda: 'λ',
  nu: 'ν', mu: 'μ', epsilon: 'ε', eta: 'η', pi: 'π', omega: 'ω', delta: 'δ', bar: 'c̄',
}

function normalize(s: string): string {
  return s.toLowerCase().trim()
}

/** Expand a query with alias equivalents so "rho" finds ρ and vice versa. */
function expandQuery(q: string): string[] {
  const terms = normalize(q).split(/\s+/).filter(Boolean)
  const out: string[] = []
  for (const t of terms) {
    out.push(t)
    const alias = SYMBOL_ALIASES[t]
    if (alias) out.push(alias)
  }
  return out
}

export function search(subject: Subject, query: string): SearchHit[] {
  const terms = expandQuery(query)
  if (terms.length === 0) return []
  const hits: SearchHit[] = []

  for (const f of subject.formulas) {
    const haystacks = [f.name.toLowerCase(), f.id, f.explanation.toLowerCase(), f.latex.toLowerCase()]
    let score = 0
    for (const term of terms) {
      if (haystacks[0].includes(term)) score += 3
      else if (haystacks[2].includes(term) || haystacks[3].includes(term)) score += 1
      else if (haystacks[1].includes(term)) score += 2
      else { score = -1; break }
    }
    if (score > 0) {
      hits.push({ kind: 'formula', id: f.id, name: f.name, weekTags: f.weekTags, topicIds: f.topicIds, score })
    }
  }

  for (const v of subject.variables) {
    const haystacks = [v.name.toLowerCase(), v.id, v.description.toLowerCase(), v.latex.toLowerCase()]
    let score = 0
    for (const term of terms) {
      if (haystacks[0].includes(term)) score += 3
      else if (haystacks[2].includes(term) || haystacks[3].includes(term)) score += 1
      else if (haystacks[1].includes(term)) score += 2
      else { score = -1; break }
    }
    if (score > 0) {
      hits.push({ kind: 'variable', id: v.id, name: v.name, weekTags: v.weekTags, topicIds: v.weekTags.map(String) as unknown as TopicId[], score })
    }
  }

  return hits.sort((a, b) => b.score - a.score)
}
