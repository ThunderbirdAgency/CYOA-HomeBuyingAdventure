// Coin Catch — Mira the provisioner's shop.
// Move the emergency pouch to catch falling coins, dodge impulse buys, and keep 5 coins ready for surprise repairs.
// All art is drawn in code from pixel maps. Plugs into arcade-core.js.

const W = 400,
  H = 600,
  DURATION = 45

/* ---------- palette ---------- */
const GOLD = '#efd08a',
  DARK = '#0c211d',
  PANEL = '#132b25',
  WALL = '#183429',
  WALL_LINE = '#112a22',
  WOOD = '#6b4a2a',
  WOOD_DARK = '#4a3220',
  WOOD_LIGHT = '#8a6238',
  CREAM = '#f0f0df',
  RED = '#e8574a',
  GREEN = '#7ed67a',
  MUTED = '#a3b4a8'

/* ---------- sprites (original pixel maps) ---------- */
const POUCH = {
  map: [
    '....LLLLLLLL....',
    '...LDDDDDDDDL...',
    '..LDDDDDDDDDDL..',
    '.LLLLLLLLLLLLLL.',
    '.LBBBBBBBBBBBBL.',
    '.LBBBBBGGBBBBBL.',
    '.LBBBBBGGBBBBBL.',
    '.LBBBBBBBBBBBBL.',
    '.LBBBHBBBBBBBBL.',
    '..LLLLLLLLLLLL..',
    '...LLLLLLLLLL...',
  ],
  legend: { L: '#4a2e14', D: '#1a120a', B: '#a0622c', H: '#b8763a', G: GOLD },
}
const COIN_FRAMES = [
  { map: ['..GGGG..', '.GYYYYG.', 'GYYWWYYG', 'GYWYYWYG', 'GYWYYWYG', 'GYYWWYYG', '.GYYYYG.', '..GGGG..'] },
  { map: ['..GGGG..', '..GYYG..', '.GYWWYG.', '.GYWWYG.', '.GYWWYG.', '.GYWWYG.', '..GYYG..', '..GGGG..'] },
  { map: ['...GG...', '...GG...', '...GY...', '...GY...', '...GY...', '...GY...', '...GG...', '...GG...'] },
  { map: ['..GGGG..', '..GYYG..', '.GYWWYG.', '.GYWWYG.', '.GYWWYG.', '.GYWWYG.', '..GYYG..', '..GGGG..'] },
]
const COIN_LEGEND = { G: '#a06e30', Y: GOLD, W: '#fff6d5' }

const BUYS = {
  sofa: {
    map: [
      '.RR......RR.',
      '.RRRRRRRRRR.',
      '.RRPPPPPPRR.',
      '.RRPPPPPPRR.',
      '.RRPPPPPPRR.',
      '.RRRRRRRRRR.',
      '.RRRRRRRRRR.',
      '.LL......LL.',
    ],
    legend: { R: '#b8453a', P: '#d86a5e', L: WOOD_DARK },
    label: 'SOFA',
  },
  tv: {
    map: [
      '.KKKKKKKKKK.',
      'KSSSSSSSSSSK',
      'KSBBBBBBBBSK',
      'KSBWBBBBBBSK',
      'KSBBBBBBBBSK',
      'KSBBBBBBBBSK',
      'KSSSSSSSSSSK',
      '.KKKKKKKKKK.',
      '.....KK.....',
      '...KKKKKK...',
    ],
    legend: { K: '#1c1c28', S: '#3a3a4a', B: '#4c8fd6', W: '#cfe6ff' },
    label: 'GIANT TV',
  },
  gadget: {
    map: [
      '.KKKKKK.',
      'KGGGGGGK',
      'KGBBBBGK',
      'KGBWBBGK',
      'KGBBBBGK',
      'KGBBBBGK',
      'KGBBBBGK',
      'KGBBBBGK',
      'KGGGGGGK',
      'KG.KK.GK',
      'KGGGGGGK',
      '.KKKKKK.',
    ],
    legend: { K: '#1c1c28', G: '#8a8fa0', B: '#5bd6b0', W: '#e8fff5' },
    label: 'GADGET',
  },
  lamp: {
    map: [
      '...YYYY...',
      '..YYYYYY..',
      '.YYYYYYYY.',
      'YYYYYYYYYY',
      '.OOOOOOOO.',
      '....GG....',
      '....GG....',
      '....GG....',
      '....GG....',
      '...GGGG...',
      '..GGGGGG..',
      '.GGGGGGGG.',
    ],
    legend: { Y: GOLD, O: '#f2a44b', G: '#a06e30' },
    label: 'FANCY LAMP',
  },
}
const REPAIRS = {
  wrench: {
    map: [
      '..SS..SS..',
      '..SD..SD..',
      '..SSSSSS..',
      '...SDDS...',
      '....SD....',
      '....SD....',
      '....SD....',
      '....SD....',
      '....SD....',
      '...SSDS...',
      '..SSSDDS..',
      '...SSSS...',
    ],
    legend: { S: '#c9ccd6', D: '#7d8391' },
  },
  pipe: {
    map: [
      'PPPPPPPPPP',
      'PDDDDDDDDP',
      'PPPPPPPPPP',
      '...PDDP...',
      '...PDDP...',
      '...PPPP...',
      '....BB....',
      '...BBBB...',
      '...BWBB...',
      '...BBBB...',
      '....BB....',
      '..........',
    ],
    legend: { P: '#8a8fa0', D: '#5a6070', B: '#4c8fd6', W: '#cfe6ff' },
  },
}
const JAR = { map: ['.JJ.', 'JCCJ', 'JCCJ', 'JCCJ', 'JCCJ', '.JJ.'] }
const SACK = { map: ['..SS..', '.SSSS.', 'SSSSSS', 'SSSSSS', 'SSSSSS', '.SSSS.'], legend: { S: '#c9a86a' } }
const MIRA = {
  map: [
    '...HHHH...',
    '..HHHHHH..',
    '..SSSSSS..',
    '..SESSES..',
    '..SSSSSS..',
    '...SSSS...',
    '.CCAAAACC.',
    'SCCAAAACCS',
    '.CCAAAACC.',
    '..PP..PP..',
    '..PP..PP..',
    '.BBB..BBB.',
  ],
  legend: { H: '#8a3a2a', S: '#f0c4a0', E: '#1c1c28', C: '#3f6e4a', A: '#e9dcc0', P: '#6b5a48', B: '#4a3220' },
}

/* ---------- layout ---------- */
const SHELF_Y = [128, 216],
  COUNTER_TOP = 440,
  COUNTER_BOTTOM = 520,
  POUCH_Y = 546,
  POUCH_W = 48,
  POUCH_H = 33,
  CATCH_TOP = POUCH_Y + 2,
  CATCH_BOTTOM = POUCH_Y + 26

export default {
  id: 'coin-catch',
  title: 'Coin Catch',
  tagline: 'Catch coins for your emergency pouch. Dodge the impulse buys.',
  lesson: 'Keep emergency money separate from the down payment. The same coins cannot buy the sofa and fix the roof.',
  lessonShort: 'Same coins, two jobs.',
  controls: '◀ ▶ or drag to move',
  duration: DURATION,
  width: W,
  height: H,
  coinCap: 40,
  touchButtons: true,

  create(arcade) {
    const { rand, pick, clamp } = arcade
    const R = Math.round
    const motion = !arcade.reduceMotion

    // state
    let pouchX = (W - POUCH_W) / 2,
      targetX = null,
      dragging = false,
      items = [],
      particles = [],
      popups = [],
      coinTimer = 0,
      nextRepair = 11,
      repairWarn = null, // { x, t }
      combo = 0,
      bestCombo = 0,
      shake = 0,
      squash = 0,
      lastSecond = -1,
      hurryFlash = 0,
      introT = 0,
      miraBob = 0,
      stats = { caught: 0, dodged: 0, hits: 0, repairsCovered: 0, repairsMissed: 0, missed: 0 }

    const ramp = () => clamp(arcade.elapsed / DURATION, 0, 1)

    function popup(text, x, y, color = GOLD, size = 10) {
      popups.push({ text, x: R(x), y: R(y), color, size, life: 1, vy: motion ? -34 : -12 })
    }
    function burst(x, y, color, n) {
      const count = motion ? n : Math.max(2, Math.floor(n / 3))
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y,
          vx: rand(-90, 90),
          vy: rand(-170, -50),
          life: rand(0.35, 0.65),
          color,
          size: pick([2, 3, 3, 4]),
        })
      }
    }

    function spawn(kind) {
      let sprite, scale, w, h, speed, type, meta
      const spd = 110 + ramp() * 150
      if (kind === 'coin') {
        scale = 3
        w = 8 * scale
        h = 8 * scale
        speed = spd * rand(0.9, 1.1)
        type = 'coin'
      } else if (kind === 'buy') {
        const key = pick(Object.keys(BUYS))
        sprite = BUYS[key]
        meta = key
        scale = 3
        w = sprite.map[0].length * scale
        h = sprite.map.length * scale
        speed = spd * rand(1.05, 1.25)
        type = 'buy'
      } else {
        const key = pick(Object.keys(REPAIRS))
        sprite = REPAIRS[key]
        meta = key
        scale = 3
        w = sprite.map[0].length * scale
        h = sprite.map.length * scale
        speed = spd * 0.8
        type = 'repair'
      }
      const x = kind === 'repair' && repairWarn ? repairWarn.x - w / 2 : rand(20, W - 20 - w)
      items.push({ type, sprite, meta, scale, w, h, x: R(x), y: -h - 4, vy: speed, spin: rand(0, 4), wob: rand(0, Math.PI * 2) })
    }

    function catchCoin(it) {
      stats.caught++
      combo++
      bestCombo = Math.max(bestCombo, combo)
      arcade.coins = Math.min(40, arcade.coins + 1)
      arcade.score += 10
      popup('+10', it.x + it.w / 2, POUCH_Y - 14)
      if (combo > 0 && combo % 5 === 0) {
        arcade.score += 25
        popup('COMBO x' + combo + ' +25', W / 2, POUCH_Y - 40, '#fff6d5', 10)
        arcade.sound.beep(1568, 0.12, 'square', 0.1)
      }
      arcade.sound.coin()
      burst(it.x + it.w / 2, POUCH_Y + 4, GOLD, 10)
      squash = 0.12
    }
    function catchBuy(it) {
      stats.hits++
      combo = 0
      const lost = Math.min(3, arcade.coins)
      arcade.coins = Math.max(0, arcade.coins - 3)
      popup(lost ? '-' + lost : 'OUCH', it.x + it.w / 2, POUCH_Y - 14, RED)
      popup(BUYS[it.meta].label + '!', it.x + it.w / 2, POUCH_Y - 30, RED, 8)
      arcade.sound.hit()
      burst(it.x + it.w / 2, POUCH_Y + 4, RED, 8)
      if (motion) shake = 0.25
    }
    function catchRepair(it) {
      combo = 0
      if (arcade.coins >= 5) {
        stats.repairsCovered++
        arcade.coins -= 5
        arcade.score += 50
        popup('COVERED! +50', it.x + it.w / 2, POUCH_Y - 18, GREEN, 10)
        popup('-5', it.x + it.w / 2, POUCH_Y - 4, MUTED, 8)
        arcade.sound.beep(784, 0.1, 'triangle', 0.12)
        setTimeout(() => arcade.sound.beep(1175, 0.16, 'triangle', 0.12), 90)
        burst(it.x + it.w / 2, POUCH_Y + 4, GREEN, 12)
        squash = 0.12
      } else {
        stats.repairsMissed++
        arcade.score = Math.max(0, arcade.score - 100)
        popup('NOT COVERED', it.x + it.w / 2, POUCH_Y - 30, RED, 10)
        popup('-100', it.x + it.w / 2, POUCH_Y - 14, RED, 10)
        arcade.sound.hit()
        setTimeout(() => arcade.sound.hit(), 140)
        burst(it.x + it.w / 2, POUCH_Y + 4, '#8a8fa0', 8)
        if (motion) shake = 0.35
      }
    }

    /* ---------- scene ---------- */
    function drawScene(ctx, t) {
      // wall
      arcade.rect(0, 0, W, COUNTER_TOP, WALL)
      for (let x = 0; x < W; x += 40) arcade.rect(x, 0, 2, COUNTER_TOP, WALL_LINE)
      arcade.rect(0, 0, W, 30, DARK) // dark band behind the HUD
      arcade.rect(0, 30, W, 2, PANEL)

      // window (warm evening light)
      arcade.rect(24, 52, 60, 56, WOOD_DARK)
      arcade.rect(28, 56, 24, 22, '#c9a86a')
      arcade.rect(56, 56, 24, 22, '#c9a86a')
      arcade.rect(28, 82, 24, 22, '#b08a4a')
      arcade.rect(56, 82, 24, 22, '#b08a4a')
      arcade.rect(32, 60, 8, 6, '#fff6d5')

      // sign
      arcade.rect(108, 44, 184, 28, WOOD_DARK)
      arcade.rect(110, 46, 180, 24, WOOD)
      arcade.rect(112, 48, 176, 2, WOOD_LIGHT)
      arcade.text("MIRA'S PROVISIONS", W / 2, 55, { size: 8, color: GOLD, align: 'center' })

      // shelves with goods
      const jarColors = ['#b8453a', '#e0a040', '#5c8a3a', '#4c8fd6', '#d86a5e']
      SHELF_Y.forEach((sy, si) => {
        arcade.rect(120, sy, 260, 6, WOOD)
        arcade.rect(120, sy + 6, 260, 3, WOOD_DARK)
        arcade.rect(120, sy, 260, 1, WOOD_LIGHT)
        for (let i = 0; i < 7; i++) {
          const gx = 128 + i * 36
          if ((i + si) % 3 === 2) arcade.sprite(SACK.map, SACK.legend, gx, sy - 18, 3)
          else arcade.sprite(JAR.map, { J: '#7d8391', C: jarColors[(i + si * 2) % jarColors.length] }, gx + 2, sy - 18, 3)
        }
      })
      // left cabinet with drawers
      arcade.rect(24, 250, 64, 190, WOOD_DARK)
      for (let i = 0; i < 4; i++) {
        arcade.rect(30, 258 + i * 44, 52, 34, WOOD)
        arcade.rect(50, 272 + i * 44, 12, 4, GOLD)
      }
      // hanging lantern
      arcade.rect(340, 30, 2, 26, '#5a6070')
      arcade.rect(332, 56, 18, 22, '#3a3a4a')
      arcade.rect(336, 60, 10, 14, '#f2a44b')
      arcade.rect(338, 62, 6, 6, '#fff6d5')

      // Mira behind the counter
      const bob = motion ? R(Math.sin(t * 3) * 1) : 0
      arcade.sprite(MIRA.map, MIRA.legend, 300, COUNTER_TOP - 36 + bob, 3)

      // counter
      arcade.rect(0, COUNTER_TOP, W, 12, WOOD_LIGHT)
      arcade.rect(0, COUNTER_TOP + 12, W, COUNTER_BOTTOM - COUNTER_TOP - 12, WOOD)
      for (let x = 0; x < W; x += 50) arcade.rect(x, COUNTER_TOP + 12, 2, COUNTER_BOTTOM - COUNTER_TOP - 12, WOOD_DARK)
      arcade.rect(0, COUNTER_TOP + 40, W, 2, WOOD_DARK)
      arcade.rect(0, COUNTER_BOTTOM - 4, W, 4, WOOD_DARK)
      // cash box on counter
      arcade.rect(60, COUNTER_TOP - 14, 30, 14, '#3a3a4a')
      arcade.rect(64, COUNTER_TOP - 10, 22, 6, '#1c1c28')

      // floor tiles
      for (let y = COUNTER_BOTTOM; y < H; y += 20)
        for (let x = 0; x < W; x += 20) arcade.rect(x, y, 20, 20, ((x + y) / 20) % 2 ? '#2a2018' : '#332a1e')
      arcade.rect(0, COUNTER_BOTTOM, W, 2, '#1c150e')
    }

    function drawPouch(ctx, x, sq) {
      const y = POUCH_Y + (sq > 0 ? 3 : 0)
      arcade.sprite(POUCH.map, POUCH.legend, R(x), y, 3)
      // coins peeking from the opening
      const n = Math.min(6, Math.ceil(arcade.coins / 7))
      for (let i = 0; i < n; i++) arcade.rect(R(x) + 12 + i * 4, y + 4, 3, 3, GOLD)
      // shadow
      arcade.rect(R(x) + 4, POUCH_Y + POUCH_H + 1, POUCH_W - 8, 3, 'rgba(0,0,0,.35)')
    }

    function drawItem(ctx, it, t) {
      if (it.type === 'coin') {
        const frame = COIN_FRAMES[Math.floor(it.spin) % COIN_FRAMES.length]
        arcade.sprite(frame.map, COIN_LEGEND, R(it.x), R(it.y), it.scale)
      } else {
        const wob = motion && it.type === 'buy' ? R(Math.sin(t * 6 + it.wob) * 2) : 0
        arcade.sprite(it.sprite.map, it.sprite.legend, R(it.x + wob), R(it.y), it.scale)
        if (it.type === 'repair') {
          // danger/opportunity marker
          const ok = arcade.coins >= 5
          arcade.rect(R(it.x + it.w / 2) - 1, R(it.y) - 10, 2, 6, ok ? GREEN : RED)
          arcade.rect(R(it.x + it.w / 2) - 1, R(it.y) - 3, 2, 2, ok ? GREEN : RED)
        }
      }
    }

    return {
      init() {
        pouchX = (W - POUCH_W) / 2
        targetX = null
        dragging = false
        items = []
        particles = []
        popups = []
        coinTimer = 0.4
        nextRepair = 11
        repairWarn = null
        combo = 0
        bestCombo = 0
        shake = 0
        squash = 0
        lastSecond = -1
        hurryFlash = 0
        introT = 0
        stats = { caught: 0, dodged: 0, hits: 0, repairsCovered: 0, repairsMissed: 0, missed: 0 }
        arcade.stats = stats
        arcade.coins = 0
        arcade.score = 0
      },

      pointerDown(x) {
        dragging = true
        targetX = x
      },
      pointerMove(x) {
        if (dragging) targetX = x
      },
      pointerUp() {
        dragging = false
        targetX = null
      },

      update(dt) {
        const t = arcade.elapsed
        introT += dt
        miraBob = t
        const r = ramp()

        // --- pouch movement ---
        const speed = 340
        let dir = 0
        if (arcade.keys.has('left')) dir -= 1
        if (arcade.keys.has('right')) dir += 1
        if (dir) {
          pouchX += dir * speed * dt
        } else if (targetX !== null) {
          const center = pouchX + POUCH_W / 2
          const d = targetX - center
          const step = Math.min(Math.abs(d), speed * 1.15 * dt)
          pouchX += Math.sign(d) * step
        }
        pouchX = clamp(pouchX, 2, W - POUCH_W - 2)

        // --- spawning ---
        coinTimer -= dt
        if (coinTimer <= 0) {
          const buyChance = 0.14 + r * 0.22
          spawn(Math.random() < buyChance ? 'buy' : 'coin')
          coinTimer = (0.85 - r * 0.42) * rand(0.75, 1.25)
        }
        // surprise repair: warn 0.9s ahead, then drop
        if (!repairWarn && t >= nextRepair - 0.9 && nextRepair < DURATION - 3) {
          repairWarn = { x: R(rand(40, W - 40)), t: 0.9 }
          arcade.sound.beep(440, 0.08, 'square', 0.08)
          setTimeout(() => arcade.sound.beep(440, 0.08, 'square', 0.08), 200)
        }
        if (repairWarn) {
          repairWarn.t -= dt
          if (repairWarn.t <= 0) {
            spawn('repair')
            repairWarn = null
            nextRepair += 12
          }
        }

        // --- items ---
        const px1 = pouchX + 6,
          px2 = pouchX + POUCH_W - 6
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i]
          it.y += it.vy * dt
          if (it.type === 'coin') it.spin += dt * 8
          const bottom = it.y + it.h,
            cx = it.x + it.w / 2
          if (bottom >= CATCH_TOP && bottom <= CATCH_BOTTOM + it.vy * dt && cx >= px1 && cx <= px2) {
            if (it.type === 'coin') catchCoin(it)
            else if (it.type === 'buy') catchBuy(it)
            else catchRepair(it)
            items.splice(i, 1)
            continue
          }
          if (it.y > H + 10) {
            if (it.type === 'buy') stats.dodged++
            else if (it.type === 'coin') {
              stats.missed++
              if (combo >= 3) popup('COMBO LOST', W / 2, POUCH_Y - 40, MUTED, 8)
              combo = 0
            } else {
              // a repair that hits the floor is simply skipped
              popup('REPAIR SKIPPED', W / 2, POUCH_Y - 40, MUTED, 8)
            }
            items.splice(i, 1)
          }
        }

        // --- fx ---
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.life -= dt
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.vy += 420 * dt
          if (p.life <= 0) particles.splice(i, 1)
        }
        for (let i = popups.length - 1; i >= 0; i--) {
          const p = popups[i]
          p.life -= dt * 0.9
          p.y += p.vy * dt
          if (p.life <= 0) popups.splice(i, 1)
        }
        if (shake > 0) shake -= dt
        if (squash > 0) squash -= dt

        // --- countdown urgency ---
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
          const a = Math.ceil(shake * 16)
          ctx.translate(R(rand(-a, a)), R(rand(-a, a)))
        }
        drawScene(ctx, t)

        // repair warning arrow at the top
        if (repairWarn) {
          const blink = motion ? Math.floor(t * 8) % 2 === 0 : true
          if (blink) {
            arcade.rect(repairWarn.x - 6, 36, 12, 4, RED)
            arcade.rect(repairWarn.x - 4, 40, 8, 4, RED)
            arcade.rect(repairWarn.x - 2, 44, 4, 4, RED)
          }
          const ok = arcade.coins >= 5
          arcade.text('REPAIR!', W / 2, 78, { size: 10, color: RED, align: 'center' })
          arcade.text(ok ? 'POUCH READY (5 COINS)' : 'NEED 5 COINS TO COVER', W / 2, 94, { size: 8, color: ok ? GREEN : RED, align: 'center' })
        }

        items.forEach((it) => drawItem(ctx, it, t))
        drawPouch(ctx, pouchX, squash)

        // repair status under the pouch while one is falling
        if (items.some((it) => it.type === 'repair')) {
          const ok = arcade.coins >= 5
          arcade.text(ok ? 'COVERED' : 'NEED 5', R(pouchX + POUCH_W / 2), POUCH_Y + POUCH_H + 6, { size: 8, color: ok ? GREEN : RED, align: 'center' })
        }

        particles.forEach((p) => arcade.rect(R(p.x), R(p.y), p.size, p.size, p.color))
        popups.forEach((p) => {
          ctx.globalAlpha = clamp(p.life * 1.5, 0, 1)
          arcade.text(p.text, p.x, p.y, { size: p.size, color: p.color, align: 'center' })
          ctx.globalAlpha = 1
        })

        // combo counter
        if (combo >= 2 && !repairWarn) {
          const pulse = motion && combo % 5 === 0 ? (Math.floor(t * 6) % 2 ? '#fff6d5' : GOLD) : GOLD
          arcade.text('COMBO x' + combo, W / 2, 78, { size: 10, color: pulse, align: 'center' })
        }

        // intro hint
        if (introT < 3) {
          ctx.globalAlpha = clamp((3 - introT) * 1.2, 0, 1)
          arcade.rect(60, 330, 280, 44, 'rgba(12,33,29,.85)')
          arcade.text('CATCH COINS', W / 2, 338, { size: 10, color: GOLD, align: 'center' })
          arcade.text('DODGE THE IMPULSE BUYS', W / 2, 356, { size: 8, color: CREAM, align: 'center' })
          ctx.globalAlpha = 1
        }

        ctx.restore()

        // last-10-seconds urgency (drawn after restore so the border stays put)
        if (arcade.timeLeft <= 10 && arcade.timeLeft > 0) {
          const a = hurryFlash > 0 ? 0.55 : 0.25
          ctx.fillStyle = `rgba(232,87,74,${a})`
          ctx.fillRect(0, 0, W, 4)
          ctx.fillRect(0, H - 4, W, 4)
          ctx.fillRect(0, 0, 4, H)
          ctx.fillRect(W - 4, 0, 4, H)
          if (!motion || Math.floor(t * 2) % 2 === 0)
            arcade.text('HURRY! ' + Math.ceil(arcade.timeLeft), W / 2, 100, { size: 12, color: RED, align: 'center' })
        }
      },

      drawIdle(ctx) {
        drawScene(ctx, 0)
        // a few coins mid-air and the pouch waiting at the counter
        ;[[90, 150], [200, 260], [300, 190], [150, 380]].forEach(([x, y], i) =>
          arcade.sprite(COIN_FRAMES[i % 4].map, COIN_LEGEND, x, y, 3)
        )
        arcade.sprite(BUYS.sofa.map, BUYS.sofa.legend, 250, 330, 3)
        drawPouch(ctx, (W - POUCH_W) / 2, 0)
      },
    }
  },
}
