import { useMemo } from 'react'
import { useApp } from '../../state/store'
import type { Formula, Subject } from '../../data/schema'
import { Tex } from '../../components/common'

function Stat({ num, label, tone }: { num: string | number; label: string; tone?: 'accent' | 'success' }) {
  return (
    <div className="stat-card glass">
      <div className={`stat-card__num${tone ? ` stat-card__num--${tone}` : ''}`}>{num}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  )
}

export function HomeView({ subject }: { subject: Subject }) {
  const setView = useApp((s) => s.setView)
  const openWindow = useApp((s) => s.openWindow)
  const mastered = useApp((s) => s.mastered)
  const attempts = useApp((s) => s.attempts)

  const totalItems = subject.formulas.length + subject.variables.length
  const pct = totalItems ? Math.round((mastered.size / totalItems) * 100) : 0

  const best = attempts.length ? Math.max(...attempts.map((a) => (a.total ? (a.score / a.total) * 100 : 0))) : 0

  /** Next focus: first non-mastered core formula (by week), else first non-mastered high. */
  const nextUp: Formula | undefined = useMemo(() => {
    const byWeek = [...subject.formulas].sort(
      (a, b) => Math.min(...a.weekTags) - Math.min(...b.weekTags),
    )
    return (
      byWeek.find((f) => f.examPriority === 'core' && !mastered.has(f.id)) ??
      byWeek.find((f) => f.examPriority === 'high' && !mastered.has(f.id)) ??
      byWeek.find((f) => !mastered.has(f.id)) ??
      byWeek[0]
    )
  }, [subject, mastered])

  const unlockedWeeks = subject.weeks.filter((w) => !w.locked)
  const latestWeek = unlockedWeeks[unlockedWeeks.length - 1]

  return (
    <div className="home-wrap scroll-glass">
      <div className="home-inner">
        {/* Hero */}
        <section className="hero glass glass--strong anim-rise">
          <div className="hero__eyebrow">{subject.institution} · {subject.examMeta}</div>
          <h1 className="hero__title">{subject.title}</h1>
          <p className="hero__sub">
            45 formulas · {subject.variables.length} variables · 11 weeks · quiz bank of {subject.quizBank.length} —
            everything examinable, one interactive web.
          </p>
          <div className="hero__cta">
            <button className="btn btn--hero" onClick={() => setView('graph')}>Explore the web</button>
            <button className="btn" onClick={() => setView('chat')}>Ask the tutor</button>
            <button className="btn" onClick={() => setView('quiz')}>Test me</button>
          </div>
        </section>

        {/* Stats */}
        <div className="stat-strip anim-rise">
          <Stat num={`${pct}%`} label="Course mastered" tone={pct >= 80 ? 'success' : 'accent'} />
          <Stat num={mastered.size} label={`of ${totalItems} items`} />
          <Stat num={attempts.length} label="Quiz attempts" />
          <Stat num={`${Math.round(best)}%`} label="Best score" tone={best >= 70 ? 'success' : undefined} />
        </div>

        <div className="home-grid">
          {/* Focus next */}
          {nextUp && (
            <section className="home-card glass anim-rise" onClick={() => openWindow({ kind: 'formula', id: nextUp.id })} role="button">
              <div className="section-label">Focus next</div>
              <div className="home-card__title">{nextUp.name}</div>
              <div className="home-card__formula"><Tex tex={nextUp.latex} display /></div>
              <div className="home-card__hint">
                Week {nextUp.weekTags.join(' & ')} · {nextUp.examPriority === 'core' ? '★ core' : 'high yield'} — click to open its window
              </div>
            </section>
          )}

          {/* Exam radar */}
          <section className="home-card glass anim-rise">
            <div className="section-label">Exam radar</div>
            {subject.examRadar.map((r) => (
              <button
                key={r.id}
                className="home-radar-row"
                onClick={() => r.relatedIds[0] && openWindow({ kind: 'formula', id: r.relatedIds[0] })}
              >
                <span>{r.title}</span>
                <span className="home-radar-row__go">→</span>
              </button>
            ))}
          </section>

          {/* Week map */}
          <section className="home-card glass anim-rise">
            <div className="section-label">Week map</div>
            <div className="week-map">
              {subject.weeks.map((w) => (
                <button
                  key={w.number}
                  className={`week-map__cell${w.locked ? ' week-map__cell--locked' : ''}`}
                  title={w.locked ? 'Unlocks closer to exam time' : w.title}
                  onClick={() => { if (!w.locked) { setView('list'); useApp.getState().setWeekFilter(w.number) } }}
                >
                  {w.number}
                </button>
              ))}
            </div>
            <div className="home-card__hint">Tap a week to open it in the list · Wk 11 locks until revision week</div>
          </section>

          {/* Latest material */}
          <section className="home-card glass anim-rise" onClick={() => { setView('list'); useApp.getState().setWeekFilter(latestWeek.number) }}>
            <div className="section-label">Latest material</div>
            <div className="home-card__title">Week {latestWeek.number}</div>
            <div className="home-card__hint">{latestWeek.title} — {latestWeek.examFocus[0]}</div>
          </section>
        </div>
      </div>
    </div>
  )
}
