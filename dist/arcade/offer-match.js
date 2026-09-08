// Offer Match: two loan scrolls, one is hiding something. Pick the cheaper deal over five years.
// Plugs into arcade-core.js. Everything on the canvas is drawn in code; no images, no emoji.

const LOAN = 300000
const TERM_MONTHS = 360
const HOLD_MONTHS = 60
const ROUNDS = 8
const PICK_SECONDS = 8
const REVEAL_SECONDS = 1.8
const REVEAL_MIN_SKIP = 0.9 // the explanation stays up at least this long before a tap can skip it
const PICK_LOCK = 0.25 // ignore picks while the scrolls are still sliding in
const MIN_GAP = 900

const LENDERS = ['IRONVAULT', 'BRIGHTPENNY', 'OAKLEDGER', 'SILVERGATE', 'HEARTHSTONE', 'COPPERKEY', 'MOONWELL', 'THISTLEDOWN']

/* ---------- math ---------- */
export function monthlyPI(principal, rate, n = TERM_MONTHS) {
  const r = rate / 12
  if (!r) return principal / n
  return (principal * r) / (1 - Math.pow(1 + r, -n))
}
export function fiveYearCost(o) {
  return HOLD_MONTHS * o.pi + o.fees + HOLD_MONTHS * o.mi
}
const money = (n) => '$' + Math.round(n).toLocaleString('en-US')
const pct = (rate) => {
  let s = (rate * 100).toFixed(3)
  if (s.endsWith('0')) s = s.slice(0, -1)
  return s + '%'
}

/* ---------- offer generation ---------- */
function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1))
}
function makeOffer(lender) {
  const rate = (44 + randInt(0, 16)) / 8 / 100 // 5.500% .. 7.500% in 0.125 steps
  const feeRoll = Math.random()
  const fees = feeRoll < 0.3 ? randInt(0, 6) * 250 : feeRoll < 0.7 ? randInt(8, 24) * 250 : randInt(24, 48) * 250
  const mi = Math.random() < 0.45 ? randInt(8, 25) * 10 : 0
  const pi = monthlyPI(LOAN, rate)
  return { lender, rate, fees, mi, pi, total: 0 }
}
function explain(worse, better) {
  const dPI = HOLD_MONTHS * (worse.pi - better.pi)
  const dFees = worse.fees - better.fees
  const dMI = HOLD_MONTHS * (worse.mi - better.mi)
  const parts = [
    { k: 'pi', v: dPI },
    { k: 'fees', v: dFees },
    { k: 'mi', v: dMI },
  ].sort((a, b) => b.v - a.v)
  const top = parts[0]
  if (top.k === 'mi') return `Mortgage insurance adds ${money(dMI)} over 5 years`
  if (top.k === 'fees') {
    if (worse.rate < better.rate) return `Lower rate, but ${money(worse.fees)} in fees`
    return `${money(worse.fees)} in fees outweigh the rest`
  }
  if (worse.fees < better.fees) return `Low fees, but the rate costs ${money(dPI)} more`
  return `The higher rate costs ${money(dPI)} more`
}
export function makeRound(index) {
  const wantFlashyWorse = Math.random() < 0.6
  const names = [LENDERS[(index * 2) % LENDERS.length], LENDERS[(index * 2 + 1) % LENDERS.length]]
  let best = null
  for (let tries = 0; tries < 400; tries++) {
    const a = makeOffer(names[0]),
      b = makeOffer(names[1])
    a.total = fiveYearCost(a)
    b.total = fiveYearCost(b)
    const gap = Math.abs(a.total - b.total)
    if (gap < MIN_GAP) continue
    const worse = a.total > b.total ? a : b,
      better = worse === a ? b : a
    // Non-trivial: the worse scroll must look attractive on at least one line.
    const looksGood = worse.pi < better.pi || worse.fees < better.fees || (worse.mi === 0 && better.mi > 0)
    if (!looksGood) continue
    const flashy = a.pi < b.pi ? a : b
    const flashyIsWorse = flashy === worse
    const round = { a, b, better, worse, flashy, explanation: explain(worse, better) }
    if (flashyIsWorse === wantFlashyWorse) return round
    best = best || round
  }
  if (best) return best
  // Deterministic fallback (practically unreachable): rate buydown trap.
  const a = { lender: names[0], rate: 0.06, fees: 9000, mi: 0 },
    b = { lender: names[1], rate: 0.0675, fees: 1500, mi: 0 }
  a.pi = monthlyPI(LOAN, a.rate)
  b.pi = monthlyPI(LOAN, b.rate)
  a.total = fiveYearCost(a)
  b.total = fiveYearCost(b)
  const worse = a.total > b.total ? a : b,
    better = worse === a ? b : a
  return { a, b, better, worse, flashy: a.pi < b.pi ? a : b, explanation: explain(worse, better) }
}

/* ---------- pixel art ---------- */
const CHECK = {
  map: ['.......GG', '......GGG', '.....GGG.', 'GG..GGG..', 'GGGGGG...', '.GGGG....', '..GG.....'],
  legend: { G: '#3fa65b' },
}
const CROSS = {
  map: ['RR....RR', 'RRR..RRR', '.RRRRRR.', '..RRRR..', '..RRRR..', '.RRRRRR.', 'RRR..RRR', 'RR....RR'],
  legend: { R: '#c8463a' },
}
const SAGE = {
  map: [
    '....HHHH....',
    '...HHHHHH...',
    '...SSSSSS...',
    '...SESSES...',
    '...SSSSSS...',
    '..WWWWWWWW..',
    '.PPPWWWWPPP.',
    'PPPPPPPPPPPP',
    'PPPPGPPGPPPP',
    'PPPPPPPPPPPP',
    '.PPPPPPPPPP.',
    '.PPPPPPPPPP.',
    '.PPPPPPPPPP.',
    '..BB....BB..',
  ],
  legend: { H: '#5b4a8a', S: '#e9c19a', E: '#1c1c28', W: '#d9d2c0', P: '#4a3a7a', G: '#efd08a', B: '#2a2438' },
}
const KEY_EMBLEM = {
  map: ['.YYY....', 'Y...Y...', 'Y...YYYY', 'Y...Y.Y.', '.YYY..Y.'],
  legend: { Y: '#efd08a' },
}

/* ---------- game ---------- */
export default {
  id: 'offer-match',
  title: 'Offer Match',
  tagline: 'Two offers. One is hiding something. Pick the better deal before the timer runs out.',
  lesson:
    'A low advertised payment is a starting point, not an answer. Compare the whole offer: rate, fees, mortgage insurance, and how long you will hold the loan.',
  lessonShort: 'Compare the whole offer.',
  controls: 'Tap a scroll · ◀ ▶ keys',
  duration: 0,
  width: 400,
  height: 600,
  coinCap: 40,
  touchButtons: false,
  create(arcade) {
    const W = arcade.w,
      H = arcade.h
    const SCROLL = { y: 100, w: 180, h: 300, ax: 12, bx: 208 }
    const rounds = []
    let round = 0,
      state = 'idle', // idle | pick | reveal | done
      timer = PICK_SECONDS,
      revealT = 0,
      picked = null, // 'a' | 'b' | null (expired)
      wasRight = false,
      correct = 0,
      pickTimes = [],
      t = 0,
      lastTickSec = -1,
      slide = 0,
      flash = 0,
      lock = 0

    // Stable brick pattern so the wall does not shimmer.
    const bricks = []
    for (let i = 0; i < 400; i++) bricks.push(Math.random())

    for (let i = 0; i < ROUNDS; i++) rounds.push(makeRound(i))

    function cur() {
      return rounds[round]
    }
    function startRound() {
      state = 'pick'
      timer = PICK_SECONDS
      picked = null
      wasRight = false
      lastTickSec = -1
      lock = PICK_LOCK
      slide = arcade.reduceMotion ? 1 : 0
      arcade.hint(`Round ${round + 1}/${ROUNDS}`)
    }
    function choose(which) {
      if (state !== 'pick') return
      if (which !== null && lock > 0) return
      const r = cur()
      picked = which
      const chosen = which === 'a' ? r.a : which === 'b' ? r.b : null
      wasRight = !!chosen && chosen === r.better
      const used = PICK_SECONDS - Math.max(0, timer)
      pickTimes.push(Math.min(PICK_SECONDS, used))
      if (wasRight) {
        correct++
        const bonus = Math.round(50 * arcade.clamp(timer / PICK_SECONDS, 0, 1))
        arcade.score += 100 + bonus
        arcade.coins = Math.min(arcade.coins + 5, 40)
        arcade.sound.coin()
      } else {
        arcade.sound.hit()
      }
      flash = 1
      state = 'reveal'
      revealT = REVEAL_SECONDS
    }
    function skip() {
      if (state === 'reveal' && REVEAL_SECONDS - revealT >= REVEAL_MIN_SKIP) advance()
    }
    function advance() {
      if (state !== 'reveal') return
      round++
      if (round >= ROUNDS) {
        state = 'done'
        const avgSeconds = pickTimes.length ? Math.round((pickTimes.reduce((s, v) => s + v, 0) / pickTimes.length) * 10) / 10 : 0
        arcade.end({
          won: correct >= 5,
          title: correct >= 7 ? 'Clear-sighted!' : correct >= 5 ? 'Sharp eyes.' : 'The scroll fooled you.',
          message: `${correct} of ${ROUNDS} offers read correctly.`,
          stats: { correct, avgSeconds },
        })
        return
      }
      startRound()
    }

    /* ----- drawing ----- */
    function drawWall(ctx) {
      arcade.rect(0, 0, W, H, '#2a2a36')
      const bw = 40,
        bh = 20
      let i = 0
      for (let row = 0; row * bh < 440; row++) {
        const off = row % 2 ? bw / 2 : 0
        for (let x = -bw; x < W + bw; x += bw) {
          const v = bricks[i++ % bricks.length]
          const shade = 0x34 + Math.floor(v * 14)
          const c = `rgb(${shade},${shade + 2},${shade + 12})`
          arcade.rect(x + off + 1, row * bh + 1, bw - 2, bh - 2, c)
          arcade.rect(x + off + 1, row * bh + 1, bw - 2, 2, `rgb(${shade + 10},${shade + 12},${shade + 22})`)
        }
      }
      // Floor.
      arcade.rect(0, 440, W, H - 440, '#3a2618')
      for (let y = 440; y < H; y += 16) {
        arcade.rect(0, y, W, 1, '#2a1a10')
        arcade.rect(0, y + 8, W, 1, '#47301e')
      }
      for (let x = 0; x < W; x += 80) arcade.rect(x + ((Math.floor(x / 80) % 2) * 40), 440, 2, H - 440, '#2a1a10')
      arcade.rect(0, 438, W, 4, '#1e1a22')
    }
    function drawBanner(ctx) {
      // Hanging guild banner behind the scrolls.
      const x = W / 2 - 70,
        y = 44
      arcade.rect(x - 8, y, 156, 6, '#5a3a1e')
      arcade.rect(x - 10, y - 2, 6, 10, '#8a6a3a')
      arcade.rect(x + 144, y - 2, 6, 10, '#8a6a3a')
      arcade.rect(x, y + 6, 140, 46, '#1e4033')
      arcade.rect(x, y + 6, 140, 3, '#efd08a')
      // Notched bottom.
      for (let i = 0; i < 7; i++) arcade.rect(x + i * 20, y + 52, 10, 6, '#1e4033')
      arcade.sprite(KEY_EMBLEM.map, KEY_EMBLEM.legend, x + 6, y + 18, 2)
      arcade.text('LENDERS GUILD', x + 70 + 8, y + 22, { size: 8, color: '#efd08a', align: 'center' })
    }
    function drawCandle(ctx, x, y, phase) {
      const flick = arcade.reduceMotion ? 0 : Math.sin(t * 9 + phase) * 1.5 + Math.sin(t * 23 + phase * 2)
      // Glow.
      ctx.save()
      const g = ctx.createRadialGradient(x, y - 6, 2, x, y - 6, 46 + flick * 2)
      g.addColorStop(0, 'rgba(255,190,90,0.35)')
      g.addColorStop(1, 'rgba(255,190,90,0)')
      ctx.fillStyle = g
      ctx.fillRect(x - 60, y - 66, 120, 120)
      ctx.restore()
      // Sconce and candle.
      arcade.rect(x - 8, y + 12, 16, 4, '#6a5a3a')
      arcade.rect(x - 3, y + 16, 6, 6, '#6a5a3a')
      arcade.rect(x - 3, y, 6, 12, '#f2e6c8')
      arcade.rect(x - 1, y - 6 + flick * 0.5, 2, 6, '#ffd27a')
      arcade.rect(x - 2, y - 4 + flick * 0.5, 4, 3, '#ff9a3a')
    }
    function drawScroll(ctx, offer, x, y, w, h, opts) {
      const { reveal, chosen, right, flashy, dim, hover } = opts
      // Shadow.
      arcade.rect(x + 3, y + 5, w, h, 'rgba(0,0,0,0.35)')
      // Rolls top and bottom.
      arcade.rect(x - 4, y, w + 8, 12, '#a8804a')
      arcade.rect(x - 4, y, w + 8, 3, '#d8b078')
      arcade.rect(x - 4, y + 9, w + 8, 3, '#7a5a30')
      arcade.rect(x - 4, y + h - 12, w + 8, 12, '#a8804a')
      arcade.rect(x - 4, y + h - 12, w + 8, 3, '#d8b078')
      arcade.rect(x - 4, y + h - 3, w + 8, 3, '#7a5a30')
      // Parchment body with pixel border.
      const body = dim ? '#cfc09a' : '#ecdcb4'
      arcade.rect(x, y + 10, w, h - 20, '#6a4a22')
      arcade.rect(x + 2, y + 12, w - 4, h - 24, body)
      arcade.rect(x + 2, y + 12, w - 4, 2, '#f6ecd0')
      arcade.rect(x + 2, y + h - 14, w - 4, 2, '#c8b088')
      // Aging spots.
      arcade.rect(x + 8, y + 40, 3, 3, '#d9c69a')
      arcade.rect(x + w - 14, y + 120, 2, 2, '#d9c69a')
      arcade.rect(x + 12, y + h - 40, 2, 2, '#d9c69a')
      if (hover && !reveal) {
        arcade.rect(x - 2, y + 8, w + 4, 2, '#efd08a')
        arcade.rect(x - 2, y + h - 10, w + 4, 2, '#efd08a')
        arcade.rect(x - 2, y + 8, 2, h - 16, '#efd08a')
        arcade.rect(x + w, y + 8, 2, h - 16, '#efd08a')
      }
      const cx = x + w / 2
      const ink = '#2b2118',
        dimInk = '#7a6a50',
        label = { size: 8, color: dimInk, align: 'center', shadow: false }
      arcade.text(offer.lender, cx, y + 22, { size: 8, color: ink, align: 'center', shadow: false })
      arcade.rect(x + 20, y + 34, w - 40, 1, '#b8a078')
      if (flashy) {
        // Loud red ribbon.
        arcade.rect(x + 10, y + 40, w - 20, 16, '#b8342a')
        arcade.rect(x + 10, y + 40, w - 20, 2, '#e0685a')
        arcade.rect(x + 6, y + 44, 4, 8, '#8a2018')
        arcade.rect(x + w - 10, y + 44, 4, 8, '#8a2018')
        arcade.text('LOWEST PAYMENT!', cx, y + 44, { size: 8, color: '#fff2d0', align: 'center', shadow: false })
      }
      arcade.text('RATE', cx, y + 66, label)
      arcade.text(pct(offer.rate), cx, y + 78, { size: 12, color: ink, align: 'center', shadow: false })
      arcade.text('PAYMENT', cx, y + 104, label)
      arcade.text(money(offer.pi) + '/mo', cx, y + 116, { size: 10, color: ink, align: 'center', shadow: false })
      arcade.text('LENDER FEES', cx, y + 142, label)
      arcade.text(offer.fees ? money(offer.fees) + ' fees' : 'No fees', cx, y + 154, {
        size: 10,
        color: offer.fees >= 6000 ? '#8a2a20' : ink,
        align: 'center',
        shadow: false,
      })
      arcade.text('MORTGAGE INS.', cx, y + 180, label)
      arcade.text(offer.mi ? money(offer.mi) + '/mo MI' : 'None', cx, y + 192, {
        size: 10,
        color: offer.mi ? '#8a2a20' : ink,
        align: 'center',
        shadow: false,
      })
      arcade.rect(x + 14, y + 218, w - 28, 2, '#b8a078')
      if (reveal) {
        arcade.text('5-YR COST', cx, y + 224, label)
        arcade.text(money(offer.total), cx, y + 236, {
          size: 10,
          color: right ? '#2a7a3a' : '#8a2a20',
          align: 'center',
          shadow: false,
        })
        const mark = right ? CHECK : CROSS
        arcade.sprite(mark.map, mark.legend, cx - (mark.map[0].length * 3) / 2, y + 250, 3)
        if (chosen) arcade.text('YOUR PICK', cx, y + h - 24, { size: 8, color: dimInk, align: 'center', shadow: false })
      } else {
        arcade.text('5-YR COST', cx, y + 224, label)
        arcade.text('?', cx, y + 238, { size: 12, color: dimInk, align: 'center', shadow: false })
      }
    }
    function drawTimer(ctx) {
      const x = 20,
        y = 32,
        w = W - 40,
        h = 8
      arcade.rect(x - 2, y - 2, w + 4, h + 4, '#141420')
      arcade.rect(x, y, w, h, '#3a3a4a')
      if (state === 'pick') {
        const f = arcade.clamp(timer / PICK_SECONDS, 0, 1)
        const color = f > 0.5 ? '#5cc46a' : f > 0.25 ? '#efd08a' : '#e0685a'
        arcade.rect(x, y, w * f, h, color)
        arcade.rect(x, y, w * f, 2, 'rgba(255,255,255,0.35)')
      } else if (state === 'reveal') {
        arcade.rect(x, y, w, h, wasRight ? '#3fa65b' : '#c8463a')
      }
    }
    function drawSage(ctx, line) {
      const sx = 22,
        sy = 448
      arcade.sprite(SAGE.map, SAGE.legend, sx, sy, 3)
      // Speech box.
      const bx = 74,
        by = 452,
        bw = W - 74 - 14,
        bh = 68
      arcade.rect(bx, by, bw, bh, '#1a1620')
      arcade.rect(bx + 2, by + 2, bw - 4, bh - 4, '#f2e8cc')
      arcade.rect(bx - 4, by + 24, 4, 6, '#f2e8cc')
      arcade.text('SAGE', bx + 8, by + 8, { size: 8, color: '#5b4a8a', shadow: false })
      const lines = wrap(line, 34)
      for (let i = 0; i < Math.min(3, lines.length); i++)
        arcade.text(lines[i], bx + 8, by + 24 + i * 13, { size: 8, color: '#2b2118', shadow: false })
    }
    function wrap(str, maxChars) {
      const words = String(str).split(' '),
        out = []
      let cur = ''
      for (const wd of words) {
        if ((cur + ' ' + wd).trim().length > maxChars && cur) {
          out.push(cur)
          cur = wd
        } else cur = (cur + ' ' + wd).trim()
      }
      if (cur) out.push(cur)
      return out
    }
    function drawScene(ctx, idle) {
      drawWall(ctx)
      drawBanner(ctx)
      drawCandle(ctx, 30, 70, 0)
      drawCandle(ctx, W - 30, 70, 2)
      const r = cur() || rounds[0]
      if (!r) return
      const reveal = state === 'reveal'
      const ease = 1 - Math.pow(1 - arcade.clamp(slide, 0, 1), 3)
      const off = idle ? 0 : (1 - ease) * 60
      const hoverA = state === 'pick' && arcade.pointer.y > 50 && arcade.pointer.y < 430 && arcade.pointer.x < W / 2
      const hoverB = state === 'pick' && arcade.pointer.y > 50 && arcade.pointer.y < 430 && arcade.pointer.x >= W / 2
      drawScroll(ctx, r.a, SCROLL.ax - off, SCROLL.y, SCROLL.w, SCROLL.h, {
        reveal,
        chosen: picked === 'a',
        right: r.a === r.better,
        flashy: r.flashy === r.a,
        dim: reveal && r.a !== r.better,
        hover: hoverA,
      })
      drawScroll(ctx, r.b, SCROLL.bx + off, SCROLL.y, SCROLL.w, SCROLL.h, {
        reveal,
        chosen: picked === 'b',
        right: r.b === r.better,
        flashy: r.flashy === r.b,
        dim: reveal && r.b !== r.better,
        hover: hoverB,
      })
      // Result strip between scrolls and the floor.
      if (reveal) {
        const headline = picked === null ? 'TIME UP  -  no pick' : wasRight ? 'CORRECT' : 'NOT THIS ONE'
        arcade.text(headline, W / 2, 410, { size: 10, color: wasRight ? '#8ee39a' : '#f0907f', align: 'center' })
        const lines = wrap(r.explanation, 44)
        arcade.text(lines[0], W / 2, 425, { size: 8, color: '#f0f0df', align: 'center' })
        if (flash > 0 && !arcade.reduceMotion) {
          ctx.save()
          ctx.globalAlpha = flash * 0.25
          ctx.fillStyle = wasRight ? '#8ee39a' : '#f0907f'
          ctx.fillRect(0, 0, W, H)
          ctx.restore()
        }
      } else if (state === 'pick') {
        arcade.text('Same loan: $300,000 - 30-yr fixed', W / 2, 412, { size: 8, color: '#c9c3b0', align: 'center' })
        arcade.text('Which costs LESS over 5 years?', W / 2, 425, { size: 8, color: '#efd08a', align: 'center' })
      }
      drawTimer(ctx)
      let say
      if (idle) say = 'Read both scrolls. Payment is only part of the price.'
      else if (state === 'reveal') say = picked === null ? 'The timer beat you. Read faster next time!' : wasRight ? 'Well read. Tap to continue.' : 'The scroll fooled you. Tap to continue.'
      else say = timer < 3 ? 'Quickly now! Pick a scroll.' : 'Payments, fees, insurance. Add it all up.'
      drawSage(ctx, say)
    }

    return {
      init() {
        round = 0
        correct = 0
        pickTimes = []
        arcade.score = 0
        arcade.coins = 0
        startRound()
      },
      update(dt) {
        t += dt
        if (slide < 1) slide = Math.min(1, slide + dt / 0.35)
        if (flash > 0) flash = Math.max(0, flash - dt / 0.4)
        if (lock > 0) lock -= dt
        if (state === 'pick') {
          timer -= dt
          const sec = Math.ceil(timer)
          if (sec <= 3 && sec >= 1 && sec !== lastTickSec) {
            lastTickSec = sec
            arcade.sound.tick()
          }
          if (timer <= 0) {
            timer = 0
            choose(null)
          }
        } else if (state === 'reveal') {
          revealT -= dt
          if (revealT <= 0) advance()
        }
      },
      draw(ctx) {
        drawScene(ctx, false)
      },
      drawIdle(ctx) {
        drawScene(ctx, true)
      },
      pointerDown(x, y) {
        if (state === 'reveal') return skip()
        if (state !== 'pick') return
        if (y < 44 || y > SCROLL.y + SCROLL.h + 40) return
        choose(x < W / 2 ? 'a' : 'b')
      },
      keyDown(key) {
        if (state === 'reveal') {
          if (key === 'action' || key === 'left' || key === 'right') skip()
          return
        }
        if (state !== 'pick') return
        if (key === 'left') choose('a')
        else if (key === 'right') choose('b')
      },
    }
  },
}
