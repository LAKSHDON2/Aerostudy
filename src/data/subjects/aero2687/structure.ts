import type { Topic, Week } from '../../schema'

/** Topic palette — hues drive node colours, filters and week chips */
export const topics: Topic[] = [
  { id: 'atmosphere', name: 'Atmosphere', hue: 205 },
  { id: 'aerodynamics', name: 'Aerodynamics', hue: 217 },
  { id: 'airfoils', name: 'Airfoils', hue: 168 },
  { id: 'wings', name: 'Wings', hue: 192 },
  { id: 'performance', name: 'Performance', hue: 42 },
  { id: 'materials', name: 'Materials', hue: 282 },
  { id: 'structures', name: 'Structures', hue: 322 },
  { id: 'propulsion', name: 'Propulsion', hue: 16 },
  { id: 'uas', name: 'UAS', hue: 132 },
  { id: 'rotary', name: 'Rotary-Wing', hue: 90 },
  { id: 'simulation', name: 'Simulation', hue: 258 },
  { id: 'space', name: 'Space', hue: 350 },
]

export const weeks: Week[] = [
  {
    number: 1,
    title: 'Intro & the Standard Atmosphere',
    topicIds: ['atmosphere'],
    examFocus: [
      'Know the four forces and straight-and-level equilibrium',
      'ISA: temperature falls ~1.98 °C per 1000 ft; memorise sea-level values',
      'R = 287 J/(kg·K) for air — appears in every gas-law question',
    ],
  },
  {
    number: 2,
    title: 'Aerodynamics',
    topicIds: ['aerodynamics', 'atmosphere'],
    examFocus: [
      'Lift & drag from q·S coefficients — the backbone of the exam',
      'Bernoulli: faster flow ⇒ lower static pressure (source of lift)',
      'Pitot-static: TAS vs EAS — density altitude effect',
      'Continuity: A₁V₁ = A₂V₂ for incompressible flow',
    ],
  },
  {
    number: 3,
    title: 'Airfoils',
    topicIds: ['airfoils'],
    examFocus: [
      'Thin-airfoil slope a₀ = 2π per radian — quoted constantly',
      'Stall = flow separation at c_{l,max}; camber shifts α_{L=0}',
      'Reynolds number: prove it is dimensionless (practice exam #2)',
      'AC ≈ quarter-chord; pitching moment constant there',
    ],
  },
  {
    number: 4,
    title: 'Wings (Finite Wings)',
    topicIds: ['wings', 'performance'],
    examFocus: [
      'Induced drag ∝ C_L²/(πARe) — higher AR ⇒ lower induced drag',
      'Span efficiency e: 1 ideal elliptical, 0.7–0.9 real wings',
      'Wing area S = b·c̄ and AR = b²/S both quotable',
    ],
  },
  {
    number: 5,
    title: 'Materials',
    topicIds: ['materials'],
    examFocus: [
      'σ = F/A and τ = F/A with correct area orientation',
      'Bending stress σ = My/I — I is the star of the show',
      'Factor of Safety = failure/allowable — know both forms',
      'Rule of Mixtures for composite longitudinal modulus',
    ],
  },
  {
    number: 6,
    title: 'Structures',
    topicIds: ['structures', 'materials'],
    examFocus: [
      'Euler column: P_CR = π²EI/(kL)² — buckling is geometric instability',
      'Plate buckling σ_CR = KE(t/b)² — thinner ⇒ dramatically weaker',
      'Thin-wall beam failure modes with sketches (practice exam #3)',
      'Semi-monocoque: skins + stringers/frames/ribs/spars',
    ],
  },
  {
    number: 7,
    title: 'Propulsion',
    topicIds: ['propulsion', 'performance'],
    examFocus: [
      'Jet thrust from momentum change: F = ṁ(Vⱼ − V₀)',
      'Power required = D·V; efficiency = useful/thrust power',
      'Engine family trade-offs: turbojet vs turbofan vs prop vs electric',
    ],
  },
  {
    number: 8,
    title: 'Unmanned Aircraft Systems',
    topicIds: ['uas', 'aerodynamics', 'performance'],
    examFocus: [
      'Low-Re aerodynamics: thick boundary layers, low c_{l,max}',
      'Electric endurance from battery energy / average power',
      'Payload–range–endurance trade for surveillance missions',
    ],
  },
  {
    number: 9,
    title: 'Rotary-Wing Aerodynamics',
    topicIds: ['rotary', 'aerodynamics'],
    examFocus: [
      'Momentum theory hover: T = 2ρAv_i² ideal',
      'Disk loading drives induced power; Figure of Merit compares to ideal',
      'Advancing/retreating blade asymmetry and dissymmetry of lift',
    ],
  },
  {
    number: 10,
    title: 'Simulation & Flight Performance',
    topicIds: ['simulation', 'performance'],
    examFocus: [
      'Stall speed vs wing loading and C_{L,max}',
      'Similitude: match Re and Mach between model and full scale',
      'Glide ratio L/D; rate of climb = excess power / weight',
      'Breguet range logic (expanded)',
    ],
  },
  {
    number: 11,
    title: 'Space (Coming Soon)',
    topicIds: ['space'],
    examFocus: ['Placeholder — orbital mechanics content lands in a future update'],
    locked: true,
  },
]
