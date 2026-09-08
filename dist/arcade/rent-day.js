// Rent Day — Bartleby Quill has come to collect.
// Your rent coins fly out of your purse toward the landlord all on their own. Slide the strongbox
// along the floor and keep what you can. Every coin you catch is a coin that stays yours.
// All art is drawn in code from pixel maps. Plugs into arcade-core.js.

const W = 400,
  H = 600,
  DURATION = 40

/* ---------- palette ---------- */
const GOLD = '#efd08a',
  WALL = '#183429',
  WALL_LINE = '#112a22',
  WOOD = '#6b4a2a',
  WOOD_DARK = '#4a3220',
  WOOD_LIGHT = '#8a6238',
  CREAM = '#f0f0df',
  RED = '#e8574a',
  MUTED = '#a3b4a8',
  PARCH = '#d8bd85',
  INK = '#2a1c14',
  BRICK = '#7a4438',
  BRICK_DARK = '#5a3128',
  FLOOR_A = '#3a2a1c',
  FLOOR_B = '#33241a',
  IRON = '#3a3a4a',
  IRON_LIGHT = '#6a6f80',
  PLUM = '#5f2b4d',
  PLUM_LIGHT = '#7d3a66'

const FONT = '"Press Start 2P", "Courier New", monospace'

/* ---------- Bartleby Quill (original pixel sprite, 18 x 34) ---------- */
// Drawn in three pieces so the hat can tip and the legs can stride.
const BQ = {
  H: '#241826', // hat / boots
  G: GOLD, // hat band, coat buttons, ledger clasp
  S: '#f0c4a0', // skin
  E: '#1c1c28', // eyes
  M: '#3a2418', // waxed moustache
  T: '#fff6d5', // delighted grin
  W: '#e9dcc0', // shirt and collar
  P: PLUM, // plum coat
  Q: PLUM_LIGHT,
  L: '#7a4a20', // ledger boards
  C: '#e9dcc0', // ledger pages
  K: '#241826', // trousers and boots
}
const BQ_HAT = [
  '......HHHHHH......',
  '......HHHHHH......',
  '......HHHHHH......',
  '......HHHHHH......',
  '......HHHHHH......',
  '......GGGGGG......',
  '......HHHHHH......',
  '......HHHHHH......',
  '.....HHHHHHHH.....',
  '....HHHHHHHHHH....',
]
const BQ_BODY = [
  '......SSSSSS......',
  '......EESSEE......',
  '......SESSES......',
  '.....MSSSSSSM.....',
  '.....MMSSSSMM.....',
  '......STTTTS......',
  '.......SSSS.......',
  '......WWWWWW......',
  '....PPPPPPPPPP....',
  '.LLLLPPWWWWPPPP...',
  '.LCCLPPPWWPPPSS...',
  '.LCCLPPPWWPPPSSS..',
  '.LGGLPPPWWPPPSS...',
  '.LLLLPPPWWPPP.....',
  '......PPWWPP......',
  '......PPGGPP......',
  '......PPWWPP......',
  '.....PPPWWPPP.....',
  '....PPPP..PPPP....',
]
const BQ_LEGS_A = [
  '.....KKK..KKK.....',
  '.....KKK..KKK.....',
  '.....KKK..KKK.....',
  '....KKKK..KKKK....',
  '...KKKKK..KKKKK...',
  '...KKKKK..KKKKK...',
]
const BQ_LEGS_B = [
  '....KKK....KKK....',
  '...KKK......KKK...',
  '..KKK........KKK..',
  '..KKK........KKK..',
  '.KKKKK......KKKKK.',
  '.KKKKK......KKKKK.',
]
const BQ_S = 4,
  BQ_W = 18 * BQ_S, // 72
  BQ_H = 35 * BQ_S, // 140
  BQ_BODY_ROW = 10,
  BQ_LEGS_ROW = 29,
  BQ_PALM = { col: 14, row: 21 }

/* ---------- the strongbox you control ---------- */
const BOX = {
  map: [
    'AAAAAAAAAAAAAAAAAAAAAA',
    'AGGGGGGGGGGGGGGGGGGGGA',
    'IJ..................JI',
    'IJ..................JI',
    'IJ..................JI',
    'IJ..................JI',
    'IJ..................JI',
    'IJ..................JI',
    'IJ..................JI',
    'IJ..................JI',
    'IJ..................JI',
    'IIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIGGGGGGIIIIIIII',
    'IIIIIIIIGGKKGGIIIIIIII',
    'IIIIIIIIGGGGGGIIIIIIII',
    'KKKK..............KKKK',
  ],
  legend: { A: '#a06e30', G: GOLD, I: IRON, J: IRON_LIGHT, K: '#151520' },
}
const BOX_LID = {
  map: ['AAAAAAAAAAAAAAAAAA', 'AIIIIIIIIIIIIIIIIA', 'AIJJJJJJJJJJJJJJIA', 'AAAAAAAAAAAAAAAAAA'],
  legend: { A: '#a06e30', I: IRON, J: IRON_LIGHT },
}
const BOX_S = 3,
  BOX_W = 66,
  BOX_H = 48,
  BOX_Y = 466,
  MOUTH_Y = BOX_Y + 6, // the catch line
  IN_X = 6,
  IN_W = 54,
  IN_Y = 6,
  IN_H = 27

/* ---------- coins, indignities, props ---------- */
const COIN_FRAMES = [
  ['..GGGG..', '.GYYYYG.', 'GYYWWYYG', 'GYWYYWYG', 'GYWYYWYG', 'GYYWWYYG', '.GYYYYG.', '..GGGG..'],
  ['..GGGG..', '..GYYG..', '.GYWWYG.', '.GYWWYG.', '.GYWWYG.', '.GYWWYG.', '..GYYG..', '..GGGG..'],
  ['...GG...', '...GG...', '..GYYG..', '..GYYG..', '..GYYG..', '..GYYG..', '...GG...', '...GG...'],
  ['..GGGG..', '..GYYG..', '.GYWWYG.', '.GYWWYG.', '.GYWWYG.', '.GYWWYG.', '..GYYG..', '..GGGG..'],
]
const COIN_LEGEND = { G: '#a06e30', Y: GOLD, W: '#fff6d5' }
// spin order: the edge-on frame only gets a sixth of the cycle so a coin always reads as a coin
const COIN_SPIN = [0, 0, 1, 2, 1, 3]

const PAINT = {
  map: [
    '.MMMMMMMM.',
    '.M......M.',
    'MMMMMMMMMM',
    'MCCCCCCCCM',
    'MCCCCCCCCM',
    'MCRRRRRRCM',
    'MCRRRRRRCM',
    'MCCCCCCCCM',
    'MCCCCCCCCM',
    'MMMMMMMMMM',
    '.MMMMMMMM.',
  ],
  legend: { M: '#8a8fa0', C: '#c9ccd6', R: '#5bd6b0' },
}
const NAIL = {
  map: ['.NNNND.', 'NNNNNDD', '..NDD..', '..NDD..', '..NDD..', '..NDD..', '..NDD..', '..NDD..', '...ND..', '...ND..', '...ND..', '....D..'],
  legend: { N: '#c9ccd6', D: '#7d8391' },
}
const PURSE = {
  map: [
    '...LLLL...',
    '..LDDDDL..',
    '.LLLLLLLL.',
    'LBBBBBBBBL',
    'LBBBGGBBBL',
    'LBBBBBBBBL',
    'LBBBBBBBBL',
    '.LLLLLLLL.',
    '..LLLLLL..',
  ],
  legend: { L: '#4a2e14', D: '#1a120a', B: '#a0622c', G: GOLD },
}
const JAR = {
  map: ['.JJJJ.', 'JCCCCJ', 'JCGCCJ', 'JCCCGJ', 'JCGCCJ', 'JCCCCJ', '.JJJJ.'],
  legend: { J: '#7d8391', C: '#2c4a40', G: GOLD },
}

/* ---------- the fees Bartleby invents ---------- */
const FEES = [
  { name: 'CONVENIENCE FEE', lines: ['CONVENIENCE FEE'], coins: 3 },
  { name: 'DOORKNOB TAX', lines: ['DOORKNOB TAX'], coins: 3 },
  { name: 'SUNLIGHT SURCHARGE', lines: ['SUNLIGHT', 'SURCHARGE'], coins: 3 },
  { name: 'GOOD MORNING FEE', lines: ['GOOD MORNING FEE'], coins: 4 },
  { name: 'CARPET BREATHING FEE', lines: ['CARPET', 'BREATHING FEE'], coins: 4 },
  { name: 'RENT WENT UP AGAIN!', lines: ['RENT WENT', 'UP AGAIN!'], coins: 4 },
]
const FEE_TIMES = [4.5, 10.5, 16.5, 22.5, 28, 34] // one of each, so no fee repeats in a round
const ENTRIES = [
  { t: 12, p: 'window' },
  { t: 21, p: 'chimney' },
  { t: 29.5, p: 'door' },
  { t: 36, p: 'chimney' },
]
const PORTALS = {
  door: { x: 292, dx: 140, dy: 0 },
  window: { x: 18, dx: -140, dy: 0 },
  chimney: { x: 164, dx: 0, dy: -320 },
}

/* ---------- layout ---------- */
const FLOOR_Y = 340,
  FEET_Y = 340,
  BART_Y = FEET_Y - BQ_H, // 238
  BART_MIN = 12,
  BART_MAX = W - BQ_W - 12,
  SPAWN_Y = 596,
  LOST_Y = 186

export default {
  id: 'rent-day',
  title: 'Rent Day',
  tagline: 'Rent day again. Bartleby Quill is here for his money. Keep what you can.',
  lesson: 'Rent buys you a month. It never comes back. Money you keep is money that can become a down payment.',
  lessonShort: 'Rent leaves. Savings stay.',
  controls: '◀ ▶ or drag to catch',
  duration: DURATION,
  width: W,
  height: H,
  coinCap: 30,
  touchButtons: true,

  create(arcade) {
    const { rand, pick, clamp } = arcade
    const R = Math.round
    const motion = !arcade.reduceMotion

    /* ---------- state ---------- */
    let boxX = (W - BOX_W) / 2,
      targetX = null,
      dragging = false,
      items = [],
      sparks = [],
      particles = [],
      popups = [],
      bubble = null,
      bart = null,
      feeIdx = 0,
      feeBag = [],
      entryIdx = 0,
      coinTimer = 0,
      nextIndignity = 7,
      shake = 0,
      squash = 0,
      ledgerFlash = 0,
      lastSecond = -1,
      hurryFlash = 0,
      introT = 0,
      purseJiggle = 0,
      streak = 0,
      stats = { saved: 0, lost: 0, fees: 0, indignities: 0 }

    const ramp = () => clamp(arcade.elapsed / DURATION, 0, 1)
    const frantic = () => arcade.timeLeft <= 10

    /* ---------- little helpers ---------- */
    function popup(str, x, y, color = GOLD, size = 10) {
      popups.push({ str, x: R(x), y: R(y), color, size, life: 1, vy: motion ? -30 : -10 })
    }
    function burst(x, y, color, n, up = true) {
      const count = motion ? n : Math.max(2, Math.floor(n / 3))
      for (let i = 0; i < count; i++)
        particles.push({
          x,
          y,
          vx: rand(-80, 80),
          vy: up ? rand(-160, -40) : rand(-40, 60),
          life: rand(0.3, 0.6),
          color,
          size: pick([2, 3, 3, 4]),
        })
    }
    const PALM_X = BQ_PALM.col * BQ_S + BQ_S / 2,
      PALM_FX = (17 - BQ_PALM.col) * BQ_S + BQ_S / 2,
      PALM_DY = BQ_PALM.row * BQ_S + BQ_S / 2
    function palm() {
      const flip = bart.dir < 0
      return { x: bart.drawX + (flip ? PALM_FX : PALM_X), y: bart.drawY + PALM_DY }
    }
    function nextFee() {
      if (!feeBag.length) feeBag = FEES.map((_, i) => i).sort(() => Math.random() - 0.5)
      return FEES[feeBag.pop()]
    }
    function say(lines, dur = 2.3) {
      bubble = { lines, life: dur, dur }
    }

    /* ---------- spawning ---------- */
    function telegraph(x, kind, delay) {
      sparks.push({ x: clamp(x, 22, W - 22), kind, t: delay, max: delay })
    }
    function launch(x, kind) {
      const base = (108 + ramp() * 92) * (frantic() ? 1.15 : 1)
      if (kind === 'coin') {
        items.push({
          kind,
          x: x - 12,
          y: SPAWN_Y,
          w: 24,
          h: 24,
          vx: rand(-26, 26),
          vy: -base * rand(0.9, 1.12),
          spin: rand(0, 4),
          wob: rand(0, 6.28),
        })
      } else if (kind === 'paint') {
        items.push({ kind, x: x - 15, y: SPAWN_Y, w: 30, h: 33, vx: rand(-18, 18), vy: -base * 0.72, spin: 0, wob: rand(0, 6.28) })
      } else {
        items.push({ kind, x: x - 10, y: SPAWN_Y, w: 21, h: 36, vx: rand(-18, 18), vy: -base * 0.78, spin: 0, wob: rand(0, 6.28) })
      }
      purseJiggle = 0.2
    }

    function fee() {
      const f = nextFee()
      stats.fees++
      say(f.lines, 2.4)
      arcade.sound.beep(196, 0.16, 'sawtooth', 0.12, 90)
      setTimeout(() => arcade.sound.beep(147, 0.2, 'sawtooth', 0.1, -40), 130)
      if (motion) shake = 0.3
      const n = f.coins + (frantic() ? 1 : 0)
      for (let i = 0; i < n; i++) telegraph(rand(30, W - 30), 'coin', 0.5 + i * 0.34)
      popup('INCOMING!', W / 2, 430, GOLD, 10)
    }

    /* ---------- outcomes ---------- */
    function keepIt(it) {
      const cx = it.x + it.w / 2
      if (it.kind === 'coin') {
        stats.saved++
        streak++
        arcade.coins = Math.min(30, arcade.coins + 1)
        arcade.score += 10
        popup('+10', cx, BOX_Y - 20, GOLD, 10)
        arcade.sound.coin()
        burst(cx, MOUTH_Y, GOLD, 9)
        if (streak > 0 && streak % 6 === 0) {
          arcade.score += 20
          popup('KEPT ' + streak + ' IN A ROW +20', W / 2, BOX_Y - 44, '#fff6d5', 8)
          arcade.sound.beep(1568, 0.12, 'square', 0.1)
          say(['HMPH.'], 1.2)
        }
      } else {
        stats.indignities++
        arcade.score += 25
        const line = it.kind === 'paint' ? ["YOU CAN'T PAINT", 'THE WALLS'] : ['NO NAILS', 'IN THE WALLS']
        popup(line[0], cx, BOX_Y - 46, '#5bd6b0', 8)
        popup(line[1], cx, BOX_Y - 32, '#5bd6b0', 8)
        popup('+25', cx, BOX_Y - 18, GOLD, 10)
        arcade.sound.beep(523, 0.09, 'triangle', 0.12)
        setTimeout(() => arcade.sound.beep(784, 0.14, 'triangle', 0.12), 80)
        burst(cx, MOUTH_Y, '#5bd6b0', 10)
      }
      squash = 0.14
    }
    function collected(it) {
      stats.lost++
      streak = 0
      ledgerFlash = 0.5
      bart.tip = 0.45
      bart.collected++
      arcade.sound.beep(233, 0.13, 'square', 0.09, -90)
      const p = palm()
      burst(p.x, p.y, '#a06e30', 6, false)
      popup('-1', p.x, p.y - 22, RED, 8)
      if (bart.collected % 5 === 0 && !bubble) say(['THANK YOU', 'KINDLY.'], 1.5)
    }

    /* ---------- the cottage ---------- */
    function drawRoom(ctx, t) {
      // back wall
      arcade.rect(0, 0, W, FLOOR_Y, WALL)
      for (let x = 0; x < W; x += 40) arcade.rect(x, 32, 2, FLOOR_Y - 32, WALL_LINE)
      arcade.rect(0, FLOOR_Y - 6, W, 6, '#14291f')

      // chimney breast + fireplace
      arcade.rect(168, 56, 64, 152, BRICK_DARK)
      for (let y = 56; y < 208; y += 10)
        for (let x = 168; x < 232; x += 16) arcade.rect(x + (((y / 10) | 0) % 2 ? 8 : 0), y, 14, 8, BRICK)
      arcade.rect(140, 196, 120, 14, WOOD)
      arcade.rect(140, 208, 120, 4, WOOD_DARK)
      arcade.rect(140, 196, 120, 2, WOOD_LIGHT)
      arcade.rect(148, 212, 104, 128, BRICK_DARK)
      for (let y = 212; y < 340; y += 10)
        for (let x = 148; x < 252; x += 16) arcade.rect(x + (((y / 10) | 0) % 2 ? 8 : 0), y, 14, 8, BRICK)
      arcade.rect(164, 240, 72, 100, '#180f0c') // the opening he drops out of
      // embers
      const glow = motion ? 0.6 + Math.sin(t * 4) * 0.4 : 1
      arcade.rect(176, 320, 48, 8, WOOD_DARK)
      arcade.rect(182, 314, 12, 8, '#5a3128')
      arcade.rect(206, 314, 12, 8, '#5a3128')
      arcade.rect(190, 322, 20, 4, glow > 0.7 ? '#f2a44b' : '#b8453a')
      arcade.rect(184, 306, 8, 10, glow > 0.7 ? '#e8574a' : '#b8453a')
      arcade.rect(196, 300, 8, 16, '#f2a44b')
      arcade.rect(208, 306, 8, 10, glow > 0.7 ? '#b8453a' : '#e8574a')
      arcade.rect(198, 306, 4, 6, '#fff6d5')
      // a candlestick and a jar on the mantel
      arcade.rect(158, 182, 6, 14, '#c9ccd6')
      arcade.rect(159, 176, 4, 6, '#f2a44b')
      arcade.sprite(JAR.map, JAR.legend, 236, 172, 4)

      // window (left) — rainy evening outside
      arcade.rect(22, 92, 84, 80, WOOD_DARK)
      arcade.rect(28, 98, 72, 68, '#1d3b5a')
      arcade.rect(28, 98, 34, 32, '#27507a')
      arcade.rect(66, 98, 34, 32, '#27507a')
      arcade.rect(28, 134, 34, 32, '#1d3b5a')
      arcade.rect(66, 134, 34, 32, '#1d3b5a')
      arcade.rect(60, 98, 6, 68, WOOD_DARK)
      arcade.rect(28, 128, 72, 6, WOOD_DARK)
      arcade.rect(18, 168, 92, 8, WOOD)
      arcade.rect(74, 104, 10, 6, '#7fb3d5')

      // door (right)
      arcade.rect(292, 140, 84, 200, WOOD_DARK)
      arcade.rect(298, 146, 72, 194, WOOD)
      arcade.rect(304, 154, 26, 78, WOOD_DARK)
      arcade.rect(338, 154, 26, 78, WOOD_DARK)
      arcade.rect(304, 240, 60, 88, WOOD_DARK)
      arcade.rect(306, 250, 8, 8, GOLD) // knob (taxed)
      arcade.rect(292, 140, 84, 4, WOOD_LIGHT)

      // framed picture on the wall
      arcade.rect(96, 216, 44, 38, WOOD_DARK)
      arcade.rect(100, 220, 36, 30, '#2c4a40')
      arcade.rect(104, 236, 28, 10, '#3f6e4a')
      arcade.rect(112, 226, 12, 12, '#c9a86a')

      // floor
      for (let y = FLOOR_Y; y < H; y += 22) {
        arcade.rect(0, y, W, 22, ((y / 22) | 0) % 2 ? FLOOR_A : FLOOR_B)
        arcade.rect(0, y, W, 2, '#241a11')
      }
      for (let x = 0; x < W; x += 66) arcade.rect(x, FLOOR_Y, 2, H - FLOOR_Y, '#241a11')
      for (let y = FLOOR_Y + 10; y < H; y += 44)
        for (let x = 14; x < W; x += 132) arcade.rect(x, y, 26, 2, '#2c2015') // plank grain
      // skirting board where the wall meets the floor
      arcade.rect(0, FLOOR_Y - 12, W, 12, '#22402f')
      arcade.rect(0, FLOOR_Y - 12, W, 2, '#2c503c')

      // rug
      arcade.rect(58, 520, 284, 62, '#5c2f34')
      arcade.rect(64, 526, 272, 50, '#7a3f42')
      arcade.rect(96, 536, 208, 30, '#5c2f34')
      arcade.rect(130, 544, 140, 14, '#a3565a')
      for (let x = 58; x < 342; x += 12) arcade.rect(x, 582, 6, 5, '#5c2f34')

      // your purse (leaking) and a coin jar
      const jig = purseJiggle > 0 && motion ? R(Math.sin(purseJiggle * 60) * 2) : 0
      arcade.sprite(PURSE.map, PURSE.legend, 16 + jig, 542, 3)
      arcade.text('YOUR PURSE', 48, 528, { size: 8, color: MUTED, align: 'center' })
      arcade.sprite(JAR.map, JAR.legend, 344, 546, 4)
    }

    function drawLedgerStrip(ctx) {
      arcade.rect(0, 30, W, 26, INK)
      arcade.rect(4, 32, W - 8, 22, ledgerFlash > 0 ? '#f0d9a0' : PARCH)
      arcade.rect(4, 32, W - 8, 2, '#efe4c8')
      arcade.text("BARTLEBY'S LEDGER", 12, 38, { size: 8, color: INK, shadow: false })
      arcade.text('COLLECTED ' + (bart ? bart.collected : 0), W - 12, 38, {
        size: 8,
        color: ledgerFlash > 0 ? '#8a1f1f' : INK,
        align: 'right',
        shadow: false,
      })
    }

    function drawBartleby(ctx, t) {
      if (!bart.visible) return
      const x = R(bart.drawX),
        y = R(bart.drawY),
        flip = bart.dir < 0
      // shadow
      arcade.rect(x + 8, FEET_Y - 2, BQ_W - 16, 4, 'rgba(0,0,0,.35)')
      const stride = bart.mode === 'walk' && motion ? Math.floor(t * 6) % 2 : 0
      const tipping = bart.tip > 0
      const hx = x + (tipping ? (flip ? -4 : 4) : 0)
      const hy = y - (tipping ? 9 : 0)
      arcade.sprite(BQ_HAT, BQ, hx, hy, BQ_S, flip)
      arcade.sprite(BQ_BODY, BQ, x, y + BQ_BODY_ROW * BQ_S, BQ_S, flip)
      arcade.sprite(stride ? BQ_LEGS_B : BQ_LEGS_A, BQ, x, y + BQ_LEGS_ROW * BQ_S, BQ_S, flip)
      // the open, expectant palm
      const p = palm()
      if (motion && Math.floor(t * 5) % 2 === 0) arcade.rect(p.x - 6, p.y - 4, 12, 3, '#ffe9b8')
    }

    function drawBox(ctx, t) {
      const x = R(boxX),
        y = BOX_Y + (squash > 0 ? 3 : 0)
      arcade.rect(x + 4, BOX_Y + BOX_H, BOX_W - 8, 4, 'rgba(0,0,0,.4)')
      arcade.sprite(BOX_LID.map, BOX_LID.legend, x + 6, y - 12, BOX_S)
      arcade.rect(x + 12, y - 4, 6, 6, IRON) // hinges
      arcade.rect(x + BOX_W - 18, y - 4, 6, 6, IRON)
      arcade.rect(x + IN_X, y + IN_Y, IN_W, IN_H, '#23282f')
      arcade.rect(x + IN_X, y + IN_Y, IN_W, 3, '#171b21')
      // savings level: eased so the first few coins are visible
      const frac = Math.min(arcade.coins, 30) / 30
      const fill = frac > 0 ? Math.max(4, R(IN_H * Math.pow(frac, 0.72))) : 0
      if (fill > 0) {
        const fy = y + IN_Y + IN_H - fill
        arcade.rect(x + IN_X, fy, IN_W, fill, '#a06e30')
        arcade.rect(x + IN_X, fy, IN_W, 3, GOLD)
        for (let i = 0; i < IN_W - 6; i += 9) arcade.rect(x + IN_X + i + 2, fy + 5, 5, 2, '#c9a24e')
        if (frac >= 1 && (!motion || Math.floor(t * 4) % 2 === 0)) arcade.rect(x + IN_X + 24, fy - 4, 4, 4, '#fff6d5')
      }
      arcade.sprite(BOX.map, BOX.legend, x, y, BOX_S)
      // "this is the bit you move"
      if (introT < 6) {
        const a = clamp(6 - introT, 0, 1)
        ctx.globalAlpha = motion ? a * (0.6 + 0.4 * Math.abs(Math.sin(t * 4))) : a
        for (let i = 0; i < 3; i++) {
          arcade.rect(x - 10 - i * 3, BOX_Y + 16 - i * 3, 3, 6 + i * 6, GOLD)
          arcade.rect(x + BOX_W + 7 + i * 3, BOX_Y + 16 - i * 3, 3, 6 + i * 6, GOLD)
        }
        ctx.globalAlpha = 1
      }
      arcade.rect(x + BOX_W / 2 - 21, BOX_Y + BOX_H + 3, 42, 13, 'rgba(10,26,22,.82)')
      arcade.text('KEEP', x + BOX_W / 2, BOX_Y + BOX_H + 6, { size: 8, color: GOLD, align: 'center' })
    }

    function drawItem(ctx, it, t) {
      const x = R(it.x),
        y = R(it.y)
      if (it.kind === 'coin') {
        arcade.sprite(COIN_FRAMES[COIN_SPIN[Math.floor(it.spin) % COIN_SPIN.length]], COIN_LEGEND, x, y, 3)
      } else if (it.kind === 'paint') {
        const wob = motion ? R(Math.sin(t * 5 + it.wob) * 2) : 0
        arcade.sprite(PAINT.map, PAINT.legend, x + wob, y, 3)
      } else {
        const wob = motion ? R(Math.sin(t * 5 + it.wob) * 2) : 0
        arcade.sprite(NAIL.map, NAIL.legend, x + wob, y, 3)
      }
    }

    function drawBubble(ctx, cx, bottomY, b) {
      const size = 9,
        lh = 15,
        padX = 10,
        padY = 8
      ctx.save()
      ctx.font = `${size}px ${FONT}`
      let tw = 0
      for (const l of b.lines) tw = Math.max(tw, ctx.measureText(l).width)
      ctx.restore()
      const bw = Math.max(76, Math.ceil(tw) + padX * 2),
        bh = b.lines.length * lh + padY * 2 - 4
      const bx = clamp(cx - bw / 2, 4, W - bw - 4),
        by = bottomY - bh
      const age = b.dur - b.life
      const pop = !motion ? 1 : age < 0.14 ? 0.6 + (age / 0.14) * 0.5 : age < 0.24 ? 1.1 - ((age - 0.14) / 0.1) * 0.1 : 1
      ctx.save()
      ctx.globalAlpha = clamp(b.life / 0.4, 0, 1)
      if (pop !== 1) {
        ctx.translate(cx, bottomY)
        ctx.scale(pop, pop)
        ctx.translate(-cx, -bottomY)
      }
      const tx = clamp(cx, bx + 14, bx + bw - 14)
      arcade.rect(bx + 2, by, bw - 4, bh, INK)
      arcade.rect(bx, by + 2, bw, bh - 4, INK)
      arcade.rect(bx + 3, by + 1, bw - 6, bh - 2, CREAM)
      arcade.rect(bx + 1, by + 3, bw - 2, bh - 6, CREAM)
      arcade.rect(tx - 7, by + bh - 3, 14, 5, INK)
      arcade.rect(tx - 5, by + bh + 2, 10, 4, INK)
      arcade.rect(tx - 3, by + bh + 6, 6, 4, INK)
      arcade.rect(tx - 6, by + bh - 4, 12, 3, CREAM)
      arcade.rect(tx - 4, by + bh, 8, 3, CREAM)
      b.lines.forEach((l, i) =>
        arcade.text(l, bx + bw / 2, by + padY + i * lh - 2, { size, color: INK, align: 'center', shadow: false })
      )
      ctx.restore()
      ctx.globalAlpha = 1
    }

    function newBartleby() {
      return { x: 300, dir: -1, drawX: 300, drawY: BART_Y, mode: 'walk', visible: true, tip: 0, collected: 0, timer: 0, off: null, land: 0 }
    }

    return {
      init() {
        boxX = (W - BOX_W) / 2
        targetX = null
        dragging = false
        items = []
        sparks = []
        particles = []
        popups = []
        bubble = null
        bart = newBartleby()
        feeIdx = 0
        feeBag = []
        entryIdx = 0
        coinTimer = 1.1
        nextIndignity = 7
        shake = 0
        squash = 0
        ledgerFlash = 0
        lastSecond = -1
        hurryFlash = 0
        introT = 0
        purseJiggle = 0
        streak = 0
        stats = { saved: 0, lost: 0, fees: 0, indignities: 0 }
        arcade.stats = stats
        arcade.coins = 0
        arcade.score = 0
        say(['RENT DAY!'], 2)
      },

      pointerDown(x) {
        dragging = true
        targetX = x
      },
      pointerMove(x) {
        if (dragging) targetX = x
      },
      pointerUp(x) {
        dragging = false
        targetX = x
      },
      keyDown(k) {
        if (k === 'action') {
          squash = 0.12
          arcade.sound.beep(320, 0.05, 'square', 0.06)
        }
      },

      update(dt) {
        const t = arcade.elapsed
        introT += dt
        const r = ramp()

        /* --- strongbox --- */
        const speed = 340
        let dir = 0
        if (arcade.keys.has('left')) dir -= 1
        if (arcade.keys.has('right')) dir += 1
        if (dir) {
          boxX += dir * speed * dt
          targetX = null
        } else if (targetX !== null) {
          const d = targetX - (boxX + BOX_W / 2)
          const step = Math.min(Math.abs(d), speed * 1.2 * dt)
          boxX += Math.sign(d) * step
          if (Math.abs(d) < 1) targetX = null
        }
        boxX = clamp(boxX, 2, W - BOX_W - 2)

        /* --- Bartleby --- */
        if (bart.tip > 0) bart.tip -= dt
        if (bart.land > 0) bart.land -= dt
        if (bart.mode === 'walk') {
          const bs = 46 + r * 34
          bart.x += bart.dir * bs * dt
          if (bart.x <= BART_MIN) {
            bart.x = BART_MIN
            bart.dir = 1
          } else if (bart.x >= BART_MAX) {
            bart.x = BART_MAX
            bart.dir = -1
          }
          bart.drawX = bart.x
          bart.drawY = BART_Y + (motion ? -Math.abs(Math.sin(t * 6)) * 4 : 0)
          if (entryIdx < ENTRIES.length && t >= ENTRIES[entryIdx].t) {
            bart.mode = 'gone'
            bart.timer = 0.5
            burst(bart.x + BQ_W / 2, BART_Y + 50, '#8a8fa0', 10, false)
            arcade.sound.beep(520, 0.1, 'square', 0.08, -280)
          }
        } else if (bart.mode === 'gone') {
          bart.visible = false
          bart.timer -= dt
          if (bart.timer <= 0) {
            const e = ENTRIES[entryIdx++]
            const p = PORTALS[e.p]
            bart.portal = e.p
            bart.x = p.x
            bart.dir = p.x < W / 2 ? 1 : -1
            bart.off = { dx: p.dx, dy: p.dy }
            bart.mode = 'enter'
            bart.timer = e.p === 'chimney' ? 0.55 : 0.5
            bart.max = bart.timer
            bart.visible = true
          }
        } else if (bart.mode === 'enter') {
          bart.timer -= dt
          const k = clamp(bart.timer / bart.max, 0, 1)
          const ease = k * k
          bart.drawX = bart.x + bart.off.dx * ease
          bart.drawY = BART_Y + bart.off.dy * ease
          if (bart.timer <= 0) {
            bart.mode = 'walk'
            bart.drawX = bart.x
            bart.drawY = BART_Y
            bart.land = 0.2
            if (motion) shake = 0.22
            arcade.sound.jump()
            const soot = bart.portal === 'chimney'
            burst(bart.x + BQ_W / 2, FEET_Y - 6, soot ? '#4a4a52' : '#8a8fa0', 14, false)
            if (soot) say(['THE CHIMNEY', 'IS ALSO MINE.'], 1.8)
            else if (bart.portal === 'window') say(['WINDOWS OPEN', 'BOTH WAYS!'], 1.8)
            else say(['ME AGAIN!'], 1.5)
          }
        }

        /* --- fees --- */
        if (feeIdx < FEE_TIMES.length && t >= FEE_TIMES[feeIdx] && bart.mode === 'walk') {
          feeIdx++
          fee()
        }

        /* --- steady leak of rent coins --- */
        coinTimer -= dt
        if (coinTimer <= 0) {
          telegraph(rand(28, W - 28), 'coin', 0.45)
          coinTimer = (1.5 - r * 0.65) * rand(0.8, 1.2) * (frantic() ? 0.66 : 1)
        }
        if (t >= nextIndignity) {
          nextIndignity += 8.5
          telegraph(rand(40, W - 40), Math.random() < 0.5 ? 'paint' : 'nail', 0.45)
        }

        /* --- telegraphs --- */
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i]
          s.t -= dt
          if (s.t <= 0) {
            launch(s.x, s.kind)
            sparks.splice(i, 1)
          }
        }

        /* --- items --- */
        const mx1 = boxX + 4,
          mx2 = boxX + BOX_W - 4
        const p = palm()
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i]
          const prevCy = it.y + it.h / 2
          it.y += it.vy * dt
          it.x += it.vx * dt
          if (it.kind === 'coin') {
            it.spin += dt * 9
            // greed: once they clear the floor they curve toward his open palm
            if (it.y < 420 && bart.visible) {
              it.vx += Math.sign(p.x - (it.x + it.w / 2)) * 130 * dt
              it.vx = clamp(it.vx, -170, 170)
            }
          } else if (motion) it.x += Math.sin(arcade.elapsed * 4 + it.wob) * 14 * dt
          // a forgiving nudge toward an open strongbox on the last stretch
          const bc = boxX + BOX_W / 2
          if (it.y + it.h / 2 > MOUTH_Y && it.y + it.h / 2 < MOUTH_Y + 76 && Math.abs(it.x + it.w / 2 - bc) < 42)
            it.x += Math.sign(bc - (it.x + it.w / 2)) * 70 * dt
          it.x = clamp(it.x, 2, W - it.w - 2)
          const cx = it.x + it.w / 2,
            cy = it.y + it.h / 2

          // caught by the strongbox on the way up
          if (prevCy > MOUTH_Y && cy <= MOUTH_Y && cx >= mx1 && cx <= mx2) {
            keepIt(it)
            items.splice(i, 1)
            continue
          }
          // snatched by Bartleby
          if (bart.visible && Math.abs(cx - p.x) < 20 && Math.abs(cy - p.y) < 20) {
            if (it.kind === 'coin') collected(it)
            else {
              stats.lost++
              popup('HE TOOK IT', p.x, p.y - 24, MUTED, 8)
            }
            items.splice(i, 1)
            continue
          }
          if (cy < LOST_Y) {
            if (it.kind === 'coin') collected(it)
            items.splice(i, 1)
          }
        }

        /* --- fx --- */
        for (let i = particles.length - 1; i >= 0; i--) {
          const q = particles[i]
          q.life -= dt
          q.x += q.vx * dt
          q.y += q.vy * dt
          q.vy += 400 * dt
          if (q.life <= 0) particles.splice(i, 1)
        }
        for (let i = popups.length - 1; i >= 0; i--) {
          const q = popups[i]
          q.life -= dt * 0.85
          q.y += q.vy * dt
          if (q.life <= 0) popups.splice(i, 1)
        }
        if (bubble) {
          bubble.life -= dt
          if (bubble.life <= 0) bubble = null
        }
        if (shake > 0) shake -= dt
        if (squash > 0) squash -= dt
        if (ledgerFlash > 0) ledgerFlash -= dt
        if (purseJiggle > 0) purseJiggle -= dt

        const sec = Math.ceil(arcade.timeLeft)
        if (arcade.timeLeft <= 10 && sec !== lastSecond) {
          lastSecond = sec
          arcade.sound.tick()
          hurryFlash = 0.3
        }
        if (hurryFlash > 0) hurryFlash -= dt
      },

      draw(ctx) {
        const t = arcade.elapsed
        ctx.save()
        if (shake > 0 && motion) {
          const a = Math.ceil(shake * 14)
          ctx.translate(R(rand(-a, a)), R(rand(-a, a)))
        }
        drawRoom(ctx, t)
        drawBartleby(ctx, t)

        // telegraph puffs at the bottom: your money getting restless
        sparks.forEach((s) => {
          const k = 1 - s.t / s.max
          const yy = R(SPAWN_Y - 6 - k * 14)
          const blink = !motion || Math.floor(arcade.elapsed * 12) % 2 === 0
          arcade.rect(s.x - 2, yy, 5, 5, blink ? '#fff6d5' : GOLD)
          arcade.rect(s.x - 6, yy + 7, 3, 3, GOLD)
          arcade.rect(s.x + 4, yy + 6, 3, 3, GOLD)
          arcade.rect(s.x - 4, yy - 6, 9, 3, blink ? GOLD : '#a06e30')
          arcade.rect(s.x - 2, yy - 9, 5, 3, blink ? GOLD : '#a06e30')
        })

        items.forEach((it) => drawItem(ctx, it, t))
        drawBox(ctx, t)

        particles.forEach((q) => arcade.rect(R(q.x), R(q.y), q.size, q.size, q.color))
        popups.forEach((q) => {
          ctx.globalAlpha = clamp(q.life * 1.5, 0, 1)
          arcade.text(q.str, q.x, q.y, { size: q.size, color: q.color, align: 'center' })
          ctx.globalAlpha = 1
        })

        if (bubble && bart.visible) drawBubble(ctx, clamp(bart.drawX + BQ_W / 2, 60, W - 60), bart.drawY - 6, bubble)
        drawLedgerStrip(ctx)

        // opening hint
        if (introT < 3.4) {
          ctx.globalAlpha = clamp((3.4 - introT) * 1.2, 0, 1)
          arcade.rect(38, 392, 324, 50, 'rgba(12,33,29,.88)')
          arcade.rect(38, 392, 324, 2, GOLD)
          arcade.text('CATCH THE RENT IN YOUR STRONGBOX', W / 2, 402, { size: 8, color: GOLD, align: 'center' })
          arcade.text('BEFORE BARTLEBY DOES', W / 2, 420, { size: 10, color: CREAM, align: 'center' })
          ctx.globalAlpha = 1
        }

        ctx.restore()

        if (arcade.timeLeft <= 10 && arcade.timeLeft > 0) {
          const a = hurryFlash > 0 ? 0.55 : 0.25
          ctx.fillStyle = `rgba(232,87,74,${a})`
          ctx.fillRect(0, 0, W, 4)
          ctx.fillRect(0, H - 4, W, 4)
          ctx.fillRect(0, 0, 4, H)
          ctx.fillRect(W - 4, 0, 4, H)
          if (!motion || Math.floor(t * 2) % 2 === 0) {
            arcade.rect(W / 2 - 62, 58, 124, 20, 'rgba(10,26,22,.88)')
            arcade.text('LAST ' + Math.ceil(arcade.timeLeft) + '!', W / 2, 62, { size: 12, color: RED, align: 'center' })
          }
        }
      },

      drawIdle(ctx) {
        bart = bart || newBartleby()
        bart.drawX = 288
        bart.drawY = BART_Y
        bart.dir = -1
        bart.visible = true
        bart.mode = 'idle'
        drawRoom(ctx, 0)
        drawBartleby(ctx, 0)
        ;[
          [120, 470],
          [212, 520],
          [286, 424],
          [66, 552],
        ].forEach(([x, y], i) => arcade.sprite(COIN_FRAMES[COIN_SPIN[i % COIN_SPIN.length]], COIN_LEGEND, x, y, 3))
        drawBox(ctx, 0)
        drawBubble(ctx, clamp(bart.drawX + BQ_W / 2, 60, W - 60), BART_Y - 6, { lines: ['RENT DAY!'], life: 9, dur: 9 })
        drawLedgerStrip(ctx)
      },
    }
  },
}
