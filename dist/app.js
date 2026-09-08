import {
  sources,
  locations,
  items,
  episode,
  episodes,
  teaserPins,
  mapCoins,
  mapDocs,
  secretSpots,
  journalLessons,
  initialState,
  unlocked,
  choose,
  enter,
  restoreState,
  collectMapCoin,
  collectDoc,
  recordMinigame,
} from './story-data.js'
import { AdventureAudio } from './audio.js'
import { heroes, profileOptions, cleanProfile, learningPlan, nextLocation } from './profile.js'
import { config, presenter, partner, assistant, coinsToDollars, coinsToMonthlySavings } from './config.js'
import { track, trackOnce } from './analytics.js'
import { requestLead, contactLinks } from './lead.js'
import { pixelate, shareCard } from './avatar.js'

const $ = (s) => document.querySelector(s),
  music = new AdventureAudio(),
  KEY = 'choicewright:first-key:v1'
const GAMES = {
  'coin-catch': { title: 'Coin Catch', where: 'Mira’s shop', blurb: 'Catch coins for the emergency pouch. Dodge the impulse buys.', icon: '◉' },
  'offer-match': { title: 'Offer Match', where: 'The guild hall', blurb: 'Two loan scrolls. One is hiding something. Pick the better deal.', icon: '◈' },
  'inspection-hunt': { title: 'Inspection Hunt', where: 'Three-Door Lane', blurb: 'Seven things are wrong with this house. Find them in time.', icon: '⌂' },
  'down-payment-dash': { title: 'Down Payment Dash', where: 'The lantern bridge', blurb: 'Run, jump, and collect coins toward your down payment.', icon: '⚿' },
}
let state = initialState(),
  saved = null,
  storageOK = true,
  lastFocus = null,
  reading = false,
  toastTimer,
  erikPixel = presenter.headshot,
  albertPixel = assistant.headshot,
  activeArcade = null
try {
  const raw = JSON.parse(localStorage.getItem(KEY))
  state = restoreState(raw)
  if (state.started) saved = raw
} catch {}
let audioPrefs = { music: 60, voice: 80 }
try {
  const p = JSON.parse(localStorage.getItem(KEY + ':audio'))
  if (p) {
    audioPrefs.music = Math.max(0, Math.min(100, Number(p.music) || 0))
    audioPrefs.voice = Math.max(0, Math.min(100, Number(p.voice) || 0))
  }
} catch {}
music.setVolume(audioPrefs.music / 100)
const story = $('#story'),
  utility = $('#utility'),
  welcome = $('#welcome'),
  world = $('#world'),
  layer = $('#layer')

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    storageOK = false
    $('#save-note').textContent = 'Progress is not saved in this browser'
  }
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}
function money(n) {
  return (n < 0 ? '−' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US')
}
function heroOf(p = state.profile) {
  return heroes.find((h) => h.id === p.hero) || heroes[0]
}
function portraitHtml(cls = 'hero-art') {
  return state.avatar
    ? `<span class="${cls} avatar" style="background-image:url(${state.avatar})"></span>`
    : `<span class="${cls}" style="background-position:${heroOf().index * 50}% center"></span>`
}
function vars() {
  const v = state.vars,
    p = state.profile,
    plan = learningPlan(p),
    margin = 6000 - 2100 - 500 - v.housing,
    portalLead = state.lead.portal
  return {
    ...v,
    name: p.name,
    priority: profileOptions.goal.find(([id]) => id === p.goal)[1].toLowerCase(),
    goalText: profileOptions.goal.find(([id]) => id === p.goal)[1].toLowerCase(),
    questionText: profileOptions.question.find(([id]) => id === p.question)[1].toLowerCase(),
    timelineText: profileOptions.timeline.find(([id]) => id === p.timeline)[1].toLowerCase(),
    focusText: plan.title.toLowerCase(),
    firstStop: p.question === 'process' ? 'visit Sage at the guides’ guild' : 'visit Mira at the provisioner’s shop',
    reserve: money(v.reserve),
    margin: money(margin),
    afterRepair: money(v.reserve - 3000),
    homeName: v.home === 'willow' ? 'Willow Cottage' : 'Lantern House',
    reserveResult:
      v.reserve < 3000
        ? 'The pouch cannot cover this repair. You would need a different, workable plan before proceeding.'
        : v.reserve === 3000
          ? 'The repair would use the entire pouch. Another surprise would have no cushion waiting for it.'
          : 'There is money left, but it is a thinner cushion than before. Consider whether that remaining amount is enough for your circumstances.',
    endingText: 'The road ahead is yours: ' + plan.title.toLowerCase() + '. ' + plan.pace,
    coins: state.coins,
    coinDollars: money(coinsToDollars(state.coins)),
    coinSavings: money(coinsToMonthlySavings(state.coins)) + ' a month',
    fictionalRate: (config.fictional.rate * 100).toFixed(2) + '%',
    presenterName: presenter.name,
    presenterFirst: presenter.firstName,
    presenterRole: presenter.role.toLowerCase(),
    presenterCompany: presenter.company,
    assistantName: assistant.name,
    assistantFirst: assistant.firstName,
    docsLeft: mapDocs.length - state.docs.length,
    docsStatus:
      state.docQuest === 'complete'
        ? 'You brought back all five. That satchel is the best-organized thing in Hearthvale.'
        : state.docQuest === 'active'
          ? `${mapDocs.length - state.docs.length} of my papers are still out there. Walk over them and they are yours.`
          : 'Speaking of collecting: I could use a hand with something.',
    agentName: partner?.name || 'Nell',
    partnerLine: partner ? ` “${partner.name} and I work together, so when you are ready, we both already know your story.”` : '',
    portalDelivery: !portalLead
      ? ''
      : portalLead === 'delivered'
        ? 'The keeper has your name; the Credit Compass will find you when the series opens.'
        : portalLead === 'skipped'
          ? 'You kept your name to yourself. The stones opened anyway.'
          : 'The keeper’s ledger could not be reached just now. The stones opened anyway.',
  }
}
function interpolate(t) {
  const v = vars()
  return t.replace(/\{\{(\w+)\}\}/g, (_, k) => esc(v[k] ?? ''))
}
function toast(t) {
  $('#toast').textContent = t
  $('#toast').classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500)
}
function openDialog(d) {
  lastFocus = document.activeElement
  if (!d.open) d.showModal()
}
function anyDialogOpen() {
  return [...document.querySelectorAll('dialog')].some((d) => d.open)
}
function stopNarration() {
  window.speechSynthesis?.cancel()
  reading = false
  $('#narrate').setAttribute('aria-pressed', 'false')
  $('#narrate').textContent = '◖ Read aloud'
  music.duck(false)
}
function closeStory() {
  stopNarration()
  destroyArcade()
  story.close()
  world.focus({ preventScroll: true })
}

/* ---------- presenter portrait (pixelated in the browser) ---------- */
async function preparePresenter() {
  $('#footer-presenter').textContent = `${presenter.name} · ${presenter.company}`.toUpperCase()
  $('#footer-legal').textContent = presenter.legal
  try {
    const cached = sessionStorage.getItem('choicewright:erik-pixel')
    erikPixel = cached || (await pixelate(presenter.headshot, { size: 40, scale: 6, focus: 'top' }))
    if (!cached) sessionStorage.setItem('choicewright:erik-pixel', erikPixel)
  } catch {
    erikPixel = presenter.headshot
  }
  try {
    const cached = sessionStorage.getItem('choicewright:albert-pixel')
    albertPixel = cached || (await pixelate(assistant.headshot, { size: 40, scale: 6, focus: 'top' }))
    if (!cached) sessionStorage.setItem('choicewright:albert-pixel', albertPixel)
  } catch {
    albertPixel = assistant.headshot
  }
  renderBubble()
  renderAlbert()
}

/* ---------- Albert: in-game support ---------- */
function albertHint() {
  if (!state.started) return 'Create your adventurer and I will point you to the first stop.'
  const next = nextLocation(state, locations, unlocked)
  const coinsLeft = mapCoins.length - state.coinsCollected.length
  if (state.docQuest === 'active') return `${mapDocs.length - state.docs.length} of my papers are still out on the map. They are the little white sheets.`
  if (state.ended && state.portal !== 'open') return 'Finished already? Off the marked paths, near the waterfall, something is humming.'
  if (state.ended && !state.albertMet) return 'Come find me in the castle keep. Erik will point you in.'
  if (state.ended) return `${coinsLeft ? coinsLeft + ' path coins are still out there, and' : 'Every path coin is found, and'} the arcade always takes another run.`
  if (state.done.includes('homes')) return 'Erik is at the gate, and I am right behind him in the keep. Come say hi.'
  if (next?.id === 'lookout') return 'The tower opens once you have the compass and the lens. Ellis is waiting.'
  if (coinsLeft > 8 && state.done.length > 1) return 'Walk the paths instead of jumping straight to a place. There are coins on them.'
  return next ? `Next stop: ${next.name}. Press E or tap ● when you are close.` : 'You are doing great. Keep going.'
}
function renderAlbert() {
  $('#albert-face').src = albertPixel
  $('#albert-hint').textContent = albertHint()
}
function askAlbert() {
  track('albert_open')
  const tips = [
    ['Moving', 'Walk with W A S D or the arrows, tap the map, or use the d-pad on a phone. Press E or tap ● near a glowing place to enter it.'],
    ['Coins', `${mapCoins.length - state.coinsCollected.length} of ${mapCoins.length} path coins are still on the map. Each is 3 coins. The arcade games pay up to 40 each; only a better run than your best adds more.`],
    ['Right now', albertHint()],
  ]
  if (state.docQuest === 'active') tips.push(['My papers', `Still missing: ${mapDocs.filter((d) => !state.docs.includes(d.id)).map((d) => d.label).join(', ')}.`])
  if (state.ended) tips.push(['After the key', 'Your buying plan is in the Series panel and the objective bar. You can send it to Erik, or download it and keep it.'])
  utilityView(
    'ASK ALBERT',
    `<div class="plan-erik"><img src="${albertPixel}" alt="" width="56" height="56" style="border-color:#8aa3ff"><div><strong>${esc(assistant.name)}</strong><small>${esc(assistant.role)} · ${esc(presenter.company)} · NMLS #${esc(assistant.nmls)}. ${esc(assistant.line)}</small></div></div><h2>What can I help with?</h2><ul class="albert-hint-list">${tips.map(([t, d]) => `<li><b>${esc(t)}:</b> ${esc(d)}</li>`).join('')}</ul><div class="utility-actions"><button class="primary" id="albert-go">${state.ended ? 'Open my buying plan' : 'Take me to my next stop'} →</button><button class="secondary" id="albert-erik">Ask ${esc(presenter.firstName)} a real question</button></div><p class="small">Albert answers inside the game. For a question about your own situation, the button sends it to ${esc(presenter.firstName)} and Albert, who read every message.</p>`,
  )
  $('#albert-go').onclick = () => {
    utility.close()
    goNext()
  }
  $('#albert-erik').onclick = () => {
    utility.close()
    $('#bubble-ask').click()
  }
}
$('#ask-albert').onclick = askAlbert

/* ---------- map, pins, coins, secrets ---------- */
function update() {
  const n = state.done.length,
    total = locations.length
  $('#progress').style.width = (n / total) * 100 + '%'
  $('#progress-label').textContent = `YOUR JOURNEY · ${n} OF ${total}`
  const next = nextLocation(state, locations, unlocked)
  $('#quest-intro').textContent = state.ended
    ? 'First quest complete! Your buying plan is unlocked.'
    : 'Collect the compass, lens, and map. Face your house decision. Reach the bridge to win this first quest.'
  $('#objective-text').textContent = state.ended
    ? 'You earned your First Key. Continue with your own buying plan, or keep filling your coin pouch in the arcade.'
    : next
      ? 'Next: ' + next.quest + '. ' + (state.inventory.filter((i) => ['compass', 'lens', 'map'].includes(i)).length < 3 ? `${Math.min(state.inventory.length, 3)}/3 tools collected.` : 'Your three tools are ready.')
      : 'Follow the highlighted path to the bridge.'
  $('#next-destination').textContent = state.ended ? 'Open my buying plan →' : next ? 'Go to ' + next.name + ' →' : 'Show me the way →'
  $('#player-label').textContent = state.profile.complete ? state.profile.name.toUpperCase() + '’S QUEST' : 'YOUR ADVENTURE'
  const token = $('#hero-token')
  if (state.avatar) {
    token.classList.add('avatar')
    token.style.backgroundImage = `url(${state.avatar})`
    token.style.backgroundPosition = 'center'
  } else {
    token.classList.remove('avatar')
    token.style.backgroundImage = ''
    token.style.backgroundPosition = heroOf().index * 50 + '% center'
  }
  $('#pins').innerHTML = locations
    .map((l) => {
      const available = unlocked(state, l),
        done = state.done.includes(l.id)
      return `<button class="pin ${done ? 'done' : !available ? 'locked' : 'active'}" style="left:${l.x}%;top:${l.y}%" data-place="${l.id}" aria-label="${esc(l.name)}${done ? ', completed' : available ? ', visit' : ', locked'}"><span class="pin-icon">${done ? '✓' : available ? l.symbol : '·'}</span><span class="pin-label">${esc(l.name)}</span></button>`
    })
    .join('')
  $('#teasers').innerHTML = teaserPins
    .map(
      (t) =>
        `<button class="pin teaser" style="left:${t.x}%;top:${t.y}%" data-teaser="${t.id}" aria-label="${esc(t.name)}, ${esc(t.label)}, coming soon"><span class="pin-icon">✧</span><span class="pin-label">${esc(t.label)}</span></button>`,
    )
    .join('')
  $('#coins').innerHTML = mapCoins
    .filter((c) => !state.coinsCollected.includes(c.id))
    .map((c) => `<span class="map-coin" data-coin="${c.id}" style="left:${c.x}%;top:${c.y}%;animation-delay:${(c.x * 7) % 10 / 10}s"></span>`)
    .join('')
  $('#docs').innerHTML =
    state.docQuest === 'active'
      ? mapDocs
          .filter((d) => !state.docs.includes(d.id))
          .map((d) => `<span class="map-doc" data-doc="${d.id}" data-label="${esc(d.label)}" style="left:${d.x}%;top:${d.y}%;animation-delay:${(d.x % 7) / 7}s"></span>`)
          .join('')
      : ''
  $('#secrets').innerHTML = secretSpots
    .map(
      (s) =>
        `<button class="secret ${state.portal}" style="left:${s.x}%;top:${s.y}%" data-secret="${s.id}" aria-label="${state.portal === 'hidden' ? 'Something unusual' : esc(s.name)}"><i></i><i></i><i></i></button>`,
    )
    .join('')
  $('#quest-list').innerHTML = locations
    .map(
      (l, i) =>
        `<li class="${state.done.includes(l.id) ? 'finished' : unlocked(state, l) ? 'current' : ''}"><b>${state.done.includes(l.id) ? '✓' : String(i + 1).padStart(2, '0')}</b><button data-place="${l.id}">${l.quest}</button></li>`,
    )
    .join('')
  document.querySelectorAll('[data-place]').forEach((b) => (b.onclick = () => travel(b.dataset.place)))
  document.querySelectorAll('[data-teaser]').forEach((b) => (b.onclick = () => showSeries(2)))
  document.querySelectorAll('[data-secret]').forEach((b) => (b.onclick = () => approachSecret(b.dataset.secret)))
  $('#items').innerHTML = items
    .map(
      (i) =>
        `<button class="item ${state.inventory.includes(i.id) ? 'earned' : ''} ${i.bonus ? 'bonus' : ''}" data-item="${i.id}" title="${state.inventory.includes(i.id) ? i.title : i.bonus ? 'A hidden bonus' : 'Not found yet'}" aria-label="${state.inventory.includes(i.id) ? i.title : 'Unfound item'}">${state.inventory.includes(i.id) ? i.symbol : '·'}</button>`,
    )
    .join('')
  document.querySelectorAll('[data-item]').forEach(
    (b) =>
      (b.onclick = () => {
        const i = items.find((i) => i.id === b.dataset.item)
        toast(state.inventory.includes(i.id) ? i.title + ': ' + i.text : i.bonus ? 'Somewhere off the marked paths, something hums.' : 'Explore Hearthvale to discover what belongs here.')
      }),
  )
  $('#coin-count').textContent = state.coins
  $('#coin-value').textContent = state.coins
    ? `${money(coinsToDollars(state.coins))} of fictional down payment · about ${money(coinsToMonthlySavings(state.coins))}/mo lower payment`
    : 'Walk the paths and play the arcade to fill your pouch.'
  position()
  $('#map-hint').textContent =
    state.docQuest === 'active'
      ? `Albert’s papers: ${state.docs.length}/${mapDocs.length} found`
      : state.ended
        ? 'Your first key is earned. The arcade and the portal are still open.'
        : `Next: ${next?.name || 'explore the town'}`
  renderBubble()
  renderAlbert()
}

/* ---------- movement engine ---------- */
const SPEED = 30 // percent of map per second
const held = new Set()
let target = null,
  onArrive = null,
  moving = false,
  rafId = 0,
  lastTs = 0,
  dustTimer = 0,
  saveTimer = 0,
  nearId = null,
  followCamera = true
try {
  followCamera = localStorage.getItem(KEY + ':follow') !== 'off'
} catch {}
const traveler = $('#traveler')
function position() {
  traveler.style.left = state.player.x + '%'
  traveler.style.top = state.player.y + '%'
  $('#hero-token').style.transform = state.player.facing < 0 ? 'scaleX(-1)' : ''
  camera()
}
function camera() {
  const zoomed = followCamera && world.clientWidth < 700
  world.classList.toggle('zoomed', zoomed)
  $('#zoom-toggle').setAttribute('aria-pressed', String(followCamera))
  if (!zoomed) {
    layer.style.transform = ''
    return
  }
  const Z = 1.9
  // Keep the traveler centered, clamped so the map edge never shows.
  const cx = Math.max(50 / Z, Math.min(100 - 50 / Z, state.player.x)),
    cy = Math.max(50 / Z, Math.min(100 - 50 / Z, state.player.y))
  // transform-origin is 0 0 and scale comes first, so the translate is in unscaled layer units.
  layer.style.transform = `scale(${Z}) translate(${50 / Z - cx}%, ${50 / Z - cy}%)`
}
function startLoop() {
  if (moving) return
  moving = true
  lastTs = performance.now()
  traveler.classList.add('walking')
  rafId = requestAnimationFrame(step)
}
function stopLoop() {
  moving = false
  cancelAnimationFrame(rafId)
  traveler.classList.remove('walking')
  save()
}
function step(ts) {
  if (!moving) return
  const dt = Math.min(0.05, (ts - lastTs) / 1000)
  lastTs = ts
  let dx = 0,
    dy = 0
  if (held.size) {
    if (held.has('left')) dx -= 1
    if (held.has('right')) dx += 1
    if (held.has('up')) dy -= 1
    if (held.has('down')) dy += 1
    target = null
    onArrive = null
  } else if (target) {
    dx = target.x - state.player.x
    dy = target.y - state.player.y
    const d = Math.hypot(dx, dy)
    // Arrive when within a step, or when already standing there (first frame has dt ≈ 0).
    if (d < Math.max(0.6, SPEED * dt)) {
      state.player.x = target.x
      state.player.y = target.y
      const cb = onArrive
      target = null
      onArrive = null
      position()
      checkCoins()
      stopLoop()
      cb?.()
      return
    }
  }
  const len = Math.hypot(dx, dy)
  if (!len) return stopLoop()
  dx /= len
  dy /= len
  // The map is 1.5:1, so vertical percent moves fewer pixels; scale y a little to feel even.
  state.player.x = Math.max(3, Math.min(97, state.player.x + dx * SPEED * dt))
  state.player.y = Math.max(5, Math.min(93, state.player.y + dy * SPEED * dt * 1.35))
  if (dx) state.player.facing = dx < 0 ? -1 : 1
  position()
  dustTimer += dt
  if (dustTimer > 0.22) {
    dustTimer = 0
    puff()
    music.effect('step-soft')
  }
  checkCoins()
  checkNear()
  saveTimer += dt
  if (saveTimer > 1) {
    saveTimer = 0
    save()
  }
  rafId = requestAnimationFrame(step)
}
function puff() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const d = document.createElement('span')
  d.className = 'dust'
  d.style.left = state.player.x + '%'
  d.style.top = state.player.y + 0.5 + '%'
  layer.appendChild(d)
  setTimeout(() => d.remove(), 600)
}
function walkTo(x, y, cb) {
  if (!state.started) return
  target = { x: Math.max(3, Math.min(97, x)), y: Math.max(5, Math.min(93, y)) }
  onArrive = cb || null
  startLoop()
}
function checkCoins() {
  for (const c of mapCoins) {
    if (state.coinsCollected.includes(c.id)) continue
    if (Math.hypot(c.x - state.player.x, (c.y - state.player.y) * 0.75) < 3.6) {
      collectMapCoin(state, c.id)
      const el = document.querySelector(`[data-coin="${c.id}"]`)
      if (el) {
        el.classList.add('taken')
        setTimeout(() => el.remove(), 700)
      }
      music.effect('coin')
      $('#coin-count').textContent = state.coins
      $('#coin-pouch').classList.add('bump')
      setTimeout(() => $('#coin-pouch').classList.remove('bump'), 400)
      toast(`+3 coins · ${state.coins} in your pouch`)
      track('coin_pickup', { coins: state.coins })
      if (state.coinsCollected.length === mapCoins.length) toast('Every path coin found! Hearthvale is yours.')
      save()
      update()
    }
  }
  if (state.docQuest === 'active')
    for (const d of mapDocs) {
      if (state.docs.includes(d.id)) continue
      if (Math.hypot(d.x - state.player.x, (d.y - state.player.y) * 0.75) < 3.8) {
        collectDoc(state, d.id)
        const el = document.querySelector(`[data-doc="${d.id}"]`)
        if (el) {
          el.classList.add('taken')
          setTimeout(() => el.remove(), 700)
        }
        music.effect('reward')
        track('doc_pickup', { doc: d.id, found: state.docs.length })
        save()
        update()
        if (state.docQuest === 'complete') {
          toast('All five documents found! Albert is running over.')
          setTimeout(() => {
            state.location = 'gate'
            state.history = []
            renderNode('albert-done')
          }, 700)
          return
        }
        toast(`${d.label} found · ${d.why}`)
      }
    }
  for (const s of secretSpots) {
    if (state.portal === 'hidden' && Math.hypot(s.x - state.player.x, (s.y - state.player.y) * 0.75) < s.radius) {
      state.portal = 'found'
      save()
      update()
      music.effect('reward')
      toast('Something hums near the waterfall…')
      track('portal_found')
    }
  }
}
function nearest() {
  let best = null,
    bd = Infinity
  for (const l of locations) {
    const d = Math.hypot(l.x - state.player.x, (l.y + 5 - state.player.y) * 0.75)
    if (d < bd) {
      bd = d
      best = { kind: 'place', id: l.id, name: l.name, d }
    }
  }
  for (const s of secretSpots) {
    if (state.portal === 'hidden') continue
    const d = Math.hypot(s.x - state.player.x, (s.y - state.player.y) * 0.75)
    if (d < bd) {
      bd = d
      best = { kind: 'secret', id: s.id, name: s.name, d }
    }
  }
  return best && best.d < 11 ? best : null
}
function checkNear() {
  const n = nearest()
  const id = n ? n.kind + ':' + n.id : null
  if (id === nearId) return
  nearId = id
  const hint = $('#enter-hint')
  document.querySelectorAll('.pin.near').forEach((p) => p.classList.remove('near'))
  if (!n) {
    hint.hidden = true
    return
  }
  const pin = document.querySelector(`[data-place="${n.id}"]`)
  pin?.classList.add('near')
  const touch = matchMedia('(pointer: coarse)').matches
  hint.innerHTML = `${touch ? '● ' : '<kbd>E</kbd> '}${esc(n.name)}`
  hint.hidden = false
}
function enterNearby() {
  const n = nearest()
  if (!n) return toast('Walk closer to a marked place, or tap it directly.')
  if (n.kind === 'secret') return approachSecret(n.id)
  travel(n.id)
}
function travel(id) {
  if (!state.started) return
  const loc = locations.find((l) => l.id === id)
  if (!unlocked(state, loc)) {
    toast('First: ' + loc.requires.filter((r) => !state.done.includes(r)).map((r) => locations.find((l) => l.id === r).name).join(' and '))
    return
  }
  $('#map-hint').textContent = 'Walking to ' + loc.name + '…'
  walkTo(loc.x + 2, loc.y + 6, () => {
    state.location = id
    state.history = []
    music.effect()
    track('location_enter', { location: id })
    renderNode(loc.start)
  })
}
function approachSecret(id) {
  const s = secretSpots.find((x) => x.id === id)
  if (!s) return
  walkTo(s.x + 3, s.y + 5, () => {
    state.location = 'secret'
    state.history = []
    if (state.portal === 'hidden') state.portal = 'found'
    if (state.portal === 'open') return renderNode('portal-open')
    renderNode('portal')
  })
}
// Keyboard: hold to walk. E/Enter to enter.
const dirKeys = { arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right', arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down' }
document.addEventListener('keydown', (e) => {
  if (!state.started || anyDialogOpen()) return
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return
  const k = e.key.toLowerCase()
  if (dirKeys[k]) {
    e.preventDefault()
    held.add(dirKeys[k])
    startLoop()
  } else if (k === 'e' || k === 'enter') {
    if (document.activeElement !== world && document.activeElement?.tagName === 'BUTTON') return
    e.preventDefault()
    enterNearby()
  }
})
document.addEventListener('keyup', (e) => {
  const k = dirKeys[e.key.toLowerCase()]
  if (k) held.delete(k)
})
window.addEventListener('blur', () => held.clear())
// Touch d-pad.
document.querySelectorAll('#dpad [data-dir]').forEach((b) => {
  const k = b.dataset.dir
  const down = (e) => {
    e.preventDefault()
    if (!state.started) return
    held.add(k)
    startLoop()
  }
  const up = (e) => {
    e.preventDefault()
    held.delete(k)
  }
  b.addEventListener('touchstart', down, { passive: false })
  b.addEventListener('touchend', up)
  b.addEventListener('touchcancel', up)
  b.addEventListener('mousedown', down)
  b.addEventListener('mouseup', up)
  b.addEventListener('mouseleave', up)
})
$('#dpad [data-act]').onclick = enterNearby
// Tap or click the map to walk there.
world.addEventListener('click', (e) => {
  if (!state.started) return
  if (e.target.closest('button')) return
  const r = layer.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 100,
    y = ((e.clientY - r.top) / r.height) * 100
  if (x < 0 || x > 100 || y < 0 || y > 100) return
  walkTo(x, y)
  world.focus({ preventScroll: true })
})
$('#zoom-toggle').onclick = () => {
  followCamera = !followCamera
  try {
    localStorage.setItem(KEY + ':follow', followCamera ? 'on' : 'off')
  } catch {}
  camera()
  toast(followCamera ? 'Camera follows you.' : 'Whole map view.')
}
window.addEventListener('resize', camera)

/* ---------- story ---------- */
function widget(type) {
  if (type === 'compare')
    return `<div class="numbers"><div><small>WILLOW · FICTIONAL / MONTH</small><strong>$2,400</strong><p class="small">Loan P&amp;I $1,600<br>Taxes &amp; insurance $400<br>Utilities $200 · Upkeep $200<br>HOA &amp; mortgage insurance $0 assumed</p></div><div><small>LANTERN · FICTIONAL / MONTH</small><strong>$3,300</strong><p class="small">Loan P&amp;I $2,200<br>Taxes &amp; insurance $600<br>Utilities $250 · Upkeep $250<br>HOA &amp; mortgage insurance $0 assumed</p></div></div>`
  if (type === 'monthly')
    return `<div class="numbers"><div><small>CHOSEN HOUSING BUDGET</small><strong>${money(state.vars.housing)}/mo</strong></div><div><small>AFTER EXPENSES &amp; SAVINGS GOAL</small><strong>${money(3400 - state.vars.housing)}/mo</strong></div></div>`
  if (type === 'reserve')
    return `<div class="budget-control"><label for="reserve-range">Keep in my emergency pouch</label><input type="range" id="reserve-range" min="0" max="4000" step="500" value="${Math.max(0, Math.min(4000, Number(state.vars.reserve) || 0))}"><output id="reserve-output" for="reserve-range">${money(state.vars.reserve)} reserved · ${money(4000 - state.vars.reserve)} for furniture</output></div>`
  if (type === 'roadmap')
    return `<ol class="buying-roadmap"><li><b>Prepare</b><span>Understand your budget and options.</span></li><li><b>Gather your team</b><span>Discuss representation and financing.</span></li><li><b>Find a home</b><span>Compare homes and make an offer.</span></li><li><b>Check the details</b><span>Inspections, financing, and contract deadlines.</span></li><li><b>Close &amp; move in</b><span>Review documents and complete the purchase.</span></li></ol>`
  if (type === 'repair')
    return `<div class="numbers"><div><small>YOUR EMERGENCY POUCH</small><strong>${money(state.vars.reserve)}</strong></div><div><small>FICTIONAL REPAIR ESTIMATE</small><strong>$3,000</strong></div></div>`
  if (type === 'downpayment') {
    const base = 300000,
      extra = coinsToDollars(state.coins)
    return `<div class="numbers three"><div><small>YOUR COIN POUCH</small><strong>◉ ${state.coins}</strong><p class="small">1 coin = $100 fictional down payment</p></div><div><small>EXTRA DOWN PAYMENT</small><strong>${money(extra)}</strong><p class="small">On a fictional ${money(base)} home</p></div><div><small>PAYMENT CHANGE</small><strong>−${money(coinsToMonthlySavings(state.coins))}/mo</strong><p class="small">30-year fixed at ${(config.fictional.rate * 100).toFixed(2)}%, principal &amp; interest only</p></div></div>`
  }
  if (type === 'documents')
    return `<div class="doc-list">${mapDocs.map((d) => `<div class="${state.docs.includes(d.id) ? 'got' : ''}"><span class="doc-mark">${state.docs.includes(d.id) ? '✓' : '▣'}</span><div><b>${esc(d.label)}</b><small>${esc(d.why)}</small></div></div>`).join('')}</div>`
  if (type === 'arizona')
    return `<div class="az-notes"><div><b>Home Plus</b><span>Arizona IDA · statewide</span><p>Up to 4% down payment and closing cost assistance.</p><a href="${sources.homePlus.url}" target="_blank" rel="noopener noreferrer">homeplusaz.com ↗</a></div><div><b>Home in Five Advantage</b><span>Maricopa County</span><p>Up to 5% assistance, plus 1% more for eligible buyers.</p><a href="${sources.homeInFive.url}" target="_blank" rel="noopener noreferrer">homein5.org ↗</a></div><div><b>VA-backed loans</b><span>Veterans, service members, survivors</span><p>Most buy with no down payment. A funding fee applies.</p><a href="${sources.va.url}" target="_blank" rel="noopener noreferrer">va.gov ↗</a></div><div><b>FHA loans</b><span>Lower down payment</span><p>Available to buyers with lower credit scores; mortgage insurance applies.</p><a href="${sources.loanTypes.url}" target="_blank" rel="noopener noreferrer">CFPB loan options ↗</a></div></div><p class="small">Program terms change and each has income, purchase-price, and education requirements. ${esc(presenter.name)} is licensed in ${esc(presenter.licensedIn)} and can confirm what applies to you.</p>`
  return ''
}
function speakerPortrait(node) {
  const s = node.speaker || ''
  if (s.startsWith('{{presenterName}}')) return `<img class="portrait" src="${erikPixel}" alt="">`
  if (s.startsWith('{{assistantName}}')) return `<img class="portrait albert" src="${albertPixel}" alt="">`
  if (s.startsWith('{{name}}')) return portraitHtml('portrait hero-portrait')
  return `<span class="sigil">${node.symbol}</span>`
}
function renderNode(id) {
  stopNarration()
  destroyArcade()
  const node = episode.nodes[id]
  if (!node) return
  const oldItems = state.inventory.length,
    oldCoins = state.coins
  state.node = id
  enter(state, node)
  if (state.inventory.length > oldItems) music.effect(node.ending ? 'finish' : 'reward')
  if (state.coins > oldCoins) toast(`+${state.coins - oldCoins} coins`)
  if (node.ending) trackOnce('game_complete', { coins: state.coins, nextStep: state.vars.nextStep })
  music.mood = ['inspection', 'self-fund'].includes(id) ? 'tense' : id.startsWith('portal') || id.startsWith('ledger') ? 'mystic' : 'explore'
  save()
  update()
  track('scene', { node: id })
  const loc = locations.find((l) => l.id === state.location)
  $('#scene-location').textContent = `${id.startsWith('albert') ? 'The Loan Castle keep' : loc ? loc.name : 'Off the marked paths'} · ${node.ending ? 'JOURNEY COMPLETE' : id.startsWith('portal') || id.startsWith('ledger') ? 'THE CREDIT COMPASS · PREVIEW' : 'THE FIRST KEY'}`
  const game = node.minigame && GAMES[node.minigame]
  const best = node.minigame && state.minigames[node.minigame]
  $('#story-body').innerHTML =
    `<div class="scene-enter">${node.ending ? '<div class="ending-seal">⚿</div>' : ''}<div class="character">${speakerPortrait(node)}${interpolate(node.speaker)}</div><h2>${interpolate(node.title)}</h2><div class="prose">${node.text.map((p) => `<p>${interpolate(p)}</p>`).join('')}</div>${node.widget ? widget(node.widget) : ''}${node.lesson ? `<div class="lesson"><small>PACK THIS FOR REAL LIFE</small>${node.lesson}</div>` : ''}${node.ending ? `<div class="complete-metrics"><span>${locations.length} places explored</span><span>${state.inventory.length} discoveries earned</span><span>◉ ${state.coins} coins</span></div>` : ''}${
      game
        ? `<button class="minigame-launch" data-game="${node.minigame}"><span class="mg-icon">${game.icon}</span><span><strong>Bonus game: ${game.title}</strong><small>${game.blurb}${best ? ` · Best ◉ ${best.coins}` : ' · Earn up to 40 coins'}</small></span><span>▶</span></button>`
        : ''
    }<div class="choices">${node.choices.map((c, i) => `<button class="choice" data-choice="${i}"><span>${i + 1}</span><div><strong>${interpolate(c.label)}</strong>${c.detail ? `<small>${interpolate(c.detail)}</small>` : ''}</div><span>→</span></button>`).join('')}</div></div>`
  $('#story-body').scrollTop = 0
  $('#back-scene').disabled = !state.history.length
  $('#scene-count').textContent = `${state.done.length}/${locations.length} places · ◉ ${state.coins}`
  $('#scene-source').hidden = !node.source
  document.querySelectorAll('[data-choice]').forEach((b) => (b.onclick = () => act(Number(b.dataset.choice))))
  document.querySelectorAll('[data-game]').forEach((b) => (b.onclick = () => launchArcade(b.dataset.game, 'story')))
  const range = $('#reserve-range')
  if (range)
    range.oninput = () => {
      $('#reserve-output').textContent = `${money(+range.value)} reserved · ${money(4000 - range.value)} for furniture`
    }
  openDialog(story)
}
async function act(i) {
  const node = episode.nodes[state.node],
    c = node.choices[i]
  if (!c) return
  state.history.push(JSON.stringify({ ...state, history: [], avatar: null }))
  if (state.history.length > 30) state.history.shift()
  if (node.widget === 'reserve') state.vars.reserve = +$('#reserve-range').value
  music.effect()
  track('choice', { node: state.node, choice: i })
  if (c.to.startsWith('@')) {
    if (c.to === '@portal-unlock') return unlockPortal()
    save()
    closeStory()
    update()
    if (c.to === '@journal') showJournal()
    if (c.to === '@series') showSeries()
    if (c.to === '@plan') showPlan()
    if (c.to === '@next') goNext()
    if (c.to === '@card') showCard()
    return
  }
  choose(state, c)
  renderNode(c.to)
}
async function unlockPortal() {
  stopNarration()
  const r = await requestLead({
    funnel: 'game-portal',
    eyebrow: 'THE KEEPER OF THE GATE',
    title: 'Leave your name and the seal opens.',
    intro: `Optional. ${presenter.firstName} will send the Credit Compass preview when the series opens, and nothing else unless you ask. The portal opens either way.`,
    submit: 'Open the seal',
    context: gameContext('portal'),
  })
  state.lead.portal = r.skipped ? 'skipped' : r.delivered ? 'delivered' : 'failed'
  state.portal = 'open'
  save()
  update()
  music.effect('finish')
  track('portal_open', { lead: state.lead.portal })
  renderNode('portal-open')
}
function gameContext(kind) {
  const plan = learningPlan(state.profile)
  return {
    game_stage: kind,
    adventurer: heroOf().name,
    goal: plan.goal,
    pace: state.profile.timeline,
    biggest_question: state.profile.question,
    housing_budget_fictional: money(state.vars.housing),
    repair_response: state.vars.resolution || '',
    next_step: state.vars.nextStep || '',
    coins: state.coins,
    arcade_best: Object.entries(state.minigames).map(([k, v]) => `${k}:${v.score}`).join(', '),
    plan_focus: plan.title,
    plan_done: state.planTasks.join(', '),
    visited_arizona_notes: state.visitedArizona ? 'yes' : 'no',
    met_albert: state.albertMet ? 'yes' : 'no',
    documents_gathered: state.docs.length + '/' + mapDocs.length,
    portal: state.portal,
  }
}
$('#back-scene').onclick = () => {
  if (!state.history.length) return
  const history = [...state.history],
    previous = JSON.parse(history.pop())
  const { profile, avatar, coins, coinsCollected, minigames, lead, portal, albertMet, docQuest, docs } = state
  state = { ...previous, profile, avatar, coins, coinsCollected, minigames, lead, portal, albertMet, docQuest, docs, history }
  renderNode(state.node)
}
$('#close-story').onclick = closeStory
story.addEventListener('cancel', (e) => {
  e.preventDefault()
  closeStory()
})
$('#narrate').onclick = () => {
  if (reading) return stopNarration()
  if (!window.speechSynthesis) return toast('Read-aloud is not available in this browser. All dialogue is on screen.')
  const node = episode.nodes[state.node],
    u = new SpeechSynthesisUtterance([interpolate(node.title), ...node.text.map(interpolate), node.lesson || ''].join('. ').replace(/&[a-z#0-9]+;/g, ' '))
  u.rate = 0.96
  u.pitch = 0.93
  u.lang = 'en-US'
  u.volume = audioPrefs.voice / 100
  u.onend = u.onerror = () => stopNarration()
  reading = true
  $('#narrate').setAttribute('aria-pressed', 'true')
  $('#narrate').textContent = '■ Stop reading'
  music.duck(true)
  speechSynthesis.speak(u)
}

/* ---------- arcade (in-story and from the panel) ---------- */
function destroyArcade() {
  if (activeArcade) {
    activeArcade.destroy()
    activeArcade = null
  }
}
async function launchArcade(id, from) {
  const meta = GAMES[id]
  if (!meta) return
  let mod
  try {
    mod = (await import(`./arcade/${id}.js`)).default
  } catch (e) {
    toast('That game could not load right now.')
    return
  }
  stopNarration()
  const inStory = from === 'story' && story.open
  const host = inStory ? $('#story-body') : $('#utility-body')
  if (!inStory) {
    $('#utility-label').textContent = 'HEARTHVALE ARCADE'
    openDialog(utility)
  } else $('#scene-location').textContent = `HEARTHVALE ARCADE · ${meta.title.toUpperCase()}`
  destroyArcade()
  host.innerHTML = `<div class="arcade-host"><div class="arcade-host-top"><span class="eyebrow">${esc(meta.where.toUpperCase())} · BONUS GAME</span><button class="secondary" id="arcade-back">${inStory ? '← Back to the story' : '← All games'}</button></div><div id="arcade-mount"></div><p class="small">Coins you earn here join your pouch. Only a better run than your best adds more. <a href="arcade/${id}.html" target="_blank" rel="noopener">Open this game on its own page to share it ↗</a></p></div>`
  host.scrollTop = 0
  const back = () => {
    destroyArcade()
    if (inStory) renderNode(state.node)
    else showArcade()
  }
  $('#arcade-back').onclick = back
  music.duck(true)
  activeArcade = (await import('./arcade/arcade-core.js')).runGame(mod, {
    container: '#arcade-mount',
    onEnd: (r) => {
      const gained = recordMinigame(state, r)
      save()
      update()
      music.duck(false)
      toast(gained ? `+${gained} coins for your pouch · ${state.coins} total` : `Best so far: ◉ ${state.minigames[id].coins}. Beat it to earn more.`)
    },
    actions: [{ label: inStory ? 'Back to the story →' : 'Back to the arcade →', primary: true, onClick: back }],
  })
}
function showArcade() {
  destroyArcade()
  utilityView(
    'HEARTHVALE ARCADE',
    `<h2>Four quick games. Real lessons. Pretend coins.</h2><p>Every coin is $100 of fictional down payment at the gate. Play here any time, or share a game on its own page.</p><div class="arcade-list">${Object.entries(GAMES)
      .map(([id, g]) => {
        const b = state.minigames[id]
        return `<div class="arcade-row"><span class="mg-icon">${g.icon}</span><div><strong>${g.title}</strong><small>${g.blurb}</small><small class="muted">${b ? `Best score ${b.score} · ◉ ${b.coins} · ${b.plays} play${b.plays === 1 ? '' : 's'}` : 'Not played yet'}</small></div><div class="arcade-row-actions"><button class="primary" data-play="${id}">Play ▶</button><button class="secondary" data-share="${id}" title="Copy a link to this game">↗</button></div></div>`
      })
      .join('')}</div><div class="numbers"><div><small>COIN POUCH</small><strong>◉ ${state.coins}</strong></div><div><small>FICTIONAL PAYMENT CHANGE</small><strong>−${money(coinsToMonthlySavings(state.coins))}/mo</strong></div></div><p class="small">Games are original and fictional. They practice ideas; they do not predict prices, rates, or approvals. <a href="arcade/" target="_blank" rel="noopener">Open the arcade page ↗</a></p>`,
  )
  document.querySelectorAll('[data-play]').forEach((b) => (b.onclick = () => launchArcade(b.dataset.play, 'panel')))
  document.querySelectorAll('[data-share]').forEach(
    (b) =>
      (b.onclick = async () => {
        const url = new URL(`arcade/${b.dataset.share}.html`, location.href).href
        const g = GAMES[b.dataset.share]
        try {
          if (navigator.share) await navigator.share({ title: g.title, text: g.blurb + ' Can you beat my score?', url })
          else {
            await navigator.clipboard.writeText(url)
            toast('Game link copied.')
          }
          track('share', { game: b.dataset.share })
        } catch {}
      }),
  )
}
$('#arcade-button').onclick = () => {
  if (!state.started) return toast('Create your adventurer first, then the arcade opens.')
  showArcade()
}

/* ---------- sound ---------- */
function syncSound() {
  document.querySelectorAll('[data-prologue-sound]').forEach((b) => (b.textContent = music.on ? '♫ Mute' : '♫ Sound on'))
  $('#music').setAttribute('aria-pressed', String(music.on))
  $('#music span').textContent = music.on ? 'Sound on' : 'Sound off'
  $('#music-volume').value = audioPrefs.music
  $('#voice-volume').value = audioPrefs.voice
  $('#music-level').textContent = audioPrefs.music + '%'
  $('#voice-level').textContent = audioPrefs.voice + '%'
  $('#sound-mute').textContent = music.on ? 'Mute music' : 'Turn music on'
}
async function toggleMusic() {
  if (music.on) music.stop()
  else {
    const ok = await music.start()
    if (!ok) toast('Audio is unavailable here. You can keep playing quietly.')
  }
  syncSound()
}
$('#music').onclick = toggleMusic
function soundPanel() {
  if ($('#prologue').open) {
    prologuePaused = true
    renderPrologue()
  }
  syncSound()
  openDialog($('#sound-panel'))
}
$('#audio-settings').onclick = soundPanel
$('#story-volume').onclick = soundPanel
$('#close-sound').onclick = () => $('#sound-panel').close()
$('#sound-mute').onclick = toggleMusic
function saveAudio() {
  try {
    localStorage.setItem(KEY + ':audio', JSON.stringify(audioPrefs))
  } catch {}
}
$('#music-volume').oninput = (e) => {
  audioPrefs.music = +e.target.value
  music.setVolume(audioPrefs.music / 100)
  syncSound()
  saveAudio()
}
$('#voice-volume').oninput = (e) => {
  audioPrefs.voice = +e.target.value
  syncSound()
  saveAudio()
}

/* ---------- utility panels ---------- */
function utilityView(label, html) {
  destroyArcade()
  $('#utility-label').textContent = label
  $('#utility-body').innerHTML = html
  openDialog(utility)
  $('#utility-body').scrollTop = 0
}
$('#close-utility').onclick = () => {
  destroyArcade()
  utility.close()
  lastFocus?.focus?.()
}
utility.addEventListener('cancel', () => destroyArcade())
const MAIN_SOURCES = ['budget', 'loans', 'inspection', 'downPayment']
function showSources(only) {
  const entries = only ? [[only, sources[only]]] : Object.entries(sources).filter(([id]) => MAIN_SOURCES.includes(id) || (state.visitedArizona && ['homePlus', 'homeInFive', 'va', 'loanTypes'].includes(id)) || (state.portal === 'open' && ['credit', 'dispute'].includes(id)) || (state.albertMet && id === 'preapproval'))
  utilityView(
    'THE FACTS BEHIND THE ADVENTURE',
    `<h2>Fantasy world. Grounded lessons.</h2><p>Characters, prices, households, and outcomes are fictional. Educational claims are linked to these public resources. Reviewed September 8, 2026. This is introductory education, not a loan offer, credit-score forecast, or individual financial advice.</p>${entries.map(([id, s]) => `<div class="source-card"><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a><small>${s.publisher} · ${s.note}</small></div>`).join('')}<p class="small">Your gameplay stays in this browser unless you choose to send a message to ${esc(presenter.name)}. There is no credit pull, report upload, or application in this game. Read-aloud uses your browser’s voice service when available.</p><p class="small">${esc(presenter.legal)}</p>`,
  )
}
$('#sources').onclick = () => showSources()
$('#scene-source').onclick = () => showSources(episode.nodes[state.node].source)
const nextSteps = () => learningPlan(state.profile).tasks.map((t) => t.title + ': ' + t.detail)
function journalText() {
  const lessons = [...state.done.map((id) => locations.find((l) => l.id === id).quest.toUpperCase() + '\n' + journalLessons[id])]
  if (state.visitedArizona) lessons.push('ARIZONA FIELD NOTES\n' + journalLessons.arizona)
  if (state.docQuest === 'complete') lessons.push('ALBERT’S READY SATCHEL\n' + journalLessons.albert)
  if (state.portal === 'open') lessons.push('THE CREDIT COMPASS (PREVIEW)\n' + journalLessons.portal)
  return [
    'THE FIRST KEY — MY FIELD JOURNAL',
    `A Choicewright adventure · presented by ${presenter.name}, ${presenter.company} · NMLS #${presenter.nmls}`,
    'Fictional training choices, not a loan approval or credit assessment.',
    '',
    ...lessons,
    '',
    `Adventurer: ${state.profile.name}`,
    `My goal: ${learningPlan(state.profile).goal}`,
    `My pace: ${learningPlan(state.profile).pace}`,
    `Fictional monthly housing budget: ${money(state.vars.housing)}`,
    `Fictional reserve before repair: ${money(state.vars.reserve)}`,
    `Repair response: ${state.vars.resolution || 'Not reached yet'}`,
    `Coin pouch: ${state.coins} coins = ${money(coinsToDollars(state.coins))} fictional down payment (about ${money(coinsToMonthlySavings(state.coins))}/mo lower payment)`,
    '',
    'MY NEXT STEPS',
    ...nextSteps().map((s, i) => `${i + 1}. ${s}`),
    '',
    'QUESTIONS FOR MY GUIDE',
    'What does my complete monthly housing budget look like?',
    'Which loan features and costs are different between these options?',
    'What happens if an inspection uncovers a repair?',
    'Which down payment assistance or loan programs could apply to me?',
    'What should I understand or prepare before moving forward?',
    '',
    `TALK TO ${presenter.name.toUpperCase()}`,
    `${presenter.phone} · ${presenter.email} · ${presenter.site}`,
    '',
    'SOURCES · Reviewed September 8, 2026',
    ...Object.entries(sources)
      .filter(([id]) => MAIN_SOURCES.includes(id) || (state.visitedArizona && ['homePlus', 'homeInFive', 'va'].includes(id)))
      .map(([, s]) => s.publisher + ' — ' + s.title + '\n' + s.url),
  ].join('\n')
}
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function downloadJournal() {
  downloadBlob(new Blob([journalText()], { type: 'text/plain;charset=utf-8' }), 'The-First-Key-Field-Journal.txt')
  toast('Your field journal is ready to take with you.')
  track('journal_download')
}
function showJournal() {
  const entries = state.done.map((id) => `<div class="journal-entry"><h3>${locations.find((l) => l.id === id).quest}</h3><p>${journalLessons[id]}</p></div>`)
  if (state.visitedArizona) entries.push(`<div class="journal-entry bonus"><h3>Arizona field notes</h3><p>${journalLessons.arizona}</p></div>`)
  if (state.docQuest === 'complete') entries.push(`<div class="journal-entry bonus"><h3>Albert’s Ready Satchel</h3><p>${journalLessons.albert}</p></div>`)
  if (state.portal === 'open') entries.push(`<div class="journal-entry bonus"><h3>The Credit Compass · preview</h3><p>${journalLessons.portal}</p></div>`)
  utilityView(
    'YOUR FIELD JOURNAL',
    `<h2>${state.ended ? 'Your next chapter starts here.' : 'Understanding, collected.'}</h2><p>${state.done.length ? `${state.done.length} of ${locations.length} places explored. These are the lessons you have gathered.` : 'Your journal is empty. Visit your cottage to begin collecting lessons.'}</p>${entries.join('')}${state.done.includes('market') ? `<div class="numbers three"><div><small>FICTIONAL HOUSING BUDGET</small><strong>${money(state.vars.housing)}/mo</strong></div><div><small>RESERVE BEFORE REPAIR</small><strong>${money(state.vars.reserve)}</strong></div><div><small>COIN POUCH</small><strong>◉ ${state.coins}</strong></div></div>` : ''}${
      state.ended
        ? `<h3>Take one step into the real world</h3><ol>${nextSteps().map((s) => `<li>${s}</li>`).join('')}</ol><p>Bring this journal to a buyer or lender conversation. Use it to explain your questions and what you want to understand next.</p>`
        : ''
    }<div class="utility-actions"><button class="primary" id="download-journal">Download my journal ↓</button><button class="secondary" id="share">Share the adventure ↗</button>${state.ended ? '<button class="secondary" id="journal-plan">Open my buying plan →</button><button class="secondary" id="restart">Try another path</button>' : ''}</div><p class="small">Saved only on this device. Downloading or sharing does not send your information to anyone.</p>`,
  )
  $('#download-journal').onclick = downloadJournal
  $('#share').onclick = share
  if ($('#journal-plan')) $('#journal-plan').onclick = showPlan
  const restart = $('#restart')
  if (restart)
    restart.onclick = () => {
      utilityView(
        'ANOTHER PATH',
        `<h2>Start a fresh adventure?</h2><p>This replaces the saved journey on this device. Your adventurer, photo, coins, and arcade bests stay with you. Download your current field journal first if you want to keep it.</p><div class="utility-actions"><button id="confirm-restart" class="primary">Start fresh</button><button id="cancel-restart" class="secondary">Keep my journey</button></div>`,
      )
      $('#confirm-restart').onclick = () => {
        const { profile, avatar, coins, coinsCollected, minigames, lead, portal, albertMet, docQuest, docs } = state
        state = { ...initialState(), profile, avatar, coins, coinsCollected, minigames, lead, portal, albertMet, docQuest, docs, started: true }
        save()
        utility.close()
        update()
        track('restart')
        renderNode('letter')
      }
      $('#cancel-restart').onclick = showJournal
    }
}
$('#journal').onclick = showJournal
async function share() {
  const data = {
    title: 'The First Key',
    text: 'A little adventure about a big life decision. Explore Hearthvale, put your face in the game, and find your first key.',
    url: location.origin + location.pathname + (partner ? `?partner=${encodeURIComponent(partner.name)}` : ''),
  }
  try {
    if (navigator.share) await navigator.share(data)
    else if (navigator.clipboard) {
      await navigator.clipboard.writeText(data.url)
      toast('Adventure link copied.')
    } else toast('Copy the address in your browser to share this adventure.')
    track('share', { what: 'game' })
  } catch (e) {
    if (e.name !== 'AbortError') toast('Copy the address in your browser to share this adventure.')
  }
}
function showSeries(focusEpisode) {
  const cards = episodes
    .map((e) => {
      const status = e.status === 'playable' ? 'PLAYABLE NOW' : e.status === 'next' ? 'NEXT · IN DEVELOPMENT' : 'PLANNED'
      return `<div class="series-card ${e.status} ${focusEpisode === e.number ? 'focus' : ''}"><span class="eyebrow">EPISODE ${String(e.number).padStart(2, '0')} · ${status}</span><h3>${e.title}</h3><p>${e.tagline}</p>${e.teaser ? `<ul class="teaser-list">${e.teaser.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}${
        e.status === 'playable'
          ? `<button class="primary" id="return-game">${state.ended ? 'Return to Hearthvale' : 'Continue my adventure'} →</button>`
          : e.status === 'next'
            ? `<button class="secondary" id="episode-notify">${state.lead.episode ? '✓ You’re on the list' : 'Tell me when it opens'}</button>`
            : ''
      }</div>`
    })
    .join('')
  utilityView(
    'THE CHOICEWRIGHT COLLECTION',
    `<h2>One world of possibilities.</h2><p>Adventures that help you practice the decisions waiting in real life. Presented by ${esc(presenter.name)}, ${esc(presenter.company)}.</p>${cards}<div class="series-card"><span class="eyebrow">YOUR NEXT STEP · ${state.ended ? 'UNLOCKED' : 'FINISH THE FIRST QUEST TO UNLOCK'}</span><h3>Your Buying Plan</h3><p>A personal checklist based on your goals, timing, and the questions you want answered. Send it to ${esc(presenter.firstName)} when you are ready to talk.</p><button class="secondary" id="series-plan">${state.ended ? 'Open my plan →' : 'Continue my first quest →'}</button></div><div class="series-card"><span class="eyebrow">THE CREDIT COMPASS · SIDE SERIES · ${state.portal === 'open' ? 'PREVIEW UNLOCKED' : 'HIDDEN IN HEARTHVALE'}</span><h3>A number is not your story.</h3><p>A planned adventure about understanding your reports, investigating errors, building healthy habits, and recognizing credit-repair traps. ${state.portal === 'open' ? 'You opened the portal by the waterfall.' : 'Somewhere off the marked paths, a ring of stones is humming.'}</p><ol><li><b>The Hidden Ledger:</b> read a report and understand what a score represents.</li><li><b>The False Entry:</b> gather evidence and practice an accurate dispute.</li><li><b>The Steady Path:</b> work through payment and balance decisions over time.</li><li><b>The Shortcut Seller:</b> spot promises no one can guarantee.</li></ol><p class="small">Research foundation: CFPB and FTC consumer guidance. Real credit outcomes vary; this series will not promise a point increase or instant repair.</p><button class="secondary" id="credit-facts">Explore the research ↗</button></div>`,
  )
  $('#return-game').onclick = () => utility.close()
  $('#series-plan').onclick = () => {
    if (state.ended) showPlan()
    else {
      utility.close()
      goNext()
    }
  }
  $('#credit-facts').onclick = () => showSources('rebuild')
  const notify = $('#episode-notify')
  if (notify)
    notify.onclick = async () => {
      const r = await requestLead({
        funnel: 'game-episode',
        eyebrow: 'EPISODE 2 · THE PRE-APPROVAL SCROLL',
        title: 'Be first through the gate.',
        intro: `Leave your name and ${presenter.firstName} will let you know when Episode 2 opens. Nothing else unless you ask.`,
        submit: 'Put me on the list',
        context: gameContext('episode2'),
      })
      if (r.ok) {
        state.lead.episode = r.delivered ? 'delivered' : 'failed'
        save()
        toast(r.delivered ? 'You’re on the list for Episode 2.' : `We couldn’t send that just now. Text ${presenter.phone} and ${presenter.firstName} will add you.`)
        showSeries(2)
      }
    }
  if (focusEpisode) setTimeout(() => document.querySelector('.series-card.focus')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50)
}
$('#series').onclick = () => showSeries()

/* ---------- share card ---------- */
async function showCard() {
  utilityView('YOUR ADVENTURER CARD', `<h2>Making your card…</h2><p class="small">Drawn on this device.</p>`)
  let url = ''
  try {
    const blob = await shareCard({
      avatar: state.avatar,
      name: state.profile.name,
      headline: `${state.profile.name} earned the First Key`,
      subline: `${heroOf().name} · ${learningPlan(state.profile).title}`,
      footer: `Play at ${presenter.site.replace(/^https?:\/\/(www\.)?/, '')}/play · presented by ${presenter.name}, ${presenter.company}`,
      coins: state.coins,
    })
    url = URL.createObjectURL(blob)
    utilityView(
      'YOUR ADVENTURER CARD',
      `<h2>${esc(state.profile.name)}, you look great in pixels.</h2><img class="card-preview" src="${url}" alt="Adventurer card"><div class="utility-actions"><button class="primary" id="card-download">Download ↓</button><button class="secondary" id="card-share">Share ↗</button>${state.avatar ? '' : '<button class="secondary" id="card-photo">Add my photo first</button>'}</div><p class="small">${state.avatar ? 'Your photo was turned into pixels on this device and never uploaded.' : 'Add a photo in My adventurer to put your own face on the card.'}</p>`,
    )
    $('#card-download').onclick = () => {
      downloadBlob(blob, 'My-First-Key-Adventurer.png')
      track('card_download')
    }
    $('#card-share').onclick = async () => {
      const file = new File([blob], 'first-key.png', { type: 'image/png' })
      try {
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'The First Key', text: 'I earned my First Key in Hearthvale.' })
        else {
          downloadBlob(blob, 'My-First-Key-Adventurer.png')
          toast('Saved. Post it anywhere you like.')
        }
        track('card_share')
      } catch {}
    }
    if ($('#card-photo')) $('#card-photo').onclick = () => showSetup(true)
  } catch (e) {
    utilityView('YOUR ADVENTURER CARD', `<h2>The card could not be drawn here.</h2><p>Try another browser, or download your field journal instead.</p>`)
  }
}

/* ---------- Erik bubble ---------- */
let bubbleOpen = false,
  bubbleDismissed = false,
  bubbleLast = '',
  bubbleQuietTimer = 0
try {
  bubbleDismissed = sessionStorage.getItem('choicewright:bubble') === 'off'
} catch {}
function bubbleLine() {
  if (!state.started) return `Hi, I’m ${presenter.firstName}. I’m the only real person in Hearthvale.`
  if (state.ended) return 'Nice work on that key. Want me to read your plan before we talk?'
  if (state.node === 'lender' || state.node === 'arizona') return 'The flag on the gate is mine. Ask me anything, and say hi to Albert in the keep.'
  if (state.done.includes('homes')) return 'Roof leak, huh? Come see me at the gate.'
  if (state.done.includes('market')) return 'Good pouch. Keep it separate from the down payment.'
  return 'Stuck on the numbers? I’m the lender at the gate.'
}
function renderBubble() {
  const b = $('#erik-bubble')
  b.hidden = false
  b.classList.toggle('dismissed', bubbleDismissed && !bubbleOpen)
  $('#bubble-portrait').src = erikPixel
  $('#bubble-portrait-2').src = erikPixel
  const line = bubbleLine()
  if (line !== bubbleLast) {
    bubbleLast = line
    $('#bubble-say').textContent = line
    b.classList.remove('quiet')
    clearTimeout(bubbleQuietTimer)
    bubbleQuietTimer = setTimeout(() => b.classList.add('quiet'), 9000)
  }
  $('#bubble-name').textContent = presenter.name
  $('#bubble-role').textContent = `${presenter.role} · ${presenter.company} · NMLS #${presenter.nmls}`
  $('#bubble-blurb').textContent = `${presenter.tagline} Straight answers, no pressure, licensed in ${presenter.licensedIn}. ${assistant.firstName} and I both read every message. Call, text, or send a question from the game.`
  const links = contactLinks()
  $('#bubble-call').href = links.call
  $('#bubble-call').textContent = `Call ${presenter.phone}`
  $('#bubble-text').href = links.text
  $('#bubble-email').href = links.email
  $('#bubble-plan').hidden = !state.ended
  $('#bubble-legal').textContent = presenter.legal
  $('#bubble-card').hidden = !bubbleOpen
  $('#bubble-face').setAttribute('aria-expanded', String(bubbleOpen))
}
$('#bubble-face').onclick = () => {
  bubbleOpen = !bubbleOpen
  bubbleDismissed = false
  renderBubble()
  if (bubbleOpen) track('contact_open')
}
$('#bubble-close').onclick = () => {
  bubbleOpen = false
  bubbleDismissed = true
  try {
    sessionStorage.setItem('choicewright:bubble', 'off')
  } catch {}
  renderBubble()
}
;['bubble-call', 'bubble-text', 'bubble-email'].forEach((id) => ($('#' + id).onclick = () => track('contact_click', { via: id.replace('bubble-', '') })))
$('#bubble-ask').onclick = async () => {
  bubbleOpen = false
  renderBubble()
  const r = await requestLead({
    funnel: 'game-question',
    eyebrow: 'ASK ' + presenter.firstName.toUpperCase(),
    title: 'What’s on your mind?',
    intro: `Ask anything about buying a home in ${presenter.licensedIn}. ${presenter.firstName} answers personally, usually the same business day.`,
    submit: 'Send my question',
    messageLabel: 'Your question',
    context: gameContext('question'),
  })
  if (r.ok) toast(r.delivered ? `Sent. ${presenter.firstName} will get back to you.` : `We couldn’t send that just now. Text or call ${presenter.phone}.`)
}
$('#bubble-plan').onclick = () => {
  bubbleOpen = false
  renderBubble()
  sendPlan()
}
async function sendPlan() {
  const p = learningPlan(state.profile)
  const r = await requestLead({
    funnel: 'game-plan',
    eyebrow: 'YOUR BUYING PLAN',
    title: `Send my plan to ${presenter.firstName}.`,
    intro: `${presenter.firstName} reads your plan (${p.title}) and your game choices before you talk, so the first conversation starts in the middle. No application, no credit pull.`,
    submit: 'Send my plan',
    messageLabel: 'Anything you want to add? (optional)',
    context: gameContext('plan'),
  })
  if (r.ok) {
    state.lead.plan = r.delivered ? 'delivered' : 'failed'
    save()
    toast(r.delivered ? `Sent. ${presenter.firstName} will read it before you talk.` : `We couldn’t send that just now. Download your plan and text it to ${presenter.phone}.`)
    if (utility.open && $('#plan-send')) showPlan()
  }
}

/* ---------- welcome, setup, prologue, plan ---------- */
async function begin(sound) {
  if (sound && !music.on) await toggleMusic()
  welcome.close()
  trackOnce('game_start', { returning: !!saved })
  if (state.profile.complete) {
    state.started = true
    save()
    update()
    if (state.ended) showPlan()
    else renderNode(state.node)
  } else showSetup(false)
}
$('#begin').onclick = () => begin(true)
$('#quiet').onclick = () => begin(false)
if (saved?.started && state.profile.complete) {
  $('#begin').innerHTML = 'Continue your adventure <span>→</span>'
  $('#quiet').textContent = 'Continue without sound'
} else if (saved?.started) {
  $('.welcome-body>p').innerHTML = 'Your adventure has a new beginning.<br>Choose your character, then continue your saved journey.'
}
welcome.addEventListener('cancel', (e) => e.preventDefault())
document.addEventListener('keydown', (e) => {
  if (story.open && !utility.open && !$('#sound-panel').open && !$('#lead')?.open && !activeArcade && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && ['1', '2', '3'].includes(e.key)) {
    e.preventDefault()
    act(+e.key - 1)
  }
})
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopNarration()
    held.clear()
    if ($('#prologue').open) {
      prologuePaused = true
      renderPrologue()
    }
    if (music.on) music.ctx?.suspend()
  } else if (music.on) music.ctx?.resume()
})
setInterval(() => {
  if (state.started && !state.ended && !document.hidden) {
    state.elapsed += 10
    save()
  }
}, 10000)
function goNext() {
  if (!state.started) return showSetup(false)
  if (state.ended) return showPlan()
  const next = nextLocation(state, locations, unlocked)
  if (next) travel(next.id)
  else toast('Open your field journal to see your progress.')
}
$('#next-destination').onclick = goNext
function howToPlay() {
  utilityView(
    'YOUR FIRST QUEST',
    `<h2>From rent day to your first key.</h2><p>Your long-term adventure is buying a home. This opening quest is a short practice run that unlocks your personal buying plan.</p><ol class="how-steps"><li><b>Collect three tools.</b> Visit the provisioner, the guild, and the mapmaker’s tower.</li><li><b>Face your first house decision.</b> Visit Three-Door Lane and work through a repair surprise.</li><li><b>Meet the lender at the gate.</b> ${esc(presenter.firstName)} and ${esc(assistant.firstName)} are the two real people in town. Reach the bridge to earn your First Key.</li></ol><div class="lesson"><small>HOW TO MOVE</small>Walk with <kbd>W A S D</kbd> or the arrows, or tap anywhere on the map. Press <kbd>E</kbd> or tap ● near a glowing place to enter it. Walk over coins to collect them. Something off the marked paths is humming.</div><div class="lesson"><small>COINS</small>Path coins and the four arcade games fill your pouch. At the gate, every coin becomes $100 of fictional down payment and you see what it does to a monthly payment.</div><p>There is no timer and no perfect score. Thoughtful choices, including deciding to prepare longer, move the story forward.</p><div class="utility-actions"><button class="primary" id="help-next">${state.ended ? 'Open my buying plan' : 'Take me to my next stop'} →</button><button class="secondary" id="replay-intro">Replay the opening</button></div>`,
  )
  $('#help-next').onclick = () => {
    utility.close()
    goNext()
  }
  $('#replay-intro').onclick = () => {
    utility.close()
    showPrologue(true)
  }
}
$('#help').onclick = howToPlay
let setupDraft = null,
  setupStep = 0,
  editingProfile = false,
  draftAvatar = null,
  avatarBusy = false
function showSetup(edit = false) {
  stopNarration()
  editingProfile = edit
  setupDraft = cleanProfile(state.profile)
  draftAvatar = state.avatar
  setupStep = 0
  renderSetup()
  openDialog($('#setup'))
}
function selectOptions(key, value) {
  return profileOptions[key].map(([v, label]) => `<option value="${v}" ${value === v ? 'selected' : ''}>${label}</option>`).join('')
}
function collectSetup() {
  if (setupStep === 0) {
    setupDraft.name = $('#adventurer-name').value
    setupDraft.charm = $('#adventurer-charm').value
  } else for (const key of ['goal', 'timeline', 'question']) setupDraft[key] = $('#profile-' + key).value
}
function draftPortrait(cls) {
  const hero = heroes.find((h) => h.id === setupDraft.hero)
  return draftAvatar ? `<span class="${cls} avatar" style="background-image:url(${draftAvatar})"></span>` : `<span class="${cls}" style="background-position:${hero.index * 50}% center"></span>`
}
function renderSetup() {
  const hero = heroes.find((h) => h.id === setupDraft.hero)
  $('#setup-body').innerHTML = `<div class="setup-top"><span class="eyebrow">${editingProfile ? 'MY ADVENTURER' : 'YOUR STORY STARTS HERE'} · ${setupStep + 1} OF 2</span>${editingProfile ? '<button id="cancel-profile" aria-label="Cancel changes">✕</button>' : ''}</div><div class="setup-content"><h2>${setupStep === 0 ? 'Every adventure needs you.' : 'What is on the other side of your door?'}</h2><p class="muted">${setupStep === 0 ? 'Pick a character that feels like you, or put your own face in the game. All three can take every path.' : 'A few choices to make the journey yours. You can change them later.'}</p>${
    setupStep === 0
      ? `<div class="hero-grid" role="group" aria-label="Choose your adventurer">${heroes.map((h) => `<button type="button" class="hero-card ${setupDraft.hero === h.id ? 'selected' : ''}" data-hero="${h.id}" aria-pressed="${setupDraft.hero === h.id}"><span class="hero-art" style="background-position:${h.index * 50}% center"></span><strong>${h.name}</strong><small>${h.line}</small><span class="hero-selected">${setupDraft.hero === h.id ? '✓ Selected' : 'Choose'}</span></button>`).join('')}</div><div class="photo-row"><div class="photo-preview">${draftAvatar ? `<img src="${draftAvatar}" alt="Your pixel portrait" width="96" height="96">` : '<span class="photo-empty">◉</span>'}</div><div><strong>Put your face in the game</strong><p class="small">Choose a photo and it becomes a pixel portrait right here on your device. The photo is never uploaded; only the tiny portrait is kept.</p><div class="photo-actions"><label class="secondary file-btn">${draftAvatar ? 'Try another photo' : 'Choose a photo'}<input type="file" id="avatar-file" accept="image/*" capture="user" hidden></label>${draftAvatar ? '<button type="button" class="secondary" id="avatar-remove">Use the character instead</button>' : ''}</div><p class="small photo-status" id="photo-status" hidden></p></div></div><div class="profile-grid"><label>What should we call you?<input id="adventurer-name" type="text" maxlength="30" autocomplete="off" value="${esc(setupDraft.name === 'Adventurer' ? '' : setupDraft.name)}" placeholder="Name or nickname"></label><label>Bring a little luck<select id="adventurer-charm">${selectOptions('charm', setupDraft.charm)}</select></label></div>`
      : `<div class="profile-hero">${draftPortrait('hero-art')}<div><span class="eyebrow">${draftAvatar ? 'YOU, IN PIXELS · ' : ''}${hero.name}</span><h3>${esc(setupDraft.name || 'Adventurer')}</h3><p>${esc(profileOptions.charm.find(([v]) => v === setupDraft.charm)[1])} packed. Possibilities ahead.</p></div></div><div class="profile-fields"><label>What would a home make possible?<select id="profile-goal">${selectOptions('goal', setupDraft.goal)}</select></label><label>When might you want to make a move?<select id="profile-timeline">${selectOptions('timeline', setupDraft.timeline)}</select></label><label>What would you most like to understand?<select id="profile-question">${selectOptions('question', setupDraft.question)}</select></label></div>`
  }<div class="setup-actions">${setupStep ? '<button class="secondary" id="setup-back">← My character</button>' : '<span class="small">Your character changes the look, not your options.</span>'}<button class="primary" id="setup-next">${setupStep === 0 ? 'Make it my story →' : editingProfile ? 'Save my changes' : 'Watch the opening →'}</button></div><p class="privacy-note">Your answers personalize learning and stay on this device unless you choose to send a message to ${esc(presenter.name)}. They are not a mortgage assessment.</p></div>`
  document.querySelectorAll('[data-hero]').forEach(
    (b) =>
      (b.onclick = () => {
        collectSetup()
        setupDraft.hero = b.dataset.hero
        music.effect()
        renderSetup()
      }),
  )
  const file = $('#avatar-file')
  if (file)
    file.onchange = async () => {
      const f = file.files?.[0]
      if (!f || avatarBusy) return
      avatarBusy = true
      collectSetup()
      const status = $('#photo-status')
      status.hidden = false
      status.textContent = 'Turning you into pixels…'
      try {
        draftAvatar = await pixelate(f, { size: 32, scale: 8 })
        music.effect('reward')
        track('avatar_created')
      } catch {
        status.textContent = 'That photo could not be read. Try a JPG or PNG.'
        avatarBusy = false
        return
      }
      avatarBusy = false
      renderSetup()
    }
  if ($('#avatar-remove'))
    $('#avatar-remove').onclick = () => {
      collectSetup()
      draftAvatar = null
      renderSetup()
    }
  if ($('#cancel-profile')) $('#cancel-profile').onclick = () => $('#setup').close()
  if ($('#setup-back'))
    $('#setup-back').onclick = () => {
      collectSetup()
      setupStep = 0
      renderSetup()
    }
  $('#setup-next').onclick = () => {
    collectSetup()
    setupDraft = cleanProfile(setupDraft)
    if (setupStep === 0) {
      setupStep = 1
      renderSetup()
      return
    }
    state.profile = { ...setupDraft, complete: true }
    state.avatar = draftAvatar
    state.vars.priority = state.profile.goal
    save()
    update()
    $('#setup').close()
    track('profile_saved', { hero: state.profile.hero, avatar: !!state.avatar, question: state.profile.question, timeline: state.profile.timeline })
    if (editingProfile) {
      toast('Your adventurer and buying plan are updated.')
      if (state.planStarted && state.ended) showPlan()
    } else showPrologue(false)
  }
}
$('#setup').addEventListener('cancel', (e) => {
  if (!editingProfile) e.preventDefault()
})
$('#profile-button').onclick = () => showSetup(true)
let prologueTimer = null,
  prologueIndex = 0,
  prologuePaused = false,
  prologueReplay = false
const openingFrames = [
  { position: '22% 72%', eyebrow: 'HEARTHVALE · ANOTHER RENT DAY', title: 'Work. Rent. Repeat.', text: 'You work hard. Every month, another payment buys another month in a place that belongs to someone else. Tonight, you start wondering what a place of your own could look like.' },
  { position: '92% 15%', eyebrow: 'A DIFFERENT CHAPTER', title: 'A door with your name on it.', text: 'A garden. More space. Walls you can finally paint. Buying brings responsibilities, too. You don’t need all the answers tonight—just a way to find your first ones.' },
  { position: '48% 43%', eyebrow: 'YOUR MISSION', title: 'Three tools. One first key.', text: 'Meet Mira, Sage, and Ellis. Collect the Budget Compass, the Clear-Sight Lens, and the Homeward Map. Then face your first house decision and meet Rowan at the lantern bridge.' },
  { position: '75% 62%', eyebrow: 'HOW TO WIN THIS FIRST QUEST', title: 'Walk, collect, and reach the gate.', text: `Walk with the arrows or tap the map. Pick up coins on the paths and play the arcade games. The flag on the castle belongs to ${presenter.name}, the one real person in Hearthvale. Reach the bridge to unlock a buying plan built around your goals.` },
]
function showPrologue(replay = false) {
  stopNarration()
  prologueReplay = replay
  prologueIndex = 0
  prologuePaused = false
  renderPrologue()
  openDialog($('#prologue'))
}
function renderPrologue() {
  clearTimeout(prologueTimer)
  const f = openingFrames[prologueIndex]
  $('#prologue-body').innerHTML = `<div class="cinema-scene" style="--scene-position:${f.position}"><div class="cinema-art ${prologuePaused ? 'paused' : ''}"></div><div class="cinema-shade"></div><div class="cinema-controls"><span class="eyebrow">THE FIRST KEY · OPENING</span><div><button data-prologue-sound>${music.on ? '♫ Mute' : '♫ Sound on'}</button><button id="intro-volume">Volume</button><button id="skip-opening">Skip opening →</button></div></div><div class="cinema-caption"><span class="eyebrow">${f.eyebrow}</span><h2>${f.title}</h2><p>${esc(state.profile.name)}, ${f.text.charAt(0).toLowerCase() + f.text.slice(1)}</p><div class="cinema-progress">${openingFrames.map((_, i) => `<button data-frame="${i}" class="${i <= prologueIndex ? 'viewed' : ''}" aria-label="Opening scene ${i + 1}"></button>`).join('')}</div><div class="cinema-bottom"><button id="pause-opening" class="secondary">${prologuePaused ? '▶ Play' : 'Ⅱ Pause'}</button><span>${prologueIndex + 1} / ${openingFrames.length} · Animated opening</span><button id="next-opening" class="primary">${prologueIndex === 3 ? (prologueReplay ? 'Back to my adventure →' : 'I’m ready. Let’s go →') : 'Next →'}</button></div></div></div>`
  $('[data-prologue-sound]').onclick = toggleMusic
  $('#intro-volume').onclick = soundPanel
  $('#skip-opening').onclick = finishPrologue
  $('#next-opening').onclick = () => {
    if (prologueIndex === 3) finishPrologue()
    else {
      prologueIndex++
      renderPrologue()
    }
  }
  $('#pause-opening').onclick = () => {
    prologuePaused = !prologuePaused
    renderPrologue()
  }
  document.querySelectorAll('[data-frame]').forEach(
    (b) =>
      (b.onclick = () => {
        prologueIndex = +b.dataset.frame
        renderPrologue()
      }),
  )
  if (!prologuePaused && prologueIndex < 3)
    prologueTimer = setTimeout(() => {
      prologueIndex++
      renderPrologue()
    }, 12000)
}
function finishPrologue() {
  clearTimeout(prologueTimer)
  $('#prologue').close()
  if (prologueReplay) return update()
  state.started = true
  save()
  update()
  track('prologue_done')
  renderNode(saved ? state.node : 'letter')
}
$('#prologue').addEventListener('cancel', (e) => {
  e.preventDefault()
  finishPrologue()
})
function showPlan() {
  stopNarration()
  if (!state.ended) {
    utility.close()
    goNext()
    return
  }
  state.planStarted = true
  save()
  track('plan_open')
  const p = learningPlan(state.profile),
    done = p.tasks.filter((t) => state.planTasks.includes(t.id)).length
  utilityView(
    'YOUR NEXT CHAPTER · BUYING PLAN',
    `<div class="plan-heading">${portraitHtml('hero-art')}<div><span class="eyebrow">FIRST KEY EARNED</span><h2>${esc(state.profile.name)}, make it real.</h2><p>${esc(p.goal)}. ${esc(p.pace)}</p></div></div><div class="plan-focus"><span class="eyebrow">YOUR PATH</span><h3>${p.title}</h3><p>${p.why}</p></div><div class="plan-progress"><span>${done} of ${p.tasks.length} steps checked off</span><div class="progress-track"><i style="width:${(done / p.tasks.length) * 100}%"></i></div></div><div class="plan-checklist">${p.tasks.map((t) => `<label><input type="checkbox" data-task="${t.id}" ${state.planTasks.includes(t.id) ? 'checked' : ''}><span><strong>${t.title}</strong><small>${t.detail}</small></span></label>`).join('')}</div>${done === p.tasks.length ? '<div class="lesson"><small>YOUR CHECKLIST IS COMPLETE</small>You’ve marked your preparation steps complete. Bring your questions and notes into a real conversation when you’re ready.</div>' : ''}<div class="plan-erik"><img src="${erikPixel}" alt="" width="56" height="56"><div><strong>${state.lead.plan === 'delivered' ? `${esc(presenter.firstName)} has your plan.` : `Want ${esc(presenter.firstName)} to read this first?`}</strong><small>${state.lead.plan === 'delivered' ? 'He’ll have read it before you talk. Call or text whenever you’re ready.' : `Send your plan and game choices to ${esc(presenter.name)}, ${esc(presenter.company)}. No application, no credit pull, no pressure.`}</small></div></div><div class="utility-actions"><button class="primary" id="plan-send">${state.lead.plan === 'delivered' ? `Text ${esc(presenter.firstName)}` : `Send my plan to ${esc(presenter.firstName)} →`}</button><button class="secondary" id="plan-download">Download my plan ↓</button><button class="secondary" id="plan-card">My adventurer card</button><button class="secondary" id="plan-profile">Update my information</button><button class="secondary" id="plan-map">Return to Hearthvale</button></div><p class="small">This is a self-guided learning checklist, personalized by your answers. Progress stays on this device. Nothing is sent unless you choose to send it.</p>`,
  )
  document.querySelectorAll('[data-task]').forEach(
    (b) =>
      (b.onchange = () => {
        state.planTasks = b.checked ? [...new Set([...state.planTasks, b.dataset.task])] : state.planTasks.filter((id) => id !== b.dataset.task)
        save()
        track('plan_task', { task: b.dataset.task, checked: b.checked })
        showPlan()
      }),
  )
  $('#plan-send').onclick = () => (state.lead.plan === 'delivered' ? (location.href = contactLinks().text) : sendPlan())
  $('#plan-download').onclick = downloadJournal
  $('#plan-card').onclick = showCard
  $('#plan-profile').onclick = () => showSetup(true)
  $('#plan-map').onclick = () => utility.close()
}

window.addEventListener('pagehide', save)
syncSound()
update()
preparePresenter()
openDialog(welcome)
