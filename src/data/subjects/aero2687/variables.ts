import type { Variable } from '../../schema'

/** Part 1 — atmosphere & aerodynamics (Weeks 1–2) */
export const variablesPart1: Variable[] = [
  {
    id: 'L', name: 'Lift', latex: 'L',
    description:
      'The aerodynamic force component perpendicular to the free-stream direction. Lift is generated almost entirely by the pressure difference between the lower and upper surfaces of the wing — suction above dominates. In straight-and-level unaccelerated flight lift exactly balances weight, which is why L = W anchors most performance calculations.',
    units: { si: 'N', other: ['kN', 'lbf'] },
    typicalValues: [
      { context: 'Cessna 172 at cruise', range: '≈ 10,000 N (≈ W ≈ 1,020 kg)' },
      { context: 'Airliner at MTOW', range: '2–4 MN' },
    ],
    weekTags: [1, 2, 4],
    appearsIn: ['f-lift', 'f-forces-eq'],
  },
  {
    id: 'D', name: 'Drag', latex: 'D',
    description:
      'The aerodynamic force component parallel to the free-stream direction, always opposing the motion. It splits into parasite drag (skin friction, form, interference — present at all lift) and induced drag (a by-product of lift-making vortices). In steady level flight thrust must equal drag, and drag times speed is the power that must be paid for.',
    units: { si: 'N', other: ['kN', 'lbf'] },
    typicalValues: [
      { context: 'Cessna 172 at cruise', range: '≈ 500–700 N' },
      { context: 'Small UAS', range: '1–10 N' },
    ],
    weekTags: [2, 4, 7, 8],
    appearsIn: ['f-drag', 'f-forces-eq', 'f-power-req', 'f-breguet-range', 'f-glide'],
  },
  {
    id: 'W', name: 'Weight', latex: 'W',
    description:
      'The gravitational force on the aircraft, W = m·g, acting through the centre of gravity. Unlike aerodynamic forces it does not depend on speed or altitude. It sets the lift that must be produced, drives stall speed and take-off length, and appears in hover and range equations. Designers fight weight because every gram costs drag.',
    units: { si: 'N', other: ['kN'] },
    typicalValues: [
      { context: 'Cessna 172', range: '≈ 10 kN (MTOW 1,111 kg)' },
      { context: 'F/A-18 class fighter', range: '≈ 200 kN' },
    ],
    weekTags: [1, 2, 4, 7, 9, 10],
    appearsIn: ['f-forces-eq', 'f-takeoff', 'f-vstall', 'f-wing-load', 'f-hover-thrust', 'f-hover-power', 'f-disk-load', 'f-breguet-range', 'f-roc'],
  },
  {
    id: 'T', name: 'Thrust', latex: 'T',
    description:
      'The forward propulsive force produced by accelerating air (or exhaust) rearward — Newton’s third law in action. In steady level flight thrust equals drag; in climb the excess over drag buys climb rate. Jet engines generate it by momentum change; propellers by accelerating a large mass of air a little.',
    units: { si: 'N', other: ['kN', 'lbf'] },
    typicalValues: [
      { context: 'Cessna 172 propeller', range: '≈ 800–1,000 N (static)' },
      { context: 'Large turbofan', range: '330–500 kN each' },
    ],
    weekTags: [1, 2, 7, 9],
    appearsIn: ['f-forces-eq', 'f-takeoff', 'f-thrust-jet', 'f-hover-thrust', 'f-hover-power', 'f-fom', 'f-disk-load'],
  },
  {
    id: 'T-iso', name: 'Temperature (absolute)', latex: 'T',
    description:
      'A measure of the average molecular kinetic energy of the air, always used in absolute kelvin in gas laws — never °C. Temperature controls the speed of sound, viscosity, and via the ideal gas law the density at a given pressure. In the ISA it falls linearly with altitude in the troposphere.',
    units: { si: 'K', other: ['°C'] },
    typicalValues: [
      { context: 'ISA sea level', range: '288.15 K = 15.0 °C' },
      { context: 'ISA 35,000 ft', range: '218.9 K = −54.3 °C' },
    ],
    weekTags: [1, 2],
    appearsIn: ['f-igl', 'f-tk', 'f-isa-temp', 'f-isa-lapse', 'f-sos'],
  },
  {
    id: 'm', name: 'Mass', latex: 'm',
    description:
      'The quantity of matter in the aircraft — a fixed property of the vehicle, unlike weight which depends on local gravity. Mass resists acceleration (inertia), scales momentum flux in propulsion and rotor theory, and multiplies gravity to give weight. Fuel burn steadily reduces it in flight, improving performance as the flight progresses.',
    units: { si: 'kg', other: ['tonne', 'slug'] },
    typicalValues: [
      { context: 'Cessna 172', range: '≈ 750–1,111 kg' },
      { context: 'Small UAS', range: '0.5–25 kg' },
    ],
    weekTags: [1, 7, 8],
    appearsIn: ['f-forces-eq', 'f-lo-re'],
  },
  {
    id: 'g', name: 'Gravitational acceleration', latex: 'g',
    description:
      'The acceleration due to Earth’s gravity at the surface, 9.81 m/s². It converts mass into weight, appears under the square root in stall speed, in the denominator of the take-off distance equation, and in the gravity term of range and endurance integrals. Treat it as constant for all introductory exam work.',
    units: { si: 'm/s²' },
    typicalValues: [{ context: 'Earth sea level', range: '9.81 m/s² (use 9.81, exams round to 9.8–10)' }],
    weekTags: [1, 2, 4, 7, 10],
    appearsIn: ['f-forces-eq', 'f-takeoff', 'f-vstall', 'f-breguet-range', 'f-roc'],
  },
  {
    id: 'CL', name: 'Lift coefficient', latex: 'C_L',
    description:
      'A dimensionless measure of how effectively the wing turns dynamic pressure and area into lift: C_L = L/(qS). It rises linearly with angle of attack until stall, where it peaks at C_{L,max}. Designers and examiners love it because it strips geometry and flight condition out of lift, leaving pure aerodynamic quality.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Cruise', range: '0.2–0.6' },
      { context: 'Take-off/landing with flaps', range: '1.5–2.8' },
      { context: 'Thin airfoil pre-stall limit', range: '≈ 1.0–1.2 clean' },
    ],
    weekTags: [2, 4, 10],
    appearsIn: ['f-lift', 'f-drag', 'f-drag-polar', 'f-cdi', 'f-wing-cl', 'f-alpha-i', 'f-vstall', 'f-takeoff', 'f-glide'],
  },
  {
    id: 'CD', name: 'Drag coefficient', latex: 'C_D',
    description:
      'A dimensionless measure of drag made non-dimensional by q and S: C_D = D/(qS). The drag polar splits it into a constant parasite part C_{D,0} plus the lift-induced part C_L²/(πARe). Because induced drag grows with the square of lift coefficient, flying too slowly raises total drag — the classic drag bucket tells the whole story.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Clean aircraft cruise', range: '0.02–0.05' },
      { context: 'Glide (best L/D)', range: '≈ 0.03–0.04' },
    ],
    weekTags: [2, 4, 10],
    appearsIn: ['f-drag', 'f-drag-polar', 'f-cdi', 'f-power-req', 'f-breguet-range', 'f-breguet-endurance', 'f-glide'],
  },
  {
    id: 'CD0', name: 'Parasite (profile) drag coefficient', latex: 'C_{D,0}',
    description:
      'The zero-lift drag coefficient: the drag that remains when the wing produces no lift. It collects skin-friction drag from shear in the boundary layer, form (pressure) drag from separation, and interference drag where surfaces meet. Constant to first order with C_L, it sets the fast end of the drag polar and penalises messy exteriors.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Clean single-engine GA', range: '0.025–0.035' },
      { context: 'Airliner, clean', range: '≈ 0.020' },
      { context: 'With gear + flaps', range: 'doubles or more' },
    ],
    weekTags: [4],
    appearsIn: ['f-drag-polar'],
  },
  {
    id: 'CDi', name: 'Induced drag coefficient', latex: 'C_{D,i}',
    description:
      'The lift-induced portion of drag coefficient, C_{D,i} = C_L²/(πARe). Wing-tip vortices tilt the local lift vector rearward; the bigger the lift coefficient and the smaller the aspect ratio, the steeper the tilt. It vanishes in zero-lift flight, dominates at low speed/high C_L, and is the reason gliders have long slender wings.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Cruise (GA aircraft)', range: '≈ 0.005–0.01' },
      { context: 'Near stall', range: 'can exceed C_{D,0} several-fold' },
    ],
    weekTags: [4],
    appearsIn: ['f-cdi', 'f-drag-polar'],
  },
  {
    id: 'S', name: 'Wing reference area', latex: 'S',
    description:
      'The projected planform area of the wing used to non-dimensionalise forces — conventionally including the fuselage carry-through between the wings. It is the “S” in every qS product: lift, drag and moments all scale with it. Bigger area lowers stall speed and wing loading but adds weight and parasite drag.',
    units: { si: 'm²', other: ['ft²'] },
    typicalValues: [
      { context: 'Cessna 172', range: '16.2 m²' },
      { context: 'F/A-18', range: '37.2 m²' },
      { context: 'Small UAS', range: '0.1–1 m²' },
    ],
    weekTags: [2, 4, 8, 10],
    appearsIn: ['f-lift', 'f-drag', 'f-wing-area', 'f-ar', 'f-moment', 'f-vstall', 'f-takeoff', 'f-wing-load', 'f-breguet-range', 'f-breguet-endurance', 'f-roc'],
  },
  {
    id: 'q', name: 'Dynamic pressure', latex: 'q',
    description:
      'The kinetic energy per unit volume of the free stream, q = ½ρV². It is the “stickiness” of the airstream that wings and pitot tubes feel: aerodynamic forces scale with it, airspeed indicators read its square root, and structural loads grow with it. Halve the density (high altitude) and you halve q at the same true speed.',
    units: { si: 'Pa', other: ['kPa'] },
    typicalValues: [
      { context: 'Sea level, 60 m/s', range: '≈ 2,200 Pa' },
      { context: 'Cruise 10,000 ft, 60 m/s', range: '≈ 1,630 Pa' },
    ],
    weekTags: [2],
    appearsIn: ['f-q', 'f-lift', 'f-drag', 'f-moment'],
  },
  {
    id: 'rho', name: 'Air density', latex: '\\rho',
    description:
      'Mass of air per unit volume. It falls roughly exponentially with altitude — about 12 % lower at 5,000 ft and 69 % lower at 35,000 ft than at sea level. Density links the gas law, dynamic pressure, Reynolds number and engine/propeller performance; thinner air means faster true airspeed for the same lift and longer take-offs.',
    units: { si: 'kg/m³' },
    typicalValues: [
      { context: 'ISA sea level', range: '1.225 kg/m³' },
      { context: 'ISA 10,000 ft', range: '0.905 kg/m³' },
      { context: 'ISA 35,000 ft', range: '0.380 kg/m³' },
    ],
    weekTags: [1, 2, 3, 4, 7, 8, 9, 10],
    appearsIn: ['f-q', 'f-igl', 'f-bernoulli', 'f-pitot', 'f-eas', 'f-re', 'f-vstall', 'f-takeoff', 'f-isa-dens', 'f-hover-thrust', 'f-hover-power', 'f-disk-load', 'f-sos', 'f-similitude', 'f-lo-re'],
  },
  {
    id: 'V', name: 'True airspeed', latex: 'V',
    description:
      'The actual speed of the aircraft relative to the surrounding air mass. It is what aerodynamics responds to — dynamic pressure uses true speed — but it grows with altitude for a fixed indicated airspeed because density falls. Wind adds to it vectorially to give ground speed; pitot-static systems infer it from the total-minus-static pressure difference.',
    units: { si: 'm/s', other: ['km/h', 'kt'] },
    typicalValues: [
      { context: 'Cessna 172 cruise', range: '55–65 m/s (≈ 110–125 kt)' },
      { context: 'Airliner cruise', range: '≈ 230–250 m/s TAS (M 0.78–0.85)' },
    ],
    weekTags: [2, 3, 7, 10],
    appearsIn: ['f-q', 'f-bernoulli', 'f-pitot', 'f-eas', 'f-re', 'f-mach', 'f-power-req', 'f-roc', 'f-similitude', 'f-lo-re'],
  },
  {
    id: 'Ve', name: 'Equivalent airspeed', latex: 'V_e',
    description:
      'The sea-level-calibrated speed: the true airspeed that would produce the same dynamic pressure at standard sea-level density. V_e = V·√(ρ/ρ_sl), so it is always less than true airspeed at altitude. Airframe structural limits (V-n diagram) and the pilot’s airspeed indicator live in equivalent speed because the loads depend on q, not V.',
    units: { si: 'm/s', other: ['kt'] },
    typicalValues: [
      { context: 'Sea level', range: 'V_e = V (identical)' },
      { context: '10,000 ft', range: 'V_e ≈ 0.86·V' },
    ],
    weekTags: [2],
    appearsIn: ['f-eas'],
  },
  {
    id: 'P', name: 'Static pressure', latex: 'P',
    description:
      'The thermodynamic pressure of the air — the force per area the gas exerts equally in all directions, felt on surfaces moving with the flow. In Bernoulli’s relation it trades against dynamic pressure: where the flow speeds up, static pressure drops. It halves by about 35,000 ft, which is why cabins are pressurised.',
    units: { si: 'Pa', other: ['hPa/mbar', 'kPa'] },
    typicalValues: [
      { context: 'ISA sea level', range: '101,325 Pa' },
      { context: 'ISA 10,000 ft', range: '69,682 Pa' },
      { context: 'ISA 35,000 ft', range: '23,842 Pa' },
    ],
    weekTags: [1, 2],
    appearsIn: ['f-igl', 'f-bernoulli', 'f-bernoulli-2pt', 'f-pitot', 'f-eas', 'f-isa-press'],
  },
  {
    id: 'R', name: 'Specific gas constant (air)', latex: 'R',
    description:
      'The universal gas constant divided by the molar mass of the gas — for dry air, 287 J/(kg·K). It is the proportionality constant in the ideal gas law P = ρRT, converting temperature and pressure into density. Memorise the value: every ISA and gas-law exam question assumes it.',
    units: { si: 'J/(kg·K)' },
    typicalValues: [{ context: 'Dry air', range: '287 J/(kg·K)' }, { context: 'Water vapour', range: '461.5 J/(kg·K)' }],
    weekTags: [1, 2],
    appearsIn: ['f-igl', 'f-sos'],
  },
  {
    id: 'mdot', name: 'Mass flow rate', latex: '\\dot{m}',
    description:
      'The mass of fluid crossing a section per second, ṁ = ρAV. Mass cannot be created or destroyed, so in steady flow it is identical through every station of a duct, engine or streamtube — squeeze the area and the fluid must speed up or compress. It is also the raw material of thrust: momentum change times ṁ.',
    units: { si: 'kg/s' },
    typicalValues: [
      { context: 'Small turbofan', range: '≈ 10–50 kg/s' },
      { context: 'Large turbofan', range: '≈ 300–1,500 kg/s' },
    ],
    weekTags: [2, 7],
    appearsIn: ['f-continuity', 'f-thrust-jet'],
  },
  {
    id: 'A-flow', name: 'Flow cross-section area', latex: 'A',
    description:
      'The area of the cross-section the flow passes through — a duct station, a streamtube slice, or a propeller disk. In continuity it trades against velocity and density; in rotor momentum theory the disk area A = πR² sets how much air the rotor can capture. Bigger capturing area means lower induced velocity for the same force.',
    units: { si: 'm²' },
    typicalValues: [
      { context: 'Rotor disk, R = 5 m', range: '≈ 78.5 m²' },
      { context: 'Turbofan intake', range: '2–6 m²' },
    ],
    weekTags: [2, 9],
    appearsIn: ['f-continuity', 'f-hover-thrust', 'f-hover-power', 'f-disk-load'],
  },
  {
    id: 'mu', name: 'Dynamic viscosity', latex: '\\mu',
    description:
      'A fluid’s resistance to shearing — how strongly layers stick together as they slide past one another. It sets the boundary-layer thickness and, through Reynolds number, whether the flow is smooth or turbulent. Air’s viscosity rises with temperature (unlike liquids) and falls slightly with altitude.',
    units: { si: 'Pa·s' },
    typicalValues: [
      { context: 'ISA sea level', range: '1.81×10⁻⁵ Pa·s' },
      { context: 'ISA 35,000 ft', range: '1.44×10⁻⁵ Pa·s' },
    ],
    weekTags: [1, 2, 3],
    appearsIn: ['f-re', 'f-lo-re'],
  },
  {
    id: 'a-sos', name: 'Speed of sound', latex: 'a',
    description:
      'The speed at which small pressure disturbances propagate, a = √(γRT) for an ideal gas. It is the yardstick of compressibility: Mach number is simply the ratio of flight speed to this value. Because temperature falls with altitude, the speed of sound drops from 340 m/s at sea level to about 297 m/s at 35,000 ft.',
    units: { si: 'm/s' },
    typicalValues: [
      { context: 'ISA sea level', range: '340 m/s' },
      { context: 'ISA 35,000 ft', range: '297 m/s' },
    ],
    weekTags: [1, 2, 3],
    appearsIn: ['f-sos', 'f-mach'],
  },
  {
    id: 'gamma', name: 'Ratio of specific heats', latex: '\\gamma',
    description:
      'The ratio of specific heat at constant pressure to that at constant volume, γ = c_p/c_v. It measures how much a gas heats when compressed adiabatically and sets the stiffness of sound waves — √γ appears in the speed of sound. For air (a diatomic-dominated mixture) γ = 1.4 below about 2,000 K.',
    units: { si: '– (dimensionless)' },
    typicalValues: [{ context: 'Air (normal temps)', range: '1.4' }, { context: 'Monatomic gas (He)', range: '1.67' }],
    weekTags: [1, 3],
    appearsIn: ['f-sos'],
  },
  {
    id: 'h-alt', name: 'Altitude (geopotential)', latex: 'h',
    description:
      'Height above the ISA sea-level datum. In the standard atmosphere the model is built on geopotential altitude, which for introductory purposes equals geometric height. Altitude is the independent variable of the ISA: temperature falls linearly to 11 km, then holds constant — and pressure and density follow the hydrostatic and gas-law relations.',
    units: { si: 'm', other: ['ft (1 ft = 0.3048 m)'] },
    typicalValues: [
      { context: 'Cruise, GA', range: '3,000–12,000 ft' },
      { context: 'Cruise, airliner', range: '31,000–41,000 ft' },
    ],
    weekTags: [1],
    appearsIn: ['f-isa-lapse', 'f-isa-temp', 'f-isa-press', 'f-isa-dens'],
  },
  {
    id: 'Lapse', name: 'ISA lapse rate', latex: 'L',
    description:
      'The rate at which ISA temperature decreases with altitude in the troposphere: 6.5 °C per kilometre, or about 1.98 °C per 1,000 ft. It is the linear backbone of the temperature profile; above the 11 km tropopause the lapse rate is zero and temperature stays at −56.5 °C.',
    units: { si: 'K/m' },
    typicalValues: [{ context: 'ISA troposphere', range: '6.5 K/km ≈ 1.98 °C/1,000 ft' }],
    weekTags: [1],
    appearsIn: ['f-isa-lapse', 'f-isa-temp'],
  },
  {
    id: 'T0', name: 'ISA sea-level temperature', latex: 'T_0',
    description:
      'The anchor temperature of the International Standard Atmosphere: 288.15 K (15.0 °C) at zero altitude. Every ISA relation — lapse, pressure, density, speed of sound — is referenced to this value, and exam questions asking for “standard” conditions mean exactly this state.',
    units: { si: 'K', other: ['°C'] },
    typicalValues: [{ context: 'ISA datum', range: '288.15 K = 15.0 °C' }],
    weekTags: [1],
    appearsIn: ['f-isa-temp', 'f-isa-press', 'f-isa-dens', 'f-isa-lapse'],
  },
  {
    id: 'rho0', name: 'ISA sea-level density', latex: '\\rho_0',
    description:
      'The standard sea-level air density, 1.225 kg/m³. It is the reference for equivalent airspeed (EAS assumes this density), the density altitude concept, and the top row of the ISA table. When a question says “sea-level conditions”, plug this in and skip the atmosphere relations.',
    units: { si: 'kg/m³' },
    typicalValues: [{ context: 'ISA datum', range: '1.225 kg/m³' }],
    weekTags: [1, 2],
    appearsIn: ['f-isa-press', 'f-isa-dens', 'f-eas'],
  },
  {
    id: 'P0', name: 'ISA sea-level pressure', latex: 'P_0',
    description:
      'The standard sea-level pressure, 101,325 Pa (one atmosphere, 1013.25 hPa). It anchors the barometric altimeter and the ISA pressure profile. Airports report QNH as a correction to this datum so altimeters read field elevation.',
    units: { si: 'Pa', other: ['hPa', 'atm'] },
    typicalValues: [{ context: 'ISA datum', range: '101,325 Pa = 1013.25 hPa' }],
    weekTags: [1],
    appearsIn: ['f-isa-press'],
  },
  {
    id: 'Ma', name: 'Mach number', latex: 'M',
    description:
      'The ratio of flow speed to the local speed of sound, M = V/a — the measure of compressibility. Below M ≈ 0.3 air behaves incompressibly (Bernoulli holds); approaching M 1 shock waves form and the drag rises sharply. Aircraft regimes are named by it: subsonic, transonic, supersonic.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Cessna 172', range: 'M ≈ 0.18' },
      { context: 'Airliner cruise', range: 'M 0.78–0.85' },
      { context: 'Incompressible limit', range: 'M < 0.3' },
    ],
    weekTags: [1, 3, 8, 10],
    appearsIn: ['f-mach', 'f-similitude'],
  },
  {
    id: 'L-ref', name: 'Reference (characteristic) length', latex: 'L',
    description:
      'The length scale chosen to characterise a geometry in similarity numbers — for Reynolds number usually the mean chord of an aerofoil or wing. Choosing chord versus span changes the numerical Re, so always state what length was used. In model testing, matching Re needs the small model to run at higher speed or pressure.',
    units: { si: 'm' },
    typicalValues: [
      { context: 'GA wing mean chord', range: '≈ 1.5 m' },
      { context: 'Small UAS chord', range: '0.1–0.3 m' },
      { context: 'Airliner mean chord', range: '≈ 6–8 m' },
    ],
    weekTags: [2, 3, 8, 10],
    appearsIn: ['f-re', 'f-similitude', 'f-lo-re'],
  },

  // ─── Part 2 — Airfoils & Wings (Weeks 3–4) ───

  {
    id: 'cl', name: 'Section lift coefficient (2-D)', latex: 'c_l',
    description:
      'The lift coefficient of an infinite (2-D) wing section, based on chord length instead of wing area: c_l = l/(qc). Freed from tip effects, it follows the thin-airfoil line c_l = a₀(α − α_{L=0}) until stall. Section data from wind-tunnel catalogues (e.g. NACA) is the raw material finite-wing theory starts from.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Typical section cruise', range: '0.2–0.8' },
      { context: 'c_{l,max} clean (NACA 2412)', range: '≈ 1.6' },
      { context: 'c_{l,max} with flap effect', range: '≈ 2.0–2.6' },
    ],
    weekTags: [3, 4],
    appearsIn: ['f-cl-section', 'f-a0', 'f-moment'],
  },
  {
    id: 'a0', name: 'Ideal thin-airfoil lift slope', latex: 'a_0',
    description:
      'The lift-curve slope of an ideal (thin, inviscid, 2-D) airfoil: a₀ = 2π per radian, the most quoted constant in aerofoil theory. It predicts about 0.11 per degree, so a cambered section plus a few degrees of angle of attack is already near stall. Real sections come in slightly lower (≈ 0.10–0.11 per degree) because of viscosity.',
    units: { si: 'per radian' },
    typicalValues: [
      { context: 'Ideal thin airfoil', range: '2π ≈ 6.28 per rad ≈ 0.11 per deg' },
      { context: 'Real sections', range: '≈ 5.6–6.1 per rad' },
    ],
    weekTags: [3, 4],
    appearsIn: ['f-a0', 'f-cl-section', 'f-wing-slope', 'f-wing-cl'],
  },
  {
    id: 'alpha', name: 'Angle of attack', latex: '\\alpha',
    description:
      'The angle between the chord line and the free-stream direction. It is the pilot’s primary lift control: lift grows linearly with it until the critical angle (typically 15–16°) where flow separates and the wing stalls. Cambered airfoils produce lift at α = 0; symmetric ones do not.',
    units: { si: '° or rad — check which the formula needs' },
    typicalValues: [
      { context: 'Cruise', range: '2–5°' },
      { context: 'Stall (typical section)', range: '15–16°' },
      { context: 'Landing flare', range: '8–12°' },
    ],
    weekTags: [3, 4, 10],
    appearsIn: ['f-cl-section', 'f-wing-cl', 'f-alpha-i', 'f-wing-slope'],
  },
  {
    id: 'alphaL0', name: 'Zero-lift angle of attack', latex: '\\alpha_{L=0}',
    description:
      'The angle of attack at which the section produces no lift — negative for cambered airfoils (typically −2° to −3°) and zero for symmetric ones. It is the horizontal shift of the lift curve, and subtracting it in c_l = a₀(α − α_{L=0}) is exactly how camber is accounted for. Flaps make α_{L=0} more negative, adding lift at every α.',
    units: { si: '° or rad — same convention as α' },
    typicalValues: [
      { context: 'Symmetric section (NACA 0012)', range: '0°' },
      { context: 'Cambered section (NACA 2412)', range: '≈ −2°' },
      { context: 'With flaps deflected', range: '−4° or more' },
    ],
    weekTags: [3, 4],
    appearsIn: ['f-cl-section', 'f-wing-cl'],
  },
  {
    id: 'cm', name: 'Moment coefficient', latex: 'C_M',
    description:
      'The pitching moment made dimensionless by q, S and chord: C_M = M/(qSc). About the aerodynamic centre it is constant with angle of attack — that invariance is what makes the AC the natural reference point for stability and control work. Cambered sections pitch down (negative C_M); symmetric sections have C_M ≈ 0.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Cambered section about AC', range: '−0.05 to −0.12' },
      { context: 'Symmetric section', range: '≈ 0' },
    ],
    weekTags: [3],
    appearsIn: ['f-moment'],
  },
  {
    id: 'M-moment', name: 'Pitching moment', latex: 'M',
    description:
      'The aerodynamic moment tending to rotate the wing nose-up or nose-down about a reference point. Its value depends on where you take moments — except about the aerodynamic centre, where it is constant. Balance of pitching moments (wing, tail, weight position) is what keeps an aircraft trimmed.',
    units: { si: 'N·m' },
    typicalValues: [
      { context: 'Per unit span on a section', range: 'N·m/m' },
      { context: 'Whole wing', range: 'kN·m' },
    ],
    weekTags: [3],
    appearsIn: ['f-moment'],
  },
  {
    id: 'Re', name: 'Reynolds number', latex: 'Re',
    description:
      'The ratio of inertial to viscous forces, Re = ρVL/μ — the single number that says how a flow will behave. Low Re (small drones, model aircraft) means thick viscous effects and poor airfoil performance; high Re (real aircraft) means thin boundary layers and turbulence. It is dimensionless because every unit cancels — proving that is a practice-exam question.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Small UAS wing', range: '50,000–200,000' },
      { context: 'GA aircraft wing', range: '2–10 million' },
      { context: 'Airliner wing', range: '10–50 million' },
    ],
    weekTags: [3, 8, 10],
    appearsIn: ['f-re', 'f-similitude', 'f-lo-re'],
  },
  {
    id: 'c', name: 'Chord', latex: 'c',
    description:
      'The straight-line distance from the leading edge to the trailing edge of an airfoil — the airfoil’s basic length scale. Area, Reynolds number, moment coefficients and thickness percentages all use it. Real wings taper, so theory uses the mean chord c̄ = S/b; the ratio b/c̄ is just the aspect ratio.',
    units: { si: 'm' },
    typicalValues: [
      { context: 'Cessna 172', range: '≈ 1.5 m' },
      { context: 'Small UAS', range: '0.1–0.3 m' },
    ],
    weekTags: [3, 4],
    appearsIn: ['f-moment', 'f-wing-area', 'f-ar'],
  },
  {
    id: 'cbar', name: 'Mean (average) chord', latex: '\\bar{c}',
    description:
      'The average chord length of a whole wing, c̄ = S/b. It condenses a tapered, twisted wing into one representative section so that S = b·c̄ and AR = b/c̄ stay true. All wing-level coefficients can be based on it, and exam geometry questions usually give two of S, b, c̄ and ask for the third.',
    units: { si: 'm' },
    typicalValues: [
      { context: 'Cessna 172', range: '≈ 1.49 m (S/b = 16.2/11)' },
      { context: 'Glider (high AR)', range: '0.6–0.9 m' },
    ],
    weekTags: [4],
    appearsIn: ['f-wing-area', 'f-ar'],
  },
  {
    id: 'b', name: 'Wingspan', latex: 'b',
    description:
      'The tip-to-tip length of the wing. Span is the strongest geometric lever on induced drag: doubling b at constant area doubles aspect ratio and halves induced drag (roughly). It also drives structural bending loads and, practically, airport gate limits — which is why airliners grow span via winglets instead.',
    units: { si: 'm' },
    typicalValues: [
      { context: 'Cessna 172', range: '11.0 m' },
      { context: 'Airliner (A350)', range: '≈ 64.75 m' },
      { context: 'Sailplane (18 m class)', range: '18 m' },
    ],
    weekTags: [4],
    appearsIn: ['f-wing-area', 'f-ar'],
  },
  {
    id: 'AR', name: 'Aspect ratio', latex: 'AR',
    description:
      'Slenderness of the wing in planform, AR = b²/S = b/c̄. High AR means the wing is long and thin: less tip leakage, less induced drag, but heavier structure and slower roll. Low AR (fighter, delta) trades efficiency for agility and compactness. It appears in every induced-drag and finite-wing formula.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Cessna 172', range: '≈ 7.5' },
      { context: 'Airliner', range: '9–11' },
      { context: 'Sailplane', range: '20–40' },
      { context: 'Fighter/delta', range: '2–4' },
    ],
    weekTags: [4],
    appearsIn: ['f-ar', 'f-wing-slope', 'f-drag-polar', 'f-cdi', 'f-alpha-i'],
  },
  {
    id: 'e', name: 'Span efficiency factor (Oswald)', latex: 'e',
    description:
      'How close a wing’s spanwise lift distribution comes to the ideal elliptical shape, which produces minimum induced drag. e = 1 is the theoretical optimum; real wings reach 0.7–0.9 because of taper, twist and fuselage interference. It multiplies πARe in induced drag, so a poor e acts like a shorter wing.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Ideal elliptical planform', range: '1.0' },
      { context: 'Straight-tapered GA wing', range: '0.75–0.85' },
      { context: 'With winglets', range: '+0.02–0.05 effective' },
    ],
    weekTags: [4],
    appearsIn: ['f-wing-slope', 'f-drag-polar', 'f-cdi', 'f-alpha-i'],
  },
  {
    id: 'a-wing', name: 'Finite-wing lift slope', latex: 'a',
    description:
      'The lift-curve slope of a real 3-D wing, always smaller than the 2-D a₀ because tip vortices add downwash that tilts the effective flow. a = a₀/(1 + a₀/(πARe)). Low aspect ratio hurts twice — less slope and more induced drag — which is why deltas need high angles of attack to generate lift.',
    units: { si: 'per radian' },
    typicalValues: [
      { context: 'AR 7.5 wing (a₀ = 2π)', range: '≈ 4.9 per rad ≈ 0.086 per deg' },
      { context: 'AR 20 sailplane', range: '≈ 5.7 per rad' },
    ],
    weekTags: [4],
    appearsIn: ['f-wing-slope', 'f-wing-cl'],
  },
  {
    id: 'alpha-i', name: 'Induced angle of attack', latex: '\\alpha_i',
    description:
      'The small nose-down flow angle created by downwash behind the wing, α_i = C_L/(πARe). The section actually flies at α − α_i, which is precisely why the 3-D wing produces less lift slope than the 2-D section and why the lift vector tilts back into induced drag. More lift or less span means more induced angle.',
    units: { si: 'rad (radians!) — dividing C_L by πARe gives radians' },
    typicalValues: [
      { context: 'Cruise (GA wing)', range: '0.5–1.5°' },
      { context: 'Near stall', range: 'several degrees' },
    ],
    weekTags: [4],
    appearsIn: ['f-alpha-i'],
  },
  {
    id: 'W-S', name: 'Wing loading', latex: 'W/S',
    description:
      'Weight carried per unit wing area — the design number that decides an aircraft’s character. High wing loading means fast, smooth ride, long landing run; low means slow, nimble, short-field. Stall speed scales as √(W/S), so landing performance and wing loading are the same conversation.',
    units: { si: 'N/m² (equivalently kg/m² in common usage)' },
    typicalValues: [
      { context: 'Cessna 172', range: '≈ 670 N/m² (≈ 68 kg/m²)' },
      { context: 'Airliner at MTOW', range: '5,000–7,000 N/m²' },
      { context: 'Small UAS', range: '50–300 N/m²' },
    ],
    weekTags: [4, 10],
    appearsIn: ['f-wing-load', 'f-vstall'],
  },
  {
    id: 'CLmax', name: 'Maximum lift coefficient', latex: 'C_{L,max}',
    description:
      'The peak of the lift curve — the best the wing will ever do before stall. It fixes stall speed (V_stall = √(2W/ρSC_{L,max})) and therefore landing distance, approach speed and the take-off equation’s denominator. High-lift devices exist to raise it: flaps add camber and area, slats re-energise the boundary layer.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Clean wing', range: '1.2–1.6' },
      { context: 'Full flaps GA aircraft', range: '≈ 2.0–2.5' },
      { context: 'Airliner landing (slats+flaps)', range: '≈ 2.4–3.0' },
    ],
    weekTags: [3, 4, 10],
    appearsIn: ['f-vstall', 'f-takeoff'],
  },

  // ─── Part 3 — Materials & Structures (Weeks 5–6) ───

  {
    id: 'sigma', name: 'Normal stress', latex: '\\sigma',
    description:
      'Force per unit area acting perpendicular to a section — tension pulls, compression pushes. Stress is the material’s internal response to load: aluminium yields around 250–400 MPa, carbon composites exceed 1,000 MPa in tension. Every structural exam calculation starts by checking stress against an allowable.',
    units: { si: 'Pa', other: ['MPa (use this — 1 MPa = 1 N/mm²)'] },
    typicalValues: [
      { context: 'Aluminium 2024-T3 yield', range: '≈ 290 MPa' },
      { context: 'Steel 4340 yield', range: '≈ 1,000 MPa' },
      { context: 'CFRP laminate tension', range: '600–1,500 MPa' },
    ],
    weekTags: [5, 6],
    appearsIn: ['f-stress-n', 'f-bending', 'f-fs', 'f-euler-stress', 'f-plate-buckling'],
  },
  {
    id: 'tau', name: 'Shear stress', latex: '\\tau',
    description:
      'Force per unit area acting parallel to a surface — the stress that makes layers slide. Aircraft skins and riveted joints work largely in shear; thin panels that fail in compression actually buckle through shear-dominated instability. Shear yield is typically about half of tensile yield for metals.',
    units: { si: 'Pa', other: ['MPa'] },
    typicalValues: [
      { context: 'Aluminium shear yield', range: '≈ 150–200 MPa' },
      { context: 'Thin-web critical shear', range: 'design-dependent' },
    ],
    weekTags: [5, 6],
    appearsIn: ['f-stress-s'],
  },
  {
    id: 'F', name: 'Applied force', latex: 'F',
    description:
      'The external load carried by a structural member — tension in a tie rod, compression in a strut, shear across a rivet. Identifying how the load flows into each member, and which area resists it, is the whole game of Wk 5–6 problems. Practice-exam Q3 makes you do exactly that for thin-wall beams.',
    units: { si: 'N', other: ['kN'] },
    typicalValues: [
      { context: 'Rivet loads', range: '1–10 kN' },
      { context: 'Wing spar root loads', range: '100 kN–1 MN' },
    ],
    weekTags: [5, 6],
    appearsIn: ['f-stress-n', 'f-stress-s', 'f-fs'],
  },
  {
    id: 'A-area', name: 'Cross-section area', latex: 'A',
    description:
      'The area of the section that resists the applied load — for axial stress the full section; for shear the area parallel to the load. It is the denominator of σ = F/A and τ = F/A, so doubling area halves stress. Thin-wall members use the perimeter×thickness formula, not the enclosed area — a classic exam trap.',
    units: { si: 'm²', other: ['mm² (pair with MPa)'] },
    typicalValues: [
      { context: 'Stringer cap', range: '50–500 mm²' },
      { context: 'Main spar cap', range: '1,000–20,000 mm²' },
    ],
    weekTags: [5, 6],
    appearsIn: ['f-stress-n', 'f-stress-s'],
  },
  {
    id: 'M-bend', name: 'Bending moment', latex: 'M',
    description:
      'The internal moment a beam carries where loads try to curve it — largest at the root of a wing under lift. It generates the linear stress distribution σ = My/I: compression on one face, tension on the other, zero at the neutral axis. Bending moment diagrams are the first step of any beam design.',
    units: { si: 'N·m', other: ['kN·m'] },
    typicalValues: [
      { context: 'Light aircraft wing root', range: '≈ 10–30 kN·m' },
      { context: 'Airliner wing root', range: '≈ 10–30 MN·m' },
    ],
    weekTags: [5],
    appearsIn: ['f-bending'],
  },
  {
    id: 'y', name: 'Distance from neutral axis', latex: 'y',
    description:
      'The vertical distance from a beam’s neutral axis to the point where stress is evaluated. Stress grows linearly with y — the outer fibres carry the most, the axis carries none. This is why I-beams and spar caps put material far from the axis: more area at large y means much more bending stiffness.',
    units: { si: 'm', other: ['mm'] },
    typicalValues: [
      { context: 'Symmetric section, outer fibre', range: 'y = h/2' },
      { context: 'I-beam cap offset', range: '≈ half the depth' },
    ],
    weekTags: [5],
    appearsIn: ['f-bending'],
  },
  {
    id: 'I', name: 'Second moment of area', latex: 'I',
    description:
      'The geometric measure of how a section’s area is distributed about its axis — the “shape stiffness” in both bending (σ = My/I) and Euler buckling (P_CR = π²EI/L²). Moving material away from the axis raises I with the square of distance, which is why I-beams, hollow tubes and stiffened skins beat solid bars per kilogram.',
    units: { si: 'm⁴', other: ['mm⁴'] },
    typicalValues: [
      { context: 'Rectangle b×h about centroid', range: 'bh³/12' },
      { context: 'Typical spar cap assembly', range: '10⁵–10⁷ mm⁴' },
    ],
    weekTags: [5, 6],
    appearsIn: ['f-inertia', 'f-bending', 'f-euler', 'f-euler-stress'],
  },
  {
    id: 'E', name: 'Young’s modulus', latex: 'E',
    description:
      'Stiffness: the slope of the stress–strain line in the elastic region, E = σ/ε. It is a material property, independent of strength — steel and many aluminys share similar E but wildly different strengths. It sets elastic deflection and appears squared in buckling: double E and the buckling load doubles; halve thickness and it collapses.',
    units: { si: 'Pa', other: ['GPa'] },
    typicalValues: [
      { context: 'Steel', range: '≈ 200 GPa' },
      { context: 'Aluminium', range: '≈ 70–73 GPa' },
      { context: 'CFRP (longitudinal)', range: '100–180 GPa' },
      { context: 'Glass fibre', range: '≈ 70 GPa' },
    ],
    weekTags: [5, 6],
    appearsIn: ['f-hooke', 'f-rule-mixtures', 'f-rule-mixtures-e2', 'f-euler', 'f-plate-buckling', 'f-euler-stress'],
  },
  {
    id: 'sigma-fail', name: 'Failure (ultimate) stress', latex: '\\sigma_{fail}',
    description:
      'The maximum stress a material can take in a given failure mode before fracture or unacceptable permanent deformation — yield stress for ductile metals, ultimate for composites. It is the numerator of the Factor of Safety and the allowable every design must stay under (divided by FS).',
    units: { si: 'Pa', other: ['MPa'] },
    typicalValues: [
      { context: 'Al 2024-T3 yield', range: '≈ 290 MPa' },
      { context: 'Al 7075-T6 yield', range: '≈ 470 MPa' },
      { context: 'CFRP ultimate', range: '≈ 1,500 MPa' },
    ],
    weekTags: [5],
    appearsIn: ['f-fs'],
  },
  {
    id: 'sigma-allow', name: 'Allowable stress', latex: '\\sigma_{allow}',
    description:
      'The stress the design is actually permitted to reach: the failure stress divided by the factor of safety. Working stress must stay below it under every load case. Examiners love asking you to compute allowable stress, applied stress, and then declare pass/fail with justification.',
    units: { si: 'Pa', other: ['MPa'] },
    typicalValues: [{ context: 'With FS = 1.5 on Al 2024', range: '≈ 190 MPa' }],
    weekTags: [5],
    appearsIn: ['f-fs'],
  },
  {
    id: 'FS', name: 'Factor of Safety', latex: 'FS',
    description:
      'The design margin: FS = failure load (or stress) ÷ allowable. FS > 1 means the structure survives with margin. Aircraft use small factors (1.5 typical, limited by weight); uncertainty, load variability and material scatter justify the number. Equivalently, ultimate load = limit load × FS in certification terms.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Aircraft structures', range: '1.5 typical' },
      { context: 'Buildings (steel)', range: '≈ 1.67–2' },
      { context: 'Experimental/uncertain loads', range: '2–4' },
    ],
    weekTags: [5],
    appearsIn: ['f-fs'],
  },
  {
    id: 'E1', name: 'Composite longitudinal modulus', latex: 'E_1',
    description:
      'The effective Young’s modulus of a unidirectional composite loaded along the fibres, given by the Rule of Mixtures E₁ = E_f V_f + E_m V_m. Fibres carry almost all the load, so E₁ approaches E_f·V_f. It is the headline property of directional composites and a Wk-5 exam favourite.',
    units: { si: 'Pa', other: ['GPa'] },
    typicalValues: [
      { context: 'CFRP 60 % fibre', range: '≈ 135 GPa (with E_f = 220 GPa)' },
      { context: 'Glass/epoxy 55 % fibre', range: '≈ 42 GPa' },
    ],
    weekTags: [5],
    appearsIn: ['f-rule-mixtures'],
  },
  {
    id: 'Ef', name: 'Fibre modulus', latex: 'E_f',
    description:
      'The Young’s modulus of the reinforcing fibre itself — the stiff ingredient of a composite. Carbon fibre is the star: ~220–400 GPa versus ~70 GPa for glass. Because fibres dominate the longitudinal modulus, composite design is largely about fibre choice, volume fraction and direction.',
    units: { si: 'Pa', other: ['GPa'] },
    typicalValues: [
      { context: 'Carbon (standard modulus)', range: '≈ 230 GPa' },
      { context: 'Carbon (high modulus)', range: '300–600 GPa' },
      { context: 'Glass (E-glass)', range: '≈ 72 GPa' },
    ],
    weekTags: [5],
    appearsIn: ['f-rule-mixtures', 'f-rule-mixtures-e2'],
  },
  {
    id: 'Em', name: 'Matrix modulus', latex: 'E_m',
    description:
      'The Young’s modulus of the matrix (usually epoxy resin) that binds fibres, transfers shear between them and stabilises them against buckling. It is the soft ingredient — 3–4 GPa — and only matters in the longitudinal Rule of Mixtures through its volume fraction, but it dominates transverse behaviour.',
    units: { si: 'Pa', other: ['GPa'] },
    typicalValues: [{ context: 'Epoxy resin', range: '≈ 3–4 GPa' }],
    weekTags: [5],
    appearsIn: ['f-rule-mixtures', 'f-rule-mixtures-e2'],
  },
  {
    id: 'Vf', name: 'Fibre volume fraction', latex: 'V_f',
    description:
      'The share of the composite’s volume occupied by fibres — the mixture’s recipe. Aerospace laminates run 55–65 %; higher gives more stiffness but leaves too little resin to wet the fibres. In the Rule of Mixtures it weights the fibre contribution, and V_f + V_m = 1 closes the system.',
    units: { si: '– (dimensionless, 0–1)' },
    typicalValues: [
      { context: 'Aerospace prepreg', range: '0.55–0.65' },
      { context: 'Hand lay-up', range: '0.3–0.45' },
    ],
    weekTags: [5],
    appearsIn: ['f-rule-mixtures', 'f-rule-mixtures-e2'],
  },
  {
    id: 'Vm', name: 'Matrix volume fraction', latex: 'V_m',
    description:
      'The resin’s share of composite volume, completing V_f + V_m = 1. It carries little longitudinal stiffness but enables the whole system: bonding, shear transfer, toughness. Its fraction is whatever the fibre fraction leaves — compute it, don’t assume it.',
    units: { si: '– (dimensionless, 0–1)' },
    typicalValues: [{ context: 'Aerospace prepreg', range: '0.35–0.45' }],
    weekTags: [5],
    appearsIn: ['f-rule-mixtures', 'f-rule-mixtures-e2'],
  },
  {
    id: 'E2', name: 'Composite transverse modulus', latex: 'E_2',
    description:
      'The effective modulus across the fibres, computed with the inverse Rule of Mixtures — 1/E₂ = V_f/E_f + V_m/E_m. Because the soft matrix sits in series with stiff fibres, E₂ is matrix-dominated and typically only a few GPa. The huge E₁ vs E₂ gap is why composites are anisotropic and why ply orientation matters.',
    units: { si: 'Pa', other: ['GPa'] },
    typicalValues: [
      { context: 'CFRP 60 % fibre', range: '≈ 8–10 GPa' },
      { context: 'Glass/epoxy 55 %', range: '≈ 12–15 GPa' },
    ],
    weekTags: [5],
    appearsIn: ['f-rule-mixtures-e2'],
  },
  {
    id: 'P-cr', name: 'Euler critical load', latex: 'P_{CR}',
    description:
      'The compressive load at which a slender column suddenly bows sideways — buckles — rather than crushing. P_CR = π²EI/(kL)². It is an elastic-instability load: the material can be nowhere near its yield stress, yet the member fails. Doubling length quarters the capacity; increasing I is the cure.',
    units: { si: 'N', other: ['kN'] },
    typicalValues: [
      { context: 'Light aircraft strut', range: '10–100 kN' },
      { context: 'Stringer between ribs', range: '1–10 kN' },
    ],
    weekTags: [6],
    appearsIn: ['f-euler'],
  },
  {
    id: 'k', name: 'Effective length factor', latex: 'k',
    description:
      'The end-condition multiplier that turns a column’s physical length into its effective buckling length kL. Pinned–pinned k = 1; fixed–fixed k = 0.5 (four times stronger); fixed–free cantilever k = 2 (four times weaker); fixed–pinned k ≈ 0.7. Sketching the buckled shape tells you which k applies — exactly what practice-exam Q3 wants.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Pinned–pinned', range: '1.0' },
      { context: 'Fixed–fixed', range: '0.5' },
      { context: 'Fixed–pinned', range: '≈ 0.7' },
      { context: 'Fixed–free (cantilever)', range: '2.0' },
    ],
    weekTags: [6],
    appearsIn: ['f-euler'],
  },
  {
    id: 'L-col', name: 'Column length', latex: 'L',
    description:
      'The unsupported length of a compression member between restraints. It enters Euler’s formula squared in the denominator, so length is the most powerful lever on buckling: longer columns buckle at dramatically lower loads. Adding a rib, frame or intermediate support halves kL and quadruples capacity.',
    units: { si: 'm', other: ['mm'] },
    typicalValues: [
      { context: 'Stringer bay between ribs', range: '0.2–0.6 m' },
      { context: 'Control pushrod', range: '0.3–2 m' },
    ],
    weekTags: [6],
    appearsIn: ['f-euler'],
  },
  {
    id: 'K', name: 'Plate buckling coefficient', latex: 'K',
    description:
      'The dimensionless factor capturing how a plate panel is loaded and how its edges are supported — simply-supported edges under compression give K ≈ 4, clamped edges give much higher values. It multiplies E(t/b)² in the plate buckling stress, and exam problems usually supply it.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Simply supported, compression', range: '≈ 4' },
      { context: 'Clamped edges', range: '≈ 10+' },
    ],
    weekTags: [6],
    appearsIn: ['f-plate-buckling'],
  },
  {
    id: 't', name: 'Plate (skin) thickness', latex: 't',
    description:
      'The thickness of a plate panel or aircraft skin. In plate buckling it enters squared — halving thickness quarters the buckling stress — which is why thin skins cannot carry compression alone and semi-monocoque design adds stringers. Thickness also sets shear capability and mass per area.',
    units: { si: 'm', other: ['mm'] },
    typicalValues: [
      { context: 'Aircraft skin panels', range: '0.8–3 mm' },
      { context: 'UAS structure', range: '0.2–1 mm' },
    ],
    weekTags: [6],
    appearsIn: ['f-plate-buckling'],
  },
  {
    id: 'b-panel', name: 'Plate width (panel)', latex: 'b',
    description:
      'The width of the plate panel between stiffeners — the b in σ_CR = KE(t/b)². Narrower panels (closer stringers) raise buckling stress steeply because width enters squared. This is the structural logic of semi-monocoque: many stringers, small panels, thin skin.',
    units: { si: 'm', other: ['mm'] },
    typicalValues: [
      { context: 'Skin bay between stringers', range: '100–200 mm' },
      { context: 'Web panel between stiffeners', range: '150–400 mm' },
    ],
    weekTags: [6],
    appearsIn: ['f-plate-buckling'],
  },
  {
    id: 'sigma-cr', name: 'Critical (buckling) stress', latex: '\\sigma_{CR}',
    description:
      'The compressive stress at which a plate or column becomes unstable and buckles. For plates σ_CR = KE(t/b)²; for columns the Euler load divided by area. Buckling is geometric instability, not material failure — the stress can be well below yield. Compare σ_CR against applied stress to judge safety.',
    units: { si: 'Pa', other: ['MPa'] },
    typicalValues: [
      { context: 'Thin skin panel', range: '10–100 MPa' },
      { context: 'Heavily stiffened panel', range: '100–300 MPa' },
    ],
    weekTags: [6],
    appearsIn: ['f-plate-buckling', 'f-euler-stress'],
  },
  {
    id: 'r-gyr', name: 'Radius of gyration', latex: 'r',
    description:
      'The distance at which the section’s whole area could be concentrated to give the same second moment of area: r = √(I/A). It converts a section’s geometry into one slenderness number with length: slenderness ratio kL/r decides whether a column fails by buckling (long) or crushing (short).',
    units: { si: 'm', other: ['mm'] },
    typicalValues: [
      { context: 'Solid circular section', range: 'r = d/4' },
      { context: 'Thin-walled tube', range: 'r ≈ R/√2' },
    ],
    weekTags: [6],
    appearsIn: ['f-r-gyr', 'f-slenderness'],
  },
  {
    id: 'lambda', name: 'Slenderness ratio', latex: '\\lambda',
    description:
      'The effective length divided by radius of gyration, λ = kL/r — the single number that classifies compression members. Large λ means buckling governs (use Euler); small λ means material strength governs (crushing/yield). Comparing λ against the material’s transition value is the quick way to pick the right failure mode.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Typical aluminium alloys transition', range: 'λ ≈ 100' },
      { context: 'Long stringers', range: 'λ > 120 — Euler governs' },
    ],
    weekTags: [6],
    appearsIn: ['f-slenderness'],
  },
  {
    id: 'G', name: 'Shear modulus', latex: 'G',
    description:
      'The material’s stiffness in shear — slope of the τ–γ line — linked to Young’s modulus and Poisson’s ratio through G = E/2(1+ν). It governs torsional deflection of shafts and shear deformation of webs. For isotropic metals it is roughly 0.38·E.',
    units: { si: 'Pa', other: ['GPa'] },
    typicalValues: [
      { context: 'Aluminium', range: '≈ 27 GPa' },
      { context: 'Steel', range: '≈ 77 GPa' },
    ],
    weekTags: [5, 6],
    appearsIn: ['f-shear-mod'],
  },
  {
    id: 'nu', name: 'Poisson’s ratio', latex: '\\nu',
    description:
      'The ratio of lateral contraction to axial extension in elastic stretching — pull a rubber band and it thins. Metals sit near 0.3, rubber near 0.5, cork near 0. It couples the two normal strains and appears in the G–E relation and plate/beam correction factors.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Metals', range: '0.28–0.34' },
      { context: 'Rubber', range: '≈ 0.5' },
    ],
    weekTags: [5, 6],
    appearsIn: ['f-poisson', 'f-shear-mod'],
  },
  {
    id: 'epsilon', name: 'Strain', latex: '\\epsilon',
    description:
      'Dimensionless deformation: change in length divided by original length. Strain is what materials actually feel locally — stress is the book-keeping around it. Elastic strains are tiny (metals yield around ε ≈ 0.002), which is why strain gauges measure microstrain and why stiffness, not strength, usually limits deflection-critical parts.',
    units: { si: '– (dimensionless)', other: ['με = 10⁻⁶'] },
    typicalValues: [
      { context: 'Elastic limit (aluminium)', range: '≈ 2,000–5,000 με' },
      { context: 'Structural working strain', range: '≈ 1,000–3,000 με' },
    ],
    weekTags: [5],
    appearsIn: ['f-hooke', 'f-poisson'],
  },

  // ─── Part 4 — Propulsion, UAS, Rotary & Performance (Weeks 7–10) ───

  {
    id: 'F-thrust', name: 'Net thrust (jet)', latex: 'F',
    description:
      'The propulsive force from momentum change: F = ṁ(Vⱼ − V₀), plus a pressure-area correction when the jet is not fully expanded. It is Newton’s second law applied to a streamtube through the engine. Bigger mass flow or bigger velocity jump means more thrust — turbofans choose the mass-flow route for efficiency.',
    units: { si: 'N', other: ['kN', 'lbf'] },
    typicalValues: [
      { context: 'Small turbofan', range: '5–20 kN' },
      { context: 'Large turbofan (GE90 class)', range: '330–500 kN' },
    ],
    weekTags: [7],
    appearsIn: ['f-thrust-jet', 'f-prop-eff'],
  },
  {
    id: 'Vj', name: 'Jet exhaust velocity', latex: 'V_j',
    description:
      'The speed at which exhaust leaves the engine, relative to the engine. The difference Vⱼ − V₀ is the momentum change per kilogram of air that becomes thrust. Higher jet velocity wastes more kinetic energy in the wake, so pure jets (high Vⱼ) are less efficient at subsonic speeds than fans moving more air more slowly.',
    units: { si: 'm/s' },
    typicalValues: [
      { context: 'Turbojet exhaust', range: '400–700 m/s' },
      { context: 'High-bypass fan jet', range: '≈ 250–450 m/s' },
    ],
    weekTags: [7],
    appearsIn: ['f-thrust-jet', 'f-prop-eff'],
  },
  {
    id: 'V0', name: 'Flight (free-stream) velocity', latex: 'V_0',
    description:
      'The aircraft’s forward speed relative to the air — the V₀ in thrust and propulsive-efficiency expressions. As V₀ approaches Vⱼ, the momentum difference shrinks but efficiency rises; propellers sit far below their “jet” speed and are thus very efficient at low speeds.',
    units: { si: 'm/s' },
    typicalValues: [
      { context: 'GA cruise', range: '50–80 m/s' },
      { context: 'Airliner cruise', range: '≈ 230–250 m/s' },
    ],
    weekTags: [7],
    appearsIn: ['f-thrust-jet', 'f-prop-eff', 'f-power-req'],
  },
  {
    id: 'Pw', name: 'Power', latex: 'P',
    description:
      'Energy per second — force times velocity. Power required to fly is D·V; power available is engine shaft power (or thrust × speed for jets). The difference available-minus-required sets climb rate, and battery energy divided by average power sets electric endurance.',
    units: { si: 'W', other: ['kW', 'hp (1 hp = 746 W)'] },
    typicalValues: [
      { context: 'Cessna 172 engine', range: '≈ 120 kW (160 hp)' },
      { context: 'Small UAS motor', range: '100–1,000 W' },
    ],
    weekTags: [7, 8, 9, 10],
    appearsIn: ['f-power-req', 'f-breguet-endurance', 'f-roc'],
  },
  {
    id: 'eta-p', name: 'Propulsive efficiency', latex: '\\eta_p',
    description:
      'The fraction of engine power that becomes useful flight power: η_p = thrust power ÷ total power ≈ 2V₀/(Vⱼ + V₀). It rewards moving a lot of air slowly — hence high-bypass turbofans and propellers. Pure jets waste energy in fast exhaust; the Froude efficiency limit approaches 1 only as the wake slows to flight speed.',
    units: { si: '– (dimensionless, 0–1)' },
    typicalValues: [
      { context: 'Propeller at cruise', range: '0.80–0.85' },
      { context: 'High-bypass turbofan', range: '0.70–0.80' },
      { context: 'Turbojet', range: '0.40–0.60' },
    ],
    weekTags: [7],
    appearsIn: ['f-prop-eff'],
  },
  {
    id: 'TSFC', name: 'Thrust-specific fuel consumption', latex: 'TSFC',
    description:
      'Fuel mass burned per unit thrust per unit time (mg/N·s⁻¹ or lb/lbf/h) — the “fuel economy” of jet engines. Lower is better; high-bypass fans win at subsonic cruise. In Breguet range, TSFC appears in the denominator, directly scaling how far each kilogram of fuel takes you.',
    units: { si: 'kg/(N·s)', other: ['lb/(lbf·h) — multiply SI by 3,600'] },
    typicalValues: [
      { context: 'Modern turbofan cruise', range: '≈ 0.5–0.6 lb/(lbf·h) ≈ 14–17 mg/(N·s)' },
      { context: 'Turbojet', range: '0.8–1.1 lb/(lbf·h)' },
    ],
    weekTags: [7, 10],
    appearsIn: ['f-breguet-range'],
  },
  {
    id: 'c-sfc', name: 'Power-specific fuel consumption', latex: 'c',
    description:
      'The propeller-engine analogue of TSFC: fuel burned per unit shaft power per unit time. It appears in Breguet range and endurance for propeller aircraft, along with propeller efficiency η — remember to multiply power by η to get thrust power.',
    units: { si: 'kg/(W·s)', other: ['lb/(hp·h)'] },
    typicalValues: [
      { context: 'Piston engine', range: '≈ 0.4–0.5 lb/(hp·h)' },
      { context: 'Turboprop', range: '≈ 0.5–0.6 lb/(hp·h)' },
    ],
    weekTags: [7, 10],
    appearsIn: ['f-breguet-range', 'f-breguet-endurance'],
  },
  {
    id: 'C-batt', name: 'Battery capacity', latex: 'C_{batt}',
    description:
      'The total electrical charge a battery can deliver, in ampere-hours — energy equals capacity times voltage. It is the fuel tank of electric flight: endurance ≈ usable capacity × voltage ÷ average power. Batteries weigh ~50× more per joule than jet fuel, which is why electric endurance remains minutes, not hours.',
    units: { si: 'A·h (pair with V for Wh)' },
    typicalValues: [
      { context: 'Small UAS LiPo pack', range: '2–20 A·h at 11–22 V' },
      { context: 'Energy density (Li-ion)', range: '150–250 Wh/kg' },
    ],
    weekTags: [8],
    appearsIn: ['f-endurance-elec'],
  },
  {
    id: 'V-batt', name: 'Battery voltage', latex: 'V_{batt}',
    description:
      'The nominal voltage of the battery pack. Capacity in amp-hours times voltage gives energy in watt-hours; UAS packs stack cells in series (each Li-ion cell ≈ 3.7 V nominal) to reach the voltage the motors need.',
    units: { si: 'V' },
    typicalValues: [
      { context: '3S LiPo', range: '11.1 V' },
      { context: '6S LiPo', range: '22.2 V' },
    ],
    weekTags: [8],
    appearsIn: ['f-endurance-elec'],
  },
  {
    id: 'P-avg', name: 'Average electrical power', latex: 'P_{avg}',
    description:
      'The mean electrical power draw of the whole aircraft — motors, avionics, payload — averaged over the mission including climb and hover segments. Dividing usable battery energy by P_avg gives endurance; throttle discipline and light payloads stretch it.',
    units: { si: 'W' },
    typicalValues: [
      { context: 'Hover for small multirotor', range: '150–500 W' },
      { context: 'Cruise fixed-wing UAS', range: '50–200 W' },
    ],
    weekTags: [8],
    appearsIn: ['f-endurance-elec'],
  },
  {
    id: 'T-rotor', name: 'Rotor thrust', latex: 'T',
    description:
      'The upward force produced by a rotor disk. In hover it must equal weight; momentum theory says it equals 2ρAv_i² for an ideal actuator disk. Rotor thrust costs induced power T·v_i, so the design goal is producing it with the largest disk area and lowest possible induced velocity.',
    units: { si: 'N', other: ['kN'] },
    typicalValues: [
      { context: 'R44 helicopter', range: '≈ 11 kN (hover)' },
      { context: 'Small drone rotor', range: '1–10 N each' },
    ],
    weekTags: [9],
    appearsIn: ['f-hover-thrust', 'f-hover-power', 'f-fom', 'f-disk-load'],
  },
  {
    id: 'v-i', name: 'Induced velocity (rotor)', latex: 'v_i',
    description:
      'The average downward velocity the rotor imparts to the air it pumps — the “work output” of the disk. Momentum theory for hover: v_i = √(T/2ρA). Power equals T·v_i, so heavy rotors on small disks need large induced velocity and burn power fast. Ground effect reduces v_i and saves power near the surface.',
    units: { si: 'm/s' },
    typicalValues: [
      { context: 'Light helicopter', range: '8–12 m/s' },
      { context: 'Small multirotor', range: '2–5 m/s' },
    ],
    weekTags: [9],
    appearsIn: ['f-hover-vi', 'f-hover-thrust', 'f-hover-power'],
  },
  {
    id: 'DL', name: 'Disk loading', latex: 'DL',
    description:
      'Thrust per unit disk area, T/A — the rotor-world version of wing loading. Low disk loading (big slow rotors) means low induced velocity, low induced power and quiet operation; high disk loading (compact drones) costs power and noise. It sets the induced-velocity scale via v_i = √(DL/2ρ).',
    units: { si: 'N/m²' },
    typicalValues: [
      { context: 'Light helicopter', range: '≈ 140–180 N/m²' },
      { context: 'Small quadcopter', range: '20–100 N/m²' },
      { context: 'With ground effect', range: 'effective DL reduced near ground' },
    ],
    weekTags: [9],
    appearsIn: ['f-disk-load'],
  },
  {
    id: 'FM', name: 'Figure of Merit', latex: 'FM',
    description:
      'How close a real hovering rotor comes to the ideal momentum-theory power: FM = ideal induced power ÷ actual power. A perfect rotor scores 1; real rotors manage 0.6–0.8 because of profile drag, tip losses and non-uniform inflow. It is the hover-quality scorecard — analogous to span efficiency e for wings.',
    units: { si: '– (dimensionless, 0–1)' },
    typicalValues: [
      { context: 'Good helicopter rotor', range: '0.70–0.80' },
      { context: 'Small drone prop', range: '0.5–0.7' },
    ],
    weekTags: [9],
    appearsIn: ['f-fom'],
  },
  {
    id: 'R-dot', name: 'Rate of climb', latex: 'R/C',
    description:
      'Vertical speed: the excess power (available minus required) divided by weight. It is why climb performance lives and dies on the power curves — at the best-climb speed the gap D·V − P_avail is largest. Service ceiling is where the excess, and hence R/C, falls to 0.5 m/s.',
    units: { si: 'm/s', other: ['ft/min (× 196.85)'] },
    typicalValues: [
      { context: 'Cessna 172', range: '≈ 3.5 m/s (≈ 720 ft/min)' },
      { context: 'Fighter jet', range: '150–300 m/s' },
    ],
    weekTags: [10],
    appearsIn: ['f-roc'],
  },
  {
    id: 'P-avail', name: 'Power available', latex: 'P_{avail}',
    description:
      'The power the propulsion system actually delivers to the airframe at the flight condition — shaft power × propeller efficiency for props, T·V for jets. Subtract power required (D·V) to get the excess that climbs or accelerates the aircraft.',
    units: { si: 'W', other: ['kW', 'hp'] },
    typicalValues: [
      { context: 'Cessna 172 at sea level', range: '≈ 105 kW usable' },
      { context: 'Falls with altitude', range: '≈ ρ/V· factors apply' },
    ],
    weekTags: [7, 10],
    appearsIn: ['f-roc'],
  },
  {
    id: 'L-D', name: 'Lift-to-drag ratio', latex: 'L/D',
    description:
      'Aerodynamic efficiency: how much lift per unit drag. It peaks at minimum-drag conditions, where parasite and induced drag balance, and equals the glide ratio in unpowered flight. It is the denominator of Breguet range — doubling L/D doubles range. Sailplanes reach 40–60; airliners ~18–20.',
    units: { si: '– (dimensionless)' },
    typicalValues: [
      { context: 'Cessna 172', range: '≈ 9–10' },
      { context: 'Airliner cruise', range: '≈ 17–20' },
      { context: 'High-performance sailplane', range: '40–60' },
    ],
    weekTags: [4, 10],
    appearsIn: ['f-glide', 'f-breguet-range', 'f-breguet-endurance'],
  },
  {
    id: 'theta-glide', name: 'Glide angle', latex: '\\theta',
    description:
      'The shallow angle below horizontal a gliding aircraft descends at, with tan θ = D/L = 1/(L/D). Shallowest glide (max range) happens at best L/D; steepest descent (min sink) happens at minimum power speed — they are different speeds, a favourite exam distinction.',
    units: { si: '° or rad' },
    typicalValues: [
      { context: 'Cessna 172 best glide', range: '≈ 6° (L/D ≈ 9.5)' },
      { context: 'Sailplane', range: '≈ 1.5–2°' },
    ],
    weekTags: [10],
    appearsIn: ['f-glide'],
  },
  {
    id: 'W-fuel', name: 'Fuel (or energy) weight fraction', latex: 'W_f/W_0',
    description:
      'The fraction of take-off weight that is fuel — the integral outcome of the Breguet relation. Mission range demands set it, and because it multiplies through the empty-weight budget, a small range increase can force a large aircraft. In electric terms the same idea becomes battery mass fraction.',
    units: { si: '– (dimensionless, 0–1)' },
    typicalValues: [
      { context: 'Short-haul airliner', range: '0.15–0.25' },
      { context: 'Long-haul airliner', range: '0.35–0.45' },
      { context: 'GA cross-country', range: '0.10–0.15' },
    ],
    weekTags: [10],
    appearsIn: ['f-breguet-range', 'f-breguet-endurance'],
  },
  {
    id: 'V-model', name: 'Model-scale parameters', latex: 'V_m, L_m, ρ_m',
    description:
      'The speed, length and density at which a scaled model must run to reproduce full-scale flow physics. Matching Reynolds number Re = ρVL/μ with a smaller L requires larger V or ρ (pressurised tunnels) — and matching Mach simultaneously is usually impossible in air, forcing compromises discussed in Wk 10.',
    units: { si: 'varies (SI per quantity)' },
    typicalValues: [
      { context: '1:10 model, same Re', range: 'needs 10× V or 10× ρ' },
      { context: 'Pressurised tunnel trick', range: 'raise ρ, keep V subsonic' },
    ],
    weekTags: [10],
    appearsIn: ['f-similitude'],
  },
]
