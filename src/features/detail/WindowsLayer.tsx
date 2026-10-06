import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Function as FnIcon, MathOperations, X } from '@phosphor-icons/react'
import { useApp, type DetailWindow } from '../../state/store'
import type { Subject } from '../../data/schema'
import { DetailContent } from './DetailContent'

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

/**
 * One draggable glass window. Drag commits on pointer-up (store update);
 * while dragging we move the DOM node directly for smoothness.
 */
function FloatingWindow({ w, focused, subject }: { w: DetailWindow; focused: boolean; subject: Subject }) {
  const closeWindow = useApp((s) => s.closeWindow)
  const focusWindow = useApp((s) => s.focusWindow)
  const moveWindow = useApp((s) => s.moveWindow)
  const goBackWindow = useApp((s) => s.goBackWindow)

  const winRef = useRef<HTMLElement | null>(null)
  const [dragging, setDragging] = useState(false)

  // Body content — keyed by tab so a Back jump remounts cleanly (scroll reset).
  const canGoBack = w.history.findIndex((h) => h.kind === w.tab.kind && h.id === w.tab.id) < w.history.length - 1

  const back = () => {
    goBackWindow(w.key)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only the header drag-handle starts a drag (buttons stay clickable)
    if ((e.target as HTMLElement).closest('button')) return
    focusWindow(w.key)
    const el = winRef.current
    if (!el) return
    const startX = e.clientX - w.pos.x
    const startY = e.clientY - w.pos.y
    const maxX = window.innerWidth - 160
    const maxY = window.innerHeight - 60
    setDragging(true)
    e.preventDefault()

    const move = (ev: PointerEvent) => {
      const x = clamp(ev.clientX - startX, 8 - 200, maxX) // allow half-off edges
      const y = clamp(ev.clientY - startY, 4, maxY)
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      el.dataset.px = String(x)
      el.dataset.py = String(y)
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setDragging(false)
      const x = clamp(ev.clientX - startX, 8 - 200, maxX)
      const y = clamp(ev.clientY - startY, 4, maxY)
      if (x !== w.pos.x || y !== w.pos.y) moveWindow(w.key, { x, y })
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <section
      ref={winRef as React.RefObject<HTMLElement>}
      className={`win glass glass--strong${focused ? ' win--focused' : ''}${dragging ? ' win--dragging' : ''}`}
      style={{ left: w.pos.x, top: w.pos.y, zIndex: 45 }}
      onPointerDown={() => focusWindow(w.key)}
      aria-label={w.tab.kind === 'formula' ? 'Formula window' : 'Variable window'}
    >
      <div className="win__head" onPointerDown={onPointerDown}>
        <button
          className="win__btn win__back"
          onClick={back}
          disabled={!canGoBack}
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft size={14} />
        </button>
        <span className="win__title" onDoubleClick={back}>
          {w.tab.kind === 'formula' ? (<><FnIcon size={12} /> Formula</>) : (<><MathOperations size={12} /> Variable</>)}
        </span>
        <button
          className="win__btn win__close"
          onClick={() => closeWindow(w.key)}
          title="Close"
          aria-label="Close window"
        >
          <X size={13} />
        </button>
      </div>

      <div className="win__body scroll-glass">
        <div className="win__meta">
          <DetailContent subject={subject} windowKey={w.key} kind={w.tab.kind} id={w.tab.id} />
        </div>
      </div>
    </section>
  )
}

/**
 * All open floating windows + global Esc (close focused) / Shift+Esc (close all).
 */
export function WindowsLayer({ subject }: { subject: Subject }) {
  const windows = useApp((s) => s.windows)
  const closeWindow = useApp((s) => s.closeWindow)
  const closeAllWindows = useApp((s) => s.closeAllWindows)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (useApp.getState().settingsOpen) return // the settings modal owns Esc while open
      if (e.shiftKey) closeAllWindows()
      else {
        const ws = useApp.getState().windows
        if (ws.length > 0) closeWindow(ws[ws.length - 1].key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeWindow, closeAllWindows])

  if (windows.length === 0) return null

  return (
    <>
      {windows.map((w, i) => (
        <FloatingWindow
          key={w.key}
          w={w}
          focused={i === windows.length - 1}
          subject={subject}
        />
      ))}
      {windows.length > 1 && (
        <button className="close-all-btn glass glass--strong" onClick={closeAllWindows} title="Close all windows (Shift+Esc)">
          <X size={12} /> Close all ({windows.length})
        </button>
      )}
    </>
  )
}
