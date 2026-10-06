import { lazy, Suspense, useMemo, useRef } from 'react'
import { Airplane, Flask, Gear, MagnifyingGlass, Question, Sun, Moon } from '@phosphor-icons/react'
import { useApp } from './state/store'
import { getSubject } from './data/registry'
import { search } from './services/search'
import { GraphView } from './features/graph/GraphView'
import { ListView } from './features/listview/ListView'
import { QuizView } from './features/quiz/QuizView'
import { ProgressView } from './features/progress/ProgressView'
import { WindowsLayer } from './features/detail/WindowsLayer'
import { HomeView } from './features/home/HomeView'

const ChatView = lazy(() => import('./features/chat/ChatView'))
const FilesView = lazy(() => import('./features/files/FilesView'))
const SettingsModal = lazy(() => import('./features/ai/SettingsModal'))
const HelpView = lazy(() => import('./features/help/HelpView'))
const TutorOrb = lazy(() => import('./features/tutor/TutorOrb'))
const WorksheetModal = lazy(() => import('./features/ai/WorksheetModal'))

export default function App() {
  const subject = useMemo(() => getSubject('aero2687'), [])
  const view = useApp((s) => s.view)
  const setView = useApp((s) => s.setView)
  const theme = useApp((s) => s.theme)
  const toggleTheme = useApp((s) => s.toggleTheme)
  const searchQuery = useApp((s) => s.searchQuery)
  const setSearchQuery = useApp((s) => s.setSearchQuery)
  const searchOpen = useApp((s) => s.searchOpen)
  const settingsOpen = useApp((s) => s.settingsOpen)
  const worksheetOpen = useApp((s) => s.worksheetOpen)
  const openWorksheet = useApp((s) => s.openWorksheet)
  const openWindow = useApp((s) => s.openWindow)
  const weekFilter = useApp((s) => s.weekFilter)
  const setWeekFilter = useApp((s) => s.setWeekFilter)
  const topicFilter = useApp((s) => s.topicFilter)
  const setTopicFilter = useApp((s) => s.setTopicFilter)
  const searchRef = useRef<HTMLInputElement>(null)

  const hits = useMemo(
    () => (searchQuery.trim().length > 1 ? search(subject, searchQuery).slice(0, 8) : []),
    [subject, searchQuery],
  )

  return (
    <div className="app">
      <header className="toolbar glass glass--strong">
        <button className="brand brand--btn" onClick={() => setView('home')} title="Home dashboard" aria-label="Home">
          <span className="brand__logo"><Airplane size={19} weight="fill" /></span>
          <span className="brand__code">AERO2687</span>
          <span className="brand__sub">Aerospace Study Web</span>
        </button>

        <div className="search-wrap">
          <span className="icon"><MagnifyingGlass size={15} /></span>
          <input
            ref={searchRef}
            className="input"
            placeholder="Search formulas & variables. Try “rho”, “buckling”, “W4”…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchQuery('')
              if (e.key === 'Enter' && hits[0]) openWindow({ kind: hits[0].kind, id: hits[0].id })
            }}
          />
          {searchOpen && hits.length > 0 && (
            <div className="search-results glass glass--strong scroll-glass">
              {hits.map((h) => (
                <button key={`${h.kind}-${h.id}`} className="search-hit" onClick={() => openWindow({ kind: h.kind, id: h.id })}>
                  <span className="search-hit__name">{h.name}</span>
                  <span className="search-hit__kind">{h.kind} · W{h.weekTags.join('/W')}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="filters">
          <select
            className="input"
            value={String(weekFilter)}
            onChange={(e) => setWeekFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            aria-label="Filter by week"
          >
            <option value="all">All weeks</option>
            {subject.weeks.map((w) => (
              <option key={w.number} value={w.number}>Week {w.number}</option>
            ))}
          </select>
          <select
            className="input"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            aria-label="Filter by topic"
          >
            <option value="all">All topics</option>
            {subject.topics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <span className="toolbar__spacer" />

        <div className="seg" role="tablist">
          {(['graph', 'list', 'quiz', 'progress', 'chat', 'files'] as const).map((v) => (
            <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)} role="tab" aria-selected={view === v}>
              {v === 'graph' ? 'Web' : v === 'list' ? 'List' : v === 'quiz' ? 'Quiz' : v === 'progress' ? 'Progress' : v === 'chat' ? 'Chat' : 'Files'}
            </button>
          ))}
        </div>

        <button className="btn btn--icon" onClick={openWorksheet} title="AI worksheet generator: quiz with solutions" aria-label="AI worksheet generator"><Flask size={17} /></button>
        <button className="btn btn--icon" onClick={() => setView('help')} title="Help & API keys" aria-label="Help"><Question size={17} weight="bold" /></button>
        <button className="btn btn--icon" onClick={() => useApp.getState().openSettings()} title="AI settings: API keys & models" aria-label="AI settings">
          <Gear size={17} />
        </button>
        <button className="btn btn--icon" onClick={toggleTheme} title="Toggle dark / light" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </header>

      <main className="main">
        {view === 'home' && <HomeView subject={subject} />}
        {view === 'graph' && <GraphView subject={subject} />}
        {view === 'list' && <ListView subject={subject} />}
        {view === 'quiz' && <QuizView subject={subject} />}
        {view === 'progress' && <ProgressView subject={subject} />}
        <Suspense fallback={<div className="view-loading">Loading…</div>}>
          {view === 'chat' && <ChatView subject={subject} />}
          {view === 'files' && <FilesView />}
          {view === 'help' && <HelpView />}
        </Suspense>
        {settingsOpen && (
          <Suspense fallback={null}>
            <SettingsModal />
          </Suspense>
        )}
        {worksheetOpen && (
          <Suspense fallback={null}>
            <WorksheetModal subject={subject} />
          </Suspense>
        )}
        <Suspense fallback={null}>
          <TutorOrb subject={subject} />
        </Suspense>
        <WindowsLayer subject={subject} />
      </main>
    </div>
  )
}
