import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Subject } from '../../data/schema'
import { useApp } from '../../state/store'
import { chat, friendlyError, type ChatTurn } from '../../services/ai'
import { getAiSettings, isConfigured, useAiSettings } from '../../services/aiSettings'
import { daysUntilExam, loadProfile, recordSession, saveProfile, toggleStrongTopic, toggleWeakTopic, type LearnerProfile } from '../../services/profile'
import {
  buildCourseDigest,
  buildSystemPrompt,
  estimateContextChars,
} from '../../services/aiContext'
import {
  listChats,
  listFiles,
  putChat,
  putFile,
  type StoredChat,
  type StoredFile,
  type UiMessage,
} from '../../services/fileStore'
import { RichText } from '../../components/common'
import {
  AirplaneTilt,
  ArrowRight,
  Check,
  List,
  PaperPlaneRight,
  Plus,
  Stop,
  Target,
  Warning,
} from '@phosphor-icons/react'

const subjectId = 'aero2687'

const STARTERS = [
  'Explain the drag polar and how $C_{D,0}$ relates to induced drag',
  'Quiz me on the Week 4 formulas',
  "Walk me through exam radar #2: Reynolds number",
  'How does a hot day change take-off distance?',
]

/** Personalisation card — owns its state so typing never snaps back. */
function ProfileCard({ subject, initial }: { subject: Subject; initial: LearnerProfile }) {
  const [p, setP] = useState(initial)
  const days = daysUntilExam(p)
  const save = (patch: Partial<LearnerProfile>) => {
    const next = { ...p, ...patch }
    saveProfile(subject.id, next)
    setP(next)
  }
  return (
    <div className="profile-card">
      <div className="section-label">Personalise your tutor</div>
      <label className="field">
        <span className="field__label">Your goal</span>
        <input
          className="input"
          placeholder="e.g. pass comfortably, or aim for HD"
          value={p.goal}
          onChange={(e) => save({ goal: e.target.value })}
        />
      </label>
      <label className="field">
        <span className="field__label">Exam date</span>
        <input
          className="input"
          type="date"
          value={p.examDate}
          onChange={(e) => save({ examDate: e.target.value })}
        />
        {days !== null && <span className="field__hint">{days === 0 ? 'Exam is today. Good luck.' : `Exam in ${days} day${days === 1 ? '' : 's'}.`}</span>}
      </label>
      <div className="field">
        <span className="field__label">Tick what you find hard / feel solid in</span>
        <div className="profile-topics">
          {subject.topics.map((t) => {
            const weak = p.weakTopics.includes(t.id)
            const strong = p.strongTopics.includes(t.id)
            return (
              <span key={t.id} className="profile-topic-btns">
                <button
                  className={`chip profile-topic${weak ? ' profile-topic--weak' : ''}`}
                  title={weak ? 'Click to unset' : 'I find this hard'}
                  onClick={() => setP(toggleWeakTopic(subject.id, t.id))}
                >
                  {weak ? (<><Warning size={12} weight="fill" /> {t.name}</>) : t.name}
                </button>
                <button
                  className={`chip profile-topic profile-topic--strong${strong ? ' profile-topic--strong-on' : ''}`}
                  title={strong ? 'Click to unset' : 'I feel solid here'}
                  onClick={() => setP(toggleStrongTopic(subject.id, t.id))}
                >
                  <Check size={13} weight="bold" />
                </button>
              </span>
            )
          })}
        </div>
      </div>
      <p className="profile-hint">The tutor uses this in every reply: gentler scaffolding on topics you flag as hard, stretch questions on ones you feel solid in.</p>
    </div>
  )
}

const uuid = () =>
  typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `m${Date.now()}${Math.random().toString(16).slice(2)}`

export default function ChatView({ subject }: { subject: Subject }) {
  const settings = useAiSettings()
  const openSettings = useApp((s) => s.openSettings)

  const [files, setFiles] = useState<StoredFile[]>([])
  const [chats, setChats] = useState<StoredChat[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [includeCourse, setIncludeCourse] = useState(true)
  const [ctxOpen, setCtxOpen] = useState(() => typeof window === 'undefined' || window.innerWidth > 900)
  const [profile, setProfile] = useState(() => loadProfile(subjectId))
  const [profileOpen, setProfileOpen] = useState(false)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const includedFiles = useMemo(() => files.filter((f) => f.included), [files])
  const digest = useMemo(() => buildCourseDigest(subject), [subject])
  const estChars = useMemo(() => estimateContextChars(includeCourse ? digest : '', includedFiles), [digest, includeCourse, includedFiles])
  const configured = isConfigured(settings)
  const activeCfg = settings.providers[settings.activeProvider]

  const refreshFiles = useCallback(async () => {
    try { setFiles(await listFiles(subjectId)) } catch (e) { setLoadErr(String(e instanceof Error ? e.message : e)) }
  }, [])

  useEffect(() => {
    void refreshFiles()
    void listChats(subjectId)
      .then((cs) => {
        setChats(cs)
        if (cs[0]) {
          setActiveId(cs[0].id)
          setMessages(cs[0].messages)
        }
      })
      .catch((e) => setLoadErr(String(e instanceof Error ? e.message : e)))
  }, [refreshFiles])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  function persistChat(msgs: UiMessage[], id: string, title: string) {
    const chat: StoredChat = {
      id,
      subjectId,
      title,
      createdAt: chats.find((c) => c.id === id)?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      messages: msgs,
    }
    void putChat(chat).then(() => listChats(subjectId).then(setChats).catch(() => undefined)).catch(() => undefined)
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    if (!isConfigured(getAiSettings())) {
      openSettings()
      return
    }
    const s = getAiSettings()
    const cfg = s.providers[s.activeProvider]
    const chatId = activeId ?? uuid()
    const title = (activeId ? chats.find((c) => c.id === chatId)?.title : undefined) ?? trimmed.slice(0, 60)

    const userMsg: UiMessage = { id: uuid(), role: 'user', content: trimmed, fileIds: includedFiles.map((f) => f.id), at: Date.now() }
    const next = [...messages, userMsg]
    setActiveId(chatId)
    setMessages(next)
    setInput('')
    persistChat(next, chatId, title)

    const turns: ChatTurn[] = next.map((m) => ({ role: m.role, content: m.content }))
    const imgs = includedFiles.filter((f) => f.kind === 'image' && f.dataUrl).map((f) => f.dataUrl as string)
    if (turns.length > 0 && turns[turns.length - 1].role === 'user' && imgs.length) {
      turns[turns.length - 1].images = imgs
    }
    const system = buildSystemPrompt(subject, includedFiles, includeCourse, profile)

    setBusy(true)
    const ac = new AbortController()
    abortRef.current = ac
    try {
      const reply = await chat(s.activeProvider, {
        system,
        turns,
        model: cfg.model,
        key: cfg.key,
        baseUrl: cfg.baseUrl,
        signal: ac.signal,
      })
      recordSession(subjectId)
      setProfile(loadProfile(subjectId))
      const aiMsg: UiMessage = { id: uuid(), role: 'assistant', content: reply, model: cfg.model, at: Date.now() }
      const withReply = [...next, aiMsg]
      setMessages(withReply)
      persistChat(withReply, chatId, title)
    } catch (e) {
      const errMsg: UiMessage = { id: uuid(), role: 'assistant', content: friendlyError(e), error: true, at: Date.now() }
      const withErr = [...next, errMsg]
      setMessages(withErr)
      persistChat(withErr, chatId, title)
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  function stop() {
    abortRef.current?.abort()
  }

  function newChat() {
    stop()
    setActiveId(null)
    setMessages([])
  }

  function switchChat(id: string) {
    if (id === activeId) return
    const c = chats.find((x) => x.id === id)
    if (!c) return
    stop()
    setActiveId(c.id)
    setMessages(c.messages)
  }

  async function toggleFile(f: StoredFile) {
    await putFile({ ...f, included: !f.included })
    void refreshFiles()
  }

  const setView = useApp((s) => s.setView)

  const activeTitle = (activeId ? chats.find((c) => c.id === activeId)?.title : undefined) ?? 'New chat'

  return (
    <div className="chat-wrap">
      {/* Study context rail */}
      <aside className={`chat-side glass${ctxOpen ? '' : ' chat-side--hidden'}`}>
        <div className="section-label">Study context</div>
        <label className="ctx-row">
          <input type="checkbox" checked={includeCourse} onChange={(e) => setIncludeCourse(e.target.checked)} />
          <span>
            <strong>Course reference</strong>
            <em>45 formulas · variables · ISA · exam radar</em>
          </span>
        </label>
        <div className="section-label ctx-files-label">Files ({includedFiles.length} included)</div>
        <div className="ctx-files">
          {files.length === 0 && <div className="ctx-empty">No files yet. Add lecture slides or worksheets so the tutor can use them.</div>}
          {files.map((f) => (
            <label key={f.id} className="ctx-row ctx-file" title={f.description || f.name}>
              <input type="checkbox" checked={f.included} onChange={() => void toggleFile(f)} />
              <span>
                <strong>{f.name}</strong>
                {f.description && <em>{f.description}</em>}
              </span>
            </label>
          ))}
        </div>
        <button className="btn ctx-manage" onClick={() => setView('files')}>Manage files <ArrowRight size={13} /></button>
        <div className="ctx-estimate">context ≈ {Math.max(1, Math.round(estChars / 1000))}k chars (~{Math.max(1, Math.round(estChars / 4000))}k tokens)</div>
      </aside>

      <div className="chat-main">
        <div className="chat-topbar">
          <button className="btn btn--icon" onClick={() => setCtxOpen((v) => !v)} title="Toggle study context" aria-label="Toggle study context"><List size={17} /></button>
          <button className="btn btn--icon" onClick={() => setProfileOpen((v) => !v)} title="Personalise your tutor" aria-label="Personalise"><Target size={17} /></button>
          <div className="chat-title">{activeTitle}</div>
          <select className="input chat-hist" value={activeId ?? ''} onChange={(e) => switchChat(e.target.value)} aria-label="Chat history">
            <option value="">History…</option>
            {chats.map((c) => (
              <option key={c.id} value={c.id}>{c.title.slice(0, 44)}</option>
            ))}
          </select>
          <button className="btn" onClick={newChat}><Plus size={14} /> New</button>
        </div>

        {loadErr && <div className="files-status files-status--err"><Warning size={14} weight="fill" /> {loadErr}</div>}

        {profileOpen && <ProfileCard subject={subject} initial={profile} />}

        <div className="chat-msgs scroll-glass" ref={scrollRef}>
          {messages.length === 0 && !busy && (
            <div className="chat-empty glass anim-rise">
              <div className="chat-empty__title"><AirplaneTilt size={18} /> Your AERO2687 tutor is ready</div>
              <p className="chat-empty__sub">
                It knows all 45 formulas, every variable, the ISA table and the exam radar, plus any files you include
                on the right. Ask anything, or start with:
              </p>
              <div className="chat-starters">
                {STARTERS.map((s) => (
                  <button key={s} className="chip chat-starter" onClick={() => void send(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`chat-msg ${m.role === 'user' ? 'chat-msg--user' : 'chat-msg--ai'}`}>
              <div className={`chat-bubble${m.role === 'user' ? ' chat-bubble--user' : ' chat-bubble--ai'}${m.error ? ' chat-bubble--error' : ''}`}>
                {m.error && <div className="chat-bubble__errtag">Request failed</div>}
                <div className="chat-bubble__body"><RichText text={m.content} /></div>
                {m.role === 'assistant' && !m.error && (
                  <div className="chat-msg__meta">
                    <span>{m.model}</span>
                    <button className="chat-copy" onClick={() => void navigator.clipboard.writeText(m.content)}>copy</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="chat-msg chat-msg--ai">
              <div className="chat-bubble chat-bubble--ai chat-typing"><span /><span /><span /></div>
            </div>
          )}
        </div>

        {!configured && (
          <button className="chat-banner" onClick={openSettings}>
            <Warning size={14} weight="fill" /> Add your API key to start: open AI settings (keys stay in this browser)
          </button>
        )}
        <div className="chat-composer glass glass--strong">
          <textarea
            className="input chat-input"
            rows={2}
            placeholder={configured ? `Ask about lift, drag, structures… (${activeCfg.model || 'no model set'})` : 'Add your API key first, then ask anything'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send(input)
              }
            }}
          />
          {busy
            ? <button className="btn chat-send chat-send--stop" onClick={stop} title="Stop generating"><Stop size={13} weight="fill" /> Stop</button>
            : <button className="btn btn--hero chat-send" onClick={() => void send(input)} disabled={!input.trim()}>Send <PaperPlaneRight size={15} /></button>}
        </div>
      </div>
    </div>
  )
}
