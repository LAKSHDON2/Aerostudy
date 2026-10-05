/**
 * Whole-app backup: localStorage (progress, theme, AI keys/settings) plus
 * IndexedDB (uploaded files incl. image data URLs, chat history) as one JSON
 * file. Restoring overwrites the current subject's local data.
 */

import { deleteChat, listChats, listFiles, putChat, putFile, type StoredChat, type StoredFile } from './fileStore'

export interface BackupPayload {
  app: 'aero2687-study-web'
  version: 1
  exportedAt: string
  subjectId: string
  /** Raw localStorage entries under asw:<subjectId>:* (values are the stored JSON strings). */
  entries: Record<string, string>
  files: StoredFile[]
  chats: StoredChat[]
}

/** Collect this subject's localStorage entries. `store` injectable for tests. */
export function collectLocalEntries(subjectId: string, store: Storage = localStorage): Record<string, string> {
  const prefix = `asw:${subjectId}:`
  const out: Record<string, string> = {}
  for (let i = 0; i < store.length; i++) {
    const k = store.key(i)
    if (k && k.startsWith(prefix)) out[k] = store.getItem(k) ?? ''
  }
  return out
}

export async function buildBackup(subjectId: string): Promise<BackupPayload> {
  const [files, chats] = await Promise.all([listFiles(subjectId), listChats(subjectId)])
  return {
    app: 'aero2687-study-web',
    version: 1,
    exportedAt: new Date().toISOString(),
    subjectId,
    entries: collectLocalEntries(subjectId),
    files,
    chats,
  }
}

export function downloadBackup(payload: BackupPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `aero2687-backup-${payload.exportedAt.slice(0, 10)}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function parseBackup(json: string): BackupPayload {
  const p = JSON.parse(json) as BackupPayload
  if (!p || p.app !== 'aero2687-study-web' || typeof p.version !== 'number') {
    throw new Error('This file is not an AERO2687 Study Web backup.')
  }
  if (p.version > 1) throw new Error('Backup was made by a newer app version — update first.')
  return p
}

/** Restore localStorage entries. `store` injectable for tests. */
export function restoreLocalEntries(entries: Record<string, string>, subjectId: string, store: Storage = localStorage): number {
  const prefix = `asw:${subjectId}:`
  let n = 0
  for (const [k, v] of Object.entries(entries)) {
    if (k.startsWith(prefix)) {
      store.setItem(k, v)
      n++
    }
  }
  return n
}

/** Full restore: overwrites local settings + replaces all files and chats. */
export async function restoreBackup(payload: BackupPayload, subjectId: string): Promise<{ entries: number; files: number; chats: number }> {
  const entries = restoreLocalEntries(payload.entries ?? {}, subjectId)
  await clearFilesData(subjectId)
  for (const f of payload.files ?? []) await putFile(f)
  for (const c of await listChats(subjectId)) await deleteChat(c.id)
  for (const c of payload.chats ?? []) await putChat(c)
  return { entries, files: (payload.files ?? []).length, chats: (payload.chats ?? []).length }
}

async function clearFilesData(subjectId: string): Promise<void> {
  const { clearFiles } = await import('./fileStore')
  await clearFiles(subjectId)
}
