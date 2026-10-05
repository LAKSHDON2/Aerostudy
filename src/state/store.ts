import { create } from 'zustand'
import type { GraphCamera, QuizAttempt, ThemeName } from '../services/storage'
import { loadState, storage } from '../services/storage'
import { track } from '../services/analytics'
import type { QuizSession } from '../services/quiz'

export type ViewName = 'home' | 'graph' | 'list' | 'quiz' | 'progress' | 'chat' | 'files'

/** What a floating window shows — extended with a navigation stack for Back. */
export interface WindowTab {
  kind: 'formula' | 'variable'
  id: string
}

export interface DetailWindow {
  /** Stable key for React list + focus management */
  key: string
  /** Screen offset for the floating window (px, top-left) */
  pos: { x: number; y: number }
  /** Which tab is showing right now */
  tab: WindowTab
  /** Where Back returns to (most recent first). tab is always history[0] ?? initialTab. */
  history: WindowTab[]
}

/** Legacy single-selection alias so existing callers keep compiling. */
export type Selection = WindowTab

interface AppState {
  subjectId: string
  theme: ThemeName
  view: ViewName
  searchQuery: string
  weekFilter: number | 'all'
  topicFilter: string | 'all'
  /** Floating detail windows, in z-order (last = focused) */
  windows: DetailWindow[]
  searchOpen: boolean
  camera: GraphCamera | null
  mastered: Set<string>
  attempts: QuizAttempt[]
  session: QuizSession | null
  answers: (number | null)[]
  phase: 'setup' | 'running' | 'done'
  /** AI settings modal (gear icon / “add your key” banners). */
  settingsOpen: boolean

  setTheme(t: ThemeName): void
  toggleTheme(): void
  setView(v: ViewName): void
  setSearchQuery(q: string): void
  setWeekFilter(w: number | 'all'): void
  setTopicFilter(t: string | 'all'): void
  select(sel: Selection | null): void
  /** Open an item in its own floating window (or focus if already open). */
  openWindow(sel: Selection): void
  closeWindow(key: string): void
  closeAllWindows(): void
  focusWindow(key: string): void
  moveWindow(key: string, pos: { x: number; y: number }): void
  /** Current tab of the focused window (null if none). */
  focusedTab(): WindowTab | null
  /** Navigate a specific window to a new item (pushes history). */
  navigateWindow(key: string, next: Selection): void
  /** A specific window goes one step back. Returns false if it can't. */
  goBackWindow(key: string): boolean
  setSearchOpen(open: boolean): void
  saveCamera(c: GraphCamera): void
  toggleMastered(id: string): void
  startSession(s: QuizSession): void
  setAnswer(i: number, a: number): void
  finishSession(score: number, total: number): void
  exitQuiz(): void
  openSettings(): void
  closeSettings(): void
}

const subjectId = 'aero2687'
const initial = loadState(subjectId)

function applyTheme(t: ThemeName) {
  const safe = t === 'light' ? 'light' : 'dark' // never let a corrupt stored value through
  document.documentElement.dataset.theme = safe
  document.documentElement.style.colorScheme = safe
}

applyTheme(initial.theme)

let windowSeq = 0
/** Cascade offset for the next spawned window. */
function spawnPos(existing: DetailWindow[]) {
  const n = existing.length
  const step = n % 6
  const baseX = Math.min(72 + step * 36, Math.max(72, window.innerWidth - 430))
  const baseY = Math.min(76 + step * 30, Math.max(76, window.innerHeight - 340))
  return { x: baseX, y: baseY }
}

export const useApp = create<AppState>((set, get) => ({
  subjectId,
  theme: initial.theme,
  view: (initial.lastView as ViewName) || 'home',
  searchQuery: '',
  weekFilter: initial.weekFilter,
  topicFilter: initial.topicFilter,
  windows: [],
  searchOpen: false,
  camera: initial.camera,
  mastered: new Set(initial.masteredIds),
  attempts: initial.attempts,
  session: null,
  answers: [],
  phase: 'setup',
  settingsOpen: false,

  setTheme(t) {
    applyTheme(t)
    storage.save(subjectId, 'theme', t)
    set({ theme: t })
  },
  toggleTheme() {
    get().setTheme(get().theme === 'dark' ? 'light' : 'dark')
  },
  setView(v) {
    storage.save(subjectId, 'lastView', v)
    track('view_change', { view: v })
    set({ view: v })
  },
  setSearchQuery(q) {
    set({ searchQuery: q, searchOpen: q.length > 0 })
  },
  setWeekFilter(w) {
    storage.save(subjectId, 'weekFilter', w)
    set({ weekFilter: w })
  },
  setTopicFilter(t) {
    storage.save(subjectId, 'topicFilter', t)
    set({ topicFilter: t })
  },
  /** Legacy API — maps onto windows (kept so old callers still work). */
  select(sel) {
    if (!sel) {
      get().closeAllWindows()
      return
    }
    get().openWindow(sel)
  },
  openWindow(sel) {
    track('node_open', { kind: sel.kind, id: sel.id })
    const state = get()
    // Already open? Focus it (and jump to that item if it's in history).
    const existing = state.windows.find(
      (w) => w.tab.kind === sel.kind && w.tab.id === sel.id,
    )
    if (existing) {
      set({ searchOpen: false, windows: state.windows.map((w) => (w.key === existing.key ? { ...w, tab: { ...sel }, history: [sel, ...w.history.filter((h) => !(h.kind === sel.kind && h.id === sel.id))] } : w)) })
      return
    }
    const win: DetailWindow = {
      key: `w${++windowSeq}`,
      pos: spawnPos(state.windows),
      tab: { ...sel },
      history: [{ ...sel }],
    }
    set({ searchOpen: false, windows: [...state.windows, win] })
  },
  closeWindow(key) {
    set({ windows: get().windows.filter((w) => w.key !== key) })
  },
  closeAllWindows() {
    if (get().windows.length > 0) set({ windows: [] })
  },
  focusWindow(key) {
    const ws = get().windows
    const idx = ws.findIndex((w) => w.key === key)
    if (idx < 0 || idx === ws.length - 1) return
    const w = ws[idx]
    set({ windows: [...ws.slice(0, idx), ...ws.slice(idx + 1), w] })
  },
  moveWindow(key, pos) {
    set({ windows: get().windows.map((w) => (w.key === key ? { ...w, pos } : w)) })
  },
  focusedTab() {
    const ws = get().windows
    return ws.length > 0 ? ws[ws.length - 1].tab : null
  },
  navigateWindow(key, next) {
    set({
      searchOpen: false,
      windows: get().windows.map((w) =>
        w.key === key
          ? {
              ...w,
              tab: { ...next },
              history: [next, ...w.history.filter((h) => !(h.kind === next.kind && h.id === next.id))],
            }
          : w,
      ),
    })
  },
  goBackWindow(key) {
    const ws = get().windows
    const w = ws.find((x) => x.key === key)
    if (!w) return false
    const idx = w.history.findIndex((h) => h.kind === w.tab.kind && h.id === w.tab.id)
    const prev = idx >= 0 && idx + 1 < w.history.length ? w.history[idx + 1] : null
    if (!prev) return false
    set({ windows: ws.map((x) => (x.key === key ? { ...x, tab: { ...prev } } : x)) })
    return true
  },
  setSearchOpen(open) {
    set({ searchOpen: open })
  },
  saveCamera(c) {
    storage.save(subjectId, 'camera', c)
    set({ camera: c })
  },
  toggleMastered(id) {
    const next = new Set(get().mastered)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    storage.save(subjectId, 'mastered', [...next])
    track('master_toggle', { id, on: next.has(id) })
    set({ mastered: next })
  },
  startSession(s) {
    track('quiz_start', { mode: s.mode, count: s.questions.length })
    set({ session: s, answers: new Array(s.questions.length).fill(null), phase: 'running' })
  },
  setAnswer(i, a) {
    const answers = [...get().answers]
    answers[i] = a
    set({ answers })
  },
  finishSession(score, total) {
    const s = get().session
    if (!s) return
    const attempts = [...get().attempts, { at: Date.now(), mode: s.mode, score, total }]
    storage.save(subjectId, 'attempts', attempts)
    track('quiz_complete', { mode: s.mode, score, total })
    set({ attempts, phase: 'done' })
  },
  exitQuiz() {
    set({ session: null, answers: [], phase: 'setup' })
  },
  openSettings() {
    set({ settingsOpen: true })
  },
  closeSettings() {
    set({ settingsOpen: false })
  },
}))

/** Selectors */
export const selectSearchActive = (s: AppState) => s.searchQuery.trim().length > 0
