/**
 * Persistence layer. v1 = localStorage behind a tiny adapter interface, so a
 * later cloud/IndexedDB backend swaps in without touching UI code.
 * Keys are namespaced per subject (`asw:<subject>:*`) for multi-subject support.
 */

export type ThemeName = 'dark' | 'light'

export interface GraphCamera {
  x: number
  y: number
  z: number
  rx: number
  ry: number
  rz: number
}

export interface QuizAttempt {
  at: number
  mode: string
  score: number
  total: number
}

export interface StoredState {
  theme: ThemeName
  camera: GraphCamera | null
  masteredIds: string[]
  attempts: QuizAttempt[]
  lastView: string
  weekFilter: number | 'all'
  topicFilter: string | 'all'
}

const NS = 'asw'

function key(subjectId: string, field: string) {
  return `${NS}:${subjectId}:${field}`
}

export interface StorageAdapter {
  load<T>(subjectId: string, field: string, fallback: T): T
  save<T>(subjectId: string, field: string, value: T): void
  remove(subjectId: string, field: string): void
}

class LocalStorageAdapter implements StorageAdapter {
  load<T>(subjectId: string, field: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key(subjectId, field))
      if (raw == null) return fallback
      const parsed = JSON.parse(raw) as { value: T }
      return parsed.value
    } catch {
      return fallback
    }
  }

  save<T>(subjectId: string, field: string, value: T): void {
    try {
      localStorage.setItem(key(subjectId, field), JSON.stringify({ value }))
    } catch {
      // Storage full / disabled (private mode) — fail silently, app stays usable
    }
  }

  remove(subjectId: string, field: string): void {
    try {
      localStorage.removeItem(key(subjectId, field))
    } catch {
      // ignore
    }
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter()

/** Themed theme accessor used by the no-flash boot script and the app. */
export const THEME_KEY = `${NS}:theme`

export function loadState(subjectId: string): StoredState {
  const theme = storage.load<ThemeName>(subjectId, 'theme', 'dark')
  return {
    theme: theme === 'light' ? 'light' : 'dark',
    camera: storage.load<GraphCamera | null>(subjectId, 'camera', null),
    masteredIds: storage.load<string[]>(subjectId, 'mastered', []),
    attempts: storage.load<QuizAttempt[]>(subjectId, 'attempts', []),
    lastView: storage.load<string>(subjectId, 'lastView', 'graph'),
    weekFilter: storage.load<number | 'all'>(subjectId, 'weekFilter', 'all'),
    topicFilter: storage.load<string | 'all'>(subjectId, 'topicFilter', 'all'),
  }
}

export function clearSubjectProgress(subjectId: string): void {
  for (const field of ['camera', 'mastered', 'attempts', 'weekFilter', 'topicFilter', 'lastView']) {
    storage.remove(subjectId, field)
  }
}
