# AeroStudy design system

Product UI for a study app (not a landing page). The identity is **liquid glass on deep
space navy** and that stays — the design pass makes it execute at premium quality.

Source rules: `design/skills/design-taste-frontend/SKILL.md`,
`design/skills/redesign-existing-projects/SKILL.md`,
`design/skills/high-end-visual-design/SKILL.md`.

## Dials (v1.3-beta)

| Dial    | Setting | Meaning                                                            |
| ------- | ------- | ------------------------------------------------------------------ |
| VARIANCE | 5      | Calm, consistent surfaces; variation comes from hierarchy, not novelty |
| MOTION  | 4      | Springs on entry/press, 150–260 ms, GPU-safe transform/opacity only |
| DENSITY | 5      | Comfortable study spacing; large touch targets (min-height 44 px)   |

## Locked decisions

- **One accent.** Cyan family only (`--accent #22d3ee → --accent-2 #38bdf8 → --accent-3 #0ea5e9`).
  Same-hue 2-stop ramps are allowed (`--accent-grad`, used on fills only). No AI purple
  gradients, no second hue in the accent system. Semantic colors stay semantic
  (success green, warn amber, danger red; `--prio-high` is amber, not violet).
- **Fonts.** Sora for display, Outfit for UI text, JetBrains Mono for code. No Inter default.
- **Icons.** Phosphor (`@phosphor-icons/react`), one family everywhere, default weight,
  `fill`/`bold` only where emphasis is intended. No emoji in the UI.
- **Gradient text is banned.** Headings, brand and big numbers are solid color
  (`--text-1` or `--accent`). `--accent-grad` survives only as a fill (progress bar)
  and as the same-hue token definition.
- **Shape scale.** Radii 11–14 px (controls), 16–22 px (cards/modals), 999 px (chips).
  Double-bezel detail on hero surfaces: 1 px outline offset 5 px.
- **Depth.** Tinted shadows + blur; grain overlay (`body::after`, opacity 0.028,
  pointer-events none); backdrop-blur reserved for fixed/overlay layers.
- **Motion.** `--ease-fluid` / `--ease-spring`, `prefers-reduced-motion` honoured
  globally; spinners via `.icon-spin`; no transform on text layout properties.
- **Copy.** Sentence case body, small-caps only for tiny section labels.
  No em-dashes in UI copy (use periods, commas, colons, middots). No exclamation
  marks in success/system messages. Correct pluralisation everywhere.
- **Destructive actions** never use `window.confirm`; they use the inline
  `.confirm-row` strip with an explicit danger button and a keep/cancel path.
- **A11y.** `:focus-visible` outline on every interactive element; icons that replace
  text keep `aria-label`/`title`.
