/**
 * Deep links — shareable URLs for the app's view + open detail window.
 *
 * Format (hash-based, works on any static host):
 *   #/v/graph                      → open the graph view
 *   #/v/graph/w/formula/f-lift     → graph view + floating window on f-lift
 *
 * Pure functions only: parseHash/formatHash are unit-tested and safe to run
 * in any environment. Store wiring lives in state/store.ts.
 */
import type { ViewName } from '../state/store'

export type DeepKind = 'formula' | 'variable'

export interface DeepLinkState {
  view: ViewName
  /** Optional detail window to open on top of the view. */
  window: { kind: DeepKind; id: string } | null
}

const VIEWS: readonly ViewName[] = ['home', 'graph', 'list', 'quiz', 'progress', 'chat', 'files', 'help']
/** Safe id charset — a malformed/garbage hash is ignored, never applied. */
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/

/** Parse `#/v/<view>` or `#/v/<view>/w/<kind>/<id>`. Returns null for anything else. */
export function parseHash(hash: string): DeepLinkState | null {
  if (!hash) return null
  const segs = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (segs[0] !== 'v') return null
  const view = segs[1] as ViewName
  if (!VIEWS.includes(view)) return null

  if (segs.length === 2) return { view, window: null }

  if (segs.length === 5 && segs[2] === 'w') {
    const kind = segs[3]
    const id = segs[4]
    if ((kind === 'formula' || kind === 'variable') && ID_RE.test(id)) {
      return { view, window: { kind, id } }
    }
  }
  return null
}

/** Inverse of parseHash (canonical form). */
export function formatHash(s: DeepLinkState): string {
  const base = `#/v/${s.view}`
  return s.window ? `${base}/w/${s.window.kind}/${s.window.id}` : base
}

/** Full absolute URL for sharing (origin + deploy subpath + hash). */
export function buildShareUrl(s: DeepLinkState): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}${formatHash(s)}`
}
