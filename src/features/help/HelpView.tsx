import { useApp } from '../../state/store'
import { PROVIDERS, type ProviderId } from '../../services/ai'

const FREE_ROWS: { provider: string; what: string; limit: string; link?: string }[] = [
  { provider: 'Google Gemini', what: 'AI Studio API keys', limit: 'Free tier with daily request caps — the best free start for students', link: 'https://aistudio.google.com/apikey' },
  { provider: 'OpenRouter', what: 'Models tagged ":free"', limit: 'Free community models (e.g. deepseek/deepseek-chat-v1:free) with daily limits', link: 'https://openrouter.ai/models?q=free' },
  { provider: 'Ollama (custom)', what: 'Your own PC, 100% offline', limit: 'Free forever — no internet, no key; needs an 8 GB+ PC', link: 'https://ollama.com/download' },
]

const STEPS: { id: ProviderId; title: string; steps: string[]; note?: string }[] = [
  {
    id: 'gemini',
    title: 'Google Gemini — free tier (recommended first)',
    steps: [
      'Open aistudio.google.com/apikey and sign in with any Google account.',
      'Click "Create API key" → copy the key (starts with AIza…).',
      'Back here: ⚙ AI settings → Provider: Google Gemini → paste the key.',
      'Model stays gemini-2.5-flash (fast + generous free tier) → "Test connection".',
    ],
    note: 'Free tier = a few requests per minute and a daily cap. Perfect for study nights; add a paid provider as fallback when exams get serious.',
  },
  {
    id: 'openrouter',
    title: 'OpenRouter — one key, hundreds of models (some free)',
    steps: [
      'Create an account at openrouter.ai (GitHub login works).',
      'openrouter.ai/settings/keys → "Create key" → copy it (sk-or-…).',
      'Optional but wise: openrouter.ai/settings/credits → set a spend limit.',
      'Here: Provider: OpenRouter → paste key → Fetch list → pick any ":free" model.',
    ],
  },
  {
    id: 'openai',
    title: 'OpenAI (paid, prepay credit)',
    steps: [
      'platform.openai.com → Billing → add a small credit (e.g. $5).',
      'platform.openai.com/api-keys → "Create new secret key" (sk-…).',
      'Here: Provider: OpenAI → paste key → Test connection.',
    ],
    note: 'gpt-4o-mini costs cents per week of study. Set a usage cap on the key page.',
  },
  {
    id: 'anthropic',
    title: 'Anthropic Claude (paid)',
    steps: [
      'console.anthropic.com → Billing → add credit.',
      'console.anthropic.com/settings/keys → "Create key" (sk-ant-…).',
      'Here: Provider: Anthropic (Claude) → paste key → Test connection.',
    ],
  },
  {
    id: 'custom',
    title: 'Custom / fully local (Ollama, LM Studio)',
    steps: [
      'Install Ollama (ollama.com/download) and run:  ollama pull llama3.1',
      'It serves an OpenAI-compatible API at http://localhost:11434/v1 — no key needed.',
      'Here: Provider: Custom → Base URL http://localhost:11434/v1 → Fetch list → pick the model.',
    ],
    note: '100% free and offline. The tutor works on a plane; only this browser holds your data.',
  },
]

export default function HelpView() {
  const openSettings = useApp((s) => s.openSettings)

  return (
    <div className="help-wrap scroll-glass">
      <div className="help-inner">
        <h1 className="help-title">Help & API keys</h1>
        <p className="help-sub">
          The AI tutor talks straight from <strong>your browser</strong> to the provider you choose — there is no server in
          the middle, and your key is stored only on this device. One free key is enough to start.
        </p>

        <div className="help-card glass">
          <h2>⚡ Fast start (3 minutes, free)</h2>
          <ol className="help-ol">
            <li>Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">aistudio.google.com/apikey</a> and sign in with any Google account.</li>
            <li><strong>Create API key</strong> → copy it.</li>
            <li>Click the button below → paste it under <strong>Google Gemini</strong> → <strong>Test connection</strong>. Done.</li>
          </ol>
          <button className="btn btn--hero" onClick={openSettings}>Open AI settings ⚙</button>
        </div>

        <div className="help-card glass">
          <h2>🆓 Free options compared</h2>
          <table className="help-table">
            <thead><tr><th>Provider</th><th>What</th><th>Limit</th></tr></thead>
            <tbody>
              {FREE_ROWS.map((r) => (
                <tr key={r.provider}>
                  <td>{r.link ? <a href={r.link} target="_blank" rel="noreferrer">{r.provider} ↗</a> : r.provider}</td>
                  <td>{r.what}</td>
                  <td>{r.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="help-card glass">
          <h2>🔑 Step-by-step for every provider</h2>
          {STEPS.map((s) => (
            <div key={s.id} className="help-provider">
              <h3>{s.title}</h3>
              <ol className="help-ol">
                {s.steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
              {PROVIDERS[s.id].keyUrl && (
                <a className="field__link" href={PROVIDERS[s.id].keyUrl} target="_blank" rel="noreferrer">Get a {PROVIDERS[s.id].label} key ↗</a>
              )}
              {s.note && <p className="help-note">{s.note}</p>}
            </div>
          ))}
        </div>

        <div className="help-card glass">
          <h2>🛟 Fallback chain (no more dead study nights)</h2>
          <p>
            In <strong>⚙ AI settings</strong> you can enable the fallback chain: when your main provider rate-limits or
            errors, the tutor automatically retries your other configured providers in your chosen order. The bubble tells
            you which provider answered. Usage is counted locally in Settings — an estimate only; real billing is at the
            provider.
          </p>
        </div>

        <div className="help-card glass">
          <h2>🩺 Troubleshooting</h2>
          <table className="help-table">
            <thead><tr><th>Symptom</th><th>Fix</th></tr></thead>
            <tbody>
              <tr><td>"Key rejected"</td><td>Re-copy the key; check credit/quota at the provider's console; check you picked the matching provider row.</td></tr>
              <tr><td>"Rate limited / out of quota"</td><td>Wait a minute (free tiers), or let the fallback chain hand over to another provider.</td></tr>
              <tr><td>"Network request blocked"</td><td>Custom/local: is the gateway running? Does it allow browser calls (CORS)? Ollama needs <code>OLLAMA_ORIGINS=*</code> on some setups.</td></tr>
              <tr><td>Key lost after clearing the browser</td><td>Use ⚙ → Backup &amp; restore to move everything between browsers/devices.</td></tr>
            </tbody>
          </table>
        </div>

        <p className="help-foot">
          Privacy: keys and files never leave your browser except directly to the provider you chose. Nothing is uploaded
          to the site owner. Use spend-capped keys.
        </p>
      </div>
    </div>
  )
}
