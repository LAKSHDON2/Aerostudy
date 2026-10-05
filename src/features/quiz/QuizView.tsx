import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../../state/store'
import type { Subject } from '../../data/schema'
import { buildSession, scoreSession } from '../../services/quiz'
import { RichText } from '../../components/common'

export function QuizView({ subject }: { subject: Subject }) {
  const session = useApp((s) => s.session)
  const phase = useApp((s) => s.phase)
  const answers = useApp((s) => s.answers)
  const attempts = useApp((s) => s.attempts)
  const startSession = useApp((s) => s.startSession)
  const setAnswer = useApp((s) => s.setAnswer)
  const finishSession = useApp((s) => s.finishSession)
  const exitQuiz = useApp((s) => s.exitQuiz)
  const [cursor, setCursor] = useState(0)
  const [weekPick, setWeekPick] = useState(2)

  // New session → start at question 1
  useEffect(() => {
    setCursor(0)
  }, [session?.id])

  const question = phase === 'running' && session ? session.questions[cursor] : undefined
  const picked = cursor < answers.length ? answers[cursor] : null
  const revealed = question != null && picked != null
  const isLast = session ? cursor + 1 >= session.questions.length : false

  const score = useMemo(
    () => (session ? scoreSession(session.questions, answers) : { score: 0, total: 0 }),
    [session, answers],
  )

  if (phase === 'setup' || !session) {
    return (
      <div className="quiz-wrap scroll-glass">
        <div className="quiz-inner">
          <div className="section-label">Test yourself — scores are saved on this device</div>
          <div className="mode-grid">
            <button className="mode-card glass anim-rise" onClick={() => startSession(buildSession(subject, 'quick10'))}>
              <div className="mode-card__title">⚡ Quick 10</div>
              <div className="mode-card__desc">Mixed sprint: handwritten exam questions plus auto-generated symbol and unit drills.</div>
            </button>
            <button className="mode-card glass anim-rise" onClick={() => startSession(buildSession(subject, 'mock'))}>
              <div className="mode-card__title">📝 Mock 20</div>
              <div className="mode-card__desc">Longer set weighted toward ★ Core Appendix and practice-exam material.</div>
            </button>
          </div>
          <div className="section-label" style={{ marginTop: 6 }}>Week focus</div>
          <div className="filters">
            <select className="input" value={weekPick} onChange={(e) => setWeekPick(Number(e.target.value))}>
              {subject.weeks.filter((w) => !w.locked).map((w) => (
                <option key={w.number} value={w.number}>Week {w.number} — {w.title}</option>
              ))}
            </select>
            <button className="btn btn--primary" onClick={() => startSession(buildSession(subject, 'week', weekPick))}>
              Start week quiz
            </button>
          </div>

          {attempts.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: 10 }}>Recent attempts</div>
              {[...attempts].reverse().slice(0, 6).map((a, i) => (
                <div className="attempt-row glass glass--soft" key={i}>
                  <span>{new Date(a.at).toLocaleString()} · {a.mode}</span>
                  <b>{a.score}/{a.total} ({Math.round((a.score / a.total) * 100)}%)</b>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    const pct = score.total ? Math.round((score.score / score.total) * 100) : 0
    return (
      <div className="quiz-wrap scroll-glass">
        <div className="quiz-inner">
          <div className="score-hero glass anim-rise">
            <div className="score-hero__num">{pct}%</div>
            <div style={{ fontWeight: 700 }}>{score.score} of {score.total} correct</div>
            <div className="prose">
              {pct >= 85 ? 'Exam-ready. Keep this pace.' : pct >= 60 ? 'Solid — drill the misses once more.' : 'Revisit the ★ Core formulas, then retry.'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn--primary"
                onClick={() =>
                  startSession(
                    buildSession(subject, session.mode === 'week' ? 'week' : session.mode, session.mode === 'week' ? weekPick : undefined),
                  )
                }
              >
                Go again
              </button>
              <button className="btn" onClick={exitQuiz}>Back to modes</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Running
  return (
    <div className="quiz-wrap scroll-glass">
      <div className="quiz-inner">
        <div className="quiz-progress">
          <div className="quiz-progress__fill" style={{ width: `${(cursor / session.questions.length) * 100}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="section-label" style={{ margin: 0 }}>
            Question {cursor + 1} of {session.questions.length} · {question?.type.replace('-', ' ')}
          </span>
          <button className="btn btn--ghost" onClick={exitQuiz}>Exit</button>
        </div>

        {question && (
          <div className="quiz-card glass anim-rise" key={`${session.id}-${cursor}`}>
            <div className="quiz-card__prompt"><RichText text={question.prompt} /></div>
            {question.options.map((opt, oi) => {
              const isCorrect = oi === question.answerIndex
              const cls = revealed
                ? isCorrect
                  ? 'option--correct'
                  : picked === oi
                    ? 'option--wrong'
                    : ''
                : ''
              return (
                <button
                  key={oi}
                  className={`option ${cls}`}
                  disabled={revealed}
                  onClick={() => setAnswer(cursor, oi)}
                >
                  <span className="option__key">{String.fromCharCode(65 + oi)}</span>
                  <span><RichText text={opt} /></span>
                </button>
              )
            })}
            {revealed && (
              <div className="prose" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 10 }}>
                <b style={{ color: 'var(--success)' }}>Why: </b><RichText text={question.explanation} />
              </div>
            )}
            {revealed && (
              <button
                className="btn btn--primary"
                style={{ justifyContent: 'center' }}
                onClick={() => {
                  if (isLast) finishSession(score.score, score.total)
                  else setCursor(cursor + 1)
                }}
              >
                {isLast ? 'See score' : 'Next question'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
