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
  nextStep,
  blockedBecause,
  startFor,
  choiceVisible,
  readyForPreapproval,
  agents,
  inspectionKinds,
  choose,
  applyChoice,
  enter,
  restoreState,
  collectMapCoin,
  collectDoc,
  recordMinigame,
} from './story-data.js'
import { AdventureAudio } from './audio.js'
import { heroes, profileOptions, cleanProfile, learningPlan } from './profile.js'
import { config, presenter, partner, assistant, coinsToDollars, coinsToMonthlySavings } from './config.js'
import { track, trackOnce } from './analytics.js'
import { requestLead, contactLinks } from './lead.js'
import { pixelate, shareCard } from './avatar.js'
import { narrator } from './voice.js'
import { spriteSheet, portrait as characterPortrait, faceFromPhoto, CHARACTER_VERSION } from './character.js'
import { walkable, snapToPath, slide, route } from './paths.js'

const $ = (s) => document.querySelector(s),
  music = new AdventureAudio(),
  KEY = 'choicewright:first-key:v1'
// `art` is the cabinet screen from the arcade hall, so a game looks the same wherever it is listed.
const GAMES = {
  'rent-day': { title: 'Rent Day', where: 'Your cottage', blurb: 'Catch the coins before Bartleby Quill does.', icon: '⛃', art: 'arcade/art/rent-day.webp' },
  'coin-catch': { title: 'Coin Catch', where: 'Mira’s shop', blurb: 'Catch coins for the emergency pouch. Dodge the impulse buys.', icon: '◉', art: 'arcade/art/coin-catch.webp' },
  'offer-match': { title: 'Offer Match', where: 'Erik at the gate', blurb: 'Two loan scrolls. One is hiding something. Pick the better deal.', icon: '◈', art: 'arcade/art/offer-match.webp' },
  'inspection-hunt': { title: 'Inspection Hunt', where: 'Three-Door Lane', blurb: 'Seven things are wrong with this house. Find them in time.', icon: '⌂', art: 'arcade/art/inspection-hunt.webp' },
  'down-payment-dash': { title: 'Down Payment Dash', where: 'The Loan Castle', blurb: 'Run, jump, and collect coins toward your down payment.', icon: '⚿', art: 'arcade/art/down-payment-dash.webp' },
}
let state = initialState(),
  saved = null,
  storageOK = true,
  lastFocus = null,
  reading = false,
  toastTimer,
  erikPixel = presenter.headshot,
  albertPixel = assistant.headshot,
  activeArcade = null,
  heroSheet = null, // walk sprite sheet data URL for the map token
  heroPortrait = null, // matching head-and-shoulders for dialogue
  heroSheetKey = ''
try {
  const raw = JSON.parse(localStorage.getItem(KEY))
  state = restoreState(raw)
  if (state.started) saved = raw
} catch {}
// Saves from before the paths existed can put the walker in the middle of the forest.
{
  const here = snapToPath(state.player.x, state.player.y)
  state.player.x = here.x
  state.player.y = here.y
}
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
  if (heroPortrait) return `<span class="${cls} avatar" style="background-image:url(${heroPortrait})"></span>`
  return state.avatar
    ? `<span class="${cls} avatar" style="background-image:url(${state.avatar})"></span>`
    : `<span class="${cls}" style="background-position:${heroOf().index * 50}% center"></span>`
}
/**
 * Draw the player as an actual little pixel person: a walk sprite sheet for the map and a
 * matching portrait for dialogue. When the player supplied a photo, their face is composited
 * into the character's head, so the photo changes who is walking around rather than sitting
 * in a frame beside the map.
 */
async function buildHeroArt() {
  const key = `${CHARACTER_VERSION}|${state.profile.hero}|${state.avatar ? state.avatar.length : 0}`
  if (key === heroSheetKey && heroSheet) return
  heroSheetKey = key
  try {
    const opts = { hero: state.profile.hero, face: state.avatar || null }
    const [sheet, port] = await Promise.all([
      spriteSheet({ ...opts, scale: 3, walkOnly: true }),
      characterPortrait({ ...opts, scale: 2 }),
    ])
    heroSheet = sheet.dataUrl
    heroPortrait = port.dataUrl
  } catch {
    heroSheet = null
    heroPortrait = null
  }
  update()
}
/* ---------- the purchase: prices, letters, inspectors ---------- */
// Fictional throughout. The two homes match the payments Mira compares at the market.
const HOME_PRICES = { willow: 260000, lantern: 340000 }
const RESOLUTION_LINES = {
  negotiate: 'You paid somebody to look, they found one specific thing, and you asked for one specific thing. That is the whole technique.',
  'self-fund': 'You knew what the repair would cost you before you agreed to it, which is a different thing entirely from finding out afterwards.',
  'step-back': 'You used the window you paid for, and you walked. That is not a failed purchase. That is the contingency doing its job.',
  prepare: 'You looked at the number, decided the timing was wrong, and said so out loud. That is a real answer and it costs nothing to give.',
  default: 'You did the boring parts in the right order, which is the only trick there is.',
}
const askingPrice = () => HOME_PRICES[state.vars.home] || HOME_PRICES.lantern
// A ceiling derived from the housing budget the player chose, not a promise. Fictional.
const preapprovalAmount = () => (Number(state.vars.housing) >= 3000 ? 390000 : 280000)
function myAgent() {
  return agents.find((a) => a.id === state.agent) || { id: null, name: 'Your agent' }
}
function preapprovalChecklist() {
  const need = []
  if (!state.done.includes('market')) need.push('a housing number you have actually thought about — that is Mira, at the provisioner’s shop')
  if (state.docQuest !== 'complete')
    need.push(
      state.docQuest === 'active'
        ? `your last ${mapDocs.length - state.docs.length} documents, which are still out there somewhere in the wind`
        : 'your five documents, which the Augusta wind took out of your window this morning — ask Albert, he watched them go',
    )
  if (!need.length) return 'Both boxes are ticked. Let’s write it.'
  return 'Still missing: ' + need.join('. And ') + '.'
}
function inspectionFindings() {
  if (!state.inspections.length)
    return 'You did not send anyone in, so there is nothing to read. The house is exactly as unknown as it was on the day you offered on it.'
  const found = []
  if (state.inspections.includes('home'))
    found.push('The general inspector fills eleven pages, most of it ordinary, and puts a photograph of a dark patch on the upstairs ceiling on page four. “Active moisture. Recommend a roofing contractor.”')
  if (state.inspections.includes('roof'))
    found.push(`The roofer goes up with a ladder and comes down with a number: $3,000 to fix the flashing where the valley meets the wall, and about six years left in the rest of it.${state.inspections.includes('home') ? ' Which is exactly what page four was pointing at.' : ' You would never have known to ask.'}`)
  if (state.inspections.includes('sewer'))
    found.push('The sewer scope goes forty feet and finds clay pipe, some root intrusion, and nothing urgent. $250 to be told a thing is fine is $250 well spent; you only resent it when it is.')
  if (state.inspections.includes('termite'))
    found.push('The pest report comes back clean apart from some old, treated damage in the garage frame. Noted, photographed, not a problem.')
  return found.join(' ')
}
function inspectionMissed() {
  const roofKnown = state.inspections.includes('home') || state.inspections.includes('roof')
  const skipped = inspectionKinds.filter((k) => !state.inspections.includes(k.id))
  if (!roofKnown)
    return 'Nobody looked at the roof. There is a dark patch on the upstairs ceiling that you will meet in about four months, and it will cost $3,000 whether you knew about it now or not. The difference is that today you could have asked the seller.'
  if (!skipped.length) return 'You paid for all four and know everything a person can know about this house before owning it. That cost you ' + money(state.inspectionSpend) + '.'
  return `You did not order: ${skipped.map((k) => k.name.toLowerCase()).join(', ')}. That is a choice, not a mistake — but it is the list of things you have decided to find out about later.`
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

    reserve: money(v.reserve),
    margin: money(margin),
    afterRepair: money(v.reserve - 3000),
    homeName: v.home === 'willow' ? 'Willow Cottage' : 'Lantern House',
    askingPrice: money(askingPrice()),
    underPrice: money(askingPrice() - 12000),
    otherHomeName: state.vars.home === 'willow' ? 'Lantern House' : 'Willow Cottage',
    preapprovalAmount: money(preapprovalAmount()),
    myAgent: myAgent().name,
    myAgentFirst: myAgent().name.split(' ')[0],
    questHint: nextStep(state).hint,
    signedHint: state.agent
      ? `You do have one, of course — ${myAgent().name} — but Percival had no way of knowing that, and neither did you when you answered.`
      : 'Hearthvale Realty is the building with all the maps in the window.',
    percivalStatus: state.agent === 'percival'
      ? 'You have already signed with him, as it happens. Both sides, in writing. He will not have hidden that from you; he never does.'
      : state.done.includes('homes')
        ? 'You have met him. If you want him for yourself, go back to the lane and say so.'
        : 'You have not met him yet. He is holding the door at Lantern House this afternoon.',
    preapprovalStatus: state.preapproved
      ? 'You have your letter. Go and write an offer with it — that is what it is for.'
      : readyForPreapproval(state)
        ? 'Your budget is set and your papers are in one place. This is going to take about four minutes.'
        : 'We will need two things from you first, and neither of them is frightening.',
    preapprovalChecklist: preapprovalChecklist(),
    preapprovalHeadline: readyForPreapproval(state)
      ? 'Pre-approved, in writing, up to ' + money(preapprovalAmount()) + '.'
      : 'Not yet. Here is what is missing.',
    preapprovalBody: readyForPreapproval(state)
      ? `${presenter.firstName} runs the numbers off your documents and the housing budget you set at Mira's: ${money(state.vars.housing)} a month, all in. “On this fictional math, I would write your letter at ${money(preapprovalAmount())}. That is a ceiling, not a target. Plenty of people borrow less than their letter and sleep better for it.”`
      : preapprovalChecklist(),
    offerHint: state.dualAgency
      ? 'Worth remembering that Percival is writing this for you and holding the other end of it for the seller.'
      : 'Whatever you write, I am arguing for your side of it and nobody else’s.',
    inspectionStatus: state.inspections.length
      ? `Booked so far: ${state.inspections.map((id) => inspectionKinds.find((k) => k.id === id).name).join(', ')} · ${money(state.inspectionSpend)} spent.`
      : 'Nothing booked yet. Order what you want to know about.',
    inspectionFindings: inspectionFindings(),
    inspectionMissed: inspectionMissed(),
    resolutionLine: RESOLUTION_LINES[v.resolution] || RESOLUTION_LINES.default,
    inspectionSummary: v.waived
      ? 'You waived the inspection to win the house, which is a real choice a lot of buyers make and the one thing in the pile you cannot undo.'
      : state.inspections.length
        ? `You paid ${money(state.inspectionSpend)} to find out what was wrong with it before you owned it, which is the cheapest money in this whole story.`
        : 'You got there without sending anybody in to look, which is the part worth doing differently next time.',
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
        ? 'You got all five back and they are in the folder. That satchel is the best-organized thing in Hearthvale.'
        : state.docQuest === 'gathered'
          ? 'You have all five in your arms! Give them here and I will get them into the folder.'
          : state.docQuest === 'active'
            ? `${mapDocs.length - state.docs.length} still out there. Walk over each one and it is yours again — and I will tell you what it is.`
            : state.docQuest === 'asked'
              ? 'Erik has asked for your paperwork. It is at your cottage, in the drawer by the kettle. Go and get it and I will take it from there.'
              : 'When Erik asks for your paperwork, come and find me. Knowing which page is which is the whole of my job.',
    docHelpOpen:
      state.docQuest === 'active' || state.docQuest === 'gathered'
        ? 'The Augusta wind. It does that every autumn, and it has never once picked a good moment.'
        : 'The Augusta wind got your folder on the way back up the hill, did it? It does that every autumn.',
    agentName: partner?.name || 'Nell',
    partnerLine: partner ? ` “${partner.name} and I work together, so when you are ready, we both already know your story.”` : '',
    portalDelivery: !portalLead
      ? ''
      : portalLead === 'delivered'
        ? 'The keeper has your name; the Credit Compass will find you when the series opens.'
        : portalLead === 'skipped'
          ? 'You kept your name to yourself. The stones opened anyway.'
          : portalLead === 'texted'
            ? 'Your message to the keeper is waiting in your own app to send. The stones opened anyway.'
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
  narrator.stop()
  reading = false
  $('#narrate').setAttribute('aria-pressed', 'false')
  $('#narrate').textContent = '◖ Read aloud'
  music.duck(false)
}
function openStory() {
  lastFocus = document.activeElement
  story.hidden = false
  document.querySelector('.game-layout').classList.add('talking')
  camera() // the map just changed width; keep the walker centred in it
}
function closeStory() {
  stopNarration()
  destroyArcade()
  story.hidden = true
  document.querySelector('.game-layout').classList.remove('talking')
  camera()
  world.focus({ preventScroll: true })
}

/* ---------- presenter portrait (pixelated in the browser) ---------- */
async function preparePresenter() {
  $('#footer-presenter').textContent = `${presenter.name} · ${presenter.company}`.toUpperCase()
  $('#footer-legal').textContent = presenter.legal
  try {
    const cached = sessionStorage.getItem('choicewright:erik-pixel:v2')
    erikPixel = cached || (await pixelate(presenter.headshot, { size: 72, scale: 4, focus: 'top', paletteMix: 0.35 }))
    if (!cached) sessionStorage.setItem('choicewright:erik-pixel:v2', erikPixel)
  } catch {
    erikPixel = presenter.headshot
  }
  try {
    const cached = sessionStorage.getItem('choicewright:albert-pixel:v2')
    albertPixel = cached || (await pixelate(assistant.headshot, { size: 72, scale: 4, focus: 'top', paletteMix: 0.35 }))
    if (!cached) sessionStorage.setItem('choicewright:albert-pixel:v2', albertPixel)
  } catch {
    albertPixel = assistant.headshot
  }
  renderBubble()
  renderAlbert()
}

/* ---------- Albert: in-game support ---------- */
function albertHint() {
  if (!state.started) return 'Create your adventurer and I will point you to the first stop.'
  const step = nextStep(state)
  const coinsLeft = mapCoins.length - state.coinsCollected.length
  if (state.docQuest === 'asked') return 'Your papers are at home, in the drawer by the kettle. Fetch them and bring them to us.'
  if (state.docQuest === 'active') return `${mapDocs.length - state.docs.length} of your papers are still out there. Look for the little white sheets; I marked where each one landed.`
  if (state.docQuest === 'gathered') return 'You have all five! Bring them to me in the keep and I will get them into the folder.'
  if (state.ended && state.portal !== 'open') return 'Finished already? Off the marked paths, near the waterfall, something is humming.'
  if (state.ended) return `${coinsLeft ? coinsLeft + ' path coins are still out there, and' : 'Every path coin is found, and'} the arcade always takes another run.`
  if (coinsLeft > 8 && state.done.length > 1) return 'Walk the paths instead of jumping straight to a place. There are coins on them.'
  const loc = step.id && locations.find((l) => l.id === step.id)
  return loc ? `${step.hint} That is ${loc.name}. Press E or tap ● when you are close.` : step.hint
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
  if (state.docQuest === 'active') tips.push(['Your papers', `Still out there: ${mapDocs.filter((d) => !state.docs.includes(d.id)).map((d) => d.label.replace(/^Your /, '')).join(', ')}. I marked each landing spot on the map.`])
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
  const step = nextStep(state)
  const next = step.id ? locations.find((l) => l.id === step.id) : null
  $('#quest-intro').textContent = state.ended
    ? 'First quest complete! Your buying plan is unlocked.'
    : 'Get an agent who works for you, a budget you can live with, and a letter that proves it. Then go and buy a house.'
  $('#objective-text').textContent = state.ended
    ? 'You earned your First Key. Continue with your own buying plan, or keep filling your coin pouch in the arcade.'
    : step.hint
  $('#next-destination').textContent = state.ended ? 'Open my buying plan →' : next ? 'Go to ' + next.name + ' →' : 'Show me the way →'
  $('#player-label').textContent = state.profile.complete ? state.profile.name.toUpperCase() + '’S QUEST' : 'YOUR ADVENTURE'
  const token = $('#hero-token')
  if (heroSheet) {
    token.classList.add('sheet')
    token.classList.remove('avatar')
    token.style.backgroundImage = `url(${heroSheet})`
  } else if (state.avatar) {
    token.classList.add('avatar')
    token.classList.remove('sheet')
    token.style.backgroundImage = `url(${state.avatar})`
    token.style.backgroundPosition = 'center'
  } else {
    token.classList.remove('avatar', 'sheet')
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
      ? `Your papers: ${state.docs.length}/${mapDocs.length} recovered · Albert is keeping the tally`
      : state.ended
        ? 'Your first key is earned. The arcade and the portal are still open.'
        : `Next: ${next?.name || 'explore the town'}`
  renderBubble()
  renderAlbert()
}

/* ---------- movement engine ---------- */
// Percent of map width per second. Deliberately walkable: crossing Hearthvale should take
// about ten seconds, not three, so the world feels like a place rather than a menu.
const SPEED = 16
const ACCEL = 7 // how fast the walker reaches full speed (higher = snappier)
// The map is 1.5:1, so one percent of width covers more pixels than one percent of height.
// Steering is done in pixel space and converted back, otherwise diagonal walks curve and
// the walker can orbit its destination instead of arriving.
const ASPECT = 1.5
const toPixel = (dx, dy) => [dx * ASPECT, dy]
const pixelDist = (dx, dy) => Math.hypot(dx * ASPECT, dy)
const held = new Set()
let target = null,
  onArrive = null,
  moving = false,
  rafId = 0,
  lastTs = 0,
  dustTimer = 0,
  saveTimer = 0,
  nearId = null,
  followCamera = true,
  vx = 0,
  vy = 0,
  steering = null, // {x, y} map percent the pointer is holding the walker toward
  waypoints = [], // the rest of the route, once the current target is reached
  frameClock = 0,
  walkFrame = 0
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
  traveler.dataset.frame = '0'
  vx = vy = 0
  save()
}
function step(ts) {
  if (!moving) return
  const dt = Math.min(0.05, (ts - lastTs) / 1000)
  lastTs = ts
  // Desired direction, from (in priority order) the keys, the held pointer, or a walk-to target.
  let dx = 0,
    dy = 0,
    arriving = false
  if (held.size) {
    if (held.has('left')) dx -= 1
    if (held.has('right')) dx += 1
    if (held.has('up')) dy -= 1
    if (held.has('down')) dy += 1
    target = null
    onArrive = null
    steering = null
    waypoints = []
  } else if (steering) {
    dx = steering.x - state.player.x
    dy = steering.y - state.player.y
    if (pixelDist(dx, dy) < 1.6) dx = dy = 0 // stand still under the cursor
    target = null
    onArrive = null
    waypoints = []
  } else if (target) {
    dx = target.x - state.player.x
    dy = target.y - state.player.y
    const d = pixelDist(dx, dy)
    // Arrive when within a step, or when already standing there (first frame has dt ≈ 0).
    if (d < Math.max(0.9, SPEED * dt)) {
      state.player.x = target.x
      state.player.y = target.y
      // A route is a handful of waypoints along the roads; take the next leg without stopping.
      if (waypoints.length) {
        target = waypoints.shift()
        position()
        checkCoins()
        rafId = requestAnimationFrame(step)
        return
      }
      const cb = onArrive
      target = null
      onArrive = null
      vx = vy = 0
      position()
      checkCoins()
      stopLoop()
      cb?.()
      return
    }
    arriving = !waypoints.length && d < 6 // ease into the destination, not into every corner
  }
  // Normalise in pixel space so the walker travels a straight line at an even speed,
  // then convert the velocity back into map percent for each axis.
  const [px, py] = toPixel(dx, dy)
  const len = Math.hypot(px, py)
  const speed = SPEED * (arriving ? 0.6 : 1)
  const tx = len ? (px / len) * speed : 0,
    ty = len ? (py / len) * speed : 0
  const k = Math.min(1, ACCEL * dt)
  vx += (tx - vx) * k
  vy += (ty - vy) * k
  if (!len && Math.hypot(vx, vy) < 0.4) {
    vx = vy = 0
    return stopLoop()
  }
  // Stay on the roads. When the straight step is blocked, slide along whichever axis is clear,
  // so walking into the edge of a path follows it instead of sticking to it.
  const stepX = (vx / ASPECT) * dt
  const stepY = vy * dt
  const next = slide(state.player.x, state.player.y, stepX, stepY)
  if (next.x === state.player.x && stepX) vx = 0
  if (next.y === state.player.y && stepY) vy = 0
  if (next.hit && next.x === state.player.x && next.y === state.player.y && target) {
    // Following a route and wedged in a corner: step back onto the nearest path rather than stall.
    const free = snapToPath(state.player.x + stepX, state.player.y + stepY)
    next.x = free.x
    next.y = free.y
  }
  state.player.x = Math.max(3, Math.min(97, next.x))
  state.player.y = Math.max(5, Math.min(93, next.y))
  if (Math.abs(vx) > 0.6) state.player.facing = vx < 0 ? -1 : 1
  // Walk animation runs off distance travelled, so the legs match the speed.
  const moved = Math.hypot(vx, vy) * dt
  frameClock += moved
  if (frameClock > 1.5) {
    frameClock = 0
    walkFrame = (walkFrame + 1) % 4
    traveler.dataset.frame = walkFrame
  }
  position()
  dustTimer += dt
  if (dustTimer > 0.42) {
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
/**
 * Walk to a point by road. The route is a few waypoints along the path network, so tapping a
 * far corner of the map sends the walker around the pond rather than into it; a tap on
 * somewhere unwalkable heads for the nearest piece of path instead.
 */
function walkTo(x, y, cb) {
  if (!state.started) return
  const legs = route(state.player.x, state.player.y, x, y)
  waypoints = legs.length ? legs.slice() : [snapToPath(x, y)]
  target = waypoints.shift()
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
        // Albert said he would tell you what each page is. This is him doing it.
        toast(`${d.label} · ${d.why}`)
        if (state.docQuest === 'gathered')
          setTimeout(() => toast('That is all five. Take them back to Albert in the Loan Castle keep.'), 2600)
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
  if (!unlocked(state, loc)) return void toast(blockedBecause(state, loc))
  $('#map-hint').textContent = 'Walking to ' + loc.name + '…'
  walkTo(loc.x, loc.y, () => {
    state.location = id
    state.history = []
    music.effect()
    track('location_enter', { location: id })
    // Every place is a room you can walk back into, so the door picks the scene that matches
    // how far the purchase has got: an open house becomes an offer becomes an inspection.
    renderNode(startFor(state, loc))
  })
}
function approachSecret(id) {
  const s = secretSpots.find((x) => x.id === id)
  if (!s) return
  walkTo(s.x, s.y, () => {
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
window.addEventListener('blur', () => {
  held.clear()
  steering = null
  pointerHeld = false
})
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
// Pointer control: a click walks there; holding the button down leads the character
// around like a leash, so the player is steering rather than issuing orders.
function mapPoint(e) {
  const r = layer.getBoundingClientRect()
  const p = e.touches ? e.touches[0] : e
  const x = ((p.clientX - r.left) / r.width) * 100,
    y = ((p.clientY - r.top) / r.height) * 100
  return x < -5 || x > 105 || y < -5 || y > 105 ? null : { x: Math.max(3, Math.min(97, x)), y: Math.max(5, Math.min(93, y)) }
}
let pointerHeld = false,
  pointerMoved = false,
  pointerStart = null
function pointerDown(e) {
  if (!state.started || e.target.closest('button')) return
  const p = mapPoint(e)
  if (!p) return
  pointerHeld = true
  pointerMoved = false
  pointerStart = p
  world.focus({ preventScroll: true })
}
function pointerMove(e) {
  if (!pointerHeld) return
  const p = mapPoint(e)
  if (!p) return
  // Only start leading once the pointer has actually travelled, so a plain click still means "walk there".
  if (!pointerMoved && Math.hypot(p.x - pointerStart.x, p.y - pointerStart.y) < 2) return
  pointerMoved = true
  if (e.cancelable) e.preventDefault()
  steering = p
  startLoop()
}
function pointerUp(e) {
  if (!pointerHeld) return
  pointerHeld = false
  const p = mapPoint(e) || steering || pointerStart
  steering = null
  if (!pointerMoved && p) walkTo(p.x, p.y)
  pointerStart = null
}
world.addEventListener('mousedown', pointerDown)
window.addEventListener('mousemove', pointerMove)
window.addEventListener('mouseup', pointerUp)
world.addEventListener('touchstart', pointerDown, { passive: true })
world.addEventListener('touchmove', pointerMove, { passive: false })
window.addEventListener('touchend', pointerUp)
window.addEventListener('touchcancel', pointerUp)
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
    return `<div class="numbers three"><div><small>YOUR COIN POUCH</small><strong>◉ ${state.coins}</strong><p class="small">1 coin = $100 fictional down payment</p></div><div><small>EXTRA DOWN PAYMENT</small><strong>${money(extra)}</strong><p class="small">On a fictional ${money(base)} home</p></div><div><small>PAYMENT CHANGE</small><strong>−${money(coinsToMonthlySavings(state.coins))}/mo</strong><p class="small">A made-up ${(config.fictional.rate * 100).toFixed(2)}% 30-year fixed, principal &amp; interest only. An illustration, not a rate quote.</p></div></div>`
  }
  if (type === 'agents')
    return `<div class="agent-list">${agents
      .map(
        (a) =>
          `<div class="${state.agent === a.id ? 'mine' : ''}"><b>${esc(a.name)}</b><span>${esc(a.tag)}</span><p>${esc(a.line)}</p></div>`,
      )
      .join('')}</div><p class="small">Interviewing an agent costs nothing. Ask all three the same questions and see who answers them.</p>`
  if (type === 'inspections')
    return `<div class="doc-list inspect-list">${inspectionKinds
      .map(
        (k) =>
          `<div class="${state.inspections.includes(k.id) ? 'got' : ''}"><span class="doc-mark">${state.inspections.includes(k.id) ? '✓' : '◇'}</span><div><b>${esc(k.name)} · ${money(k.cost)}</b><small>${esc(k.finds)}</small></div></div>`,
      )
      .join('')}</div><div class="numbers"><div><small>POUCH AFTER INSPECTIONS</small><strong>${money(state.vars.reserve)}</strong></div><div><small>SPENT ON LOOKING</small><strong>${money(state.inspectionSpend)}</strong></div></div>`
  if (type === 'offer')
    return `<div class="numbers three"><div><small>${esc(state.vars.home === 'willow' ? 'WILLOW COTTAGE' : 'LANTERN HOUSE')} · ASKING</small><strong>${money(askingPrice())}</strong><p class="small">Fictional listing price</p></div><div><small>YOUR LETTER SAYS</small><strong>${money(preapprovalAmount())}</strong><p class="small">A ceiling, not a target</p></div><div><small>YOUR HOUSING BUDGET</small><strong>${money(state.vars.housing)}/mo</strong><p class="small">All in, the way you set it at Mira’s</p></div></div>`
  if (type === 'documents')
    return `<div class="doc-list">${mapDocs.map((d) => `<div class="${state.docs.includes(d.id) ? 'got' : ''}"><span class="doc-mark">${state.docs.includes(d.id) ? '✓' : '▣'}</span><div><b>${esc(d.label)}</b><small>${esc(d.why)}</small></div></div>`).join('')}</div>`
  if (type === 'arizona')
    return `<div class="az-notes"><div><b>Home Plus</b><span>Arizona IDA · statewide</span><p>Up to 4% down payment and closing cost assistance.</p><a href="${sources.homePlus.url}" target="_blank" rel="noopener noreferrer">homeplusaz.com ↗</a></div><div><b>Home in Five Advantage</b><span>Maricopa County</span><p>Up to 5% assistance, plus 1% more for eligible buyers.</p><a href="${sources.homeInFive.url}" target="_blank" rel="noopener noreferrer">homein5.org ↗</a></div><div><b>VA-backed loans</b><span>Veterans, service members, survivors</span><p>Most buy with no down payment. A funding fee applies.</p><a href="${sources.va.url}" target="_blank" rel="noopener noreferrer">va.gov ↗</a></div><div><b>FHA loans</b><span>Lower down payment</span><p>Available to buyers with lower credit scores; mortgage insurance applies.</p><a href="${sources.loanTypes.url}" target="_blank" rel="noopener noreferrer">CFPB loan options ↗</a></div></div><p class="small">Program terms change and each has income, purchase-price, and education requirements. ${esc(presenter.name)} is licensed in ${esc(presenter.licensedIn)} and can confirm what applies to you.</p>`
  return ''
}
// Scenes may carry choices that only apply at a certain point in the purchase. Render and
// dispatch both go through this, so the numbers the player sees are the numbers act() uses.
function visibleChoices(node) {
  return node.choices.filter((c) => choiceVisible(state, c))
}
function speakerPortrait(node) {
  const s = node.speaker || ''
  if (s.startsWith('{{presenterName}}')) return `<img class="portrait" src="${erikPixel}" alt="">`
  if (s.startsWith('{{assistantName}}')) return `<img class="portrait albert" src="${albertPixel}" alt="">`
  if (s.startsWith('{{name}}'))
    return heroPortrait
      ? `<img class="portrait" src="${heroPortrait}" alt="">`
      : portraitHtml('portrait hero-portrait')
  return `<span class="sigil">${node.symbol}</span>`
}
// How much of the current scene has been read. A scene arrives a beat at a time so the town is
// never hidden behind a wall of text; the choices only appear once the last beat has landed.
let sceneBeat = 0
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
  music.mood = ['inspect-report', 'self-fund', 'offer-lost', 'offer-blind', 'oh-signed'].includes(id) ? 'tense' : id.startsWith('portal') || id.startsWith('ledger') ? 'mystic' : 'explore'
  save()
  update()
  track('scene', { node: id })
  sceneBeat = 0
  paintScene()
  openStory()
}
function paintScene() {
  const id = state.node
  const node = episode.nodes[id]
  if (!node) return
  const loc = locations.find((l) => l.id === state.location)
  $('#scene-location').textContent = `${id.startsWith('albert') ? 'The Loan Castle keep' : loc ? loc.name : 'Off the marked paths'} · ${node.ending ? 'JOURNEY COMPLETE' : id.startsWith('portal') || id.startsWith('ledger') ? 'THE CREDIT COMPASS · PREVIEW' : 'THE FIRST KEY'}`
  const game = node.minigame && GAMES[node.minigame]
  const best = node.minigame && state.minigames[node.minigame]
  const beats = node.text.length
  const last = sceneBeat >= beats - 1
  const shown = node.text.slice(0, sceneBeat + 1)
  $('#story-body').innerHTML =
    `<div class="scene-enter">${node.ending ? '<div class="ending-seal">⚿</div>' : ''}<div class="character">${speakerPortrait(node)}${interpolate(node.speaker)}</div><h2>${interpolate(node.title)}</h2><div class="prose">${shown.map((p, i) => `<p${i === sceneBeat && sceneBeat ? ' class="beat-new"' : ''}>${interpolate(p)}</p>`).join('')}</div>${
      last
        ? `${node.widget ? widget(node.widget) : ''}${node.lesson ? `<div class="lesson"><small>PACK THIS FOR REAL LIFE</small>${node.lesson}</div>` : ''}${node.ending ? `<div class="complete-metrics"><span>${locations.length} places explored</span><span>${state.inventory.length} discoveries earned</span><span>◉ ${state.coins} coins</span></div>` : ''}${
            game
              ? `<button class="minigame-launch ${node.minigameLabel ? 'feature' : ''}" data-game="${node.minigame}"><span class="mg-icon">${game.icon}</span><span><strong>${node.minigameLabel || 'Bonus game: ' + game.title}</strong><small>${node.minigameBlurb || game.blurb}${best ? ` · Best ◉ ${best.coins}` : ' · Earn coins for your pouch'}</small></span><span>▶</span></button>`
              : ''
          }<div class="choices">${visibleChoices(node).map((c, i) => `<button class="choice" data-choice="${i}"><span>${i + 1}</span><div><strong>${interpolate(c.label)}</strong>${c.detail ? `<small>${interpolate(c.detail)}</small>` : ''}</div><span>→</span></button>`).join('')}</div>`
        : `<button class="beat-more" id="beat-more"><span>Go on…</span><span class="beat-count">${sceneBeat + 1} of ${beats}</span><span class="beat-caret">▸</span></button>`
    }</div>`
  if (!last) $('#story-body').scrollTop = $('#story-body').scrollHeight
  else if (!sceneBeat) $('#story-body').scrollTop = 0
  $('#back-scene').disabled = !state.history.length
  $('#scene-count').textContent = `${state.done.length}/${locations.length} places · ◉ ${state.coins}`
  $('#scene-source').hidden = !node.source
  if ($('#beat-more')) $('#beat-more').onclick = nextBeat
  document.querySelectorAll('[data-choice]').forEach((b) => (b.onclick = () => act(Number(b.dataset.choice))))
  document.querySelectorAll('[data-game]').forEach((b) => (b.onclick = () => launchArcade(b.dataset.game, 'story')))
  const range = $('#reserve-range')
  if (range)
    range.oninput = () => {
      $('#reserve-output').textContent = `${money(+range.value)} reserved · ${money(4000 - range.value)} for furniture`
    }
}
function nextBeat() {
  const node = episode.nodes[state.node]
  if (!node || sceneBeat >= node.text.length - 1) return false
  sceneBeat++
  music.effect('page')
  paintScene()
  return true
}
async function act(i) {
  const node = episode.nodes[state.node],
    c = visibleChoices(node)[i]
  if (!c) return
  state.history.push(JSON.stringify({ ...state, history: [], avatar: null }))
  if (state.history.length > 30) state.history.shift()
  if (node.widget === 'reserve') state.vars.reserve = +$('#reserve-range').value
  music.effect()
  track('choice', { node: state.node, choice: i })
  if (c.to.startsWith('@')) {
    // Action choices carry answers too — the opening scene asks the player's timing on an
    // @next choice — so record the data without moving the player off this scene.
    applyChoice(state, c)
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
    goal: learningPlan(state.profile).goal,
    timeline: profileOptions.timeline.find(([id]) => id === state.profile.timeline)[1],
    fallbackIntro: 'I found the Credit Compass portal in The First Key and would like the preview when it opens.',
    context: gameContext('portal'),
  })
  state.lead.portal = r.skipped ? 'skipped' : r.delivered ? 'delivered' : r.fallback ? 'texted' : 'failed'
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
document.addEventListener('keydown', (e) => {
  if (story.hidden || anyDialogOpen() || activeArcade) return
  if (e.key === 'Escape') {
    e.preventDefault()
    return closeStory()
  }
  // Space or Enter walks the scene forward, the way a game text box does.
  if ((e.key === ' ' || e.key === 'Enter') && !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(document.activeElement?.tagName)) {
    if (nextBeat()) e.preventDefault()
  }
})
$('#narrate').onclick = () => {
  if (reading) return stopNarration()
  if (!narrator.isSupported()) return toast('Read-aloud is not available in this browser. All dialogue is on screen.')
  const node = episode.nodes[state.node]
  const text = [interpolate(node.title), ...node.text.map(interpolate), node.lesson || '']
    .join('. ')
    .replace(/&[a-z#0-9]+;/g, ' ')
  reading = true
  $('#narrate').setAttribute('aria-pressed', 'true')
  $('#narrate').textContent = '■ Stop reading'
  music.duck(true)
  const handle = narrator.speak(state.node, text, {
    volume: audioPrefs.voice / 100,
    onend: stopNarration,
    onerror: stopNarration,
  })
  track('narrate', { node: state.node, mode: handle?.mode })
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
  const inStory = from === 'story' && !story.hidden
  const host = inStory ? $('#story-body') : $('#utility-body')
  if (!inStory) {
    $('#utility-label').textContent = 'HEARTHVALE ARCADE'
    openDialog(utility)
  } else $('#scene-location').textContent = `HEARTHVALE ARCADE · ${meta.title.toUpperCase()}`
  destroyArcade()
  host.innerHTML = `<div class="arcade-host"><div class="arcade-host-top"><span class="eyebrow">${esc(meta.where.toUpperCase())} · BONUS GAME</span><button class="secondary" id="arcade-back">${inStory ? '← Back to the story' : '← All games'}</button></div><div id="arcade-mount"></div><p class="small">Coins you earn here join your pouch. Only a better run than your best adds more. <a href="arcade/${id}/" target="_blank" rel="noopener">Open this game on its own page to share it ↗</a></p></div>`
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
    `<h2>Five quick games. Real lessons. Pretend coins.</h2><p>Every coin is $100 of fictional down payment at the gate. Play here any time, or share a game on its own page.</p><p class="fiction-note"><b>Everything in these games is made up</b> — prices, rates, payments and coins. Nothing here is a rate quote, an offer, or a commitment to lend.</p><div class="arcade-list">${Object.entries(GAMES)
      .map(([id, g]) => {
        const b = state.minigames[id]
        return `<div class="arcade-row"><span class="mg-art"><img src="${g.art}" alt="" width="600" height="900" loading="lazy"></span><div><strong>${g.title}</strong><small>${g.blurb}</small><small class="muted">${b ? `Best score ${b.score} · ◉ ${b.coins} · ${b.plays} play${b.plays === 1 ? '' : 's'}` : 'Not played yet'}</small></div><div class="arcade-row-actions"><button class="primary" data-play="${id}">Play ▶</button><button class="secondary" data-share="${id}" title="Copy a link to this game">↗</button></div></div>`
      })
      .join('')}</div><div class="numbers"><div><small>COIN POUCH</small><strong>◉ ${state.coins}</strong></div><div><small>FICTIONAL PAYMENT CHANGE</small><strong>−${money(coinsToMonthlySavings(state.coins))}/mo</strong></div></div><p class="small">Games are original and fictional. They practice ideas; they do not predict prices, rates, or approvals. <a href="arcade/" target="_blank" rel="noopener">Open the arcade page ↗</a></p>`,
  )
  document.querySelectorAll('[data-play]').forEach((b) => (b.onclick = () => launchArcade(b.dataset.play, 'panel')))
  document.querySelectorAll('[data-share]').forEach(
    (b) =>
      (b.onclick = async () => {
        const url = new URL(`arcade/${b.dataset.share}/`, location.href).href
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
let voicePickerReady = false
function soundPanel() {
  if (!voicePickerReady) {
    voicePickerReady = true
    buildVoicePicker()
  }
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
/* ---------- narrator voice picker ---------- */
async function buildVoicePicker() {
  const sel = $('#voice-pick'),
    note = $('#voice-note')
  if (!sel) return
  const list = await narrator.ready()
  if (!list.length) {
    sel.innerHTML = '<option>No voices installed</option>'
    sel.disabled = true
    $('#voice-try').disabled = true
    note.textContent = 'This browser has no speech voices installed, so read-aloud is unavailable. All dialogue is on screen.'
    return
  }
  const current = narrator.currentVoice()
  sel.innerHTML = list
    .map((v) => `<option value="${esc(v.id)}" ${current && v.id === current.id ? 'selected' : ''}>${esc(v.label)}</option>`)
    .join('')
  sel.disabled = false
  $('#voice-try').disabled = false
  // The best voice on the device is first in the list, so say so rather than leaving the player guessing.
  note.textContent = `${list.length} voice${list.length === 1 ? '' : 's'} on this device, best first. Settings stay on this device.`
  sel.onchange = () => {
    narrator.setVoice(sel.value)
    track('voice_changed')
    narrator.preview(sel.value, { volume: audioPrefs.voice / 100 })
  }
  $('#voice-try').onclick = () => narrator.preview(sel.value, { volume: audioPrefs.voice / 100 })
}

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
  if (state.docQuest === 'complete') lessons.push('THE READY SATCHEL\n' + journalLessons.albert)
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
  if (state.docQuest === 'complete') entries.push(`<div class="journal-entry bonus"><h3>The Ready Satchel</h3><p>${journalLessons.albert}</p></div>`)
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
        renderNode('wake')
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
        goal: learningPlan(state.profile).goal,
        timeline: profileOptions.timeline.find(([id]) => id === state.profile.timeline)[1],
        fallbackIntro: 'Please tell me when Episode 2 of The First Key opens.',
        context: gameContext('episode2'),
      })
      if (r.ok) {
        state.lead.episode = r.delivered ? 'delivered' : 'texted'
        save()
        toast(r.delivered ? 'You’re on the list for Episode 2.' : `Your message is ready to send to ${presenter.firstName}.`)
        showSeries(2)
      }
    }
  if (focusEpisode) setTimeout(() => document.querySelector('.series-card.focus')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50)
}
$('#series').onclick = () => showSeries()

/* ---------- share card ---------- */
async function showCard() {
  utilityView('YOUR ADVENTURER CARD', `<h2>Making your card…</h2><p class="small">Drawn on this device.</p>`)
  try {
    const { blob, dataUrl } = await shareCard({
      avatar: state.avatar,
      name: state.profile.name,
      headline: `${state.profile.name} earned the First Key`,
      subline: `${heroOf().name} · ${learningPlan(state.profile).title}`,
      footer: `Play at ${presenter.site.replace(/^https?:\/\/(www\.)?/, '')}/play · presented by ${presenter.name}, ${presenter.company}`,
      coins: state.coins,
    })
    utilityView(
      'YOUR ADVENTURER CARD',
      `<h2>${esc(state.profile.name)}, you look great in pixels.</h2><img class="card-preview" src="${dataUrl}" alt="Adventurer card"><div class="utility-actions"><button class="primary" id="card-download">Download ↓</button><button class="secondary" id="card-share">Share ↗</button>${state.avatar ? '' : '<button class="secondary" id="card-photo">Add my photo first</button>'}</div><p class="small">${state.avatar ? 'Your photo was turned into pixels on this device and never uploaded.' : 'Add a photo in My adventurer to put your own face on the card.'}</p>`,
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
  if (state.node === 'castle' || state.node === 'arizona' || state.node.startsWith('preapproval')) return 'The flag on the gate is mine. Ask me anything, and say hi to Albert in the keep.'
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
    goal: learningPlan(state.profile).goal,
    timeline: profileOptions.timeline.find(([id]) => id === state.profile.timeline)[1],
    fallbackIntro: 'I have a question from The First Key game.',
    context: gameContext('question'),
  })
  if (r.ok) toast(r.delivered ? `Sent. ${presenter.firstName} will get back to you.` : `Your message is ready to send to ${presenter.firstName}.`)
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
    goal: p.goal,
    timeline: profileOptions.timeline.find(([id]) => id === state.profile.timeline)[1],
    fallbackIntro: `I finished The First Key. My plan focus is ${p.title}.`,
    context: gameContext('plan'),
  })
  if (r.ok) {
    state.lead.plan = r.delivered ? 'delivered' : 'texted'
    save()
    toast(r.delivered ? `Sent. ${presenter.firstName} will read it before you talk.` : `Your plan summary is ready to send to ${presenter.firstName}.`)
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
  if (!story.hidden && !utility.open && !$('#sound-panel').open && !$('#lead')?.open && !activeArcade && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && ['1', '2', '3'].includes(e.key)) {
    e.preventDefault()
    act(+e.key - 1)
  }
})
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopNarration()
    held.clear()
    steering = null
    pointerHeld = false
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
  const step = nextStep(state)
  if (step.id) travel(step.id)
  else toast(step.hint)
}
$('#next-destination').onclick = goNext
function howToPlay() {
  utilityView(
    'YOUR FIRST QUEST',
    `<h2>From rent day to your first key.</h2><p>Your long-term adventure is buying a home. This opening quest is a short practice run that unlocks your personal buying plan.</p><ol class="how-steps"><li><b>Survive rent day.</b> Bartleby Quill wants his money. Keep what you can.</li><li><b>Collect three tools.</b> Visit the provisioner, the guild, and the mapmaker’s tower.</li><li><b>Face your first house decision.</b> Visit Three-Door Lane and work through a repair surprise.</li><li><b>Meet the lender at the gate.</b> ${esc(presenter.firstName)} and ${esc(assistant.firstName)} are the two real people in town. Reach the bridge to earn your First Key.</li></ol><div class="lesson"><small>HOW TO MOVE</small>Walk with <kbd>W A S D</kbd> or the arrows. Click the map to walk there, or <b>hold the mouse down and lead your character around</b> like a leash. Press <kbd>E</kbd> or tap ● near a glowing place to enter it. Walk over coins to collect them. Something off the marked paths is humming.</div><div class="lesson"><small>COINS</small>Path coins and the four arcade games fill your pouch. At the gate, every coin becomes $100 of fictional down payment and you see what it does to a monthly payment.</div><p>There is no timer and no perfect score. Thoughtful choices, including deciding to prepare longer, move the story forward.</p><div class="utility-actions"><button class="primary" id="help-next">${state.ended ? 'Open my buying plan' : 'Take me to my next stop'} →</button><button class="secondary" id="replay-intro">Watch the opening again</button></div>`,
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
/** Draw the character currently being configured into the setup screen's preview slot. */
let previewToken = 0
async function previewCharacter() {
  const img = $('#char-preview')
  if (!img) return
  const mine = ++previewToken
  const loading = $('#char-loading')
  if (loading) loading.hidden = false
  try {
    const sheet = await spriteSheet({ hero: setupDraft.hero, face: draftAvatar || null, scale: 6, walkOnly: true })
    if (mine !== previewToken) return
    // Show a single frame: the sheet is four frames wide, so scale it up and clip to the first.
    img.src = sheet.dataUrl
    img.style.width = sheet.frameWidth + 'px'
    img.style.height = sheet.frameHeight + 'px'
    img.style.objectFit = 'none'
    img.style.objectPosition = '0 0'
  } catch {
    if (mine === previewToken) img.removeAttribute('src')
  }
  if (loading && mine === previewToken) loading.hidden = true
}

function renderSetup() {
  const hero = heroes.find((h) => h.id === setupDraft.hero)
  $('#setup-body').innerHTML = `<div class="setup-top"><span class="eyebrow">${editingProfile ? `MY ADVENTURER · ${setupStep + 1} OF 2` : 'WHO IS KNOCKING BACK?'}</span>${editingProfile ? '<button id="cancel-profile" aria-label="Cancel changes">✕</button>' : ''}</div><div class="setup-content"><h2>${setupStep === 0 ? 'Every adventure needs you.' : 'What is on the other side of your door?'}</h2><p class="muted">${setupStep === 0 ? 'Pick a character, or put your own face in the game. Takes ten seconds. The rest you answer while you play.' : 'These shape your buying plan. Change them whenever you like.'}</p>${
    setupStep === 0
      ? `<div class="hero-grid" role="group" aria-label="Choose your adventurer">${heroes.map((h) => `<button type="button" class="hero-card ${setupDraft.hero === h.id ? 'selected' : ''}" data-hero="${h.id}" aria-pressed="${setupDraft.hero === h.id}"><span class="hero-art" style="background-position:${h.index * 50}% center"></span><strong>${h.name}</strong><small>${h.line}</small><span class="hero-selected">${setupDraft.hero === h.id ? '✓ Selected' : 'Choose'}</span></button>`).join('')}</div><div class="photo-row"><div class="photo-preview char"><img id="char-preview" alt="Your character" width="108" height="144"><span class="photo-empty" id="char-loading" hidden>…</span></div><div><strong>${draftAvatar ? 'That’s you, in Hearthvale.' : 'Put your face in the game'}</strong><p class="small">${draftAvatar ? 'Your face is part of the character now — this is who walks the map and talks to Erik.' : 'Choose a photo and your face becomes part of the character, on the map and in every conversation. The photo never leaves your device.'}</p><div class="photo-actions"><label class="secondary file-btn">${draftAvatar ? 'Try another photo' : 'Choose a photo'}<input type="file" id="avatar-file" accept="image/*" capture="user" hidden></label>${draftAvatar ? '<button type="button" class="secondary" id="avatar-remove">Use the character instead</button>' : ''}</div><p class="small photo-status" id="photo-status" hidden></p></div></div><div class="profile-grid"><label>What should we call you?<input id="adventurer-name" type="text" maxlength="30" autocomplete="off" value="${esc(setupDraft.name === 'Adventurer' ? '' : setupDraft.name)}" placeholder="Name or nickname"></label><label>Bring a little luck<select id="adventurer-charm">${selectOptions('charm', setupDraft.charm)}</select></label></div>`
      : `<div class="profile-hero">${draftPortrait('hero-art')}<div><span class="eyebrow">${draftAvatar ? 'YOU, IN PIXELS · ' : ''}${hero.name}</span><h3>${esc(setupDraft.name || 'Adventurer')}</h3><p>${esc(profileOptions.charm.find(([v]) => v === setupDraft.charm)[1])} packed. Possibilities ahead.</p></div></div><div class="profile-fields"><label>What would a home make possible?<select id="profile-goal">${selectOptions('goal', setupDraft.goal)}</select></label><label>When might you want to make a move?<select id="profile-timeline">${selectOptions('timeline', setupDraft.timeline)}</select></label><label>What would you most like to understand?<select id="profile-question">${selectOptions('question', setupDraft.question)}</select></label></div>`
  }<div class="setup-actions">${setupStep ? '<button class="secondary" id="setup-back">← My character</button>' : '<span class="small">No sign-up. Nothing is sent anywhere.</span>'}<button class="primary" id="setup-next">${setupStep === 0 ? (editingProfile ? 'Next →' : 'Start playing →') : 'Save my changes'}</button></div><p class="privacy-note">Your answers personalize learning and stay on this device unless you choose to send a message to ${esc(presenter.name)}. They are not a mortgage assessment.</p></div>`
  document.querySelectorAll('[data-hero]').forEach(
    (b) =>
      (b.onclick = () => {
        collectSetup()
        setupDraft.hero = b.dataset.hero
        music.effect()
        renderSetup()
        previewCharacter()
      }),
  )
  previewCharacter()
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
        const { dataUrl } = await faceFromPhoto(f)
        draftAvatar = dataUrl
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
    // First run is a single screen: name and character, then straight into the story.
    // Rowan and Ellis ask about goal, timing and focus in dialogue instead of on a form.
    if (setupStep === 0 && editingProfile) {
      setupStep = 1
      renderSetup()
      return
    }
    state.profile = { ...setupDraft, complete: true }
    state.avatar = draftAvatar
    buildHeroArt()
    state.vars.priority = state.profile.goal
    save()
    update()
    $('#setup').close()
    track('profile_saved', { hero: state.profile.hero, avatar: !!state.avatar, question: state.profile.question, timeline: state.profile.timeline })
    if (editingProfile) {
      toast('Your adventurer and buying plan are updated.')
      if (state.planStarted && state.ended) showPlan()
      return
    }
    // The opening plays first. You are asleep, and then Bartleby lets himself in.
    if (saved) {
      state.started = true
      save()
      update()
      renderNode(state.node)
    } else {
      showPrologue()
    }
  }
}
$('#setup').addEventListener('cancel', (e) => {
  if (!editingProfile) e.preventDefault()
})
$('#profile-button').onclick = () => showSetup(true)
/* ---------- the opening: you are asleep, and then you are not ----------
   This is the original opening from homebuyersmindset.com, rebuilt here: the apartment at six in
   the morning, the noise through the walls, the landlord letting himself in, and a receipt that
   shows the month in hours worked rather than in dollars. It plays before anything else. */
let prologueTimer = null,
  prologueIndex = 0,
  prologueReplay = false
const openingFrames = [
  {
    scene: 'sleeping',
    eyebrow: 'SIX IN THE MORNING',
    title: 'Just five more minutes.',
    text: 'A neighbour’s boots. A door slamming somewhere below. Someone, somewhere, practising the trumpet. All you want is a little peace and about four more hours.',
  },
  {
    scene: 'collector',
    eyebrow: 'BARTLEBY QUILL · YOUR LANDLORD',
    title: '“Congratulations! Another month paid.”',
    text: '“You worked a hundred hours for this. I own the building. The good news,” he beams, pocketing your month and licking a fingertip to write the receipt, “is that you get to do it all again next month!”',
    receipt: true,
  },
  {
    scene: 'gone',
    eyebrow: 'THE JAR IS LIGHTER',
    title: 'What if next month started something?',
    text: 'Rent bought you a place to live. It did not buy you a door of your own, or walls you are allowed to paint. Through the window, the roofs of Hearthvale are going gold.',
  },
]
function showPrologue(replay = false) {
  stopNarration()
  prologueReplay = replay
  prologueIndex = 0
  renderPrologue()
  openDialog($('#prologue'))
}
function renderPrologue() {
  clearTimeout(prologueTimer)
  const f = openingFrames[prologueIndex]
  const last = prologueIndex === openingFrames.length - 1
  $('#prologue-body').innerHTML = `<div class="opening" data-scene="${f.scene}">
      <div class="opening-scene">
        <span class="sleep-z">z z Z</span>
        <span class="noise-note">THUMP · TOOT · SLAM</span>
        <span class="collector"><span class="collector-hat"></span><span class="collector-coat"></span><span class="collector-ledger"></span></span>
        <span class="rent-coin">−$1,800 · rent paid</span>
        <span class="opening-shade"></span>
      </div>
      <div class="opening-caption">
        <div class="opening-controls"><button data-prologue-sound>${music.on ? '♫ Mute' : '♫ Sound on'}</button><button id="skip-opening">Skip →</button></div>
        <span class="eyebrow">${esc(f.eyebrow)}</span>
        <h2>${esc(f.title)}</h2>
        <p>${esc(f.text)}</p>
        ${f.receipt ? '<div class="rent-receipt"><strong>RECEIPT · ONE MONTH OF RENT</strong><span>$18 take-home an hour × 100 hours = $1,800</span><small>A fictional illustration of what a month of rent costs in hours of your life.</small></div>' : ''}
        <div class="opening-bottom">
          <span class="opening-dots">${openingFrames.map((_, i) => `<i class="${i <= prologueIndex ? 'on' : ''}"></i>`).join('')}</span>
          <button class="primary" id="next-opening">${last ? 'Get up →' : 'Next ▸'}</button>
        </div>
      </div>
    </div>`
  $('[data-prologue-sound]').onclick = toggleMusic
  $('#skip-opening').onclick = finishPrologue
  $('#next-opening').onclick = () => {
    if (last) finishPrologue()
    else {
      prologueIndex++
      renderPrologue()
    }
  }
  if (f.scene === 'collector') music.effect('reward')
}
function finishPrologue() {
  clearTimeout(prologueTimer)
  $('#prologue').close()
  if (prologueReplay) return update()
  state.started = true
  save()
  update()
  track('prologue_done')
  renderNode(saved ? state.node : 'wake')
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
buildHeroArt()
preparePresenter()
// Debug harness, only with ?debug=1: lets a test render every scene under a made-up state and
// check that no {{placeholder}} reaches a player as literal braces.
if (config.analytics.debug)
  window.__firstKeyDebug = {
    interpolate,
    getState: () => state,
    setState: (s) => {
      state = s
    },
  }
openDialog(welcome)
