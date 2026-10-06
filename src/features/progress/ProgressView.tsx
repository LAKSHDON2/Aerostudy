import { useState } from 'react'
import { useApp } from '../../state/store'
import type { Subject } from '../../data/schema'
import { clearSubjectProgress } from '../../services/storage'

function Ring({ pct, label }: { pct: number; label: string }) {
  const r = 34
  const c = 2 * Math.PI * r
  const filled = (Math.min(pct, 100) / 100) * c
  return (
    <div className="ring-card glass">
      <div className="ring">
        <svg width="84" height="84" viewBox="0 0 84 84">
          <circle cx="42" cy="42" r={r} fill="none" stroke="var(--glass-border)" strokeWidth="7" />
          <circle
            cx="42" cy="42" r={r} fill="none"
            stroke={pct >= 80 ? 'var(--success)' : 'var(--accent)'}
            strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${filled} ${c - filled}`}
          />
        </svg>
        <div className="ring__num">{Math.round(pct)}%</div>
      </div>
      <div className="ring__label">{label}</div>
    </div>
  )
}

export function ProgressView({ subject }: { subject: Subject }) {
  const [confirmReset, setConfirmReset] = useState(false)
  const mastered = useApp((s) => s.mastered)
  const attempts = useApp((s) => s.attempts)
  const subjectId = useApp((s) => s.subjectId)

  const totalItems = subject.formulas.length + subject.variables.length
  const bestPct = attempts.length
    ? Math.max(...attempts.map((a) => (a.total ? (a.score / a.total) * 100 : 0)))
    : 0
  const avgPct = attempts.length
    ? attempts.reduce((acc, a) => acc + (a.total ? (a.score / a.total) * 100 : 0), 0) / attempts.length
    : 0

  const weeks = subject.weeks.filter((w) => !w.locked)
  const weekItems = (weekNo: number) =>
    subject.formulas.filter((f) => f.weekTags.includes(weekNo)).length +
    subject.variables.filter((v) => v.weekTags.includes(weekNo)).length
  const weekMastered = (weekNo: number) =>
    [...subject.formulas, ...subject.variables].filter(
      (x) => x.weekTags.includes(weekNo) && mastered.has(x.id),
    ).length

  return (
    <div className="progress-wrap scroll-glass">
      <div className="progress-inner">
        <div className="stat-strip">
          <div className="stat-card glass"><div className="stat-card__num">{mastered.size}</div><div className="stat-card__label">Items mastered</div></div>
          <div className="stat-card glass"><div className="stat-card__num">{totalItems}</div><div className="stat-card__label">Total items</div></div>
          <div className="stat-card glass"><div className="stat-card__num">{attempts.length}</div><div className="stat-card__label">{attempts.length === 1 ? 'Quiz attempt' : 'Quiz attempts'}</div></div>
          <div className="stat-card glass"><div className="stat-card__num">{Math.round(bestPct)}%</div><div className="stat-card__label">Best score</div></div>
          <div className="stat-card glass"><div className="stat-card__num">{Math.round(avgPct)}%</div><div className="stat-card__label">Average</div></div>
        </div>

        <div className="section-label">Progress by week. Mark formulas and variables as mastered to fill these</div>
        <div className="ring-row">
          {weeks.map((w) => {
            const total = weekItems(w.number)
            const done = weekMastered(w.number)
            return (
              <Ring key={w.number} pct={total ? (done / total) * 100 : 0} label={`Wk ${w.number} · ${w.title}`} />
            )
          })}
        </div>

        {attempts.length > 0 && (
          <>
            <div className="section-label" style={{ marginTop: 6 }}>Full quiz history</div>
            {[...attempts].reverse().map((a, i) => (
              <div className="attempt-row glass glass--soft" key={i}>
                <span>{new Date(a.at).toLocaleString()} · {a.mode}</span>
                <b>{a.score}/{a.total} ({Math.round((a.score / a.total) * 100)}%)</b>
              </div>
            ))}
          </>
        )}

        {confirmReset ? (
          <div className="confirm-row" style={{ alignSelf: 'flex-start' }}>
            <span>Reset all local progress, quiz scores and camera position?</span>
            <button
              className="btn btn--danger btn--sm"
              onClick={() => {
                clearSubjectProgress(subjectId)
                location.reload()
              }}
            >
              Reset
            </button>
            <button className="btn btn--sm" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        ) : (
          <button
            className="btn"
            style={{ alignSelf: 'flex-start', color: 'var(--danger)' }}
            onClick={() => setConfirmReset(true)}
          >
            Reset local progress
          </button>
        )}
      </div>
    </div>
  )
}
