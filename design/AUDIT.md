# v1.3-beta audit → fixes

Audit method: `redesign-existing-projects` (audit first, fix in priority order,
never break functionality). Baseline before the pass is captured in the git
history and in the pre-pass screenshots.

## Findings and status

| # | Severity | Finding | Fix |
| - | -------- | ------- | --- |
| 1 | High | AI-slop gradient: hero title, `.btn--hero`, brand code, files title, quiz score number used cyan→violet→fuchsia `--accent-grad` with gradient text | One-accent cyan family in `tokens.css`; all gradient text → solid `--text-1`/`--accent`; `.btn--hero` solid accent with dark ink; gradient kept only as same-hue 2-stop fill (quiz progress bar) |
| 2 | High | Three accent colors (violet `#a78bfa`, fuchsia `#f0abfc`) diluted the cyan identity | `--accent-2/3` moved into the cyan family (38bdf8 / 0ea5e9) |
| 3 | High | Emoji pictographs everywhere (✈ ⌕ ⚙ ❓ 🧪 🎯 ☰ ☀ ☾ ➤ ■ ＋ ✕ ← ⬆ ⬇ 🖨 ↺ 👁 🙈 ⏳ 🔒 ⚡ 📝 🔗 ⚠ ✓ ✗ etc.) in 10+ components | Replaced with Phosphor icons, one family, default weight (App, ChatView, TutorOrb, WindowsLayer, DetailContent, FilesView, HelpView, WorksheetModal, SettingsModal, QuizView, ListView, HomeView, common) |
| 4 | High | `window.confirm` for destructive actions (restore backup, delete file, clear all files, reset progress) — jarring, unstyled, blocks the thread | Inline `.confirm-row` strips with explicit danger buttons in SettingsModal, FilesView (per-file + clear all), ProgressView |
| 5 | Medium | Body font was Inter (default-font slop) | Outfit for UI text via `--font-body`; Sora + JetBrains Mono kept; Google Fonts link updated |
| 6 | Medium | "1 QUIZ ATTEMPTS" pluralisation bug (amplified by uppercase labels) | Pluralised in HomeView + ProgressView |
| 7 | Medium | Em-dashes in UI copy (banned lazy construction) | Rewritten with periods/colons/middots across App, HomeView, ListView, QuizView, ProgressView, ChatView, TutorOrb, FilesView, HelpView, SettingsModal, WorksheetModal, common. Course data prose keeps its typography |
| 8 | Medium | "1 QUIZ ATTEMPTS" style all-caps visual noise in stat labels | Labels kept small-caps but copy fixed; no all-caps sentences elsewhere |
| 9 | Medium | `--prio-high` badge was violet (collided with the old accent) | Amber `#fbbf24` (dark + light) |
| 10 | Medium | Exclamation-style/self-questioning copy ("hidden by default when printing? No: printed as an answer key") | Rewritten plainly ("full steps with units, printed as an answer key") |
| 11 | Low | Missing visible keyboard focus on buttons/links/chips/tabs | `:focus-visible` outline rule in glass.css |
| 12 | Low | No texture; flat large surfaces felt cheap | Film grain overlay (`body::after`, feTurbulence data-URI, opacity 0.028, fixed, pointer-events none) |
| 13 | Low | Long prose/headings wrapped raggedly | `text-wrap: balance` on headings, `pretty` on prose |
| 14 | Low | Hero + home cards had single bezel; large glass surfaces lacked the "double glass" detail | Double-bezel: 1 px outline, 5 px offset on `.hero`, `.home-card` |
| 15 | Low | Window title used glyphs (ƒ / x) as icons | Phosphor `Function` / `MathOperations` |

## Deliberately unchanged

- Liquid-glass visual identity, aurora background, navy palette (product identity).
- Course data prose in `src/data/**` (educational content, not UI slop).
- AI prompt strings (e.g. `★core` tokens in aiContext) — consumed by models, covered by tests.
- Motion system and spring easings (already compliant); `prefers-reduced-motion` block.
- Functionality: no behaviour changed; the four `window.confirm` flows were re-hosted
  in-component with identical outcomes (restore → parse → confirm → restore + reload).

## Verification

- `npx tsc --noEmit` clean; `npx vitest run` 58/58 across 9 suites.
- Production build green (PWA precache intact), `dist/README-FIRST.txt` restored after build.
- Browser pass in both themes: no console errors, icons render, inline confirms work.
