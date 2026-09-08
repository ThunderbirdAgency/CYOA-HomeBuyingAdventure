// Down Payment Dash: an endless one-button runner. Collect coins toward a fictional
// down payment, jump over "surprise expense" obstacles. Plugs into arcade-core.js.

const GOLD = '#efd08a'
const GROUND = 400 // y of the running lane (hero's feet)
const HERO_X = 84
const S = 3 // sprite scale for hero and obstacles
const COIN_VALUE = 100

/* ---------- pixel art ---------- */
const HERO_BODY = [
  '...HHHH...',
  '..HHHHHH..',
  '..SSSSSS..',
  '..SESSES..',
  '..SSSSSS..',
  '...SSSS...',
  'GCCCCCCCC.',
  'GGCCCCCCCS',
  'GCCCCCCCC.',
]
const LEGS = {
  run: [
    ['..PP..PP..', '.PP....PP.', 'BBB....BBB'],
    ['...PPPP...', '...PP.PP..', '..BBB.BBB.'],
    ['..PP..PP..', '..PP..PP..', '.BBB..BBB.'],
  ],
  jump: ['..PP..PP..', '.PPP..PPP.', '.BBB..BBB.'],
  stumble: ['.PP....PP.', 'PP......PP', 'BB......BB'],
}
const RUN_SEQ = [0, 1, 2, 1]
const HERO_LEGEND = { H: '#5a3826', S: '#f0c4a0', E: '#1c1c28', C: '#3f6e4a', P: '#6b5a48', B: '#4a3220', G: GOLD }
const HERO_RED = { H: '#c0453a', S: '#f39a88', E: '#5a1c1c', C: '#b0473a', P: '#9a4a3c', B: '#7a2f24', G: '#f5c2a6' }
const heroFrames = {}
function heroMap(kind, i = 0) {
  const k = kind + i
  if (!heroFrames[k]) heroFrames[k] = HERO_BODY.concat(kind === 'run' ? LEGS.run[i] : LEGS[kind])
  return heroFrames[k]
}

const OBSTACLES = [
  {
    id: 'cart',
    label: 'CAR REPAIR',
    legend: { S: '#d8d2c8', B: '#b8453a', O: '#8a5a30', K: '#2a2a2e' },
    map: [
      '....SS......',
      '...S..S.....',
      '..BBBBBBBB..',
      '.BBBBBBBBBB.',
      '.OOOOOOOOOO.',
      '.OOOOOOOOOO.',
      '.OOOOOOOOOO.',
      '..KK........',
      '.KKKK...KKKK',
      '..KK...KKKKK',
    ],
  },
  {
    id: 'wheel',
    label: 'FLAT TIRE',
    legend: { K: '#2a2a2e', G: '#9aa0a8' },
    map: ['..KKKK..', '.KKKKKK.', 'KK.GG.KK', 'KKGGGGKK', 'KK.GG.KK', '.KKKKKK.', 'KKKKKKKK', 'KKKKKKKK'],
  },
  {
    id: 'dog',
    label: 'VET BILL',
    legend: { B: '#a06e30', E: '#1c1c28', W: '#f4efe4', R: '#b8453a' },
    map: [
      '........BB.',
      '.......BBBB',
      'B......BEBB',
      'BB..BBBBBB.',
      '.BBWWBBBB..',
      '.BBWRBBBB..',
      '.BB...BB...',
      '.BB...BB...',
    ],
  },
  {
    id: 'pipe',
    label: 'LEAKY PIPE',
    legend: { G: '#8a9aa5', D: '#4c8fd6', L: '#cfe6ff' },
    map: [
      '..GGG..',
      '..GGG..',
      '.GGLGG.',
      '..GGG..',
      '..GGG..',
      '..GGG..',
      'D.GGG.D',
      '..GGG..',
      'D.GGG.D',
      '.DGGGD.',
    ],
  },
  {
    id: 'tax',
    label: 'TAX BILL',
    legend: { W: '#e9dcc0', R: '#b8453a', T: '#7b3f6a' },
    map: [
      'WWWWWWWWWW',
      'WRWWWWWWRW',
      'WWRWWWWRWW',
      'WWWRWWRWWW',
      'WWWWRRWWWW',
      'WWWWWWWWWW',
      'WWTTTTTTWW',
      'WWWWWWWWWW',
    ],
  },
]

const COIN_LEGEND = { G: '#a06e30', Y: GOLD, W: '#fff6d5' }
const COIN_FRAMES = [
  ['..GGGG..', '.GYYYYG.', 'GYYWWYYG', 'GYWYYWYG', 'GYWYYWYG', 'GYYWWYYG', '.GYYYYG.', '..GGGG..'],
  ['...GG...', '..GYYG..', '..GYWG..', '..GYWG..', '..GYWG..', '..GYWG..', '..GYYG..', '...GG...'],
  ['...GG...', '...GG...', '...YY...', '...YY...', '...YY...', '...YY...', '...GG...', '...GG...'],
  ['...GG...', '..GYYG..', '..GWYG..', '..GWYG..', '..GWYG..', '..GWYG..', '..GYYG..', '...GG...'],
]
const KEY_MAP = ['.YYY....', 'Y...Y...', 'Y...YYYY', 'Y...Y.Y.', '.YYY..Y.']
const KEY_LEGEND = { Y: GOLD }

const PINE = ['...T...', '..TTT..', '..TTT..', '.TTTTT.', '.TTTTT.', 'TTTTTTT', 'TTTTTTT', '...K...', '...K...']
const ROUND_TREE = ['..TTT..', '.TTTTT.', 'TTTTTTT', 'TTTTTTT', '.TTTTT.', '..TTT..', '...K...', '...K...']
const TREE_LEGEND = { T: '#1f5a3d', K: '#4a3220' }
const HOUSE_MAP = [
  '....RRRR....',
  '...RRRRRR...',
  '..RRRRRRRR..',
  '.RRRRRRRRRR.',
  'RRRRRRRRRRRR',
  '.WWWWWWWWWW.',
  '.WWBBWWWDDW.',
  '.WWBBWWWDDW.',
  '.WWWWWWWDDW.',
  '.WWWWWWWDDW.',
]
const HOUSE_LEGEND = { R: '#8c3a34', W: '#cdbfa3', B: '#efd08a', D: '#4a3220' }

/* ---------- scenery math ---------- */
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
function lerpColor(a, b, t) {
  const A = hex(a),
    B = hex(b)
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`
}
const SKY_TOP = '#7b3f6a',
  SKY_HORIZON = '#f28c5c'
const SKY_BANDS = []
for (let y = 0; y < GROUND; y += 6) SKY_BANDS.push({ y, color: lerpColor(SKY_TOP, SKY_HORIZON, Math.min(1, y / 290)) })

const farHill = (x) => 302 + 30 * Math.sin(x / 74) + 14 * Math.sin(x / 31 + 1.3)
const nearHill = (x) => 352 + 22 * Math.sin(x / 52 + 0.8) + 9 * Math.sin(x / 19)

// Deterministic pseudo-random for scenery placement (no per-frame Math.random).
function seeded(n) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

/* ---------- the game ---------- */
export default {
  id: 'down-payment-dash',
  title: 'Down Payment Dash',
  tagline: 'Run, jump, and collect coins toward your down payment. Mind the surprise expenses.',
  lesson:
    'A bigger down payment lowers your monthly payment and can reduce or remove mortgage insurance. Surprise expenses are why you keep a cushion, too.',
  lessonShort: 'Every coin lowers the payment.',
  controls: 'Tap or Space to jump · double jump',
  duration: 60,
  width: 400,
  height: 600,
  coinCap: 40,
  touchButtons: false,
  create(arcade) {
    const W = arcade.w,
      H = arcade.h
    const { rand, pick, sound } = arcade

    let t = 0,
      camX = 0,
      speed = 170,
      heroY = GROUND, // feet y
      vy = 0,
      jumps = 0,
      grounded = true,
      inv = 0, // invincibility timer
      stumble = 0,
      shake = 0,
      flash = 0,
      nextSpawnX = W + 220,
      spawnCount = 0,
      keyTimer = 0,
      keyInterval = 11,
      coinsTotal = 0,
      keysTotal = 0,
      hits = 0,
      lastMilestone = 0,
      ended = false
    let coins = [],
      obstacles = [],
      keys = [],
      particles = [],
      popups = []

    const speedAt = (e) => 170 + 150 * Math.min(1, e / 60)
    const held = () => arcade.keys.has('action') || arcade.keys.has('up') || arcade.pointer.down

    function puff(x, y, n, color) {
      const count = arcade.reduceMotion ? Math.ceil(n / 2) : n
      for (let i = 0; i < count; i++)
        particles.push({ x, y, vx: rand(-50, 50), vy: rand(-70, -10), life: rand(0.25, 0.45), max: 0.45, color, size: 3 })
    }
    function sparkle(x, y) {
      const n = arcade.reduceMotion ? 4 : 8
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2
        particles.push({
          x,
          y,
          vx: Math.cos(a) * rand(40, 90),
          vy: Math.sin(a) * rand(40, 90) - 30,
          life: rand(0.3, 0.5),
          max: 0.5,
          color: i % 2 ? GOLD : '#fff6d5',
          size: 2,
        })
      }
    }

    function jump() {
      if (grounded) {
        vy = -460
        jumps = 1
        grounded = false
        puff(HERO_X + 15, GROUND, 5, '#8a7a66')
        sound.jump()
      } else if (jumps < 2) {
        vy = -420
        jumps = 2
        puff(HERO_X + 15, heroY, 6, '#f4efe4')
        sound.beep(420, 0.1, 'square', 0.08, 260)
      }
    }

    /* --- spawning (world space; screen x = worldX - camX) --- */
    function addCoin(x, y) {
      coins.push({ x: Math.round(x), y: Math.round(y), phase: rand(0, 6), taken: false })
    }
    function coinLine(x, n, height) {
      for (let i = 0; i < n; i++) addCoin(x + i * 22, GROUND - height)
      return n * 22
    }
    function coinArc(x, n, width, base, peak) {
      for (let i = 0; i < n; i++) {
        const u = n > 1 ? i / (n - 1) : 0.5
        addCoin(x + u * width, GROUND - base - Math.sin(u * Math.PI) * peak)
      }
      return width
    }
    function spawnObstacle(x) {
      const type = pick(OBSTACLES)
      const w = type.map[0].length * S,
        h = type.map.length * S
      obstacles.push({ type, x: Math.round(x), y: GROUND - h, w, h, hit: false })
      if (Math.random() < 0.55) coinArc(x - 40, 6, w + 80, 48, 42)
      return w
    }
    function spawnKey(x) {
      keys.push({ x: Math.round(x), y: GROUND - 160, taken: false })
      // a short staircase of coins hinting at the double jump
      addCoin(x - 60, GROUND - 60)
      addCoin(x - 30, GROUND - 105)
      addCoin(x + 60, GROUND - 105)
      addCoin(x + 90, GROUND - 60)
      return 24
    }
    function spawn() {
      const x = nextSpawnX
      let used = 0
      const r = Math.random()
      if (keyTimer >= keyInterval && arcade.elapsed > 6) {
        used = spawnKey(x + 60) + 90
        keyTimer = 0
        keyInterval = rand(10, 14)
      } else if (spawnCount >= 2 && r < 0.5) {
        used = spawnObstacle(x)
      } else if (r < 0.75) {
        used = coinLine(x, Math.floor(rand(4, 8)), pick([40, 40, 62, 120]))
      } else {
        used = coinArc(x, 7, 140, 36, rand(40, 70))
      }
      spawnCount++
      nextSpawnX = x + used + rand(190, 330) + speed * 0.35
    }

    /* --- collisions --- */
    const heroBox = () => ({ x: HERO_X + 6, y: heroY - 36 + 3, w: 18, h: 33 })
    const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

    function collectCoin(c) {
      c.taken = true
      coinsTotal++
      arcade.coins = coinsTotal
      arcade.score += 10
      sound.coin()
      sparkle(c.x - camX + 8, c.y + 8)
      const milestone = Math.floor(coinsTotal / 20)
      if (milestone > lastMilestone) {
        lastMilestone = milestone
        popups.push({ text: `+$${(20 * COIN_VALUE).toLocaleString()} down payment!`, x: W / 2, y: 262, t: 0, life: 1.8, big: true })
        sound.beep(1319, 0.12, 'triangle', 0.1)
      }
    }
    function hitObstacle(o) {
      o.hit = true
      hits++
      const before = arcade.coins
      arcade.coins = Math.max(0, arcade.coins - 5)
      coinsTotal = arcade.coins
      inv = 1.2
      stumble = 0.4
      shake = 0.35
      flash = 0.12
      sound.hit()
      popups.push({ text: before > 0 ? `-${Math.min(5, before)} coins  ${o.type.label}` : o.type.label, x: HERO_X + 15, y: heroY - 52, t: 0, life: 1.2, big: false })
    }

    function init() {
      t = 0
      camX = 0
      arcade.stats = { coins: 0, keys: 0, hits: 0, distance: 0 }
    }

    function update(dt) {
      t += dt
      speed = speedAt(arcade.elapsed)
      camX += speed * dt
      keyTimer += dt

      // hero physics
      const g = vy < 0 && !held() ? 1800 : 1150
      vy += g * dt
      heroY += vy * dt
      if (heroY >= GROUND) {
        if (!grounded && vy > 200) puff(HERO_X + 15, GROUND, 4, '#8a7a66')
        heroY = GROUND
        vy = 0
        grounded = true
        jumps = 0
      }
      inv = Math.max(0, inv - dt)
      stumble = Math.max(0, stumble - dt)
      shake = Math.max(0, shake - dt)
      flash = Math.max(0, flash - dt)

      // spawn ahead of the camera
      while (nextSpawnX < camX + W + 100) spawn()

      // collisions
      const hb = heroBox()
      for (const c of coins) {
        if (c.taken) continue
        const sx = c.x - camX
        if (sx > W || sx < -20) continue
        if (overlaps(hb, { x: sx + 2, y: c.y + 2, w: 12, h: 12 })) collectCoin(c)
      }
      for (const k of keys) {
        if (k.taken) continue
        const sx = k.x - camX
        if (overlaps(hb, { x: sx, y: k.y - 4, w: 24, h: 22 })) {
          k.taken = true
          keysTotal++
          arcade.score += 50
          sound.coin()
          setTimeout(() => sound.beep(1568, 0.16, 'triangle', 0.1), 120)
          sparkle(sx + 12, k.y + 8)
          sparkle(sx + 12, k.y + 8)
          popups.push({ text: '+50 KEY!', x: sx + 12, y: k.y - 14, t: 0, life: 1.2, big: false })
        }
      }
      if (inv <= 0)
        for (const o of obstacles) {
          const sx = o.x - camX
          if (sx > W || sx + o.w < 0) continue
          if (overlaps(hb, { x: sx + 3, y: o.y + 3, w: o.w - 6, h: o.h - 3 })) {
            hitObstacle(o)
            break
          }
        }

      // cull
      coins = coins.filter((c) => !c.taken && c.x - camX > -30)
      keys = keys.filter((k) => !k.taken && k.x - camX > -40)
      obstacles = obstacles.filter((o) => o.x + o.w - camX > -20)

      // particles + popups
      for (const p of particles) {
        p.life -= dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 260 * dt
      }
      particles = particles.filter((p) => p.life > 0)
      for (const p of popups) p.t += dt
      popups = popups.filter((p) => p.t < p.life)

      const distance = Math.round(camX / 10)
      arcade.stats = { coins: arcade.coins, keys: keysTotal, hits, distance }

      if (!ended && arcade.timeLeft <= 0.06) {
        ended = true
        const dollars = Math.min(arcade.coins, 40) * COIN_VALUE
        arcade.end({
          won: true,
          title: arcade.coins >= 30 ? 'Dash complete!' : 'Nice run!',
          message: `You ran ${distance} m and banked $${dollars.toLocaleString()} toward a down payment${
            keysTotal ? `, grabbed ${keysTotal} key${keysTotal === 1 ? '' : 's'}` : ''
          }${hits ? `, and stumbled into ${hits} surprise expense${hits === 1 ? '' : 's'}` : ' without a single surprise expense'}.`,
        })
      }
    }

    /* --- drawing --- */
    function drawSky(ctx) {
      for (const b of SKY_BANDS) arcade.rect(0, b.y, W, 6, b.color)
      // a few early stars in the violet band
      for (let i = 0; i < 14; i++) {
        const x = Math.round((seeded(i * 17 + 5) * (W + 40) - camX * 0.02 + 4000) % (W + 40)) - 20
        const y = 30 + Math.round(seeded(i * 23 + 9) * 90)
        const on = Math.sin(t * 2 + i) > -0.4
        if (on) arcade.rect(x, y, 2, 2, i % 3 ? '#f3d9e6' : '#fbe3a8')
      }
      // sun, partly behind the far hills
      const sx = 296,
        sy = 268,
        r = 26
      for (let dy = -r; dy <= r; dy += 2) {
        const half = Math.round(Math.sqrt(r * r - dy * dy) / 2) * 2
        arcade.rect(sx - half, sy + dy, half * 2, 2, dy < -8 ? '#fbe3a8' : GOLD)
      }
      // clouds (slowest layer)
      const period = 640
      for (let i = 0; i < 3; i++) {
        const base = i * 213 + 40
        let x = ((base - camX * 0.06) % period) + period
        x = (x % period) - 120
        const y = 60 + i * 44
        const c = '#f9c6a8'
        arcade.rect(x, y + 4, 44, 6, c)
        arcade.rect(x + 8, y, 22, 6, c)
        arcade.rect(x + 30, y + 2, 8, 4, c)
      }
    }
    function drawHills(ctx, fn, par, color) {
      for (let x = 0; x < W; x += 4) {
        const h = Math.round(fn(x + camX * par))
        arcade.rect(x, h, 4, GROUND - h, color)
      }
    }
    function drawHouses() {
      const par = 0.45,
        period = 1100
      for (let i = 0; i < 2; i++) {
        const base = 180 + i * 560
        let x = ((base - camX * par) % period) + period
        x = (x % period) - 60
        if (x < -40 || x > W + 10) continue
        const wx = x + camX * par
        const y = Math.round(nearHill(wx + 12)) - 14
        arcade.sprite(HOUSE_MAP, HOUSE_LEGEND, x, y, 2)
      }
    }
    function drawTrees() {
      const par = 0.7,
        period = 900
      for (let i = 0; i < 9; i++) {
        const base = i * 100 + Math.floor(seeded(i) * 50)
        let x = ((base - camX * par) % period) + period
        x = (x % period) - 40
        if (x < -30 || x > W + 10) continue
        const pine = seeded(i + 7) > 0.45
        const map = pine ? PINE : ROUND_TREE
        arcade.sprite(map, TREE_LEGEND, x, GROUND - map.length * 3 + 2, 3)
      }
    }
    function drawGround() {
      arcade.rect(0, GROUND, W, 6, '#4f7a4a')
      arcade.rect(0, GROUND + 6, W, 2, '#3b5a3a')
      arcade.rect(0, GROUND + 8, W, H - GROUND - 8, '#6b5a48')
      arcade.rect(0, GROUND + 64, W, 4, '#5e4e3e')
      arcade.rect(0, H - 40, W, 40, '#5a4a3a')
      // a low picket fence along the lane, scrolling at full speed
      const fy = GROUND + 16
      arcade.rect(0, fy + 4, W, 3, '#5a4030')
      arcade.rect(0, fy + 12, W, 3, '#5a4030')
      for (let i = -1; i < 12; i++) {
        const x = Math.round(i * 40 - (camX % 40))
        arcade.rect(x, fy, 5, 20, '#4a3220')
        arcade.rect(x + 1, fy - 2, 3, 2, '#4a3220')
      }
      // grass tufts on the strip and pebbles in the dirt
      const period = 800
      for (let i = 0; i < 40; i++) {
        const base = Math.floor(seeded(i * 3 + 1) * period)
        let x = ((base - camX) % period) + period
        x = (x % period) - 10
        if (x < -10 || x > W) continue
        if (i < 9) {
          arcade.rect(x, GROUND - 3, 2, 3, '#4f7a4a')
          arcade.rect(x + 3, GROUND - 2, 2, 2, '#4f7a4a')
        } else {
          const y = GROUND + 44 + Math.floor(seeded(i * 5 + 2) * 108)
          const big = seeded(i * 7 + 3) > 0.6
          arcade.rect(x, y, big ? 6 : 4, big ? 4 : 2, seeded(i * 11) > 0.5 ? '#5a4a3a' : '#7d6b58')
        }
      }
      // an occasional Hearthvale signpost
      const sp = 1400
      let sx = ((520 - camX) % sp) + sp
      sx = (sx % sp) - 100
      if (sx > -100 && sx < W) {
        arcade.rect(sx + 44, GROUND + 76, 6, 40, '#4a3220')
        arcade.rect(sx, GROUND + 78, 96, 20, '#8a5a30')
        arcade.rect(sx + 2, GROUND + 80, 92, 16, '#a06e30')
        arcade.text('HEARTHVALE', sx + 48, GROUND + 84, { size: 8, color: '#f6e3c8', align: 'center' })
      }
    }
    function drawScene(ctx) {
      drawSky(ctx)
      drawHills(ctx, farHill, 0.2, '#173a2f')
      drawHills(ctx, nearHill, 0.45, '#2d4438')
      drawHouses()
      drawTrees()
      drawGround()
    }
    function drawObstacles() {
      for (const o of obstacles) {
        const sx = Math.round(o.x - camX)
        if (sx > W || sx + o.w < 0) continue
        arcade.sprite(o.type.map, o.type.legend, sx, o.y, S)
        arcade.rect(sx + 2, GROUND, o.w - 4, 2, 'rgba(0,0,0,.25)')
        arcade.text(o.type.label, sx + Math.round(o.w / 2), o.y - 13, { size: 8, color: '#f6e3c8', align: 'center' })
      }
    }
    function drawCoins() {
      const frame = Math.floor(t * 7)
      for (const c of coins) {
        const sx = Math.round(c.x - camX)
        if (sx > W || sx < -16) continue
        const bob = Math.round(Math.sin(t * 4 + c.phase) * 2)
        const map = COIN_FRAMES[(frame + Math.floor(c.phase)) % 4]
        arcade.sprite(map, COIN_LEGEND, sx, c.y + bob, 2)
      }
      for (const k of keys) {
        const sx = Math.round(k.x - camX)
        if (sx > W || sx < -30) continue
        const bob = Math.round(Math.sin(t * 3) * 3)
        // glow ring
        arcade.rect(sx - 4, k.y + bob - 4, 32, 23, 'rgba(239,208,138,.18)')
        arcade.sprite(KEY_MAP, KEY_LEGEND, sx, k.y + bob, 3)
      }
    }
    function drawHero(idle) {
      let map
      if (idle) map = heroMap('run', 2)
      else if (stumble > 0) map = heroMap('stumble')
      else if (!grounded) map = heroMap('jump')
      else map = heroMap('run', RUN_SEQ[Math.floor(t * 8) % 4])
      const red = stumble > 0 && Math.floor(t * 12) % 2 === 0
      if (inv > 0 && stumble <= 0 && Math.floor(t * 14) % 3 === 0) return // blink while invincible
      const y = Math.round(heroY - 36)
      const x = HERO_X + (stumble > 0 ? -2 : 0)
      arcade.sprite(map, red ? HERO_RED : HERO_LEGEND, x, y, S)
      if (grounded && !idle) arcade.rect(HERO_X + 4, GROUND, 22, 2, 'rgba(0,0,0,.25)')
    }
    function drawParticles() {
      for (const p of particles) {
        arcade.ctx.globalAlpha = Math.max(0, p.life / p.max)
        arcade.rect(p.x, p.y, p.size, p.size, p.color)
      }
      arcade.ctx.globalAlpha = 1
    }
    function drawPopups() {
      for (const p of popups) {
        const u = p.t / p.life
        arcade.ctx.globalAlpha = u > 0.7 ? 1 - (u - 0.7) / 0.3 : 1
        const y = Math.round(p.y - u * 28)
        if (p.big) {
          arcade.rect(p.x - 108, y - 6, 216, 22, 'rgba(23,58,47,.85)')
          arcade.text(p.text, p.x, y, { size: 8, color: GOLD, align: 'center' })
        } else {
          const half = p.text.length * 4 + 6
          arcade.text(p.text, Math.round(arcade.clamp(p.x, half, W - half)), y, { size: 8, color: '#f9c6a8', align: 'center' })
        }
      }
      arcade.ctx.globalAlpha = 1
    }
    function drawFooter() {
      const dollars = Math.min(arcade.coins, 40) * COIN_VALUE
      arcade.rect(0, H - 40, W, 1, '#3b5a3a')
      arcade.text('DOWN PAYMENT', W / 2, H - 32, { size: 8, color: '#d9dccb', align: 'center' })
      arcade.text(`$${dollars.toLocaleString()}`, W / 2, H - 20, { size: 12, color: GOLD, align: 'center' })
      arcade.text(`${Math.round(camX / 10)} m`, 12, H - 22, { size: 8, color: '#d9dccb' })
      arcade.text(`x${(speed / 170).toFixed(1)}`, W - 12, H - 22, { size: 8, color: '#d9dccb', align: 'right' })
    }

    function draw(ctx) {
      ctx.save()
      if (shake > 0 && !arcade.reduceMotion) ctx.translate(Math.round(rand(-3, 3)), Math.round(rand(-3, 3)))
      drawScene(ctx)
      drawObstacles()
      drawCoins()
      drawHero(false)
      drawParticles()
      drawPopups()
      drawFooter()
      ctx.restore()
      if (flash > 0) arcade.rect(0, 0, W, H, `rgba(220,60,40,${(flash / 0.12) * 0.28})`)
    }

    function drawIdle(ctx) {
      drawScene(ctx)
      // a taste of what's coming
      const demo = [];
      for (let i = 0; i < 6; i++) demo.push({ x: 190 + i * 24, y: GROUND - 50 - Math.round(Math.sin((i / 5) * Math.PI) * 40) })
      for (const c of demo) arcade.sprite(COIN_FRAMES[0], COIN_LEGEND, c.x, c.y, 2)
      const o = OBSTACLES[0]
      arcade.sprite(o.map, o.legend, 250, GROUND - o.map.length * S, S)
      arcade.text(o.label, 250 + (o.map[0].length * S) / 2, GROUND - o.map.length * S - 13, { size: 8, color: '#f6e3c8', align: 'center' })
      drawHero(true)
      arcade.text('DOWN PAYMENT', W / 2, H - 32, { size: 8, color: '#d9dccb', align: 'center' })
      arcade.text('$0', W / 2, H - 20, { size: 12, color: GOLD, align: 'center' })
    }

    return {
      init,
      update,
      draw,
      drawIdle,
      pointerDown() {
        jump()
      },
      keyDown(k) {
        if (k === 'action' || k === 'up') jump()
      },
    }
  },
}
