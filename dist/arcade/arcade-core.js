// Hearthvale Arcade core: a tiny pixel-game runtime shared by every mini-game.
// A game is a module with { id, title, tagline, lesson, controls, duration, width, height, coinCap, create(arcade) }.
// create() returns { init(), update(dt), draw(ctx), pointerDown?(x,y), pointerMove?(x,y), pointerUp?(x,y), keyDown?(key) }.
// The core owns the canvas, the loop, input, sound, the start and end screens, and reports results.
import { config, presenter } from '../config.js'
import { track } from '../analytics.js'

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

/* ---------- sound (procedural, no samples) ---------- */
class Sound {
  constructor() {
    this.ctx = null
    this.on = true
    this.volume = 0.5
  }
  ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      } catch {
        this.on = false
      }
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {})
    return this.ctx
  }
  beep(freq = 440, dur = 0.08, type = 'square', vol = 0.12, slide = 0) {
    if (!this.on) return
    const ctx = this.ensure()
    if (!ctx) return
    const o = ctx.createOscillator(),
      g = ctx.createGain(),
      t = ctx.currentTime
    o.type = type
    o.frequency.setValueAtTime(freq, t)
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(vol * this.volume, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g)
    g.connect(ctx.destination)
    o.start(t)
    o.stop(t + dur + 0.02)
  }
  coin() {
    this.beep(988, 0.07, 'square', 0.1)
    setTimeout(() => this.beep(1319, 0.14, 'square', 0.1), 60)
  }
  hit() {
    this.beep(160, 0.18, 'sawtooth', 0.14, -100)
  }
  tick() {
    this.beep(660, 0.03, 'square', 0.05)
  }
  win() {
    ;[523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.beep(f, 0.16, 'triangle', 0.14), i * 90))
  }
  lose() {
    ;[392, 330, 262].forEach((f, i) => setTimeout(() => this.beep(f, 0.2, 'triangle', 0.12), i * 120))
  }
  jump() {
    this.beep(300, 0.12, 'square', 0.08, 300)
  }
}
export const sound = new Sound()

/* ---------- drawing helpers ---------- */
const FONT = '"Press Start 2P", "Courier New", monospace'
export function text(ctx, str, x, y, o = {}) {
  ctx.save()
  ctx.font = `${o.size || 10}px ${FONT}`
  ctx.textAlign = o.align || 'left'
  ctx.textBaseline = o.baseline || 'top'
  if (o.shadow !== false) {
    ctx.fillStyle = o.shadowColor || 'rgba(0,0,0,.55)'
    ctx.fillText(str, x + 1, y + 2)
  }
  ctx.fillStyle = o.color || '#f0f0df'
  ctx.fillText(str, x, y)
  ctx.restore()
}
/** Draw a sprite from a string map. legend maps characters to CSS colors; '.' or ' ' is transparent. */
export function sprite(ctx, map, legend, x, y, scale = 2, flip = false) {
  const w = map[0].length
  for (let r = 0; r < map.length; r++) {
    const row = map[r]
    for (let c = 0; c < row.length; c++) {
      const ch = row[c]
      if (ch === '.' || ch === ' ') continue
      const color = legend[ch]
      if (!color) continue
      ctx.fillStyle = color
      const cx = flip ? w - 1 - c : c
      ctx.fillRect(Math.round(x + cx * scale), Math.round(y + r * scale), scale, scale)
    }
  }
}
export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const rand = (a, b) => a + Math.random() * (b - a)
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Shared little sprites so every game feels like one world.
export const SPRITES = {
  coin: {
    map: ['..GGGG..', '.GYYYYG.', 'GYYWWYYG', 'GYWYYWYG', 'GYWYYWYG', 'GYYWWYYG', '.GYYYYG.', '..GGGG..'],
    legend: { G: '#a06e30', Y: '#efd08a', W: '#fff6d5' },
  },
  key: {
    map: ['.YYY....', 'Y...Y...', 'Y...YYYY', 'Y...Y.Y.', '.YYY..Y.'],
    legend: { Y: '#efd08a' },
  },
  hero: {
    map: [
      '...HHHH...',
      '..HHHHHH..',
      '..SSSSSS..',
      '..SESSES..',
      '..SSSSSS..',
      '...SSSS...',
      '.CCCCCCCC.',
      'SCCCCCCCCS',
      '.CCCCCCCC.',
      '..PP..PP..',
      '..PP..PP..',
      '.BBB..BBB.',
    ],
    legend: { H: '#5a3826', S: '#f0c4a0', E: '#1c1c28', C: '#3f6e4a', P: '#6b5a48', B: '#4a3220' },
  },
  house: {
    map: [
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
    ],
    legend: { R: '#b8453a', W: '#e9dcc0', B: '#7fb3d5', D: '#6b4a2a' },
  },
  drop: {
    map: ['..B..', '.BBB.', 'BBWBB', 'BBBBB', '.BBB.'],
    legend: { B: '#4c8fd6', W: '#cfe6ff' },
  },
}

/* ---------- the runtime ---------- */
export function runGame(game, opts = {}) {
  const container = typeof opts.container === 'string' ? document.querySelector(opts.container) : opts.container
  const W = game.width || 400,
    H = game.height || 600
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  container.classList.add('arcade')
  container.innerHTML = `<div class="arcade-frame" style="aspect-ratio:${W}/${H}">
      <canvas width="${W}" height="${H}" aria-label="${esc(game.title)} game area" role="img"></canvas>
      <div class="arcade-hud"><span class="hud-score">SCORE 0</span><span class="hud-time"></span><span class="hud-coins">◉ 0</span></div>
      <div class="arcade-overlay"></div>
    </div>
    <div class="arcade-controls" hidden>
      <button type="button" data-hold="left" aria-label="Left">◀</button>
      <button type="button" data-hold="action" aria-label="Action">●</button>
      <button type="button" data-hold="right" aria-label="Right">▶</button>
    </div>`
  const canvas = container.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    overlay = container.querySelector('.arcade-overlay'),
    hud = {
      score: container.querySelector('.hud-score'),
      time: container.querySelector('.hud-time'),
      coins: container.querySelector('.hud-coins'),
    },
    touchControls = container.querySelector('.arcade-controls')
  ctx.imageSmoothingEnabled = false
  if (game.touchButtons) touchControls.hidden = false

  const arcade = {
    w: W,
    h: H,
    ctx,
    canvas,
    keys: new Set(),
    pointer: { x: 0, y: 0, down: false },
    score: 0,
    coins: 0,
    timeLeft: game.duration || 0,
    elapsed: 0,
    running: false,
    over: false,
    stats: {},
    reduceMotion,
    sound,
    text: (s, x, y, o) => text(ctx, s, x, y, o),
    sprite: (map, legend, x, y, scale, flip) => sprite(ctx, map, legend, x, y, scale, flip),
    rect: (x, y, w, h, c) => rect(ctx, x, y, w, h, c),
    clamp,
    rand,
    pick,
    SPRITES,
    end(result = {}) {
      finish(result)
    },
    hint(msg) {
      hud.time.textContent = msg
    },
  }

  let impl = null,
    raf = 0,
    last = 0,
    ended = false,
    started = false

  function logical(e) {
    const r = canvas.getBoundingClientRect()
    const p = e.touches ? e.touches[0] || e.changedTouches[0] : e
    return { x: ((p.clientX - r.left) / r.width) * W, y: ((p.clientY - r.top) / r.height) * H }
  }
  const keyMap = {
    arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right', arrowup: 'up', w: 'up',
    arrowdown: 'down', s: 'down', ' ': 'action', enter: 'action', x: 'action', z: 'action',
  }
  function onKeyDown(e) {
    const k = keyMap[e.key.toLowerCase()]
    if (!k) return
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return
    e.preventDefault()
    if (!started) {
      if (k === 'action') start()
      return
    }
    if (!arcade.keys.has(k)) {
      arcade.keys.add(k)
      impl?.keyDown?.(k)
    }
  }
  function onKeyUp(e) {
    const k = keyMap[e.key.toLowerCase()]
    if (k) arcade.keys.delete(k)
  }
  function onPointerDown(e) {
    if (!started || ended) return
    e.preventDefault()
    sound.ensure()
    const p = logical(e)
    arcade.pointer = { ...p, down: true }
    impl?.pointerDown?.(p.x, p.y)
  }
  function onPointerMove(e) {
    if (!started || ended) return
    const p = logical(e)
    arcade.pointer.x = p.x
    arcade.pointer.y = p.y
    if (arcade.pointer.down || e.type === 'mousemove') impl?.pointerMove?.(p.x, p.y)
  }
  function onPointerUp(e) {
    if (!started || ended) return
    const p = logical(e)
    arcade.pointer.down = false
    impl?.pointerUp?.(p.x, p.y)
  }
  canvas.addEventListener('mousedown', onPointerDown)
  canvas.addEventListener('mousemove', onPointerMove)
  window.addEventListener('mouseup', onPointerUp)
  canvas.addEventListener('touchstart', onPointerDown, { passive: false })
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); onPointerMove(e) }, { passive: false })
  canvas.addEventListener('touchend', onPointerUp)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  touchControls.querySelectorAll('[data-hold]').forEach((b) => {
    const k = b.dataset.hold
    const down = (e) => { e.preventDefault(); if (!started) return start(); if (!arcade.keys.has(k)) { arcade.keys.add(k); impl?.keyDown?.(k) } }
    const up = (e) => { e.preventDefault(); arcade.keys.delete(k) }
    b.addEventListener('touchstart', down, { passive: false })
    b.addEventListener('touchend', up)
    b.addEventListener('touchcancel', up)
    b.addEventListener('mousedown', down)
    b.addEventListener('mouseup', up)
    b.addEventListener('mouseleave', up)
  })

  function updateHud() {
    hud.score.textContent = 'SCORE ' + arcade.score
    hud.coins.textContent = '◉ ' + Math.min(arcade.coins, game.coinCap || 999)
    if (game.duration) hud.time.textContent = Math.ceil(arcade.timeLeft) + 's'
  }
  function loop(ts) {
    if (!arcade.running) return
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016)
    last = ts
    arcade.elapsed += dt
    if (game.duration) {
      arcade.timeLeft = Math.max(0, game.duration - arcade.elapsed)
      if (arcade.timeLeft <= 0) return finish({ won: true, reason: 'time' })
    }
    impl.update(dt)
    ctx.clearRect(0, 0, W, H)
    impl.draw(ctx)
    updateHud()
    raf = requestAnimationFrame(loop)
  }
  function showStart() {
    overlay.hidden = false
    overlay.innerHTML = `<div class="arcade-card">
      <span class="eyebrow">HEARTHVALE ARCADE</span>
      <h2>${esc(game.title)}</h2>
      <p>${esc(game.tagline)}</p>
      <p class="arcade-controls-hint">${esc(game.controls || 'Arrow keys or tap')}${game.duration ? ` · ${game.duration} seconds` : ''}</p>
      <button type="button" class="primary arcade-start">Play ▶</button>
      <p class="small">Earn coins for a bigger fictional down payment. ${esc(game.lessonShort || '')}</p></div>`
    overlay.querySelector('.arcade-start').onclick = start
    ctx.clearRect(0, 0, W, H)
    if (impl?.drawIdle) impl.drawIdle(ctx)
  }
  function start() {
    if (started) return
    sound.ensure()
    started = true
    overlay.hidden = true
    overlay.innerHTML = ''
    impl.init()
    arcade.running = true
    last = performance.now()
    track('minigame_start', { game: game.id, standalone: !!opts.standalone })
    raf = requestAnimationFrame(loop)
  }
  function finish(result) {
    if (ended) return
    ended = true
    arcade.running = false
    arcade.over = true
    cancelAnimationFrame(raf)
    const coins = Math.min(Math.max(0, Math.round(arcade.coins)), game.coinCap || 999)
    const won = result.won !== false
    won ? sound.win() : sound.lose()
    const out = { id: game.id, title: game.title, score: arcade.score, coins, won, stats: { ...arcade.stats, ...(result.stats || {}) } }
    track('minigame_end', { game: game.id, score: out.score, coins, won, standalone: !!opts.standalone })
    updateHud()
    const actions = (opts.actions || []).map((a, i) => `<button type="button" class="${a.primary ? 'primary' : 'secondary'}" data-action="${i}">${esc(a.label)}</button>`).join('')
    overlay.hidden = false
    overlay.innerHTML = `<div class="arcade-card">
      <span class="eyebrow">${won ? 'ROUND COMPLETE' : 'ROUND OVER'}</span>
      <h2>${esc(result.title || (won ? 'Nice run!' : 'Almost!'))}</h2>
      <div class="arcade-result"><div><small>SCORE</small><strong>${out.score}</strong></div><div><small>COINS EARNED</small><strong>◉ ${coins}</strong></div></div>
      ${result.message ? `<p>${esc(result.message)}</p>` : ''}
      <div class="lesson"><small>PACK THIS FOR REAL LIFE</small>${esc(game.lesson)}</div>
      <div class="utility-actions"><button type="button" class="secondary arcade-again">Play again</button>${actions}</div></div>`
    overlay.querySelector('.arcade-again').onclick = () => {
      ended = false
      started = false
      arcade.score = 0
      arcade.coins = 0
      arcade.elapsed = 0
      arcade.timeLeft = game.duration || 0
      arcade.keys.clear()
      arcade.stats = {}
      arcade.over = false
      impl = game.create(arcade)
      showStart()
    }
    overlay.querySelectorAll('[data-action]').forEach((b) => (b.onclick = () => opts.actions[+b.dataset.action].onClick(out)))
    opts.onEnd?.(out)
  }
  function destroy() {
    arcade.running = false
    cancelAnimationFrame(raf)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('mouseup', onPointerUp)
    container.innerHTML = ''
    container.classList.remove('arcade')
  }
  if (document.fonts?.load) document.fonts.load('10px "Press Start 2P"').catch(() => {})
  impl = game.create(arcade)
  showStart()
  return { destroy, start, arcade }
}

/* ---------- standalone page bootstrap ---------- */
export function mountStandalone(game) {
  document.title = `${game.title} · Hearthvale Arcade`
  const root = document.querySelector('#arcade-root') || document.body
  const partnerLine = config.partner ? `<p class="small">Shared by ${esc(config.partner.name)}</p>` : ''
  root.innerHTML = `<header class="arcade-top"><a class="brand" href="${esc(config.gameUrl)}" aria-label="The First Key"><span class="brandmark">⚿</span><span>THE FIRST KEY<small>HEARTHVALE ARCADE</small></span></a><a class="arcade-all" href="../">All games</a></header>
    <p class="fiction-note hall-note-inline"><b>Every number in this game is made up</b> — prices, rates, payments and coins. It is a practice game, not a rate quote, not an advertisement of terms, and not an offer or a commitment to lend. Your real figures come on a Loan Estimate after you apply.</p>
    <main class="arcade-page">
      <div class="arcade-stage" id="stage"></div>
      <aside class="arcade-side">
        <span class="eyebrow">WHAT THIS TEACHES</span>
        <h3>${esc(game.title)}</h3>
        <p>${esc(game.lesson)}</p>
        <div class="presenter-card"><img src="${esc(presenter.headshot)}" alt="" width="64" height="64"><div><strong>${esc(presenter.name)}</strong><small>${esc(presenter.role)} · ${esc(presenter.company)}<br>NMLS #${esc(presenter.nmls)} · Licensed in ${esc(presenter.licensedIn)}</small></div></div>
        <div class="utility-actions"><a class="primary" href="${esc(config.gameUrl)}">Play the full adventure →</a><a class="secondary" href="tel:${esc(presenter.phoneHref)}">Call ${esc(presenter.firstName)}</a><a class="secondary" href="sms:${esc(presenter.phoneHref)}">Text ${esc(presenter.firstName)}</a><button type="button" class="secondary" id="share-game">Share this game ↗</button></div>
        ${partnerLine}
        <p class="small">${esc(presenter.name)}, ${esc(presenter.role)} · NMLS #${esc(presenter.nmls)} · ${esc(presenter.company)} · Licensed in ${esc(presenter.licensedIn)} · Equal Housing Lender</p>
      </aside>
    </main>
    <footer class="arcade-foot"><span>A CHOICEWRIGHT ORIGINAL ✦ presented by ${esc(presenter.name)}</span><small>${esc(presenter.legal)}</small></footer>`
  document.querySelector('#share-game').onclick = async () => {
    const data = { title: game.title, text: `${game.tagline} Can you beat my score?`, url: location.href.split('#')[0] }
    try {
      if (navigator.share) await navigator.share(data)
      else {
        await navigator.clipboard.writeText(data.url)
        alert('Link copied.')
      }
      track('share', { game: game.id })
    } catch {}
  }
  track('arcade_page', { game: game.id })
  return runGame(game, {
    container: '#stage',
    standalone: true,
    actions: [
      { label: 'Play the full adventure →', primary: true, onClick: () => (location.href = config.gameUrl) },
      { label: `Ask ${presenter.firstName} a question`, onClick: () => (location.href = `sms:${presenter.phoneHref}`) },
    ],
  })
}
