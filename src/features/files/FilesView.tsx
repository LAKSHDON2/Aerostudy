import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CaretDown,
  CaretRight,
  FileDoc,
  FilePdf,
  FileText,
  Image,
  PresentationChart,
  SpinnerGap,
  Table,
  UploadSimple,
  Warning,
  X,
  type Icon,
} from '@phosphor-icons/react'
import {
  detectKind,
  extractText,
  FILE_ACCEPT,
  fileToDataUrl,
  type FileKind,
} from '../../services/fileParse'
import {
  clearFiles,
  deleteFile,
  listFiles,
  putFile,
  type StoredFile,
} from '../../services/fileStore'

const KIND_ICON: Record<FileKind, Icon> = {
  pptx: PresentationChart,
  docx: FileDoc,
  pdf: FilePdf,
  txt: FileText,
  md: FileText,
  csv: Table,
  image: Image,
}

function KindIcon({ kind }: { kind: FileKind }) {
  const I = KIND_ICON[kind]
  return <I size={22} />
}

interface Pending {
  key: string
  name: string
  kind: FileKind
  mime: string
  size: number
  text?: string
  dataUrl?: string
  warning?: string
  desc: string
}

const subjectId = 'aero2687'

export default function FilesView() {
  const [files, setFiles] = useState<StoredFile[]>([])
  const [pending, setPending] = useState<Pending[]>([])
  const [loading, setLoading] = useState(true)
  const [parsing, setParsing] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<Set<string>>(new Set())
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    try {
      setFiles(await listFiles(subjectId))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  async function handleFiles(list: FileList | File[]) {
    const incoming = Array.from(list)
    for (const f of incoming) {
      const kind = detectKind(f.name)
      if (!kind) {
        setError(`Unsupported file type: ${f.name}`)
        continue
      }
      setError(null)
      setParsing((n) => n + 1)
      try {
        if (kind === 'image') {
          const dataUrl = await fileToDataUrl(f)
          setPending((p) => [...p, { key: `${f.name}-${f.size}-${Date.now()}`, name: f.name, kind, mime: f.type || 'image/*', size: f.size, dataUrl, desc: '' }])
        } else {
          const { text, warning } = await extractText(f)
          setPending((p) => [...p, { key: `${f.name}-${f.size}-${Date.now()}`, name: f.name, kind, mime: f.type || 'application/octet-stream', size: f.size, text, warning, desc: '' }])
        }
      } catch (e) {
        setError(`${f.name}: ${e instanceof Error ? e.message : String(e)}`)
      } finally {
        setParsing((n) => n - 1)
      }
    }
  }

  async function savePending(p: Pending) {
    const rec: StoredFile = {
      id: crypto.randomUUID(),
      subjectId,
      name: p.name,
      kind: p.kind,
      mime: p.mime,
      size: p.size,
      description: p.desc.trim(),
      text: p.text,
      dataUrl: p.dataUrl,
      included: true,
      addedAt: Date.now(),
      warning: p.warning,
    }
    await putFile(rec)
    setPending((list) => list.filter((x) => x.key !== p.key))
    void refresh()
  }

  async function saveDescription(f: StoredFile, desc: string) {
    if (desc === f.description) return
    await putFile({ ...f, description: desc })
    void refresh()
  }

  async function toggleIncluded(f: StoredFile) {
    await putFile({ ...f, included: !f.included })
    void refresh()
  }

  async function remove(f: StoredFile) {
    await deleteFile(f.id)
    setConfirmDel(null)
    void refresh()
  }

  const totalBytes = files.reduce((n, f) => n + f.size, 0)
  const textFiles = files.filter((f) => f.text)
  const describedCount = files.filter((f) => f.description).length

  return (
    <div className="files-wrap scroll-glass">
      <div className="files-inner">
        <section className="files-hero glass glass--strong anim-rise">
          <h1 className="files-title">Study files</h1>
          <p className="files-sub">
            Upload lecture slides, worksheets and scans, then describe each one so the tutor knows what you're
            working through. Files stay on this device (IndexedDB) and are sent only to your chosen AI provider.
          </p>
          <div
            className={`file-drop${dragOver ? ' file-drop--over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); void handleFiles(e.dataTransfer.files) }}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click() }}
          >
            <div className="file-drop__icon"><UploadSimple size={22} /></div>
            <div className="file-drop__text">
              <strong>Drop files here</strong> or click to browse
              <span className="file-drop__kinds">PPTX · DOCX · PDF · TXT · MD · CSV · PNG · JPG</span>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={FILE_ACCEPT}
              hidden
              onChange={(e) => { if (e.target.files) void handleFiles(e.target.files); e.target.value = '' }}
            />
          </div>
          {parsing > 0 && <div className="files-status"><SpinnerGap size={14} className="icon-spin" /> Extracting text… ({parsing} in progress)</div>}
          {error && <div className="files-status files-status--err"><Warning size={14} weight="fill" /> {error}</div>}
          {files.length > 0 && (
            <div className="files-stats">
              {files.length} file{files.length === 1 ? '' : 's'} · {(totalBytes / 1024 / 1024).toFixed(1)} MB · {describedCount} described · {textFiles.length} with extractable text
              <button className="files-clear" onClick={() => setConfirmClear(true)}>
                Clear all
              </button>
            </div>
          )}
          {confirmClear && (
            <div className="confirm-row">
              <span>Delete all {files.length} files? This cannot be undone.</span>
              <button className="btn btn--danger btn--sm" onClick={() => { setConfirmClear(false); void clearFiles(subjectId).then(refresh) }}>Delete all</button>
              <button className="btn btn--sm" onClick={() => setConfirmClear(false)}>Keep</button>
            </div>
          )}
        </section>

        {/* Describe-before-save queue */}
        {pending.map((p) => (
          <section key={p.key} className="file-card glass anim-rise file-card--pending">
            <div className="file-card__head">
              <span className="file-card__icon"><KindIcon kind={p.kind} /></span>
              <div className="file-card__meta">
                <div className="file-card__name">{p.name}</div>
                <div className="file-card__tags">
                  <span className="chip chip--source">{p.kind.toUpperCase()}</span>
                  <span className="chip">{fmtSize(p.size)}</span>
                  {p.text !== undefined && <span className="chip">{p.text.length.toLocaleString()} chars extracted</span>}
                  {p.kind === 'image' && <span className="chip">sent to vision models</span>}
                </div>
              </div>
            </div>
            {p.warning && <div className="files-status files-status--warn"><Warning size={14} weight="fill" /> {p.warning}</div>}
            <label className="field">
              <span className="field__label">Describe this file for the AI</span>
              <textarea
                className="input file-desc"
                rows={2}
                autoFocus
                placeholder="e.g. Week 4 lecture slides: lift, drag and the drag polar, with worked examples from the tutorial"
                value={p.desc}
                onChange={(e) => setPending((list) => list.map((x) => (x.key === p.key ? { ...x, desc: e.target.value } : x)))}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void savePending(p) }}
              />
            </label>
            <div className="file-card__actions">
              <button className="btn btn--hero" onClick={() => void savePending(p)}>Save file</button>
              <button className="btn" onClick={() => setPending((list) => list.filter((x) => x.key !== p.key))}>Discard</button>
            </div>
          </section>
        ))}

        {/* Saved files */}
        {loading && <div className="files-status">Loading files…</div>}
        {!loading && files.length === 0 && pending.length === 0 && (
          <div className="locked-banner">No study files yet. Drop your first PowerPoint or worksheet above.</div>
        )}
        {files.map((f) => (
          <section key={f.id} className={`file-card glass anim-rise${f.included ? '' : ' file-card--off'}`}>
            <div className="file-card__head">
              <span className="file-card__icon"><KindIcon kind={f.kind} /></span>
              <div className="file-card__meta">
                <div className="file-card__name">{f.name}</div>
                <div className="file-card__tags">
                  <span className="chip chip--source">{f.kind.toUpperCase()}</span>
                  <span className="chip">{fmtSize(f.size)}</span>
                  <span className="chip">{new Date(f.addedAt).toLocaleDateString()}</span>
                  {f.text && <span className="chip">{f.text.length.toLocaleString()} chars</span>}
                  {f.kind === 'image' && <span className="chip">vision</span>}
                </div>
              </div>
              <label className="ctx-toggle" title="Include this file in chat context">
                <input type="checkbox" checked={f.included} onChange={() => void toggleIncluded(f)} />
                in chat
              </label>
              <button className="win__btn win__close" onClick={() => setConfirmDel(f.id)} aria-label={`Delete ${f.name}`}>
                <X size={13} />
              </button>
            </div>
            {confirmDel === f.id && (
              <div className="confirm-row">
                <span>Delete “{f.name}”? This cannot be undone.</span>
                <button className="btn btn--danger btn--sm" onClick={() => void remove(f)}>Delete</button>
                <button className="btn btn--sm" onClick={() => setConfirmDel(null)}>Keep</button>
              </div>
            )}
            {f.warning && <div className="files-status files-status--warn"><Warning size={14} weight="fill" /> {f.warning}</div>}
            <textarea
              className="input file-desc"
              rows={2}
              placeholder="Add a description so the tutor knows what this is…"
              defaultValue={f.description}
              onBlur={(e) => void saveDescription(f, e.target.value.trim())}
            />
            {f.text && (
              <>
                <button className="files-preview-btn" onClick={() => setPreview((s) => { const n = new Set(s); n.has(f.id) ? n.delete(f.id) : n.add(f.id); return n })}>
                  {preview.has(f.id) ? (<><CaretDown size={12} /> Hide extracted text</>) : (<><CaretRight size={12} /> Preview extracted text</>)}
                </button>
                {preview.has(f.id) && <pre className="files-preview">{f.text.slice(0, 2400)}{f.text.length > 2400 ? '\n…' : ''}</pre>}
              </>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

function fmtSize(n: number): string {
  return n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`
}
