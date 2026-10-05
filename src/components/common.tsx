import { useMemo } from 'react'
import katex from 'katex'

/** KaTeX renderer with error resilience (bad input never crashes the UI). */
export function Tex({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false, output: 'html' })
    } catch {
      return tex
    }
  }, [tex, display])
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Renders text containing inline $...$ math segments. */
export function RichText({ text }: { text: string }) {
  const parts = text.split('$')
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <Tex key={i} tex={p} /> : <span key={i}>{p}</span>,
      )}
    </>
  )
}

/** Week tag chips with overlap support (multi-week formulas stack). */
export function WeekChips({ weeks }: { weeks: number[] }) {
  return (
    <span className="chip-stack">
      {weeks.map((w) => (
        <span key={w} className="chip chip--week" title={`Week ${w}`}>
          W{w}
        </span>
      ))}
    </span>
  )
}

export function PriorityChip({ p }: { p: 'core' | 'high' | 'medium' }) {
  return <span className={`chip chip--priority-${p}`}>{p === 'core' ? '★ Core' : p === 'high' ? 'High yield' : 'Support'}</span>
}

const SOURCE_LABEL: Record<string, string> = {
  appendix: 'Appendix',
  'practice-exam': 'Practice exam',
  lectures: 'Lectures',
  expanded: 'Expanded',
}

export function SourceChip({ s }: { s: string }) {
  return <span className="chip chip--source">{SOURCE_LABEL[s] ?? s}</span>
}

export function MasterDot({ on, onClick, title }: { on: boolean; onClick: () => void; title?: string }) {
  return (
    <button
      className={`master-dot${on ? ' on' : ''}`}
      title={title ?? (on ? 'Mastered — click to unmark' : 'Mark as mastered')}
      aria-pressed={on}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </button>
  )
}
