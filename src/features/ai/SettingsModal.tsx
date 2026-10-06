import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../../state/store'
import { chat, friendlyError, listModels, PROVIDERS, type ProviderId } from '../../services/ai'
import {
  isConfigured,
  setActiveProvider,
  setFallbackEnabled,
  setFallbackOrder,
  updateProvider,
  useAiSettings,
} from '../../services/aiSettings'
import { configuredProviders, usageSummary, type UsageRow } from '../../services/aiRun'
import { buildBackup, downloadBackup, parseBackup, restoreBackup } from '../../services/backup'

const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[]

export default function SettingsModal() {
  const close = useApp((s) => s.closeSettings)
  const settings = useAiSettings()
  const id = settings.activeProvider
  const info = PROVIDERS[id]
  const cfg = settings.providers[id]

  const [showKey, setShowKey] = useState(false)
  const [fetched, setFetched] = useState<Record<string, string[]>>({})
  const [fetching, setFetching] = useState(false)
  const [fetchErr, setFetchErr] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)
  const [testOut, setTestOut] = useState<{ ok: boolean; msg: string } | null>(null)
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null)
  const [showUsage, setShowUsage] = useState(false)

  const chain = useMemo(() => configuredProviders(settings), [settings])
  const usage: UsageRow[] = useMemo(() => (showUsage ? usageSummary('aero2687', 7) : []), [showUsage])

  function handleExport() {
    void buildBackup('aero2687').then(downloadBackup)
  }

  async function handleRestore(file: File) {
    setRestoreMsg(null)
    try {
      const payload = parseBackup(await file.text())
      if (!window.confirm(`Restore backup from ${payload.exportedAt.slice(0, 10)}? This replaces ALL local data — progress, files, chats and API keys.`)) return
      const r = await restoreBackup(payload, 'aero2687')
      window.location.reload() // every store re-reads the restored data
      void r
    } catch (e) {
      setRestoreMsg(e instanceof Error ? e.message : String(e))
    }
  }

  /* Esc closes the modal (WindowsLayer yields while settingsOpen). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const modelOptions = [...new Set([...(fetched[id] ?? []), ...info.staticModels, cfg.model].filter(Boolean))]

  async function fetchModels() {
    setFetching(true)
    setFetchErr(null)
    try {
      const list = await listModels(id, cfg.key, cfg.baseUrl)
      setFetched((f) => ({ ...f, [id]: list }))
      if (list.length === 0) setFetchErr('The provider returned an empty model list.')
    } catch (e) {
      setFetchErr(friendlyError(e))
    } finally {
      setFetching(false)
    }
  }

  async function testConnection() {
    setTesting(true)
    setTestOut(null)
    try {
      await chat(id, {
        system: 'You are a connection test. Reply with exactly: OK',
        turns: [{ role: 'user', content: 'ping' }],
        model: cfg.model,
        key: cfg.key,
        baseUrl: cfg.baseUrl,
        maxTokens: 300,
      })
      setTestOut({ ok: true, msg: `Connected — ${cfg.model} is ready.` })
    } catch (e) {
      setTestOut({ ok: false, msg: friendlyError(e) })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="settings-overlay" onClick={close} role="presentation">
      <div
        className="settings-modal glass glass--strong scroll-glass anim-pop"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="AI settings"
      >
        <div className="settings-head">
          <h2 className="settings-title">AI tutor settings</h2>
          <button className="win__btn" onClick={close} aria-label="Close settings">✕</button>
        </div>

        <label className="field">
          <span className="field__label">Provider</span>
          <select
            className="input"
            value={id}
            onChange={(e) => {
              setActiveProvider(e.target.value as ProviderId)
              setTestOut(null)
              setFetchErr(null)
            }}
          >
            {PROVIDER_IDS.map((p) => (
              <option key={p} value={p}>{PROVIDERS[p].label}</option>
            ))}
          </select>
          <span className="field__hint">{info.hint}</span>
          {info.keyUrl && (
            <a className="field__link" href={info.keyUrl} target="_blank" rel="noreferrer">
              Get a {info.label} key ↗
            </a>
          )}
        </label>

        {info.needsBaseUrl && (
          <label className="field">
            <span className="field__label">Base URL (OpenAI-compatible)</span>
            <input
              className="input"
              placeholder="http://localhost:8080/v1"
              value={cfg.baseUrl ?? ''}
              onChange={(e) => updateProvider('custom', { baseUrl: e.target.value })}
              spellCheck={false}
            />
            <span className="field__hint">
              e.g. a local Kiro gateway (kiro-gateway, AIClient2API), Ollama (http://localhost:11434/v1) or LM Studio.
            </span>
          </label>
        )}

        <label className="field">
          <span className="field__label">API key {id === 'custom' && '(optional — some local gateways need none)'}</span>
          <div className="field__row">
            <input
              className="input"
              type={showKey ? 'text' : 'password'}
              placeholder={id === 'custom' ? 'sk-… (if required)' : 'sk-…'}
              value={cfg.key}
              onChange={(e) => updateProvider(id, { key: e.target.value })}
              spellCheck={false}
              autoComplete="off"
            />
            <button className="btn btn--icon" onClick={() => setShowKey((v) => !v)} title={showKey ? 'Hide key' : 'Show key'}>
              {showKey ? '🙈' : '👁'}
            </button>
          </div>
        </label>

        <label className="field">
          <span className="field__label">Model</span>
          <div className="field__row">
            <input
              className="input"
              list="asw-models"
              placeholder={id === 'custom' ? 'model id, e.g. claude-sonnet-4' : DEFAULT_OR(cfg.model, info.defaultModel)}
              value={cfg.model}
              onChange={(e) => updateProvider(id, { model: e.target.value })}
              spellCheck={false}
            />
            <datalist id="asw-models">
              {modelOptions.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <button className="btn" onClick={fetchModels} disabled={fetching || (id === 'custom' && !cfg.baseUrl)}>
              {fetching ? '…' : 'Fetch list'}
            </button>
          </div>
          <span className="field__hint">
            {fetchErr ?? `Known ids are suggested; type any model id your provider supports.${fetched[id] ? ` ${fetched[id].length} models fetched.` : ''}`}
          </span>
        </label>

        <div className="field__row settings-actions">
          <button className="btn btn--hero" onClick={testConnection} disabled={testing || !cfg.model || (id === 'custom' ? !cfg.baseUrl : !cfg.key)}>
            {testing ? 'Testing…' : 'Test connection'}
          </button>
          <button className="btn" onClick={close}>Done</button>
        </div>
        {testOut && <div className={`settings-test ${testOut.ok ? 'settings-test--ok' : 'settings-test--bad'}`}>{testOut.ok ? '✓ ' : '✗ '}{testOut.msg}</div>}

        <div className="settings-backup">
          <div className="field__label">Fallback chain</div>
          <span className="field__hint">
            When the active provider rate-limits or errors, retry your other configured providers in this order.
            Currently configured: {chain.length === 0 ? 'none yet' : chain.join(', ')}.
          </span>
          <label className="ctx-row">
            <input
              type="checkbox"
              checked={settings.fallbackEnabled}
              onChange={(e) => setFallbackEnabled(e.target.checked)}
            />
            <span><strong>Enable fallback</strong><em>keeps study nights alive when one provider dies</em></span>
          </label>
          {settings.fallbackEnabled && (
            <div className="fb-order">
              {settings.fallbackOrder.map((pid, i) => (
                <span key={pid} className="fb-item">
                  <span className="fb-item__pos">{i + 1}</span> {PROVIDERS[pid].label}
                  <button
                    className="fb-item__btn"
                    title="Move up"
                    disabled={i === 0}
                    onClick={() => {
                      const next = [...settings.fallbackOrder]
                      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
                      setFallbackOrder(next)
                    }}
                  >↑</button>
                  <button
                    className="fb-item__btn"
                    title="Move down"
                    disabled={i === settings.fallbackOrder.length - 1}
                    onClick={() => {
                      const next = [...settings.fallbackOrder]
                      ;[next[i + 1], next[i]] = [next[i], next[i + 1]]
                      setFallbackOrder(next)
                    }}
                  >↓</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="settings-backup">
          <div className="field__label">Usage (stored on this device only)</div>
          <span className="field__hint">Rough estimate for paid tiers — free tiers cost $0. Real billing lives at the provider.</span>
          <button className="btn" onClick={() => setShowUsage((v) => !v)}>{showUsage ? 'Hide' : 'Show'} last 7 days</button>
          {showUsage && (
            usage.length === 0 ? (
              <p className="field__hint">No AI requests recorded yet.</p>
            ) : (
              <table className="usage-table">
                <thead><tr><th>Provider</th><th>Requests</th><th>≈ tokens</th><th>≈ cost</th></tr></thead>
                <tbody>
                  {usage.map((u) => (
                    <tr key={u.provider}>
                      <td>{PROVIDERS[u.provider].label}</td>
                      <td>{u.requests}</td>
                      <td>{Math.round((u.charsIn + u.charsOut) / 4).toLocaleString()}</td>
                      <td>{u.estCostCents === 0 ? 'free' : `~$${(u.estCostCents / 100).toFixed(2)}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>

        <div className="settings-backup">
          <div className="field__label">Backup &amp; restore</div>
          <span className="field__hint">
            One JSON file with your progress, study files, chats and API keys — keep it safe, or move it to any other browser.
          </span>
          <div className="field__row">
            <button className="btn" onClick={handleExport}>⬇ Download backup</button>
            <label className="btn">
              ⬆ Restore from file
              <input
                type="file"
                accept=".json,application/json"
                hidden
                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void handleRestore(f) }}
              />
            </label>
          </div>
          {restoreMsg && <div className="settings-test settings-test--bad">✗ {restoreMsg}</div>}
        </div>

        <p className="settings-note">
          Keys are stored only in this browser (localStorage) and sent directly to {info.label}. Use spend-capped keys.
          {isConfigured(settings) ? '' : ' Not configured yet.'} New to keys? Open the ❓ Help tab for a 3-minute free setup.
        </p>
      </div>
    </div>
  )
}

function DEFAULT_OR(value: string, fallback: string): string {
  return value || fallback || 'model id'
}
