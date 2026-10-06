import { Lock } from '@phosphor-icons/react'
import { useApp } from '../../state/store'
import type { Subject } from '../../data/schema'
import { MasterDot, PriorityChip, SourceChip, Tex, WeekChips } from '../../components/common'

export function ListView({ subject }: { subject: Subject }) {
  const openWindow = useApp((s) => s.openWindow)
  const mastered = useApp((s) => s.mastered)
  const toggleMastered = useApp((s) => s.toggleMastered)
  const weekFilter = useApp((s) => s.weekFilter)

  const visibleWeeks = subject.weeks.filter((w) => weekFilter === 'all' || w.number === weekFilter)

  return (
    <div className="list-scroll scroll-glass">
      <div className="list-inner">
        {weekFilter === 'all' && (
          <>
            <section>
              <div className="section-label" style={{ marginBottom: 10 }}>Exam radar: practice-exam focus areas</div>
              <div className="radar-grid">
                {subject.examRadar.map((r) => (
                  <div
                    key={r.id}
                    className="radar-card glass anim-rise"
                    onClick={() => r.relatedIds[0] && openWindow({ kind: 'formula', id: r.relatedIds[0] })}
                  >
                    <div className="radar-card__title"><SourceChip s={r.source} /> {r.title}</div>
                    <div className="radar-card__detail">{r.detail}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="isa-card glass anim-rise">
              <div className="section-label" style={{ marginBottom: 10 }}>ISA quick table (Appendix)</div>
              <table className="isa-table">
                <thead>
                  <tr>
                    <th>Alt (ft)</th><th>Temp (°C)</th><th>Pressure (Pa)</th>
                    <th>Density (kg/m³)</th><th>a (m/s)</th><th>μ (Pa·s)</th>
                  </tr>
                </thead>
                <tbody>
                  {subject.isaTable.map((row) => (
                    <tr key={row.altitudeFt}>
                      <td><b>{row.altitudeFt.toLocaleString()}</b></td>
                      <td>{row.tempC.toFixed(1)}</td>
                      <td>{row.pressurePa.toLocaleString()}</td>
                      <td>{row.densityKgM3.toFixed(3)}</td>
                      <td>{row.speedOfSoundMs}</td>
                      <td>{(row.viscosityPaS * 1e5).toFixed(2)}×10⁻⁵</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        {visibleWeeks.map((week) => {
          const weekFormulas = subject.formulas.filter((f) => f.weekTags.includes(week.number))
          return (
            <section key={week.number} className="week-block glass anim-rise">
              <header className="week-block__head">
                <span className="week-block__num">{week.number}</span>
                <span className="week-block__title">{week.title}</span>
                <span className="week-block__focus">{week.examFocus[0]}</span>
              </header>
              {week.locked ? (
                <div className="locked-banner">
                  <Lock size={14} /> {week.examFocus[0]}
                </div>
              ) : (
                <table className="week-block__table">
                  <tbody>
                    {weekFormulas.map((f) => (
                      <tr key={f.id}>
                        <td>
                          <div className="row-formula" onClick={() => openWindow({ kind: 'formula', id: f.id })}>
                            <MasterDot
                              on={mastered.has(f.id)}
                              onClick={() => toggleMastered(f.id)}
                            />
                            <span className="row-formula__name">{f.name}</span>
                            <span className="row-formula__tex"><Tex tex={f.latex} /></span>
                            <span className="row-formula__meta">
                              <WeekChips weeks={f.weekTags} />
                              <PriorityChip p={f.examPriority} />
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
