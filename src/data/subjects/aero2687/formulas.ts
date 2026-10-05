import type { Formula } from '../../schema'

/**
 * AERO2687 formula library.
 * Priority order: Appendix + practice exam (core) → Weeks 2–6 backbone → expanded standard theory.
 */
export const formulas: Formula[] = [
  // ─── Week 1 — Intro & Standard Atmosphere ───

  {
    id: 'f-forces-eq', name: 'Four forces & level-flight equilibrium',
    latex: 'L = W, \\qquad T = D',
    weekTags: [1, 2], topicIds: ['aerodynamics', 'performance'],
    explanation:
      'Only four forces act on an aircraft in flight: lift, drag, weight and thrust. In straight-and-level unaccelerated flight they must balance — lift equals weight and thrust equals drag. Every performance question starts from this equilibrium; accelerate or turn, and the balance breaks into L ≠ W or T ≠ D components that you resolve along and across the flight path.',
    insights: [
      'Lift and drag are aerodynamic forces from pressure + shear; weight and thrust are not aerodynamic.',
      'In a steady climb, thrust must exceed drag by W·sinγ — balance is along the flight path, not the horizon.',
    ],
    variableIds: ['L', 'W', 'T', 'D'],
    relatedFormulaIds: ['f-lift', 'f-drag', 'f-weight', 'f-roc'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-weight', name: 'Weight from mass',
    latex: 'W = m\\,g',
    weekTags: [1, 2], topicIds: ['aerodynamics'],
    explanation:
      'Weight is the gravitational force on the aircraft: mass times gravitational acceleration (9.81 m/s²). Mass stays constant in flight (minus fuel burn), but weight is what aerodynamics must fight. Exam data often gives mass in kg — convert to newtons with ×9.81 before any lift-equilibrium arithmetic, a step worth a mark every time.',
    variableIds: ['W', 'm', 'g'],
    relatedFormulaIds: ['f-forces-eq', 'f-vstall', 'f-takeoff'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-igl', name: 'Ideal gas law',
    latex: 'P = \\rho\\,R\\,T',
    weekTags: [1, 2], topicIds: ['atmosphere', 'aerodynamics'],
    explanation:
      'The equation of state for air: pressure equals density times the specific gas constant times absolute temperature (kelvin!). With R = 287 J/(kg·K) for air it links the three ISA pillars — given any two state variables you find the third. It is the workhorse behind density altitude, hot-day take-off questions and every atmosphere calculation.',
    insights: [
      'Temperature MUST be in kelvin: T(K) = T(°C) + 273.',
      'Hot day ⇒ lower ρ at the same pressure ⇒ longer take-off, higher true airspeed, worse engine output.',
    ],
    variableIds: ['P', 'rho', 'R', 'T-iso'],
    relatedFormulaIds: ['f-tk', 'f-isa-press', 'f-isa-dens', 'f-sos', 'f-q'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-tk', name: 'Temperature unit conversion',
    latex: 'T(\\mathrm{K}) = T(^\\circ\\mathrm{C}) + 273',
    weekTags: [1, 2], topicIds: ['atmosphere'],
    explanation:
      'Gas laws, speed of sound and ISA relations all require absolute temperature. Adding 273 (273.15 exactly) converts Celsius to kelvin. It looks trivial, but using 15 °C directly in P = ρRT is the most common avoidable error in atmosphere questions — the answer comes out wrong by a factor of ~50.',
    variableIds: ['T-iso'],
    relatedFormulaIds: ['f-igl', 'f-sos', 'f-isa-temp'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-isa-temp', name: 'ISA temperature profile (troposphere)',
    latex: 'T = T_0 - L\\,h',
    weekTags: [1], topicIds: ['atmosphere'],
    explanation:
      'In the International Standard Atmosphere temperature falls linearly with altitude: T = T₀ − L·h with T₀ = 288.15 K and L = 6.5 K/km. It is the first layer of the ISA model and the input to the pressure and density profiles. Above 11 km the tropopause holds T constant at −56.5 °C.',
    insights: ['Rule of thumb: ≈ 2 °C per 1,000 ft — quoted in exams and in real aviation.'],
    variableIds: ['T-iso', 'T0', 'Lapse', 'h-alt'],
    relatedFormulaIds: ['f-isa-lapse', 'f-isa-press', 'f-isa-dens', 'f-tk'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-isa-lapse', name: 'ISA lapse rate',
    latex: 'L = -\\frac{\\mathrm{d}T}{\\mathrm{d}h} = 6.5\\ \\mathrm{K/km}',
    weekTags: [1], topicIds: ['atmosphere'],
    explanation:
      'The lapse rate is the temperature decrease per unit altitude in the standard troposphere: 6.5 K per kilometre, or about 1.98 °C per 1,000 ft. It is a modelling constant of the ISA, not a law of nature — but every standard-atmosphere exam value comes from it. In per-foot form, ≈ 0.00198 K/ft.',
    variableIds: ['Lapse', 'h-alt', 'T-iso'],
    relatedFormulaIds: ['f-isa-temp'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-isa-press', name: 'ISA pressure profile',
    latex: 'P = P_0\\left(1 - \\frac{L\\,h}{T_0}\\right)^{\\frac{g}{R\\,L}}',
    weekTags: [1], topicIds: ['atmosphere'],
    explanation:
      'Combining the linear temperature profile with hydrostatics (dP = −ρg dh) and the gas law gives pressure falling as a power of altitude: exponent g/(RL) ≈ 5.256. At 35,000 ft this predicts 23.8 kPa — about a quarter of sea level — which is why cabins are pressurised and why the ISA table in the Appendix matters.',
    insights: [
      'This is exactly how the Appendix ISA table rows are generated — you can reconstruct any row.',
    ],
    variableIds: ['P', 'P0', 'T0', 'Lapse', 'h-alt', 'g', 'R'],
    relatedFormulaIds: ['f-isa-temp', 'f-isa-dens', 'f-igl'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-isa-dens', name: 'ISA density profile',
    latex: '\\rho = \\rho_0\\left(1 - \\frac{L\\,h}{T_0}\\right)^{\\frac{g}{R\\,L} - 1}',
    weekTags: [1], topicIds: ['atmosphere'],
    explanation:
      'Density follows from the pressure profile through the gas law, giving exponent g/(RL) − 1 ≈ 4.256 — density falls slightly faster than pressure. At 10,000 ft ρ = 0.905 kg/m³ (−26 %) and at 35,000 ft it is 0.380 kg/m³ (−69 %). Falling density is the root cause of longer take-offs, higher true airspeed and reduced engine power with altitude.',
    variableIds: ['rho', 'rho0', 'T0', 'Lapse', 'h-alt', 'g', 'R'],
    relatedFormulaIds: ['f-isa-press', 'f-igl', 'f-eas'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-sos', name: 'Speed of sound',
    latex: 'a = \\sqrt{\\gamma\\,R\\,T}',
    weekTags: [1, 2, 3], topicIds: ['atmosphere', 'aerodynamics'],
    explanation:
      'Sound is a pressure wave; its speed in an ideal gas depends only on temperature: a = √(γRT) with γ = 1.4 and R = 287 for air. At ISA sea level a = 340 m/s; at 35,000 ft, with T = 218.9 K, it drops to 297 m/s. Because the speed of sound falls with altitude, a constant true airspeed is a higher Mach number up high.',
    insights: ['Exam shortcut: a = 20.05√T m/s with T in kelvin — quick mental estimates.'],
    variableIds: ['a-sos', 'gamma', 'R', 'T-iso'],
    relatedFormulaIds: ['f-mach', 'f-tk'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-mach', name: 'Mach number',
    latex: 'M = \\frac{V}{a}',
    weekTags: [1, 3, 10], topicIds: ['aerodynamics', 'simulation'],
    explanation:
      'Mach number is the ratio of flow speed to the local speed of sound — the measure of compressibility. Below M ≈ 0.3, air behaves as incompressible and Bernoulli-based results hold; approaching M 1, shocks form and drag rises sharply. It is one of the two similarity numbers (with Reynolds number) that model tests must respect.',
    variableIds: ['Ma', 'V', 'a-sos'],
    relatedFormulaIds: ['f-sos', 'f-similitude', 'f-re'],
    examPriority: 'core', source: 'appendix',
  },

  // ─── Week 2 — Aerodynamics ───

  {
    id: 'f-q', name: 'Dynamic pressure',
    latex: 'q = \\frac{1}{2}\\,\\rho\\,V^2',
    weekTags: [2], topicIds: ['aerodynamics'],
    explanation:
      'Dynamic pressure is the kinetic energy per unit volume of the free stream — the “push” of moving air. Every aerodynamic force formula is built on q: lift, drag and moments are all q times a coefficient times an area. It also drives structural loads: flying twice as fast quadruples q.',
    insights: ['q is what an airspeed indicator actually measures — V is its square root, scaled by density.'],
    variableIds: ['q', 'rho', 'V'],
    relatedFormulaIds: ['f-lift', 'f-drag', 'f-bernoulli', 'f-moment'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-lift', name: 'Lift equation',
    latex: 'L = C_L\\,q\\,S = C_L\\,\\frac{1}{2}\\rho V^2\\,S',
    weekTags: [2, 4], topicIds: ['aerodynamics', 'wings'],
    explanation:
      'Lift equals the lift coefficient times dynamic pressure times wing reference area. The coefficient packs in all the aerodynamics (shape, angle of attack, viscosity); q and S supply the scale. Level flight demands L = W, so required C_L rises as speed falls — which is why slow flight ends in stall. This is the single most-used equation in the course.',
    insights: [
      'Level flight: V² = 2W/(ρSC_L) — every speed question hides here.',
      'Units check: [C_L]·[Pa]·[m²] = N. Do this on the exam; it is free marks.',
    ],
    variableIds: ['L', 'CL', 'q', 'S', 'rho', 'V'],
    relatedFormulaIds: ['f-drag', 'f-q', 'f-vstall', 'f-wing-cl', 'f-forces-eq'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-drag', name: 'Drag equation',
    latex: 'D = C_D\\,q\\,S = C_D\\,\\frac{1}{2}\\rho V^2\\,S',
    weekTags: [2, 4, 7], topicIds: ['aerodynamics', 'wings', 'performance'],
    explanation:
      'Drag has identical form to lift, with the drag coefficient C_D = C_{D,0} + C_L²/(πARe) from the drag polar. In steady level flight thrust must equal drag, so this equation sizes the engine and sets fuel burn. Watch the quadratic speed dependence: going 10 % faster costs about 21 % more parasite drag at fixed C_D.',
    variableIds: ['D', 'CD', 'q', 'S', 'rho', 'V'],
    relatedFormulaIds: ['f-lift', 'f-drag-polar', 'f-q', 'f-power-req'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-bernoulli', name: "Bernoulli's equation (total pressure)",
    latex: 'P_T = P + \\frac{1}{2}\\rho V^2 = \\mathrm{constant}',
    weekTags: [2], topicIds: ['aerodynamics'],
    explanation:
      'Along a streamline of steady, inviscid, incompressible flow, static pressure plus dynamic pressure is constant — energy conservation for air. Speed up the flow and static pressure must fall: this is the physical source of lift on an airfoil’s suction surface and the operating principle of the pitot tube.',
    insights: [
      'Valid only for incompressible, inviscid, steady flow along a streamline — know the three assumptions.',
      'Total pressure P_T is what a pitot probe senses at its mouth.',
    ],
    variableIds: ['P', 'rho', 'V', 'q'],
    relatedFormulaIds: ['f-bernoulli-2pt', 'f-pitot', 'f-q'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-bernoulli-2pt', name: "Bernoulli's equation (two stations)",
    latex: 'P_1 + \\frac{1}{2}\\rho V_1^2 = P_2 + \\frac{1}{2}\\rho V_2^2',
    weekTags: [2], topicIds: ['aerodynamics'],
    explanation:
      'The station-to-station form of Bernoulli: comparing two points on the same streamline, a velocity increase buys a static-pressure decrease. Pair it with continuity to solve venturi-style problems — constrict the duct, speed rises, pressure drops. This pairing is the standard exam method for ducted-fan and wind-tunnel questions.',
    variableIds: ['P', 'V', 'rho'],
    relatedFormulaIds: ['f-bernoulli', 'f-continuity'],
    examPriority: 'high', source: 'lectures',
  },
  {
    id: 'f-pitot', name: 'Pitot-static true airspeed',
    latex: 'V = \\sqrt{\\frac{2\\,(P_{\\mathrm{Total}} - P_{\\mathrm{Static}})}{\\rho}}',
    weekTags: [2], topicIds: ['aerodynamics', 'atmosphere'],
    explanation:
      'A pitot tube measures total pressure; a static port measures static pressure. Bernoulli turns their difference — the dynamic pressure — into speed: V = √(2ΔP/ρ). Note the density is the actual air density, so the same instrument reading means different true speeds at altitude. This is the mechanism behind airspeed indicators.',
    insights: [
      'ΔP is the measured quantity; ρ must come from the atmosphere (ISA table or gas law).',
      'Block the static port and the indicator lies — a classic exam conceptual question.',
    ],
    variableIds: ['V', 'P', 'rho'],
    relatedFormulaIds: ['f-bernoulli', 'f-eas'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-eas', name: 'Equivalent airspeed',
    latex: 'V_e = \\sqrt{\\frac{2\\,(P_{\\mathrm{Total}} - P_{\\mathrm{Static}})}{\\rho_{sl}}}',
    weekTags: [2], topicIds: ['aerodynamics', 'atmosphere'],
    explanation:
      'Calibrate the pitot-static speed with sea-level density and you get equivalent airspeed: the speed that would produce the same dynamic pressure at sea level. Since V_e = V√(ρ/ρ_sl), true airspeed exceeds EAS at altitude. Structural speed limits are quoted in EAS because the loads depend on q — same EAS, same aerodynamic loads, any altitude.',
    insights: ['Practice-exam favourite: “why does TAS > EAS at altitude?” — because ρ < ρ_sl for the same ΔP.'],
    variableIds: ['Ve', 'P', 'rho', 'rho0'],
    relatedFormulaIds: ['f-pitot', 'f-isa-dens'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-continuity', name: 'Continuity equation (mass conservation)',
    latex: '\\dot{m} = \\rho_1 A_1 V_1 = \\rho_2 A_2 V_2',
    weekTags: [2, 7], topicIds: ['aerodynamics', 'propulsion'],
    explanation:
      'Mass cannot pile up in steady flow: what enters a duct per second equals what leaves. For incompressible flow density cancels, leaving A₁V₁ = A₂V₂ — squeeze the area and the flow speeds up proportionally. Continuity plus Bernoulli solves most internal-flow exam problems, from venturis to engine inlets.',
    insights: ['Incompressible shortcut: A₁V₁ = A₂V₂. Compressible: keep the ρ’s and use the gas law.'],
    variableIds: ['mdot', 'rho', 'A-flow', 'V'],
    relatedFormulaIds: ['f-bernoulli-2pt', 'f-thrust-jet'],
    examPriority: 'core', source: 'appendix',
  },

  // ─── Week 3 — Airfoils ───

  {
    id: 'f-cl-section', name: 'Section lift coefficient (2-D)',
    latex: 'c_l = a_0\\,(\\alpha - \\alpha_{L=0})',
    weekTags: [3, 4], topicIds: ['airfoils', 'wings'],
    explanation:
      'Below stall, a 2-D airfoil’s lift coefficient grows linearly with angle of attack measured from the zero-lift angle: c_l = a₀(α − α_{L=0}). Camber only shifts α_{L=0} negative; the slope stays a₀. This one line generates every “what C_L at this α?” question — just keep radians and degrees consistent.',
    insights: [
      'Alternative form: c_l = a₀α + c_{l,α=0} — same line, camber term explicit.',
      'Valid only in the linear region; beyond c_{l,max} the airfoil is stalled.',
    ],
    variableIds: ['cl', 'a0', 'alpha', 'alphaL0'],
    relatedFormulaIds: ['f-a0', 'f-wing-cl', 'f-wing-slope'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-a0', name: 'Ideal thin-airfoil lift slope',
    latex: 'a_0 = 2\\pi\\ \mathrm{per\ radian}',
    weekTags: [3, 4], topicIds: ['airfoils'],
    explanation:
      'Thin-airfoil theory predicts the 2-D lift-curve slope exactly: a₀ = 2π per radian ≈ 0.11 per degree — the most quoted constant in aerofoil theory. It is the theoretical ceiling for section lift slope; real viscous sections come in 5–10 % lower. Quoting it correctly earns marks in both airfoil and finite-wing questions.',
    variableIds: ['a0'],
    relatedFormulaIds: ['f-cl-section', 'f-wing-slope'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-re', name: 'Reynolds number',
    latex: 'Re = \\frac{\\rho_\\infty V_\\infty L}{\\mu_\\infty}',
    weekTags: [3, 8, 10], topicIds: ['airfoils', 'simulation'],
    explanation:
      'Reynolds number compares inertial to viscous forces and decides the character of a flow: boundary-layer thickness, transition, separation. Substituting base units proves it is dimensionless — kg/m³·m/s·m over kg/(m·s) leaves a pure number — and that proof is practice-exam question #2. Small UAS fly at low Re where airfoils underperform; that is Wk-8 territory.',
    insights: [
      'Dimensionless proof: [ρVL/μ] = (kg/m³)(m/s)(m) ÷ (kg/(m·s)) = 1. Show the cancellation explicitly.',
      'Higher Re ⇒ thinner boundary layer, later separation, higher c_{l,max}, lower skin friction.',
    ],
    variableIds: ['Re', 'rho', 'V', 'L-ref', 'mu'],
    relatedFormulaIds: ['f-similitude', 'f-lo-re', 'f-mach'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-moment', name: 'Pitching moment coefficient',
    latex: 'M = C_M\\,q\\,S\\,c',
    weekTags: [3], topicIds: ['airfoils'],
    explanation:
      'Aerodynamic moment made dimensionless with an extra chord length: M = C_M·q·S·c. About the aerodynamic centre C_M is constant with angle of attack (≈ quarter-chord, low speed) — that invariance is what makes the AC the stability reference point. Cambered sections give constant nose-down C_M ≈ −0.05 to −0.10.',
    variableIds: ['M-moment', 'cm', 'q', 'S', 'c'],
    relatedFormulaIds: ['f-q', 'f-cl-section'],
    examPriority: 'high', source: 'lectures',
  },
  {
    id: 'f-vstall', name: 'Stall speed',
    latex: 'V_{\\mathrm{stall}} = \\sqrt{\\frac{2W}{\\rho\\,S\\,C_{L,\\max}}}',
    weekTags: [3, 10], topicIds: ['wings', 'performance'],
    explanation:
      'Stall happens when required lift exceeds C_{L,max}·q·S. Solve the lift equation for V at C_{L,max} and you get stall speed: heavier, less dense air, smaller wings or lower C_{L,max} all raise it. It sets approach speed (≈ 1.3·V_stall), landing distance and the bottom of the V-n diagram — the most quoted performance number there is.',
    insights: [
      'V_stall ∝ √W — 21 % heavier means 10 % faster stall speed.',
      'Turns multiply effective weight (n·W), raising stall speed by √n — why steep turns stall at higher speed.',
    ],
    variableIds: ['CLmax', 'W', 'rho', 'S'],
    relatedFormulaIds: ['f-lift', 'f-wing-load', 'f-CLmax-note'],
    examPriority: 'core', source: 'expanded',
  },
  {
    id: 'f-CLmax-note', name: 'Stall condition',
    latex: 'C_{L,\\max} = \\frac{2W}{\\rho\\,S\\,V_{\\mathrm{stall}}^2}',
    weekTags: [3, 4], topicIds: ['airfoils', 'wings'],
    explanation:
      'The companion view of the lift equation: at stall speed the wing is at C_{L,max}. This form answers “does the wing stall at this speed/weight?” directly and underlies gross-weight checks on take-off and landing performance. It is the same equation as stall speed, just solved for the coefficient.',
    variableIds: ['CLmax', 'W', 'rho', 'S'],
    relatedFormulaIds: ['f-vstall', 'f-lift'],
    examPriority: 'high', source: 'expanded',
  },

  // ─── Week 4 — Wings (finite wings) ───

  {
    id: 'f-wing-area', name: 'Wing area from span and mean chord',
    latex: 'S = b\\,\\bar{c}',
    weekTags: [4], topicIds: ['wings'],
    explanation:
      'Wing reference area equals span times mean chord — the planform rectangle that matches the true (tapered) area. Given any two of S, b, c̄ you reconstruct the third, and every aspect-ratio question chains from here. Exam data usually gives two and asks for AR or induced drag.',
    variableIds: ['S', 'b', 'cbar'],
    relatedFormulaIds: ['f-ar'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-ar', name: 'Aspect ratio',
    latex: 'AR = \\frac{b^2}{S} = \\frac{b}{\\bar{c}}',
    weekTags: [4], topicIds: ['wings'],
    explanation:
      'Aspect ratio is slenderness: span squared over area, or span over mean chord — the two forms are identical via S = b·c̄. High AR (sailplanes) cuts induced drag; low AR (deltas, fighters) buys compactness and roll agility. It appears in every induced-drag, lift-slope and downwash formula that follows.',
    insights: ['Use AR = b²/S when given area, AR = b/c̄ when given chords — whichever avoids the missing quantity.'],
    variableIds: ['AR', 'b', 'S', 'cbar'],
    relatedFormulaIds: ['f-wing-area', 'f-cdi', 'f-drag-polar', 'f-wing-slope'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-wing-slope', name: 'Finite-wing lift slope',
    latex: 'a = \\frac{a_0}{1 + \\frac{a_0}{\\pi\\,AR\\,e}}',
    weekTags: [4], topicIds: ['wings'],
    explanation:
      'Tip vortices create downwash that tilts the local flow, so a 3-D wing produces less lift slope than its 2-D section: a = a₀/(1 + a₀/πARe). Valid for AR ≥ 4 where lifting-line theory holds. Lower AR hurts twice — weaker lift slope and stronger induced drag — which is why deltas must fly at high angle of attack.',
    insights: ['a₀ in radians — mixing degrees here is the #1 error in finite-wing questions.'],
    variableIds: ['a-wing', 'a0', 'AR', 'e'],
    relatedFormulaIds: ['f-a0', 'f-cl-section', 'f-wing-cl', 'f-alpha-i'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-wing-cl', name: 'Wing lift coefficient (3-D)',
    latex: 'C_L = a\\,(\\alpha - \\alpha_{L=0})',
    weekTags: [4], topicIds: ['wings'],
    explanation:
      'The Appendix’s wing-level lift line: C_L grows with the finite-wing slope a from the zero-lift angle. It is the section relation f-cl-section demoted by tip losses — same α, less lift. Feed its C_L into the drag polar and you have the complete subsonic wing model used in every performance question.',
    variableIds: ['CL', 'a-wing', 'alpha', 'alphaL0'],
    relatedFormulaIds: ['f-cl-section', 'f-wing-slope', 'f-drag-polar'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-alpha-i', name: 'Induced angle of attack',
    latex: '\\alpha_i = \\frac{C_L}{\\pi\\,AR\\,e}',
    weekTags: [4], topicIds: ['wings'],
    explanation:
      'Downwash tilts the local flow down by α_i = C_L/πARe, so the section effectively flies at α − α_i — the physical origin of the finite-wing slope reduction and of induced drag. Result is in radians. High-lift, low-AR flight maximises α_i: another way of saying tip losses dominate at slow speeds.',
    variableIds: ['alpha-i', 'CL', 'AR', 'e'],
    relatedFormulaIds: ['f-wing-slope', 'f-cdi'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-drag-polar', name: 'Drag polar',
    latex: 'C_D = C_{D,0} + \\frac{C_L^2}{\\pi\\,AR\\,e}',
    weekTags: [4, 10], topicIds: ['wings', 'performance'],
    explanation:
      'The drag polar splits total drag coefficient into parasite (C_{D,0}: skin friction, form, interference — present always) plus induced (lift-driven, growing with C_L²). Plot C_D against C_L and you get the classic parabola; the bucket’s bottom is best L/D. It is the bridge from wing geometry to every range, endurance and climb result.',
    insights: [
      'Parasite = skin-friction + form + interference (know the three).',
      'Best L/D when C_{D,0} = C_L²/(πARe) — parasite equals induced. Memorise this condition.',
    ],
    variableIds: ['CD', 'CD0', 'CL', 'AR', 'e'],
    relatedFormulaIds: ['f-cdi', 'f-drag', 'f-glide', 'f-breguet-range'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-cdi', name: 'Induced drag coefficient',
    latex: 'C_{D,i} = \\frac{C_L^2}{\\pi\\,AR\\,e}',
    weekTags: [4], topicIds: ['wings'],
    explanation:
      'The lift-induced share of drag, isolated from the polar. Halve the speed and required C_L quadruples, so induced drag quadruples too — slow flight is induced-drag country. Higher AR or better e pushes it down at any C_L; this is why gliders and airliners stretch their wings.',
    variableIds: ['CDi', 'CL', 'AR', 'e'],
    relatedFormulaIds: ['f-drag-polar', 'f-ar'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-wing-load', name: 'Wing loading',
    latex: '\\frac{W}{S} = \\frac{1}{2}\\rho V^2 C_L',
    weekTags: [4, 10], topicIds: ['wings', 'performance'],
    explanation:
      'Rearranged level flight: wing loading equals half-density-times-speed-squared times C_L. It ties design (W/S) to operating condition (V, C_L) — at cruise C_L ≈ 0.3–0.5, so W/S fixes the cruise speed band. Stall speed scales with √(W/S), making it the single best descriptor of an aircraft’s size-speed character.',
    variableIds: ['W-S', 'W', 'S', 'rho', 'V', 'CL'],
    relatedFormulaIds: ['f-lift', 'f-vstall'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-takeoff', name: 'Take-off distance (practice exam)',
    latex: 's_{LO} = \\frac{1.44\,W^2}{g\\,\\rho\\,S\\,C_{L,\\max}\\,T}',
    weekTags: [4, 10], topicIds: ['performance', 'propulsion'],
    explanation:
      'The closed-form ground roll from the practice exam, derived from Newton’s second law along the runway with lift growing as V². Squared weight in the numerator means heavy aircraft pay double — twice the mass to accelerate and more lift needed. The practice exam asks you to verify units, compute it, then discuss hot-day effects and design fixes — rehearse all three.',
    insights: [
      'Units: N² ÷ [(m/s²)(kg/m³)(m²)(–)(N)] = m. Do it once in revision; reproduce it in the exam.',
      'Hot day ⇒ ρ falls ⇒ s_LO rises (both directly and via thrust T) — the double-hit discussion question.',
      'Design improvements: more thrust T, bigger S, higher C_{L,max} (flaps), lower W. Each maps to a term.',
    ],
    variableIds: ['W', 'g', 'rho', 'S', 'CLmax', 'T'],
    relatedFormulaIds: ['f-lift', 'f-weight', 'f-isa-dens'],
    examPriority: 'core', source: 'practice-exam',
  },

  // ─── Week 5 — Materials ───

  {
    id: 'f-stress-n', name: 'Normal (axial) stress',
    latex: '\\sigma = \\frac{F}{A}',
    weekTags: [5, 6], topicIds: ['materials', 'structures'],
    explanation:
      'Stress is internal force per area — tension pulls, compression pushes. It is the first calculation of every structures problem: find the load path, identify the resisting area, divide. Compare the result against the material’s yield or ultimate allowable (with factor of safety) to declare pass or fail.',
    insights: ['Compression members: also check buckling — σ = F/A may look fine while the member bows out.'],
    variableIds: ['sigma', 'F', 'A-area'],
    relatedFormulaIds: ['f-stress-s', 'f-fs', 'f-euler', 'f-euler-stress'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-stress-s', name: 'Shear stress',
    latex: '\\tau = \\frac{F}{A}',
    weekTags: [5, 6], topicIds: ['materials', 'structures'],
    explanation:
      'Same division as normal stress, but the force acts parallel to the area — rivets, bolts, glue lines and webs live in shear. Aircraft skins loaded in torsion or panel shear and lap joints are the standard examples. Shear allowables run about half of tensile allowables for metals.',
    variableIds: ['tau', 'F', 'A-area'],
    relatedFormulaIds: ['f-stress-n'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-bending', name: 'Bending stress (flexure formula)',
    latex: '\\sigma = \\frac{M\\,y}{I}',
    weekTags: [5], topicIds: ['materials', 'structures'],
    explanation:
      'A beam in bending carries compression on one face, tension on the other, zero at the neutral axis, varying linearly — σ = My/I. The outer fibres (max y) see the peak stress, which is exactly why I-beams and spar caps concentrate material there. Wing spars are designed almost entirely around this formula.',
    insights: ['Max stress at y = c (half-depth for symmetric sections): σ_max = Mc/I.'],
    variableIds: ['sigma', 'M-bend', 'y', 'I'],
    relatedFormulaIds: ['f-inertia', 'f-stress-n', 'f-fs'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-inertia', name: 'Second moment of area (rectangle)',
    latex: 'I = \\frac{b\\,h^3}{12}',
    weekTags: [5, 6], topicIds: ['materials', 'structures'],
    explanation:
      'For a rectangular section bent about its centroidal axis, I = bh³/12 — depth cubed. Orientation is everything: a plank on edge is vastly stiffer than flat because h is the bending direction. The cubed depth is why deep, thin sections (and moving material outward) dominate efficient aircraft structure.',
    insights: ['About its own base, a rectangle gives bh³/3 — quadruple the centroidal value. Use the right one.'],
    variableIds: ['I'],
    relatedFormulaIds: ['f-bending', 'f-euler', 'f-r-gyr'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-hooke', name: "Hooke's law",
    latex: '\\sigma = E\\,\\epsilon',
    weekTags: [5], topicIds: ['materials'],
    explanation:
      'In the elastic region stress and strain are proportional, with Young’s modulus E as the slope. This defines material stiffness (distinct from strength!) and lets you convert measured strain into stress — the operating principle of strain gauges. Beyond the proportional limit the line bends and Hooke no longer applies.',
    variableIds: ['sigma', 'E', 'epsilon'],
    relatedFormulaIds: ['f-poisson', 'f-shear-mod'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-poisson', name: "Poisson's ratio",
    latex: '\\nu = -\\frac{\\epsilon_{\\mathrm{lateral}}}{\\epsilon_{\\mathrm{axial}}}',
    weekTags: [5], topicIds: ['materials'],
    explanation:
      'Stretch a member axially and it contracts laterally; Poisson’s ratio is the (negative of the) ratio of those strains. For metals ν ≈ 0.3. It matters when a material is prevented from contracting (biaxial stress states) and is one of only two elastic constants an isotropic material needs.',
    variableIds: ['nu', 'epsilon'],
    relatedFormulaIds: ['f-hooke', 'f-shear-mod'],
    examPriority: 'medium', source: 'expanded',
  },
  {
    id: 'f-shear-mod', name: 'Shear modulus relation',
    latex: 'G = \\frac{E}{2\\,(1 + \\nu)}',
    weekTags: [5, 6], topicIds: ['materials'],
    explanation:
      'For isotropic materials only two elastic constants are independent; given E and ν, shear stiffness follows as G = E/2(1+ν) — about 0.38·E for metals. It appears whenever torsion or shear deflection is computed. Quick exam use: with E = 70 GPa and ν = 0.3, G ≈ 27 GPa for aluminium.',
    variableIds: ['G', 'E', 'nu'],
    relatedFormulaIds: ['f-hooke', 'f-poisson'],
    examPriority: 'medium', source: 'expanded',
  },
  {
    id: 'f-fs', name: 'Factor of Safety',
    latex: 'FS = \\frac{F_{\\mathrm{fail}}}{F_{\\mathrm{allow}}} = \\frac{\\sigma_{\\mathrm{fail}}}{\\sigma_{\\mathrm{allow}}}',
    weekTags: [5], topicIds: ['materials', 'structures'],
    explanation:
      'The factor of safety is how many times stronger the structure is than it needs to be for the expected load: failure stress over allowable stress (same ratio with loads). Aircraft keep FS small (≈1.5) because margin is mass; uncertainty is handled by proving loads and material allowables. Quote the ratio both ways — loads and stresses — as the Appendix does.',
    insights: ['Working stress = σ_fail/FS. If applied stress exceeds this, the design fails the check.'],
    variableIds: ['FS', 'sigma-fail', 'sigma-allow', 'F'],
    relatedFormulaIds: ['f-stress-n', 'f-bending'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-rule-mixtures', name: 'Rule of Mixtures (longitudinal modulus)',
    latex: 'E_1 = E_f\\,V_f + E_m\\,V_m, \\qquad V_f + V_m = 1',
    weekTags: [5], topicIds: ['materials'],
    explanation:
      'For a unidirectional composite loaded along its fibres, fibre and matrix act in parallel: stiffnesses average by volume fraction. With 60 % carbon fibre (E_f ≈ 230 GPa) in epoxy (E_m ≈ 3.4 GPa), E₁ ≈ 139 GPa. The closed volume constraint V_f + V_m = 1 lets you eliminate one fraction whenever the other is given.',
    insights: ['Fibres carry nearly everything: E₁ ≈ E_f·V_f to within a few percent at aerospace fractions.'],
    variableIds: ['E1', 'Ef', 'Em', 'Vf', 'Vm'],
    relatedFormulaIds: ['f-rule-mixtures-e2'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-rule-mixtures-e2', name: 'Inverse Rule of Mixtures (transverse modulus)',
    latex: '\\frac{1}{E_2} = \\frac{V_f}{E_f} + \\frac{V_m}{E_m}',
    weekTags: [5], topicIds: ['materials'],
    explanation:
      'Loaded across the fibres, fibre and matrix act in series — compliances (1/E) add, so the soft matrix dominates and E₂ lands in the single-digit-to-teens GPa range. The enormous E₁/E₂ contrast (often 15×) is what makes composites anisotropic, and why laminates stack plies at ±45°/0°/90° to tune direction-dependent stiffness.',
    variableIds: ['E2', 'Ef', 'Em', 'Vf', 'Vm'],
    relatedFormulaIds: ['f-rule-mixtures'],
    examPriority: 'high', source: 'expanded',
  },

  // ─── Week 6 — Structures ───

  {
    id: 'f-euler', name: 'Euler column buckling',
    latex: 'P_{CR} = \\frac{\\pi^2 E I}{(k\\,L)^2}',
    weekTags: [6], topicIds: ['structures', 'materials'],
    explanation:
      'A slender column under compression fails by sudden lateral bowing — elastic instability — at the Euler load π²EI/(kL)². Nothing has yielded: buckling is geometric, which is the conceptual point examiners test. Capacity scales with EI and collapses with length squared; end conditions enter through k (pinned 1, fixed 0.5, cantilever 2).',
    insights: [
      'Doubling length quarters P_CR — the most powerful lever is length/restraints.',
      'Sketch the buckled shape to justify k. Fixed-fixed buckles as two half-waves: k = 0.5.',
      'Valid only for elastic buckling — check the slenderness ratio first.',
    ],
    variableIds: ['P-cr', 'E', 'I', 'k', 'L-col'],
    relatedFormulaIds: ['f-euler-stress', 'f-slenderness', 'f-r-gyr', 'f-stress-n'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-euler-stress', name: 'Euler critical stress',
    latex: '\\sigma_{CR} = \\frac{\\pi^2 E}{(k\\,L/r)^2}',
    weekTags: [6], topicIds: ['structures'],
    explanation:
      'Dividing the Euler load by area expresses the stability limit as a stress that depends only on material (E) and geometry through the slenderness ratio kL/r. Long columns (high λ) buckle at stresses far below yield; short ones yield first. Comparing σ_CR with σ_yield picks the governing failure mode — the exam’s favourite structures discussion.',
    variableIds: ['sigma-cr', 'E', 'k', 'L-col', 'r-gyr'],
    relatedFormulaIds: ['f-euler', 'f-slenderness'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-plate-buckling', name: 'Plate buckling stress',
    latex: '\\sigma_{CR} = K\\,E\\left(\\frac{t}{b}\\right)^2',
    weekTags: [6], topicIds: ['structures'],
    explanation:
      'A thin flat panel buckles under compression at a stress set by the plate coefficient K, the modulus E and the squared thickness-to-width ratio. Halving thickness quarters capacity — thin skins alone are terrible in compression. Semi-monocoque is the answer: stringers shrink each panel’s b, and frames shorten the column lengths.',
    insights: [
      'K ≈ 4 for simply supported edges in compression; higher for clamped or shear-dominated cases (K supplied).',
      'Same instability logic as Euler columns, but geometry enters via t/b instead of kL/r.',
    ],
    variableIds: ['sigma-cr', 'K', 'E', 't', 'b-panel'],
    relatedFormulaIds: ['f-euler', 'f-euler-stress'],
    examPriority: 'core', source: 'appendix',
  },
  {
    id: 'f-r-gyr', name: 'Radius of gyration',
    latex: 'r = \\sqrt{\\frac{I}{A}}',
    weekTags: [6], topicIds: ['structures'],
    explanation:
      'The radius of gyration condenses a section’s shape into one length: the distance at which all area could sit and give the same I. It is the bridge from section tables to slenderness: r = √(I/A). Solid circles give r = d/4; hollow tubes punch far above their weight because their area sits far from the axis.',
    variableIds: ['r-gyr', 'I', 'A-area'],
    relatedFormulaIds: ['f-slenderness', 'f-euler-stress'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-slenderness', name: 'Slenderness ratio',
    latex: '\\lambda = \\frac{k\\,L}{r}',
    weekTags: [6], topicIds: ['structures'],
    explanation:
      'Effective length over radius of gyration — one number classifying every compression member. Large λ ⇒ buckling governs (use Euler); small λ ⇒ material crushing/yield governs (use σ = F/A). Real columns transition between regimes; knowing which side of the transition λ sits on tells you which formula the examiner expects.',
    variableIds: ['lambda', 'k', 'L-col', 'r-gyr'],
    relatedFormulaIds: ['f-euler', 'f-euler-stress', 'f-r-gyr'],
    examPriority: 'high', source: 'expanded',
  },

  // ─── Week 7 — Propulsion ───

  {
    id: 'f-thrust-jet', name: 'Jet thrust (momentum theory)',
    latex: 'F = \\dot{m}\\,(V_j - V_0) + (p_j - p_0)\\,A_j',
    weekTags: [7], topicIds: ['propulsion', 'aerodynamics'],
    explanation:
      'Thrust is Newton’s second law on the airflow through the engine: mass flow times the velocity jump from free stream to jet, plus a pressure-area term when the exhaust is not fully expanded (usually small for subsonic cruise). More mass flow or more velocity jump means more thrust — and the trade between the two defines engine families.',
    insights: [
      'Turbofans: big ṁ, small (V_j − V₀) — efficient. Turbojets: small ṁ, big jump — fast but thirsty.',
      'When p_j = p_0 the pressure term vanishes — the usual exam simplification.',
    ],
    variableIds: ['F-thrust', 'mdot', 'Vj', 'V0'],
    relatedFormulaIds: ['f-continuity', 'f-prop-eff', 'f-power-req'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-prop-eff', name: 'Propulsive (Froude) efficiency',
    latex: '\\eta_p = \\frac{2\\,V_0}{V_j + V_0}',
    weekTags: [7], topicIds: ['propulsion', 'performance'],
    explanation:
      'Propulsive efficiency compares useful thrust power (T·V₀) with the total kinetic energy handed to the wake. Move the same momentum with more air at lower velocity jump and less energy is wasted: η_p rises as Vⱼ approaches V₀. This single formula explains why airliners use high-bypass fans, drones use propellers, and pure jets thrive only up high and fast.',
    insights: [
      'η_p → 1 as Vⱼ → V₀ — but then ṁ → ∞ for the same thrust. Engineering compromise.',
      'Propeller ≈ 0.8, high-bypass fan ≈ 0.75, turbojet ≈ 0.5 at cruise.',
    ],
    variableIds: ['eta-p', 'V0', 'Vj'],
    relatedFormulaIds: ['f-thrust-jet', 'f-breguet-range'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-power-req', name: 'Power required',
    latex: 'P_{\\mathrm{req}} = D\\,V',
    weekTags: [7, 10], topicIds: ['performance', 'propulsion'],
    explanation:
      'The power needed to sustain flight is drag times velocity. Plotting P_req against V produces the classic U-curve: high at low speed (induced drag dominates) and high at high speed (parasite drag dominates). Its minimum is minimum-power speed (best endurance); the tangent from the origin is minimum-drag speed (best range). Excess power above this curve is what climbs.',
    variableIds: ['Pw', 'D', 'V'],
    relatedFormulaIds: ['f-drag', 'f-drag-polar', 'f-roc', 'f-glide', 'f-endurance-elec'],
    examPriority: 'core', source: 'expanded',
  },

  // ─── Week 8 — UAS ───

  {
    id: 'f-lo-re', name: 'Low-Reynolds-number aerodynamics (UAS)',
    latex: 'Re = \\frac{\\rho V L}{\\mu} \\ll 10^6',
    weekTags: [8], topicIds: ['uas', 'airfoils', 'aerodynamics'],
    explanation:
      'Small unmanned aircraft fly at chord Reynolds numbers of 10⁴–10⁶, where boundary layers are thick and laminar separation bubbles appear: airfoils lose lift slope, c_{l,max} drops and drag fractions balloon. Design responses: dedicated low-Re sections, higher wing loading, careful trip locations. This is why model-scale and full-scale aerodynamics are not directly transferable.',
    insights: [
      'Low Re ⇒ lower c_{l,max} ⇒ higher stall speed relative to size ⇒ narrow flight envelope.',
      'A 1/5-scale model at the same speed runs at Re ≈ 1/5 — similitude implications for Wk 10.',
    ],
    variableIds: ['Re', 'rho', 'V', 'L-ref', 'mu'],
    relatedFormulaIds: ['f-re', 'f-similitude', 'f-endurance-elec'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-endurance-elec', name: 'Electric endurance',
    latex: 't = \\frac{C_{\\mathrm{batt}}\\,V_{\\mathrm{batt}}}{P_{\\mathrm{avg}}}',
    weekTags: [8], topicIds: ['uas', 'performance'],
    explanation:
      'Battery energy (capacity × voltage) divided by average power draw gives flight time — the electric aircraft’s Breguet. Every component competes for watts: motors, avionics, payload. Because batteries store ~50× less energy per kilogram than fuel, UAS design is a ruthless weight budget, and cruise (minimum-power speed) stretches endurance the most.',
    insights: [
      'Capacity in A·h × voltage in V = energy in W·h. Keep units consistent.',
      'Hover (multirotor) burns far more power than cruise — missions mixing both need margin.',
    ],
    variableIds: ['C-batt', 'V-batt', 'P-avg'],
    relatedFormulaIds: ['f-power-req', 'f-lo-re', 'f-breguet-endurance'],
    examPriority: 'core', source: 'expanded',
  },

  // ─── Week 9 — Rotary-wing ───

  {
    id: 'f-hover-thrust', name: 'Momentum theory: rotor thrust (hover)',
    latex: 'T = 2\\,\\rho\\,A\\,v_i^2',
    weekTags: [9], topicIds: ['rotary', 'aerodynamics'],
    explanation:
      'The actuator-disk model treats the rotor as a disk pumping air: thrust equals the momentum change of the captured streamtube, T = 2ρAv_i² in hover. It is the rotor-world sibling of induced drag — and like a wing, the rotor pays twice: once for the momentum, once for losses (profile drag, tip vortices). Bigger disk, lower induced velocity for the same thrust.',
    variableIds: ['T-rotor', 'rho', 'A-flow', 'v-i'],
    relatedFormulaIds: ['f-hover-vi', 'f-hover-power', 'f-disk-load'],
    examPriority: 'core', source: 'lectures',
  },
  {
    id: 'f-hover-vi', name: 'Ideal induced velocity (hover)',
    latex: 'v_i = \\sqrt{\\frac{T}{2\\,\\rho\\,A}}',
    weekTags: [9], topicIds: ['rotary', 'aerodynamics'],
    explanation:
      'Solving the momentum relation for the induced velocity: the rotor pushes air down at v_i = √(T/2ρA). Heavy thrust on a small disk demands high induced velocity — and since hover power is T·v_i, that squares into power cost. Ground effect and forward flight both reduce v_i, which is why hovering in ground effect is cheaper than free air hover.',
    variableIds: ['v-i', 'T-rotor', 'rho', 'A-flow'],
    relatedFormulaIds: ['f-hover-thrust', 'f-hover-power', 'f-disk-load'],
    examPriority: 'core', source: 'expanded',
  },
  {
    id: 'f-hover-power', name: 'Ideal hover power',
    latex: 'P = T\\,v_i',
    weekTags: [9], topicIds: ['rotary', 'performance'],
    explanation:
      'The ideal induced power of a hovering rotor is thrust times induced velocity — the work done pumping the streamtube. Real power adds profile drag losses and non-ideal inflow; the Figure of Merit compares the real to this ideal. Disk loading (T/A) is the design lever: halve it and induced velocity falls by √2, induced power by the same.',
    variableIds: ['Pw', 'T-rotor', 'v-i'],
    relatedFormulaIds: ['f-fom', 'f-hover-vi', 'f-hover-thrust'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-fom', name: 'Figure of Merit',
    latex: 'FM = \\frac{P_{\\mathrm{ideal}}}{P_{\\mathrm{actual}}}',
    weekTags: [9], topicIds: ['rotary'],
    explanation:
      'The Figure of Merit scores a real hovering rotor against the ideal momentum-theory rotor: ideal induced power over actual power. FM ≈ 0.7–0.8 is a good helicopter rotor; small drone props score lower. It is exactly the role span efficiency e plays for wings — a single number for how close reality comes to theory.',
    variableIds: ['FM'],
    relatedFormulaIds: ['f-hover-power', 'f-hover-thrust'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-disk-load', name: 'Disk loading',
    latex: 'DL = \\frac{T}{A}, \\qquad v_i = \\sqrt{\\frac{DL}{2\\rho}}',
    weekTags: [9], topicIds: ['rotary'],
    explanation:
      'Disk loading — thrust per unit disk area — is the rotor equivalent of wing loading and the master variable of hover performance: induced velocity scales with √(DL/2ρ). Low DL (large, slow rotors) is quiet and efficient; high DL (compact drones) pays power. Comparing DL across aircraft instantly ranks their hover economics.',
    variableIds: ['DL', 'T-rotor', 'A-flow', 'v-i', 'rho'],
    relatedFormulaIds: ['f-hover-vi', 'f-hover-power'],
    examPriority: 'high', source: 'expanded',
  },

  // ─── Week 10 — Simulation & Flight Performance ───

  {
    id: 'f-glide', name: 'Glide ratio & glide angle',
    latex: '\\frac{L}{D} = \\frac{1}{\\tan\\theta}',
    weekTags: [10], topicIds: ['performance'],
    explanation:
      'In a steady glide, lift balances the component of weight across the flight path and drag along it — so the glide angle satisfies tan θ = D/L = 1/(L/D). Best-glide range means best L/D (min-drag speed); flattest descent (min sink for thermalling) means minimum power speed — two different speeds, a favourite distinction question.',
    insights: ['Glide distance = height × L/D. From 1,000 m at L/D 9, you cover 9 km.'],
    variableIds: ['L-D', 'theta-glide', 'L', 'D'],
    relatedFormulaIds: ['f-drag-polar', 'f-power-req', 'f-roc'],
    examPriority: 'core', source: 'expanded',
  },
  {
    id: 'f-roc', name: 'Rate of climb',
    latex: 'R/C = \\frac{P_{\\mathrm{avail}} - P_{\\mathrm{req}}}{W}',
    weekTags: [10], topicIds: ['performance'],
    explanation:
      'Climb rate is excess power divided by weight: the engine delivers power, drag consumes some, and the surplus is converted into potential energy. The best-climb speed is where the vertical gap between power-available and power-required curves is widest. As altitude thins the air, power available falls until R/C drops to 0.5 m/s — the service ceiling.',
    variableIds: ['R-dot', 'P-avail', 'Pw', 'W'],
    relatedFormulaIds: ['f-power-req', 'f-glide', 'f-vstall'],
    examPriority: 'core', source: 'expanded',
  },
  {
    id: 'f-similitude', name: 'Similitude: matching Re and Mach',
    latex: 'Re_m = Re_f, \\qquad M_m = M_f',
    weekTags: [10, 3], topicIds: ['simulation', 'aerodynamics'],
    explanation:
      'A wind-tunnel model reproduces full-scale physics only when its similarity numbers match: Reynolds number (viscous behaviour) and Mach number (compressibility). With a smaller model L, matching Re demands higher V or higher ρ (pressurised tunnels) — but then Mach usually overshoots. The two constraints generally cannot both hold in air at model scale, and knowing why is the exam discussion.',
    insights: [
      'Re ∝ ρVL/μ: 1/10 model needs 10× V or 10× ρ at same μ.',
      'Variable-density (pressurised) tunnels raise ρ to buy Re without breaking Mach limits.',
    ],
    variableIds: ['Re', 'Ma', 'V-model'],
    relatedFormulaIds: ['f-re', 'f-mach', 'f-lo-re'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-breguet-range', name: 'Breguet range equation (jet/prop)',
    latex: 'R = \\frac{\\eta_p}{c}\\,\\frac{C_L}{C_D}\\,\\ln\\frac{W_0}{W_1}',
    weekTags: [10, 7], topicIds: ['performance', 'propulsion'],
    explanation:
      'Range comes from integrating fuel burn as weight falls: specific fuel consumption in the denominator, aerodynamic efficiency C_L/C_D as the multiplier, and the natural log of the weight ratio as the fuel term. For jets read η_p/c as V/(TSFC·g). It condenses the whole cruise-design conversation — fly at best L/D, burn efficiently, and every kilogram of structure costs range.',
    insights: [
      'Prop form uses c (power SFC) and η_p; jet form uses TSFC — know which symbols your exam uses.',
      'ln(W₀/W₁): doubling fuel fraction does not double range — diminishing returns.',
    ],
    variableIds: ['eta-p', 'c-sfc', 'L-D', 'W', 'W-fuel'],
    relatedFormulaIds: ['f-drag-polar', 'f-prop-eff', 'f-breguet-endurance'],
    examPriority: 'high', source: 'expanded',
  },
  {
    id: 'f-breguet-endurance', name: 'Breguet endurance (propeller)',
    latex: 'E = \\frac{\\eta_p}{c}\\,\\frac{C_L^{3/2}}{C_D}\\,\\sqrt{2\\rho S}\\left(W_1^{-\\frac{1}{2}} - W_0^{-\\frac{1}{2}}\\right)',
    weekTags: [10], topicIds: ['performance'],
    explanation:
      'Endurance maximises time aloft, so it rewards the minimum-power condition — C_L^{3/2}/C_D, not C_L/C_D. The square-root weight difference replaces the logarithm of the range case. Slow, light and draggy aircraft with efficient props loiter longest; that is why surveillance platforms fly slow and clean.',
    variableIds: ['eta-p', 'c-sfc', 'CL', 'CD', 'rho', 'S', 'W'],
    relatedFormulaIds: ['f-breguet-range', 'f-power-req', 'f-endurance-elec'],
    examPriority: 'medium', source: 'expanded',
  },

  // ─── Week 11 — Space (placeholder) ───

  {
    id: 'f-space-placeholder', name: 'Space — coming soon',
    latex: '\\text{Week 11: Space \\; — \\; content coming soon}',
    weekTags: [11], topicIds: ['space'],
    explanation:
      'Week 11 extends the course into spaceflight — orbits, Δ-v and the rocket equation. This study web currently covers Weeks 1–10 in full; the Space module arrives in a future update. The node stays visible in the graph so the map matches the course outline end to end.',
    variableIds: [],
    relatedFormulaIds: [],
    examPriority: 'medium', source: 'expanded',
  },
]
