import { useState } from 'react'
import { useApp } from '../../state/store'
import type { Subject } from '../../data/schema'
import { PriorityChip, RichText, SourceChip, Tex, WeekChips } from '../../components/common'
import { buildShareUrl } from '../../services/deepLink'

/** Expandable units + typical-values card (kept collapsed by default). */
function UnitToggle({ si, other, typical }: { si: string; other?: string[]; typical?: { context: string; range: string }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="toggle-card">
      <button className={`toggle-card__head${open ? ' open' : ''}`} onClick={() => setOpen(!open)}>
        <span>Units &amp; typical values</span>
        <span className="chev">▾</span>
      </button>
      {open && (
        <div className="toggle-card__body">
          <div className="kv"><span className="k">SI unit</span><span className="v">{si}</span></div>
          {other && other.length > 0 && (
            <div className="kv"><span className="k">Also seen as</span><span className="v">{other.join(' · ')}</span></div>
          )}
          {typical?.map((t, i) => (
            <div className="kv" key={i}><span className="k">{t.context}</span><span className="v">{t.range}</span></div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Copies text even in webviews that deny or hang on the async clipboard API. */
async function copyText(text: string): Promise<'ok' | 'fail'> {
  try {
    const timeout = new Promise<never>((_, rej) => window.setTimeout(() => rej(new Error('clipboard timeout')), 1500))
    await Promise.race([navigator.clipboard.writeText(text), timeout])
    return 'ok'
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok ? 'ok' : 'fail'
    } catch {
      return 'fail'
    }
  }
}

/** Copies a URL that reopens this exact item in this exact view. */
function CopyLinkButton({ kind, id }: { kind: 'formula' | 'variable'; id: string }) {
  const view = useApp((s) => s.view)
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const onCopy = () => {
    copyText(buildShareUrl({ view, window: { kind, id } })).then((r) => {
      setState(r === 'ok' ? 'copied' : 'failed')
      window.setTimeout(() => setState('idle'), 1800)
    })
  }
  const label = state === 'copied' ? '✓ Link copied' : state === 'failed' ? '⚠ Copy failed' : '🔗 Copy link'
  return (
    <button className="btn copy-link-btn" title="Copy a link that opens this exact item" onClick={onCopy}>
      {label}
    </button>
  )
}

/**
 * Full detail body for one formula/variable, inside a floating window.
 * Clicking variables / related formulas NAVIGATES that window (with per-window
 * Back); Ctrl/Cmd+click opens it in its own window instead.
 */
export function DetailContent({ subject, windowKey, kind, id }: { subject: Subject; windowKey: string; kind: 'formula' | 'variable'; id: string }) {
  const navigateWindow = useApp((s) => s.navigateWindow)
  const openWindow = useApp((s) => s.openWindow)
  const mastered = useApp((s) => s.mastered)
  const toggleMastered = useApp((s) => s.toggleMastered)

  const formula = kind === 'formula' ? subject.formulas.find((f) => f.id === id) : undefined
  const variable = kind === 'variable' ? subject.variables.find((v) => v.id === id) : undefined
  if (!formula && !variable) return null

  const isMastered = mastered.has(id)
  const weeks = formula?.weekTags ?? variable!.weekTags
  const chipWeeks = weeks.length > 2 ? [weeks[0], weeks[weeks.length - 1]] : weeks

  /** Chip click: navigate this window; Ctrl/Cmd+click: open in a new window. */
  const chipClick = (e: React.MouseEvent, target: { kind: 'formula' | 'variable'; id: string }) => {
    if (e.metaKey || e.ctrlKey) openWindow(target)
    else navigateWindow(windowKey, target)
  }

  return (
    <>
      <div className="win__tags">
        <WeekChips weeks={chipWeeks} />
        {formula && <PriorityChip p={formula.examPriority} />}
        {formula && <SourceChip s={formula.source} />}
        {variable && <SourceChip s="lectures" />}
      </div>

      {formula && (
        <>
          <div className="formula-card">
            <Tex tex={formula.latex} display />
            {formula.altLatex?.map((alt, i) => <Tex key={i} tex={alt} display />)}
          </div>
          <div>
            <div className="section-label">What it means</div>
            <p className="prose"><RichText text={formula.explanation} /></p>
          </div>
          {formula.insights && formula.insights.length > 0 && (
            <div>
              <div className="section-label">Exam insights</div>
              {formula.insights.map((ins, i) => (
                <div className="insight" key={i}><span className="bullet">▸</span><span><RichText text={ins} /></span></div>
              ))}
            </div>
          )}
          {formula.variableIds.length > 0 && (
            <div>
              <div className="section-label">Variables in this formula</div>
              <div className="link-chips">
                {formula.variableIds.map((vid) => {
                  const v = subject.variables.find((x) => x.id === vid)
                  if (!v) return null
                  return (
                        <button key={vid} className="link-chip" title="Click to open here · Ctrl/Cmd+click for a new window" onClick={(e) => chipClick(e, { kind: 'variable', id: vid })}>
                          <span className="sym"><Tex tex={v.latex} /></span> {v.name}
                        </button>
                      )
                })}
              </div>
            </div>
          )}
          {formula.relatedFormulaIds.length > 0 && (
            <div>
              <div className="section-label">Related formulas</div>
              <div className="link-chips">
                {formula.relatedFormulaIds.map((fid) => {
                  const f = subject.formulas.find((x) => x.id === fid)
                  if (!f) return null
                  return (
                        <button key={fid} className="link-chip" title="Click to open here · Ctrl/Cmd+click for a new window" onClick={(e) => chipClick(e, { kind: 'formula', id: fid })}>
                          {f.name}
                        </button>
                      )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {variable && (
        <>
          <div className="formula-card">
            <Tex tex={variable.latex} display />
          </div>
          <div>
            <div className="section-label">What it is</div>
            <p className="prose">{variable.description}</p>
          </div>
          <UnitToggle si={variable.units.si} other={variable.units.other} typical={variable.typicalValues} />
          {variable.appearsIn.length > 0 && (
            <div>
              <div className="section-label">Appears in {variable.appearsIn.length} formula{variable.appearsIn.length === 1 ? '' : 's'}</div>
              <div className="link-chips">
                {variable.appearsIn.map((fid) => {
                  const f = subject.formulas.find((x) => x.id === fid)
                  if (!f) return null
                  return (
                        <button key={fid} className="link-chip" title="Click to open here · Ctrl/Cmd+click for a new window" onClick={(e) => chipClick(e, { kind: 'formula', id: fid })}>
                          {f.name}
                        </button>
                      )
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="detail-btn-row">
        <CopyLinkButton kind={kind} id={id} />
        <button
          className={`btn mastered-btn${isMastered ? ' mastered-btn--on' : ''}`}
          onClick={() => toggleMastered(id)}
        >
          {isMastered ? '✓ Mastered' : 'Mark as mastered'}
        </button>
      </div>
    </>
  )
}
