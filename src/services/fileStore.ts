/**
 * IndexedDB persistence for AI material — uploaded files (with extracted text,
 * descriptions and image data URLs) and saved chat conversations. IndexedDB is
 * used because files are far too big for localStorage.
 */

import type { FileKind } from './fileParse'

export interface StoredFile {
  id: string
  subjectId: string
  name: string
  kind: FileKind
  mime: string
  size: number
  /** The user's description — what this file is and why it matters. */
  description: string
  /** Extracted text (office/pdf/txt kinds). */
  text?: string
  /** Data URL for images (vision models). */
  dataUrl?: string
  /** Included in chat context by default. */
  included: boolean
  addedAt: number
  /** Parse warning, e.g. scanned PDF with no text layer. */
  warning?: string
}

export interface UiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** Files whose content was included when this message was sent. */
  fileIds?: string[]
  model?: string
  at: number
  /** Set on failed assistant turns (error bubble). */
  error?: boolean
}

export interface StoredChat {
  id: string
  subjectId: string
  title: string
  createdAt: number
  updatedAt: number
  messages: UiMessage[]
}

const DB_NAME = 'asw-ai'
const DB_VERSION = 1
const FILES = 'files'
const CHATS = 'chats'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(FILES)) {
          const s = db.createObjectStore(FILES, { keyPath: 'id' })
          s.createIndex('subjectId', 'subjectId')
        }
        if (!db.objectStoreNames.contains(CHATS)) {
          const s = db.createObjectStore(CHATS, { keyPath: 'id' })
          s.createIndex('subjectId', 'subjectId')
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error ?? new Error('IndexedDB unavailable'))
    })
  }
  return dbPromise
}

async function withStore<T>(name: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(name, mode)
    const store = tx.objectStore(name)
    let result: T | undefined
    const req = fn(store)
    if (req) {
      req.onsuccess = () => {
        result = req.result
      }
    }
    tx.oncomplete = () => resolve(result)
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'))
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'))
  })
}

/* ── Files ───────────────────────────────────────────────────────────────── */

export async function listFiles(subjectId: string): Promise<StoredFile[]> {
  const all = (await withStore<StoredFile[]>(FILES, 'readonly', (s) => s.getAll())) ?? []
  return all.filter((f) => f.subjectId === subjectId).sort((a, b) => b.addedAt - a.addedAt)
}

export async function putFile(f: StoredFile): Promise<void> {
  await withStore(FILES, 'readwrite', (s) => { s.put(f) })
}

export async function deleteFile(id: string): Promise<void> {
  await withStore(FILES, 'readwrite', (s) => { s.delete(id) })
}

export async function clearFiles(subjectId: string): Promise<void> {
  const files = await listFiles(subjectId)
  for (const f of files) await deleteFile(f.id)
}

export async function getFilesByIds(ids: string[]): Promise<StoredFile[]> {
  const found = await Promise.all(ids.map((id) => withStore<StoredFile | undefined>(FILES, 'readonly', (s) => s.get(id))))
  return found.filter((f): f is StoredFile => !!f)
}

/* ── Chats ───────────────────────────────────────────────────────────────── */

export async function listChats(subjectId: string): Promise<StoredChat[]> {
  const all = (await withStore<StoredChat[]>(CHATS, 'readonly', (s) => s.getAll())) ?? []
  return all.filter((c) => c.subjectId === subjectId).sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function putChat(c: StoredChat): Promise<void> {
  await withStore(CHATS, 'readwrite', (s) => { s.put(c) })
}

export async function deleteChat(id: string): Promise<void> {
  await withStore(CHATS, 'readwrite', (s) => { s.delete(id) })
}
