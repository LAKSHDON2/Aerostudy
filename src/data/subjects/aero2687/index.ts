import type { ExamRadarItem, IsaRow, Subject, Variable } from '../../schema'
import { topics, weeks } from './structure'
import { formulas } from './formulas'
import { quizBank } from './quiz'

/** Variables: parts appended into one exported array (see bottom of this file). */
import { variablesPart1 } from './variables'

/**
 * Official Appendix ISA extract (0 / 5,000 / 10,000 / 35,000 ft) — rendered as a data card.
 * Values exactly as printed in the course Appendix.
 */
const isaTable: IsaRow[] = [
  { altitudeFt: 0, tempC: 15.0, pressurePa: 101325, densityKgM3: 1.225, speedOfSoundMs: 340, viscosityPaS: 1.81e-5 },
  { altitudeFt: 5000, tempC: 5.1, pressurePa: 84307, densityKgM3: 1.056, speedOfSoundMs: 334, viscosityPaS: 1.76e-5 },
  { altitudeFt: 10000, tempC: -4.8, pressurePa: 69682, densityKgM3: 0.905, speedOfSoundMs: 328, viscosityPaS: 1.71e-5 },
  { altitudeFt: 35000, tempC: -54.3, pressurePa: 23842, densityKgM3: 0.38, speedOfSoundMs: 297, viscosityPaS: 1.44e-5 },
]

/** The four practice-exam focus areas, pinned to the top of List View. */
const examRadar: ExamRadarItem[] = [
  {
    id: 'radar-1',
    title: 'Aircraft type comparison (surveillance mission)',
    detail:
      'Compare fixed-wing vs rotary-wing vs lighter-than-air for a surveillance mission. Fixed-wing: fast, long range, needs runway or launch — poor loiter. Rotary-wing: hover, vertical take-off, precise station-keeping — short endurance, complex. Lighter-than-air: very long endurance at low power — slow, wind-sensitive, large ground handling. Structure answers as advantage → disadvantage → recommendation.',
    relatedIds: ['f-forces-eq', 'f-power-req', 'f-endurance-elec', 'f-hover-power'],
    source: 'practice-exam',
  },
  {
    id: 'radar-2',
    title: 'Reynolds number — proof, calculation, total drag',
    detail:
      'Three parts: (1) prove Re = ρVL/μ is dimensionless by base-unit cancellation; (2) compute Re for a given aircraft (watch chord vs span as the reference length); (3) discuss why Re matters (boundary layers, transition, c_l,max) and compute total drag via the drag polar D = C_D·q·S with C_D from C_{D,0} + C_L²/πARe.',
    relatedIds: ['f-re', 'f-drag-polar', 'f-drag', 'f-q'],
    source: 'practice-exam',
  },
  {
    id: 'radar-3',
    title: 'Thin-wall beam — three failure modes',
    detail:
      'For tension, cantilever bending and compression members: tension fails by yielding/rupture (σ = F/A); a cantilever under end load fails by bending (σ = My/I) or tip deflection; compression fails earliest by buckling (Euler π²EI/(kL)², cantilever k = 2). Sketch each mode, state the governing formula, compare applied vs critical stress with a factor of safety.',
    relatedIds: ['f-stress-n', 'f-bending', 'f-euler', 'f-fs'],
    source: 'practice-exam',
  },
  {
    id: 'radar-4',
    title: 'Take-off distance — units, calculation, hot day, design',
    detail:
      'Four parts: (1) verify s_LO = 1.44W²/(gρSC_{L,max}T) has metre units by cancelling; (2) plug numbers; (3) hot day → lower ρ reduces lift and thrust → longer roll; (4) design improvements map to equation terms: more thrust T, larger S, higher C_{L,max} (flaps), less weight W (squared benefit).',
    relatedIds: ['f-takeoff', 'f-isa-dens', 'f-lift'],
    source: 'practice-exam',
  },
]

/** Derive variable.appearsIn from the formulas so links are guaranteed bidirectional. */
function deriveAppearsIn(vars: Variable[], fmls: typeof formulas): Variable[] {
  const map = new Map(vars.map((v) => [v.id, v]))
  for (const f of fmls) {
    for (const vid of f.variableIds) {
      const v = map.get(vid)
      if (v && !v.appearsIn.includes(f.id)) v.appearsIn.push(f.id)
    }
  }
  return vars
}

const variables = deriveAppearsIn(variablesPart1, formulas)

export const aero2687: Subject = {
  id: 'aero2687',
  code: 'AERO2687',
  title: 'Introduction to Aerospace Engineering',
  institution: 'RMIT University',
  examMeta: '2-hour closed-book end-of-semester exam · Weeks 1–11',
  weeks,
  topics,
  formulas,
  variables,
  quizBank,
  isaTable,
  examRadar,
}
