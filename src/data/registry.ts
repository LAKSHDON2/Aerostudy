import type { Subject } from './schema'
import { aero2687 } from './subjects/aero2687'

/**
 * Subject registry — the multi-subject expansion point.
 * Adding a future subject (e.g. AERO2437) = create data/subjects/<id>/ and
 * append one entry here. Every view, the graph, quizzes and storage
 * namespaces pick it up automatically.
 */
export const subjects: Subject[] = [aero2687]

export const defaultSubjectId = subjects[0].id

export function getSubject(id: string): Subject {
  const s = subjects.find((x) => x.id === id)
  if (!s) throw new Error(`Unknown subject: ${id}`)
  return s
}
