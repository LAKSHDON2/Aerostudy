/**
 * Analytics sink — a no-op today, a real provider (Posthog/Plausible/GA)
 * later. The app already calls these at the right moments, so wiring a
 * provider is a one-file change. No data leaves the browser in v1.
 */

export type AnalyticsEvent =
  | 'view_change'
  | 'node_open'
  | 'search'
  | 'quiz_start'
  | 'quiz_complete'
  | 'master_toggle'

type EventProps = Record<string, string | number | boolean | undefined>

export function track(_event: AnalyticsEvent, _props?: EventProps): void {
  // v1: intentionally silent. Keep the signature stable for future providers.
}

/**
 * Content gating hook for the future paid tier. In v1 everything is free:
 * the gate always returns allowed. When accounts arrive, check entitlement
 * here (e.g. subject in plan) — UI code stays untouched.
 */
export function isSubjectEntitled(_subjectId: string): boolean {
  return true
}
