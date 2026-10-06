import { useEffect, useRef, useState } from 'react'
import type { Subject } from '../../data/schema'
import { useApp } from '../../state/store'
import { friendlyError, type ChatTurn } from '../../services/ai'
import { getAiSettings, isConfigured } from '../../services/aiSettings'
import { runWithFallback } from '../../services/aiRun'
import { addUsage } from '../../services/aiRun'
import { buildSystemPrompt } from '../../services/aiContext'
import { loadProfile, recordSession } from '../../services/profile'
import { listChats, putChat, type StoredChat, type UiMessage } from '../../services/fileStore'

const AGENT_TITLE = 'Tutor agent'
const STARTERS = [
  { label: '🧪 Make me a quiz', kind: 'worksheet' as const },
  { label: '📝 Make a worksheet', kind: 'worksheet' as const },
  { label: '🎯 What should I revise?', kind: 'chat' as const, text: 'Based on what you know about me and the course, what should I revise next and why? Keep it to 3 bullets.' },
  { label: '💡 Explain a topic', kind: 'chat' as const, text: 'Pick the most exam-important concept I haven\u2019t mastered yet and explain it simply with one worked example.' },
]

const uuid = () =>
  typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `m${Date.now()}${Math.random().toString(16).slice(2)}`

export default function TutorOrb({ subject }: { subject: Subject }) {
  const view = useApp((s) => s.view)
  const settingsOpen = useApp((s) => s.settingsOpen)
  const openSettings = useApp((s) => s.openSettings)
  const openWorksheet = useApp((s) => s.openWorksheet)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [chatId, setChatId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  const configured = isConfigured(getAiSettings())

  // Load the persisted agent chat once.
  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    void listChats(subject.id)
      .then((cs) => {
        const agent = cs.find((c) => c.title === AGENT_TITLE)
        if (agent) {
          setChatId(agent.id)
          setMessages(agent.messages)
        }
      })
      .catch(() => undefined)
  }, [subject.id])

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy, open])

  // Esc closes the popup (after Settings had its chance).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function persist(msgs: UiMessage[]) {
    if (!chatId) return
    const chat: StoredChat = {
      id: chatId,
      subjectId: subject.id,
      title: AGENT_TITLE,
      createdAt: Date.now() - 1000,
      updatedAt: Date.now(),
      messages: msgs,
    }
    void putChat(chat).catch(() => undefined)
  }

  function ensureChatId(): string {
    if (chatId) return chatId
    const id = uuid()
    setChatId(id)
    return id
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
    ensureChatId()
    const userMsg: UiMessage = { id: uuid(), role: 'user', content: trimmed, at: Date.now() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    persist(next)

    const turns: ChatTurn[] = next.map((m) => ({ role: m.role, content: m.content }))
    const system = buildSystemPrompt(subject, [], true, loadProfile(subject.id))

    setBusy(true)
    const ac = new AbortController()
    abortRef.current = ac
    try {
      const res = await runWithFallback(
        { system, turns, model: cfg.model, key: cfg.key, baseUrl: cfg.baseUrl, signal: ac.signal },
      )
      addUsage(subject.id, res.provider, system.length + turns.reduce((n, t) => n + t.content.length, 0), res.text.length)
      recordSession(subject.id)
      const aiMsg: UiMessage = { id: uuid(), role: 'assistant', content: res.text, model: res.provider, at: Date.now() }
      const withReply = [...next, aiMsg]
      setMessages(withReply)
      persist(withReply)
    } catch (e) {
      const errMsg: UiMessage = { id: uuid(), role: 'assistant', content: friendlyError(e), error: true, at: Date.now() }
      const withErr = [...next, errMsg]
      setMessages(withErr)
      persist(withErr)
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  function quickAction(st: (typeof STARTERS)[number]) {
    if (st.kind === 'worksheet') {
      setOpen(false)
      openWorksheet()
      return
    }
    if (st.text) void send(st.text)
  }

  // Hidden on the Chat view (it has its own full tutor) and while Settings is open.
  if (view === 'chat' || settingsOpen) return null

  return (
    <>
      {open && (
        <div className="orb-panel glass glass--strong anim-pop" role="dialog" aria-label="Tutor agent">
          <div className="orb-panel__head">
            <span className="orb-panel__dot" />
            <span className="orb-panel__title">Study agent</span>
            <button className="win__btn" onClick={() => setOpen(false)} aria-label="Close agent">✕</button>
          </div>

          <div className="orb-panel__msgs scroll-glass" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="orb-empty">
                <div className="orb-empty__t">Hey 👋 I learn how YOU study.</div>
                <p>Tell me your goal and weak spots — or pick one:</p>
                <div className="orb-starters">
                  {STARTERS.map((st) => (
                    <button key={st.label} className="chip chat-starter" onClick={() => quickAction(st)}>{st.label}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.role === 'user' ? 'chat-msg--user' : 'chat-msg--ai'}`}>
                <div className={`chat-bubble${m.role === 'user' ? ' chat-bubble--user' : ' chat-bubble--ai'}${m.error ? ' chat-bubble--error' : ''}`}>
                  {m.error && <div className="chat-bubble__errtag">Request failed</div>}
                  <div className="chat-bubble__body chat-bubble__body--sm">{m.content}</div>
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
            <button className="chat-banner" onClick={openSettings}>⚠ Add your API key to start</button>
          )}
          <div className="orb-composer">
            <textarea
              className="input orb-input"
              rows={2}
              placeholder={configured ? 'Ask your agent…' : 'Add your API key first…'}
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
              ? <button className="btn orb-send orb-send--stop" onClick={() => abortRef.current?.abort()}>■</button>
              : <button className="btn orb-send" onClick={() => void send(input)} disabled={!input.trim()}>➤</button>}
          </div>
        </div>
      )}

      <button
        className={`tutor-orb${open ? ' tutor-orb--open' : ''}${busy ? ' tutor-orb--busy' : ''}`}
        onClick={() => setOpen((v) => !v)}
        title="Your study agent"
        aria-label="Open tutor agent"
      >
        {open ? '✕' : '✈'}
      </button>
    </>
  )
}
