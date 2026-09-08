// Inspection Hunt: a dollhouse cutaway with seven hidden defects. Tap what looks wrong.
// Runs on arcade-core.js. Everything on the canvas is drawn in code; no images.

/* ---------- palette (warm interior on the game's dark green) ---------- */
const P = {
  sky: '#0c211d',
  panel: '#132b25',
  gold: '#efd08a',
  cream: '#f0f0df',
  soil: '#2a1d13',
  soilDark: '#1d1810',
  grass: '#3f6e4a',
  grassDark: '#2f5238',
  roof: '#b8453a',
  roofDark: '#8f3229',
  atticWall: '#4a3220',
  atticFloor: '#6b4a2a',
  woodDark: '#5a3826',
  wood: '#8a5a34',
  woodLight: '#b07a48',
  floor: '#a06e30',
  floorLight: '#c08a4c',
  siding: '#d9c19a',
  bedroom: '#e6d3b3',
  bathroom: '#bfd8d3',
  tile: '#9fc0bb',
  kitchen: '#e9dcc0',
  living: '#d9c19a',
  concrete: '#7d7d76',
  concreteDark: '#6a6a63',
  concreteLight: '#9a9a92',
  steel: '#b0b0a8',
  steelDark: '#2a2a30',
  white: '#e8e8e0',
  glass: '#7fb3d5',
  glassLight: '#cfe6ff',
  water: '#4c8fd6',
  red: '#b8453a',
  terracotta: '#c47a4a',
  stain: '#6e4a22',
  stainDark: '#4d3216',
  rust: '#a5542a',
  rustDark: '#6e3416',
  mold: '#243a22',
  moldDark: '#121c12',
  crack: '#2f2f2b',
  spark: '#fff6d5',
  sparkGold: '#ffd84a',
  green: '#5fd27a',
  greenDark: '#1e4033',
  miss: '#ff6b5a',
}

/* ---------- layout (400 x 600, HUD lives in the top ~28px) ---------- */
const CX = 200
const ROOF = { peak: 46, eave: 130, halfW: 186 }
const IN_L = 32, IN_R = 368 // interior span between exterior walls
const MID = 198 // interior partition x (4px wide)
const FL = {
  up: { top: 130, bot: 244 },
  main: { top: 248, bot: 366 },
  base: { top: 370, bot: 496 },
}
const GROUND = 366
const BAR = { top: 552, bot: 600 }
const HIT_R = 26

/* ---------- small sprites ---------- */
const CURSOR = {
  map: [
    '...GGGG....',
    '..GWWWWG...',
    '.GW.....G..',
    '.GW.....G..',
    '.G......G..',
    '.G......G..',
    '..G....G...',
    '...GGGG.H..',
    '........HH.',
    '.........HH',
    '..........H',
  ],
  legend: { G: P.gold, W: '#fff6d5', H: P.woodDark },
}
const CHECK = {
  map: ['......G', '.....GG', '....GG.', 'G..GG..', 'GGGG...', '.GG....'],
  legend: { G: P.green },
}
const XMARK = {
  map: ['R...R', '.R.R.', '..R..', '.R.R.', 'R...R'],
  legend: { R: P.miss },
}
const LEAF = {
  map: ['.L.', 'LLB', '.B.'],
  legend: { L: '#6b8a3a', B: '#8a6a2a' },
}

/* ---------- the finding pool (9; each round hides 7) ---------- */
const FINDINGS = [
  { id: 'roof', label: 'Roof leak', x: 122, y: 104 },
  { id: 'gutter', label: 'Clogged gutter', x: 380, y: 132 },
  { id: 'window', label: 'Gap around window', x: 92, y: 172 },
  { id: 'mold', label: 'Mold under bathroom', x: 320, y: 258 },
  { id: 'handrail', label: 'Missing handrail', x: 238, y: 282 },
  { id: 'pipe', label: 'Leaking pipe', x: 118, y: 348 },
  { id: 'heater', label: 'Rusty water heater', x: 78, y: 478 },
  { id: 'panel', label: 'Old wiring', x: 330, y: 442 },
  { id: 'crack', label: 'Cracked foundation', x: 43, y: 466 },
]
// Normal furniture "slots" (decoys). Tapping these is a miss, like any empty spot.
// fridge, stove, upper cabinets, tub, toilet, bath sink, mirror, bed, lamp, sofa, picture,
// furnace, shelves, chimney, attic boxes, left gutter, moon.

/* ---------- geometry helpers ---------- */
const roofY = (x, peak, eave, halfW) => peak + (Math.abs(x - CX) / halfW) * (eave - peak)
const stepTop = (x) => FL.main.bot - (Math.min(7, Math.floor((x - 206) / 8)) + 1) * 14
const frac = (t, period, phase = 0) => (((t + phase) % period) + period) % period / period
// deterministic flicker from time, so sparks look random without allocating
const noise = (t, seed) => {
  const v = Math.sin(t * 91.7 + seed * 13.1) * 43758.5453
  return v - Math.floor(v)
}

export default {
  id: 'inspection-hunt',
  title: 'Inspection Hunt',
  tagline: 'Seven things are wrong with this house. Find them before the appraisal does not.',
  lesson:
    'An appraisal estimates value for the lender. An independent home inspection checks condition. Get the inspection, then decide what to ask for.',
  lessonShort: 'Inspection is not appraisal.',
  controls: 'Tap what looks wrong',
  duration: 60,
  width: 400,
  height: 600,
  coinCap: 40,
  touchButtons: false,

  create(arcade) {
    const R = (x, y, w, h, c) => arcade.rect(x, y, w, h, c)
    const SPR = (s, x, y, sc = 2, flip = false) => arcade.sprite(s.map, s.legend, x, y, sc, flip)
    const anim = !arcade.reduceMotion

    let t = 0
    let active = new Set() // finding ids hidden this round
    let found = new Set()
    let misses = 0
    let marks = [] // { x, y, kind: 'check' | 'x', age, life }
    let popups = [] // { x, y, text, color, age, life }
    let cursor = { x: 200, y: 300, visible: false }
    let doneAt = -1

    const isDefect = (id) => active.has(id)

    /* ----- pixel line for cracks ----- */
    function jag(points, color, w = 2) {
      for (let i = 0; i < points.length - 1; i++) {
        const [x0, y0] = points[i], [x1, y1] = points[i + 1]
        const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))
        for (let k = 0; k <= n; k++) {
          const f = n ? k / n : 0
          R(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, w, w, color)
        }
      }
    }
    function drop(x, y, sc = 1) {
      SPR(arcade.SPRITES.drop, x - 2 * sc, y, sc)
    }
    function fallingDrop(x, y0, y1, period, phase = 0) {
      const f = anim ? frac(t, period, phase) : 0.55
      // a quick fall with a short pause at the source
      const g = f < 0.25 ? 0 : (f - 0.25) / 0.75
      drop(x, y0 + (y1 - y0) * g * g)
    }

    /* ---------- scene ---------- */
    function drawSky() {
      R(0, 0, 400, GROUND, P.sky)
      const stars = [[22, 60], [48, 96], [70, 40], [110, 30], [300, 34], [352, 22], [372, 76], [392, 110], [16, 140], [388, 96]]
      for (const [sx, sy] of stars) R(sx, sy, 2, 2, (sx + sy) % 3 ? '#9fb3a0' : P.gold)
      // moon
      R(326, 54, 12, 2, P.cream); R(322, 56, 20, 2, P.cream); R(320, 58, 24, 8, P.cream); R(322, 66, 20, 2, P.cream); R(326, 68, 12, 2, P.cream)
      R(330, 60, 4, 2, '#cfcfbf'); R(334, 64, 2, 2, '#cfcfbf')
    }

    function drawGround() {
      R(0, GROUND, 400, BAR.top - GROUND, P.soil)
      // pebbles
      const pebbles = [[8, 420], [12, 470], [4, 510], [388, 430], [394, 480], [386, 520], [60, 530], [140, 520], [250, 536], [330, 526], [200, 512]]
      for (const [px, py] of pebbles) R(px, py, 3, 2, P.soilDark)
      // grass either side of the house
      R(0, GROUND - 6, 20, 8, P.grass); R(380, GROUND - 6, 20, 8, P.grass)
      R(0, GROUND, 20, 2, P.grassDark); R(380, GROUND, 20, 2, P.grassDark)
      R(6, GROUND - 12, 4, 6, P.grassDark); R(388, GROUND - 10, 4, 4, P.grassDark)
    }

    function drawRoofAndAttic() {
      // chimney (behind roof)
      R(296, 56, 20, 44, '#6e4232'); R(294, 54, 24, 4, '#8a5a4a'); R(300, 66, 4, 2, '#8a5a4a'); R(308, 74, 4, 2, '#8a5a4a')
      if (anim) {
        const f = frac(t, 3)
        R(302 + Math.sin(t * 2) * 2, 44 - f * 14, 4, 4, 'rgba(200,200,190,' + (0.35 * (1 - f)).toFixed(2) + ')')
      }
      // outer roof
      for (let y = ROOF.peak; y < ROOF.eave; y += 2) {
        const hw = ((y - ROOF.peak) / (ROOF.eave - ROOF.peak)) * ROOF.halfW
        R(CX - hw, y, hw * 2, 2, (y - ROOF.peak) % 8 === 6 ? P.roofDark : P.roof)
      }
      // attic interior
      const ip = ROOF.peak + 12, ihw = ROOF.halfW - 12
      for (let y = ip; y < ROOF.eave; y += 2) {
        const hw = ((y - ip) / (ROOF.eave - ip)) * ihw
        R(CX - hw, y, hw * 2, 2, P.atticWall)
      }
      // rafters
      for (let x = 60; x < 340; x += 40) {
        if (Math.abs(x - CX) < 6) continue
        const y = roofY(x, ip, ROOF.eave, ihw)
        R(x, y, 2, ROOF.eave - y, P.woodDark)
      }
      // eaves + gutters
      R(14, ROOF.eave - 4, 372, 4, P.roofDark)
      R(10, ROOF.eave, 22, 6, P.steel); R(368, ROOF.eave, 22, 6, P.steel)
      R(10, ROOF.eave + 4, 22, 2, P.concreteDark); R(368, ROOF.eave + 4, 22, 2, P.concreteDark)
      R(12, ROOF.eave + 6, 4, GROUND - ROOF.eave - 12, P.concreteLight) // downspout
      R(384, ROOF.eave + 6, 4, GROUND - ROOF.eave - 12, P.concreteLight)
      // attic vent + boxes + trunk
      R(196, 68, 8, 10, P.woodDark); R(198, 70, 4, 2, P.atticFloor); R(198, 74, 4, 2, P.atticFloor)
      R(160, 108, 22, 18, P.wood); R(160, 114, 22, 2, P.woodLight); R(168, 108, 6, 18, P.woodLight)
      R(186, 112, 16, 14, P.wood); R(186, 116, 16, 2, P.woodLight)
      R(226, 104, 30, 22, P.woodDark); R(226, 104, 30, 4, P.wood); R(238, 112, 6, 4, P.gold)
      // attic floor / upstairs ceiling slab
      R(IN_L - 8, FL.up.top - 4, IN_R - IN_L + 16, 4, P.atticFloor)

      // FINDING: roof leak (stain on the underside + a drip to the attic floor)
      if (isDefect('roof')) {
        R(108, 86, 8, 4, P.stain); R(112, 90, 14, 6, P.stain); R(116, 96, 12, 4, P.stain); R(120, 100, 6, 2, P.stainDark)
        R(114, 92, 8, 2, P.stainDark)
        R(114, FL.up.top - 6, 16, 2, P.water)
        fallingDrop(122, 100, FL.up.top - 8, 1.6)
      }
      // FINDING: clogged gutter (leaves piled up, overflow running down the wall)
      if (isDefect('gutter')) {
        SPR(LEAF, 370, ROOF.eave - 8, 2); SPR(LEAF, 378, ROOF.eave - 10, 2); SPR(LEAF, 384, ROOF.eave - 6, 2)
        R(372, ROOF.eave - 2, 16, 2, '#8a6a2a')
        fallingDrop(389, ROOF.eave + 6, GROUND - 8, 1.1)
        fallingDrop(389, ROOF.eave + 6, GROUND - 8, 1.1, 0.55)
        R(384, GROUND - 4, 12, 2, P.water)
      }
    }

    function drawShell() {
      // exterior walls
      R(IN_L - 8, FL.up.top, 8, GROUND - FL.up.top, P.siding)
      R(IN_R, FL.up.top, 8, GROUND - FL.up.top, P.siding)
      for (let y = FL.up.top + 6; y < GROUND; y += 12) {
        R(IN_L - 8, y, 8, 1, P.woodLight); R(IN_R, y, 8, 1, P.woodLight)
      }
      // foundation walls
      R(16, GROUND, 16, FL.base.bot + 8 - GROUND, P.concrete)
      R(IN_R, GROUND, 16, FL.base.bot + 8 - GROUND, P.concrete)
      R(16, FL.base.bot, 368, 8, P.concreteDark) // footing
    }

    function drawUpstairs() {
      const { top, bot } = FL.up
      // rooms
      R(IN_L, top, MID - IN_L, bot - top, P.bedroom)
      R(MID + 4, top, IN_R - MID - 4, bot - top, P.bathroom)
      R(MID, top, 4, bot - top, P.woodDark)
      // wallpaper hint (bedroom) + tile band (bathroom)
      for (let x = IN_L + 10; x < MID - 6; x += 24) R(x, top + 12, 2, 2, '#d3bc95')
      for (let x = MID + 4; x < IN_R; x += 8) for (let y = bot - 20; y < bot; y += 8) if (((x + y) / 8) % 2 < 1) R(x, y, 8, 8, P.tile)
      R(MID + 4, bot - 22, IN_R - MID - 4, 2, '#8fb0ab')
      // bedroom window
      R(44, 150, 40, 44, P.woodDark); R(48, 154, 32, 36, P.glass); R(62, 154, 4, 36, P.woodDark); R(48, 170, 32, 4, P.woodDark)
      R(50, 156, 6, 6, P.glassLight)
      R(40, 194, 48, 4, P.wood) // sill
      // curtain
      R(84, 148, 6, 40, P.terracotta); R(86, 160, 2, 12, '#a0523a')
      // picture
      R(136, 150, 26, 20, P.gold); R(139, 153, 20, 14, P.greenDark); R(143, 160, 12, 4, P.grass)
      // bed
      R(104, 196, 8, 48, P.woodDark); R(112, 214, 72, 18, P.white); R(114, 208, 18, 8, P.cream)
      R(134, 218, 50, 14, P.red); R(134, 218, 50, 2, '#d0655a')
      R(112, 232, 72, 6, P.wood); R(114, 238, 4, 6, P.woodDark); R(178, 238, 4, 6, P.woodDark)
      // nightstand + lamp
      R(88, 224, 14, 20, P.wood); R(90, 230, 10, 2, P.woodDark)
      R(94, 216, 2, 8, P.woodDark); R(89, 208, 12, 8, P.gold); R(91, 206, 8, 2, P.gold)
      // rug
      R(100, 240, 92, 4, '#7a3a2a'); R(104, 240, 84, 1, P.terracotta)

      // bathroom: shower head, tub, toilet, sink, mirror
      R(214, 150, 4, 30, P.steel); R(210, 178, 12, 4, P.steel)
      R(210, 214, 78, 30, P.white); R(206, 210, 86, 6, '#d6d6cc'); R(214, 222, 70, 6, P.water); R(214, 222, 70, 2, P.glassLight)
      R(212, 240, 6, 4, P.steel); R(280, 240, 6, 4, P.steel)
      R(306, 200, 18, 22, P.white); R(298, 222, 26, 10, P.white); R(300, 232, 12, 12, P.white); R(304, 202, 14, 4, P.steel)
      R(346, 214, 14, 30, P.white); R(334, 208, 36, 10, P.white); R(340, 210, 24, 4, P.glass); R(350, 200, 2, 8, P.steel)
      R(336, 160, 26, 36, P.woodDark); R(340, 164, 18, 28, P.glassLight); R(342, 166, 6, 10, '#e8f4ff')

      // FINDING: gap around the window (a dark seam + cold draft lines curling in)
      if (isDefect('window')) {
        R(84, 150, 2, 44, P.crack); R(44, 148, 40, 2, P.crack)
        for (let i = 0; i < 3; i++) {
          const off = anim ? frac(t, 1.4, i * 0.45) * 14 : i * 4
          const y = 160 + i * 10 + Math.round(Math.sin((t + i) * 3) * (anim ? 1 : 0))
          R(90 + off, y, 6, 1, P.glassLight); R(96 + off, y - 1, 3, 1, P.glassLight); R(86 + off, y + 1, 4, 1, P.glassLight)
        }
      }
    }

    function drawMain() {
      const { top, bot } = FL.main
      R(IN_L, top, MID - IN_L, bot - top, P.kitchen)
      R(MID + 4, top, IN_R - MID - 4, bot - top, P.living)
      R(MID, top, 4, bot - top, P.woodDark)
      // upstairs floor slab
      R(IN_L, FL.up.bot, IN_R - IN_L, 4, P.floor); R(IN_L, FL.up.bot, IN_R - IN_L, 1, P.floorLight)

      // kitchen: upper cabinets, hood, fridge, counter, sink, stove
      R(80, 256, 76, 32, P.wood); R(80, 256, 76, 2, P.woodLight); R(117, 256, 2, 32, P.woodDark); R(96, 272, 4, 4, P.gold); R(136, 272, 4, 4, P.gold)
      R(158, 260, 34, 16, P.steel); R(160, 262, 30, 12, P.concreteDark); R(172, 276, 6, 8, P.concrete)
      R(40, 296, 32, 70, '#dcdcd4'); R(40, 320, 32, 2, '#b9b9b1'); R(66, 304, 3, 12, P.concreteDark); R(66, 326, 3, 22, P.concreteDark)
      R(80, 322, 76, 6, '#d0d0c8'); R(80, 328, 76, 38, P.wood)
      R(82, 332, 16, 30, P.woodDark); R(90, 344, 2, 6, P.gold) // closed door
      R(100, 330, 36, 34, '#3e2616') // open cabinet showing the trap
      R(136, 330, 18, 34, P.woodDark); R(140, 344, 2, 6, P.gold)
      R(100, 318, 36, 10, P.concreteDark); R(104, 320, 28, 6, P.concreteLight)
      R(116, 306, 3, 12, P.steel); R(116, 304, 10, 3, P.steel)
      R(116, 328, 4, 14, P.concreteLight); R(116, 340, 18, 4, P.concreteLight) // pipe + trap
      R(160, 320, 30, 46, '#cfcfc7'); R(160, 320, 30, 6, P.steelDark); R(164, 322, 6, 2, '#5a5a60'); R(178, 322, 6, 2, '#5a5a60')
      R(164, 336, 22, 14, P.steelDark); R(166, 338, 18, 4, '#3a3a40'); R(164, 330, 22, 2, P.steel)

      // FINDING: leaking pipe under the sink
      if (isDefect('pipe')) {
        R(122, 342, 6, 2, P.rustDark)
        fallingDrop(126, 344, 360, 1.3)
        R(108, 362, 24, 2, P.water); R(112, 364, 16, 2, P.water)
      }

      // living room: stairs, sofa, picture, floor lamp, rug
      for (let i = 0; i < 8; i++) {
        const x = 206 + i * 8, sy = bot - (i + 1) * 14
        R(x, sy, 8, bot - sy, P.wood); R(x, sy, 8, 2, P.woodLight); R(x + 7, sy, 1, 14, P.woodDark)
      }
      R(270, top, 4, bot - top - 14 * 8 + 2, P.woodDark) // stairwell trim
      if (isDefect('handrail')) {
        // FINDING: missing handrail. Just two broken baluster stubs and a dangling piece.
        R(214, stepTop(214) - 10, 2, 10, P.woodDark); R(230, stepTop(230) - 6, 2, 6, P.woodDark)
        R(216, stepTop(214) - 14, 6, 2, P.woodDark)
        R(262, stepTop(262) - 2, 8, 2, P.woodDark)
      } else {
        for (let x = 206; x < 270; x += 2) R(x, stepTop(x) - 26, 2, 3, P.woodDark)
        for (let x = 210; x < 270; x += 12) R(x, stepTop(x) - 24, 2, 24, P.woodDark)
        R(266, stepTop(266) - 32, 4, 6, P.woodDark)
      }
      R(284, 322, 72, 18, '#a0523a'); R(280, 336, 80, 16, P.terracotta); R(280, 336, 80, 2, '#d68a5a')
      R(280, 322, 8, 30, '#a0523a'); R(348, 322, 8, 30, '#a0523a'); R(284, 352, 4, 14, P.woodDark); R(350, 352, 4, 14, P.woodDark)
      R(292, 324, 20, 12, '#d0655a'); R(322, 324, 20, 12, '#d0655a')
      R(296, 268, 44, 28, P.gold); R(300, 272, 36, 20, P.greenDark); R(306, 282, 24, 6, P.grass); R(318, 274, 6, 6, P.cream)
      R(361, 300, 2, 66, P.woodDark); R(354, 292, 16, 10, P.gold)
      R(278, 362, 84, 4, '#7a3a2a')

      // FINDING: mold on the living-room ceiling, right under the tub
      if (isDefect('mold')) {
        R(302, top, 40, 6, '#c9b48a')
        const spots = [[304, 250], [310, 253], [318, 249], [322, 254], [330, 251], [336, 249], [314, 257], [326, 258], [308, 258], [338, 255]]
        for (let i = 0; i < spots.length; i++) {
          const [sx, sy] = spots[i]
          R(sx, sy, 3, 2, i % 3 ? P.mold : P.moldDark)
        }
        R(312, 254, 12, 2, P.mold); R(328, 253, 8, 2, P.moldDark)
      }
    }

    function drawBasement() {
      const { top, bot } = FL.base
      R(IN_L, top, IN_R - IN_L, bot - top, P.concrete)
      for (let y = top + 10; y < bot; y += 12) R(IN_L, y, IN_R - IN_L, 1, P.concreteDark)
      for (let y = top + 10, k = 0; y < bot; y += 12, k++) for (let x = IN_L + (k % 2) * 16; x < IN_R; x += 32) R(x, y, 1, 12, P.concreteDark)
      R(IN_L, FL.main.bot, IN_R - IN_L, 4, P.floor); R(IN_L, FL.main.bot, IN_R - IN_L, 1, P.floorLight)
      R(IN_L, bot - 4, IN_R - IN_L, 4, P.concreteLight)

      // water heater
      R(74, top, 4, 46, P.concreteLight); R(74, 412, 8, 4, P.concreteLight)
      R(62, 416, 32, 6, '#bdbdb4'); R(60, 420, 36, 74, '#d8d8d0'); R(64, 428, 6, 60, '#e6e6de'); R(60, 488, 36, 6, '#bdbdb4')
      R(76, 452, 6, 6, P.steelDark); R(78, 454, 2, 2, P.red)
      if (isDefect('heater')) {
        // FINDING: rust creeping up from the bottom, with streaks
        const spots = [[62, 486], [68, 490], [76, 488], [84, 484], [90, 490], [66, 480], [80, 478], [88, 474], [72, 474], [62, 476]]
        for (let i = 0; i < spots.length; i++) {
          const [sx, sy] = spots[i]
          R(sx, sy, 4, 3, i % 2 ? P.rust : P.rustDark)
        }
        R(60, 486, 36, 8, P.rustDark); R(64, 482, 8, 4, P.rust); R(84, 480, 10, 6, P.rust)
        R(70, 462, 2, 20, P.rust); R(88, 456, 2, 24, P.rustDark)
        R(80, 490, 14, 4, P.rustDark)
      }

      // furnace + duct
      R(132, top, 20, 56, P.concreteLight); R(132, top, 20, 2, P.steel)
      R(116, 426, 52, 68, P.concreteLight); R(120, 430, 44, 60, P.concreteDark); R(124, 436, 36, 22, P.steelDark)
      R(136, 470, 12, 12, P.steelDark)
      R(138, 474 + (anim ? Math.round(noise(Math.floor(t * 8), 3) * 2) : 0), 8, 6, '#e07a2a'); R(140, 478, 4, 3, P.gold)

      // shelves with boxes
      R(200, 430, 84, 3, P.woodDark); R(200, 462, 84, 3, P.woodDark); R(202, 430, 3, 64, P.woodDark); R(279, 430, 3, 64, P.woodDark)
      R(208, 412, 22, 18, P.wood); R(208, 418, 22, 2, P.woodLight); R(236, 416, 30, 14, P.woodDark); R(236, 420, 30, 2, P.wood)
      R(210, 444, 30, 18, P.wood); R(210, 450, 30, 2, P.woodLight); R(246, 448, 26, 14, P.terracotta)
      R(212, 470, 36, 24, P.woodDark); R(212, 476, 36, 2, P.wood); R(252, 478, 22, 16, P.wood)

      // electrical panel
      R(300, 396, 36, 50, P.steel); R(304, 400, 28, 42, P.steelDark)
      for (let i = 0; i < 5; i++) {
        R(308, 404 + i * 7, 8, 4, i % 2 ? '#8a8a82' : P.gold)
        R(320, 404 + i * 7, 8, 4, i % 3 ? '#8a8a82' : P.steel)
      }
      R(318, 396, 2, 50, '#8a8a82')
      R(316, top, 4, 26, '#6e6e67') // conduit
      if (isDefect('panel')) {
        // FINDING: old wiring. A scorch mark and flickering sparks at the corner.
        R(326, 438, 10, 8, '#3a2a20'); R(328, 446, 12, 4, '#2a1d13')
        R(322, 430, 4, 2, '#3a3a30'); R(324, 442, 2, 4, '#3a3a30')
        const k = Math.floor(t * 12)
        for (let i = 0; i < 4; i++) {
          const n = noise(k, i + 7)
          if (!anim ? i < 2 : n > 0.45) {
            const sx = 328 + Math.round(noise(k, i + 20) * 12), sy = 436 + Math.round(noise(k, i + 40) * 12)
            R(sx, sy, 2, 2, n > 0.8 ? P.spark : P.sparkGold)
          }
        }
      }

      // FINDING: a crack from the floor up the foundation wall
      if (isDefect('crack')) {
        jag([[50, bot - 2], [44, 482], [48, 470], [40, 458], [46, 448], [36, 436], [40, 428]], P.crack)
        jag([[46, 448], [54, 442]], P.crack, 1)
        jag([[44, 482], [36, 486]], P.crack, 1)
        R(48, bot - 6, 6, 2, P.concreteDark)
      }
    }

    function drawStatusBar() {
      R(0, BAR.top, 400, BAR.bot - BAR.top, P.panel)
      R(0, BAR.top, 400, 2, P.greenDark); R(0, BAR.top + 2, 400, 1, P.gold)
      arcade.text(`FOUND ${found.size}/7`, 12, BAR.top + 12, { size: 10, color: P.gold })
      arcade.text(`MISSES ${misses}`, 12, BAR.top + 30, { size: 8, color: '#a3b4a8' })
      for (let i = 0; i < 7; i++) {
        const x = 236 + i * 22
        R(x, BAR.top + 10, 16, 16, i < found.size ? P.green : P.greenDark)
        R(x + 2, BAR.top + 12, 12, 12, i < found.size ? P.green : P.panel)
        if (i < found.size) SPR(CHECK, x + 2, BAR.top + 13, 2)
      }
      arcade.text('TAP WHAT LOOKS WRONG', 388, BAR.top + 30, { size: 8, color: '#a3b4a8', align: 'right' })
    }

    function drawHouse() {
      drawSky()
      drawGround()
      drawRoofAndAttic()
      drawShell()
      drawUpstairs()
      drawMain()
      drawBasement()
    }

    function drawMarks() {
      for (const m of marks) {
        const a = m.kind === 'check' ? 1 : Math.max(0, 1 - m.age / m.life)
        arcade.ctx.save()
        arcade.ctx.globalAlpha = a
        if (m.kind === 'check') {
          R(m.x - 9, m.y - 8, 18, 16, 'rgba(12,33,29,.55)')
          SPR(CHECK, m.x - 7, m.y - 6, 2)
        } else {
          const s = 2 + Math.round(m.age * 6)
          SPR(XMARK, m.x - 2.5 * s, m.y - 2.5 * s, s)
        }
        arcade.ctx.restore()
      }
    }

    function drawPopups() {
      for (const p of popups) {
        const a = p.age < p.life - 0.5 ? 1 : Math.max(0, (p.life - p.age) / 0.5)
        const size = 9, w = p.text.length * size + 14, h = 20
        const lift = Math.min(10, p.age * 24)
        const x = arcade.clamp(p.x - w / 2, 4, 396 - w), y = arcade.clamp(p.y - 36 - lift, 30, 540)
        arcade.ctx.save()
        arcade.ctx.globalAlpha = a
        R(x, y, w, h, P.sky); R(x + 1, y + 1, w - 2, h - 2, P.panel); R(x, y, w, 1, p.color); R(x, y + h - 1, w, 1, p.color)
        arcade.text(p.text, x + w / 2, y + 6, { size, color: p.color, align: 'center' })
        arcade.ctx.restore()
      }
    }

    function drawCursor() {
      if (!cursor.visible) return
      const x = Math.round(cursor.x), y = Math.round(cursor.y)
      arcade.ctx.save()
      arcade.ctx.globalAlpha = 0.18
      R(x - 8, y - 8, 16, 16, P.gold)
      arcade.ctx.restore()
      SPR(CURSOR, x - 9, y - 9, 2)
    }

    /* ---------- game logic ---------- */
    function syncStats() {
      arcade.stats = { found: found.size, misses }
      arcade.hint(`Found ${found.size}/7`)
    }

    function tap(x, y) {
      if (doneAt >= 0) return
      cursor.x = x; cursor.y = y; cursor.visible = true
      let best = null, bestD = HIT_R
      for (const f of FINDINGS) {
        if (!active.has(f.id)) continue
        const d = Math.hypot(f.x - x, f.y - y)
        if (d <= bestD) { best = f; bestD = d }
      }
      if (best && found.has(best.id)) return // re-tapping a solved finding costs nothing
      if (best) {
        found.add(best.id)
        arcade.score += 100
        arcade.coins += 5
        arcade.sound.coin()
        marks.push({ x: best.x, y: best.y, kind: 'check', age: 0, life: Infinity })
        popups.push({ x: best.x, y: best.y, text: best.label, color: P.green, age: 0, life: 1.8 })
        syncStats()
        if (found.size === 7) {
          arcade.score += Math.round(arcade.timeLeft * 5)
          doneAt = t
          popups.push({ x: 200, y: 330, text: 'CLEAN SWEEP', color: P.gold, age: 0, life: 3 })
        }
      } else {
        misses++
        arcade.score = Math.max(0, arcade.score - 20)
        arcade.sound.hit()
        marks.push({ x, y, kind: 'x', age: 0, life: 0.7 })
        syncStats()
      }
    }

    return {
      init() {
        t = 0
        found = new Set()
        misses = 0
        marks = []
        popups = []
        doneAt = -1
        const pool = FINDINGS.map((f) => f.id)
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[pool[i], pool[j]] = [pool[j], pool[i]]
        }
        active = new Set(pool.slice(0, 7))
        syncStats()
      },
      update(dt) {
        t += dt
        for (const m of marks) m.age += dt
        marks = marks.filter((m) => m.age < m.life)
        for (const p of popups) p.age += dt
        popups = popups.filter((p) => p.age < p.life)
        if (doneAt >= 0 && t - doneAt > 0.8) {
          arcade.end({
            won: true,
            title: 'Nothing gets past you.',
            message: `All 7 findings in ${Math.round(arcade.elapsed)}s.`,
            stats: { found: 7, misses },
          })
        }
      },
      draw(ctx) {
        drawHouse()
        drawMarks()
        drawPopups()
        drawStatusBar()
        drawCursor()
      },
      drawIdle(ctx) {
        // the house with nothing wrong yet, so the start card sits on a warm scene
        const saved = active
        active = new Set()
        drawHouse()
        R(0, BAR.top, 400, BAR.bot - BAR.top, P.panel)
        R(0, BAR.top, 400, 2, P.greenDark); R(0, BAR.top + 2, 400, 1, P.gold)
        arcade.text('7 HIDDEN FINDINGS', 200, BAR.top + 18, { size: 10, color: P.gold, align: 'center' })
        active = saved
      },
      pointerDown(x, y) {
        tap(x, y)
      },
      pointerMove(x, y) {
        cursor.x = x; cursor.y = y; cursor.visible = true
      },
      pointerUp() {},
      keyDown() {},
    }
  },
}
