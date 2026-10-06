import { useMemo, useState } from 'react'
import {
  ArrowCounterClockwise,
  DownloadSimple,
  Flask,
  Printer,
  Sparkle,
  X,
} from '@phosphor-icons/react'
import type { Subject } from '../../data/schema'
import { useApp } from '../../state/store'
import { friendlyError } from '../../services/ai'
import { isConfigured } from '../../services/aiSettings'
import { runWithFallback } from '../../services/aiRun'
import { addUsage } from '../../services/aiRun'
import { buildCourseDigest } from '../../services/aiContext'
import {
  buildWorksheetPrompt,
  parseWorksheet,
  worksheetFilename,
  worksheetToMarkdown,
  WORKSHEET_MAX_TOKENS,
  type WorksheetOptions,
} from '../../services/worksheet'
import { RichText } from '../../components/common'

type Stage = 'form' | 'generating' | 'ready'

export default function WorksheetModal({ subject }: { subject: Subject }) {
  const close = useApp((s) => s.closeWorksheet)
  const openSettings = useApp((s) => s.openSettings)
  const weekOptions = useMemo(
    () => subject.weeks.filter((w) => !w.locked).map((w) => ({ label: `Week ${w.number} · ${w.title}`, value: `Week ${w.number} (${w.title})` })),
    [subject],
  )

  const [stage, setStage] = useState<Stage>('form')
  const [scope, setScope] = useState<string>(weekOptions[0]?.value ?? 'full-exam mix')
  const [count, setCount] = useState(8)
  const [difficulty, setDifficulty] = useState<WorksheetOptions['difficulty']>('mixed')
  const [solutions, setSolutions] = useState(true)
  const [focus, setFocus] = useState('')
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [md, setMd] = useState('')
  const [ws, setWs] = useState(() => parseWorksheet(''))

  const configured = isConfigured()

  function reset() {
    setStage('form')
    setProgress('')
    setError(null)
    setMd('')
  }

  async function generate() {
    if (!configured) {
      openSettings()
      return
    }
    setStage('generating')
    setError(null)
    const opts: WorksheetOptions = { scope, count, difficulty, includeSolutions: solutions, focus: focus.trim() || undefined }
    const prompt = buildWorksheetPrompt(subject.code, opts)
    const system = [
      `You are an exam-paper writer for ${subject.code} (${subject.title}).`,
      'Ground truth is the COURSE REFERENCE below — never invent week numbers or formulas outside it.',
      'Write only the worksheet in the exact requested format. No preamble.',
      '',
      '=== COURSE REFERENCE ===',
      buildCourseDigest(subject),
      '=== END COURSE REFERENCE ===',
    ].join('\n')
    try {
      const res = await runWithFallback(
        { system, turns: [{ role: 'user', content: prompt }], model: '', key: '', maxTokens: WORKSHEET_MAX_TOKENS },
        (i, provider, total) => setProgress(total > 1 ? `Trying ${provider} (${i + 1}/${total})…` : `Asking ${provider}…`),
      )
      addUsage(subject.id, res.provider, system.length + prompt.length, res.text.length)
      setMd(res.text)
      setWs(parseWorksheet(res.text))
      setStage('ready')
    } catch (e) {
      setError(friendlyError(e))
      setStage('form')
    }
  }

  function download() {
    const blob = new Blob([md || worksheetToMarkdown(ws, subject.code)], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = worksheetFilename(ws)
    a.click()
    URL.revokeObjectURL(url)
  }

  /** Print via a hidden iframe (app chrome stays out of the page). */
  function print() {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${ws.title}</title>
<style>
  body{font:13px/1.55 Georgia,'Times New Roman',serif;color:#111;max-width:760px;margin:28px auto;padding:0 18px}
  h1{font-size:20px;margin:0 0 2px}h2{font-size:15px;margin:18px 0 4px;border-bottom:1px solid #999;padding-bottom:2px}
  .meta{color:#555;margin:0 0 14px}p{margin:6px 0}
  .q{margin:10px 0 14px}.qn{font-weight:700}.marks{color:#555;font-style:italic;font-weight:400}
  .sol{margin:6px 0 0 18px;padding:6px 10px;border-left:3px solid #999;background:#f6f6f6}
  .sol b{font-variant:small-caps}
  @media print{.sol{background:#fff}}
</style></head><body>
<h1>${ws.title}</h1><p class="meta">${ws.meta || subject.code}</p>
${ws.sections
  .map(
    (s) =>
      `<h2>Section ${s.letter} — ${s.title}</h2>${s.intro ? `<p><em>${s.intro}</em></p>` : ''}` +
      s.questions
        .map(
          (q) =>
            `<div class="q"><span class="qn">${q.n}.</span> ${q.prompt.replace(/\$\$?([^$]+)\$\$?/g, (_m, t) => t)} <span class="marks">(${q.marks} marks)</span>` +
            (q.solution ? `<div class="sol"><b>Solution.</b> ${q.solution.replace(/\n/g, '<br/>').replace(/\$\$?([^$]+)\$\$?/g, (_m, t) => t)}</div>` : '') +
            '</div>',
        )
        .join(''),
  )
  .join('')}
</body></html>`
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.opacity = '0'
    iframe.srcdoc = html
    iframe.onload = () => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      window.setTimeout(() => iframe.remove(), 4000)
    }
    document.body.appendChild(iframe)
  }

  return (
    <div className="settings-overlay" onClick={close} role="presentation">
      <div className="settings-modal glass glass--strong scroll-glass anim-pop ws-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="AI worksheet generator">
        <div className="settings-head">
          <h2 className="settings-title"><Flask size={17} /> AI worksheet generator</h2>
          <button className="win__btn" onClick={close} aria-label="Close"><X size={14} /></button>
        </div>

        {stage === 'form' && (
          <>
            <label className="field">
              <span className="field__label">Scope</span>
              <select className="input" value={scope} onChange={(e) => setScope(e.target.value)}>
                {weekOptions.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
                <option value="full-exam mix">Full-exam mix (all weeks)</option>
              </select>
            </label>
            <div className="field__row">
              <label className="field ws-field--half">
                <span className="field__label">Questions</span>
                <input className="input" type="number" min={5} max={15} value={count} onChange={(e) => setCount(Number(e.target.value) || 8)} />
              </label>
              <label className="field ws-field--half">
                <span className="field__label">Difficulty</span>
                <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value as WorksheetOptions['difficulty'])}>
                  <option value="easy">Easy warm-up</option>
                  <option value="mixed">Mixed</option>
                  <option value="hard">Exam-hard</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span className="field__label">Focus (optional)</span>
              <input className="input" placeholder="e.g. ISA calculations, buckling, anything from the practice exam" value={focus} onChange={(e) => setFocus(e.target.value)} />
            </label>
            <label className="ctx-row ws-sol-row">
              <input type="checkbox" checked={solutions} onChange={(e) => setSolutions(e.target.checked)} />
              <span><strong>Include worked solutions</strong><em>full steps with units, printed as an answer key</em></span>
            </label>
            {error && <div className="settings-test settings-test--bad"><X size={14} weight="bold" /> {error}</div>}
            <div className="field__row settings-actions">
              <button className="btn btn--hero" onClick={() => void generate()}>{configured ? (<><Sparkle size={15} /> Generate</>) : 'Add API key first'}</button>
              <button className="btn" onClick={close}>Cancel</button>
            </div>
          </>
        )}

        {stage === 'generating' && (
          <div className="ws-progress">
            <div className="chat-typing"><span /><span /><span /></div>
            <p>{progress || 'Composing questions…'}</p>
            <button className="btn" onClick={reset}>Cancel</button>
          </div>
        )}

        {stage === 'ready' && (
          <>
            <div className="field__row settings-actions ws-ready-actions">
              <span className="ws-stat">{ws.sections.length} sections · {ws.sections.reduce((n, s) => n + s.questions.length, 0)} questions · {ws.totalMarks} marks</span>
              <button className="btn" onClick={print}><Printer size={15} /> Print / PDF</button>
              <button className="btn" onClick={download}><DownloadSimple size={15} /> Download .md</button>
              <button className="btn" onClick={reset}><ArrowCounterClockwise size={15} /> New</button>
            </div>
            <div className="ws-preview">
              <h3 className="ws-title">{ws.title}</h3>
              {ws.meta && <div className="ws-meta">{ws.meta}</div>}
              {ws.sections.map((s) => (
                <div key={s.letter} className="ws-section">
                  <div className="ws-section__head">Section {s.letter} · {s.title}</div>
                  {s.intro && <div className="ws-section__intro">{s.intro}</div>}
                  {s.questions.map((q) => (
                    <div key={q.n} className="ws-q">
                      <div className="ws-q__p">
                        <strong>{q.n}.</strong> <RichText text={q.prompt} /> <span className="ws-q__marks">({q.marks} marks)</span>
                      </div>
                      {q.solution && (
                        <div className="ws-q__sol">
                          <b>Solution.</b> <RichText text={q.solution} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
