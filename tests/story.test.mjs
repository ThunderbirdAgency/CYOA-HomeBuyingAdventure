import assert from 'node:assert/strict'
import {
  episode,
  locations,
  sources,
  items,
  agents,
  inspectionKinds,
  mapCoins,
  mapDocs,
  secretSpots,
  episodes,
  teaserPins,
  initialState,
  choose,
  applyChoice,
  enter,
  unlocked,
  blockedBecause,
  startFor,
  nextStep,
  choiceVisible,
  readyForPreapproval,
  restoreState,
  addCoins,
  collectMapCoin,
  collectDoc,
  recordMinigame,
} from '../dist/story-data.js'
import { learningPlan, cleanProfile } from '../dist/profile.js'
import { monthlyFor, coinsToDollars, coinsToMonthlySavings, config } from '../dist/config.js'
import { walkable, route } from '../dist/paths.js'

const nodes = episode.nodes
const MINIGAMES = ['rent-day', 'coin-catch', 'offer-match', 'inspection-hunt', 'down-payment-dash']
const ACTIONS = ['@next', '@plan', '@journal', '@series', '@card', '@close', '@portal-unlock']
const WIDGETS = [
  'compare',
  'monthly',
  'reserve',
  'roadmap',
  'repair',
  'downpayment',
  'documents',
  'arizona',
  'agents',
  'inspections',
  'offer',
]

/* ---------- authored graph is sound ---------- */
for (const [id, node] of Object.entries(nodes)) {
  assert.ok(node.text.length && node.choices.length, id + ' must have prose and a way forward')
  if (node.source) assert.ok(sources[node.source], id + ' source exists: ' + node.source)
  if (node.item) assert.ok(items.some((i) => i.id === node.item), id + ' item exists')
  if (node.minigame) assert.ok(MINIGAMES.includes(node.minigame), id + ' minigame exists')
  if (node.widget) assert.ok(WIDGETS.includes(node.widget), id + ' widget exists: ' + node.widget)
  if (node.hire) assert.ok(agents.some((a) => a.id === node.hire), id + ' hires a real agent')
  for (const c of node.choices) {
    assert.ok(
      c.to.startsWith('@') ? ACTIONS.includes(c.to) : nodes[c.to],
      id + ' choice destination exists: ' + c.to,
    )
    if (c.order) assert.ok(inspectionKinds.some((k) => k.id === c.order), id + ' orders a real inspection')
  }
}
const seen = new Set()
function reach(id) {
  if (seen.has(id)) return
  seen.add(id)
  for (const c of nodes[id].choices) if (!c.to.startsWith('@')) reach(c.to)
}
// Every door into the world: the six places, at every stage of the purchase, plus the bonuses.
{
  const stages = [
    initialState(),
    { ...initialState(), done: ['cottage', 'market'], metPercival: true },
    { ...initialState(), done: ['cottage', 'market'], metPercival: true, agent: 'wren' },
    { ...initialState(), done: ['cottage', 'homes', 'market', 'guild'], agent: 'wren', preapproved: true },
    { ...initialState(), agent: 'wren', preapproved: true, offer: 'lost' },
    { ...initialState(), agent: 'wren', preapproved: true, offer: 'accepted' },
    { ...initialState(), agent: 'wren', preapproved: true, offer: 'accepted', inspections: ['home'] },
  ]
  for (const s of stages) for (const l of locations) reach(startFor(s, l))
}
secretSpots.forEach((s) => reach(s.start))
reach('portal-open') // opened by the @portal-unlock action
reach('albert-done') // opened when the last document is collected
assert.equal(seen.size, Object.keys(nodes).length, 'all authored scenes reachable')
for (const s of secretSpots) assert.ok(nodes[s.start], 'secret spot start exists')
for (const p of teaserPins) assert.ok(episodes.some((e) => e.number === p.episode), 'teaser pin episode exists')
assert.equal(episodes.filter((e) => e.status === 'playable').length, 1)
assert.equal(episodes.length, 5)
assert.ok(mapCoins.length >= 10 && new Set(mapCoins.map((c) => c.id)).size === mapCoins.length)

/* ---------- everything on the map can actually be walked to ---------- */
{
  const start = initialState().player
  assert.ok(walkable(start.x, start.y), 'the player starts on a path')
  for (const l of locations) {
    assert.ok(walkable(l.x, l.y), l.id + ' stands on a path')
    assert.ok(route(start.x, start.y, l.x, l.y).length, l.id + ' is reachable on foot from the start')
  }
  for (const c of mapCoins) assert.ok(walkable(c.x, c.y), 'coin ' + c.id + ' is on a path')
  for (const d of mapDocs) assert.ok(walkable(d.x, d.y), 'document ' + d.id + ' is on a path')
  for (const s of secretSpots) assert.ok(walkable(s.x, s.y), 'secret ' + s.id + ' is on a path')
  // Nothing sits close enough to anything else to be collected by accident.
  const pins = [...mapCoins, ...mapDocs]
  for (let i = 0; i < pins.length; i++)
    for (let j = i + 1; j < pins.length; j++)
      assert.ok(
        Math.hypot((pins[i].x - pins[j].x) * 1.5, pins[i].y - pins[j].y) > 5,
        `${pins[i].id} and ${pins[j].id} are too close together`,
      )
  // The pond, the forest and the castle towers are not walkable.
  for (const [x, y] of [[47, 45], [12, 90], [68, 58], [50, 85], [95, 20]])
    assert.ok(!walkable(x, y), `(${x},${y}) must not be walkable`)
}

/* ---------- complete journeys ---------- */
function follow(s, ids) {
  for (let i = 0; i < ids.length; i++) {
    s.node = ids[i]
    enter(s, nodes[ids[i]])
    if (i + 1 < ids.length) {
      const c = nodes[ids[i]].choices.find((c) => c.to === ids[i + 1])
      assert.ok(c, `${ids[i]} -> ${ids[i + 1]}`)
      choose(s, c)
    }
  }
}
// Pick a choice by its label so a test reads like a player's afternoon.
function pick(s, label) {
  const node = nodes[s.node]
  const c = node.choices.find((c) => c.label.includes(label))
  assert.ok(c, `${s.node} has a choice matching "${label}"`)
  assert.ok(choiceVisible(s, c), `"${label}" is offered right now`)
  applyChoice(s, c)
  if (!c.to.startsWith('@')) {
    s.node = c.to
    enter(s, nodes[c.to])
  }
  return s
}
function doTheBudget(s, reserve) {
  follow(s, ['market', 'budget-choice', 'reserve'])
  s.vars.reserve = reserve
  follow(s, ['market-end'])
}
function findTheDocuments(s) {
  follow(s, ['castle', 'albert', 'albert-quest'])
  for (const d of mapDocs) assert.ok(collectDoc(s, d.id))
  follow(s, ['albert-done'])
}

// Both first moves, both ways of getting an agent, every offer outcome, every repair response.
const AGENT_ROUTES = [
  // Open house first, hire the listing agent, dual agency in writing.
  ['homes', ['openhouse', 'oh-none', 'oh-house', 'oh-dual', 'oh-hire'], 'percival', true],
  // Open house first, interview him, then walk up the hill to Wren.
  ['homes', ['openhouse', 'oh-why', 'oh-dual', 'oh-interview'], 'wren', false],
  // Lie about having an agent, get shown the door, go and get a real one.
  ['homes', ['openhouse', 'oh-lie', 'oh-signed'], 'dashiell', false],
  // Straight to the office.
  ['guild', ['office', 'office-wren'], 'wren', false],
]
let variants = 0
for (const [first, agentPath, hire, dual] of AGENT_ROUTES)
  for (const reserve of [0, 1000, 4000])
    for (const outcome of ['negotiate', 'self-fund', 'step-back']) {
      const s = initialState()
      const gate = locations.find((l) => l.id === 'gate')

      // Nobody writes a loan for a buyer with nobody on their side.
      assert.equal(unlocked(s, gate), false)
      assert.match(blockedBecause(s, gate), /agent/i)

      follow(s, ['wake'])
      pick(s, 'I want a door of my own')
      assert.equal(s.node, 'rowan')
      pick(s, 'Somewhere to settle in')
      assert.ok(s.done.includes('cottage'))
      assert.equal(s.profile.goal, 'stability')

      // Both first moves are open from the start.
      assert.ok(unlocked(s, locations.find((l) => l.id === 'homes')))
      assert.ok(unlocked(s, locations.find((l) => l.id === 'guild')))
      assert.equal(nextStep(s).id, 'homes')

      follow(s, agentPath)
      if (hire !== 'percival') {
        // The listing agent is not your agent, whatever he showed you.
        assert.equal(s.agent, null, 'walking the open house does not hire anybody')
        assert.equal(unlocked(s, gate), false)
        follow(s, ['office', hire === 'wren' ? 'office-wren' : 'office-dashiell', 'office-hire-' + hire])
      }
      assert.equal(s.agent, hire)
      assert.equal(s.dualAgency, dual, 'dual agency is only set when you sign for it')
      assert.ok(s.done.includes('guild'), 'choosing an agent ticks that step wherever it happened')
      assert.ok(unlocked(s, gate), 'the gate opens once somebody represents you')

      // Pre-approval needs a budget and every document. Neither is optional.
      s.node = 'castle'
      assert.ok(!readyForPreapproval(s))
      follow(s, ['castle', 'preapproval'])
      assert.ok(
        !nodes.preapproval.choices.filter((c) => choiceVisible(s, c)).some((c) => c.to === 'preapproval-done'),
        'the letter is not on offer yet',
      )
      doTheBudget(s, reserve)
      assert.ok(!readyForPreapproval(s), 'a budget alone is not enough')
      findTheDocuments(s)
      assert.ok(readyForPreapproval(s))
      s.node = 'preapproval'
      pick(s, 'Write me the letter')
      assert.ok(s.preapproved)
      assert.ok(s.done.includes('gate'))
      assert.equal(s.vars.reserve, reserve, 'getting qualified costs nothing from the pouch')

      // Only now does the lane become a place where you write an offer.
      assert.equal(startFor(s, locations.find((l) => l.id === 'homes')), 'offer-write')
      follow(s, ['offer-write', 'offer-asking', 'offer-accepted'])
      assert.equal(s.offer, 'accepted')

      // Inspections cost money, out of the pouch, before you own anything.
      assert.equal(startFor(s, locations.find((l) => l.id === 'homes')), 'inspect-choose')
      s.node = 'inspect-choose'
      pick(s, 'General home inspection')
      assert.deepEqual(s.inspections, ['home'])
      assert.equal(s.inspectionSpend, 450)
      assert.equal(s.vars.reserve, Math.max(0, reserve - 450))
      pick(s, 'General home inspection')
      assert.deepEqual(s.inspections, ['home'], 'you only pay for each inspection once')
      pick(s, 'Roof specialist')
      assert.equal(s.inspectionSpend, 750)
      const pouch = s.vars.reserve
      follow(s, ['inspect-choose', 'inspect-report', outcome])
      assert.equal(s.vars.resolution, outcome)
      assert.equal(s.vars.reserve, pouch, 'the repair branch does not silently spend the pouch')

      follow(s, [outcome === 'self-fund' ? 'homes-end' : 'homes-end'])
      assert.equal(nextStep(s).id, 'gate')
      follow(s, ['castle'])
      const finale = nodes.castle.choices.filter((c) => choiceVisible(s, c))
      assert.ok(finale.some((c) => c.to === 'bridge-choice'), 'the key is offered once the house is settled')
      assert.ok(!finale.some((c) => c.to === 'preapproval'), 'and pre-approval is not offered twice')
      follow(s, ['bridge-choice', 'ending'])

      assert.equal(new Set(s.done).size, 5, 'five of six steps; the tower is optional')
      assert.ok(s.ended)
      assert.ok(s.inventory.includes('key'))
      assert.ok(s.inventory.includes('satchel'))
      const before = s.inventory.length
      enter(s, nodes.ending)
      assert.equal(s.inventory.length, before, 'revisiting the ending must not duplicate rewards')
      variants++
    }
assert.equal(variants, 36)

/* ---------- the offer is a proposal, not a formality ---------- */
{
  // A player who has done everything up to the offer.
  const readyToOffer = (agent = 'wren') => {
    const s = initialState()
    s.done = ['cottage', 'guild', 'market', 'gate']
    s.agent = agent
    s.preapproved = true
    s.docQuest = 'complete'
    return s
  }
  // Lowball twice and the house sells to somebody else.
  const s = readyToOffer()
  follow(s, ['offer-write', 'offer-under', 'offer-lost'])
  assert.equal(s.offer, 'lost')
  assert.equal(s.offerTries, 1)
  assert.equal(startFor(s, locations.find((l) => l.id === 'homes')), 'offer-lost-again')
  assert.match(nextStep(s).hint, /sold/)
  follow(s, ['offer-lost-again', 'offer-accepted'])
  assert.equal(s.offer, 'accepted')
  assert.equal(s.vars.home, 'lantern', 'the second time round you go for the other door on the lane')
  assert.equal(s.vars.housing, 3300, 'and the housing budget follows the house')

  // Take the counter instead and you are under contract in one move.
  const t = readyToOffer('wren')
  follow(t, ['offer-write', 'offer-under', 'offer-accepted'])
  assert.equal(t.offer, 'accepted')

  // Waiving the inspection wins the house and skips the part that protects you.
  const u = readyToOffer('dashiell')
  follow(u, ['offer-write', 'offer-waive', 'offer-blind'])
  assert.equal(u.offer, 'accepted')
  assert.equal(u.vars.waived, true)
  assert.equal(startFor(u, locations.find((l) => l.id === 'homes')), 'homes-end', 'nothing left to inspect')
  assert.equal(nextStep(u).id, 'gate', 'there is no inspection to wait for')
  assert.ok(
    nodes.castle.choices.filter((c) => choiceVisible(u, c)).some((c) => c.to === 'bridge-choice'),
    'a waived inspection still lets you finish',
  )
  // The middle path keeps the inspection.
  const v = readyToOffer('dashiell')
  follow(v, ['offer-write', 'offer-waive', 'offer-accepted'])
  assert.ok(!v.vars.waived)
}

/* ---------- the open house teaches who works for whom ---------- */
{
  assert.equal(nodes.openhouse.source, 'agency')
  assert.match(sources.agency.publisher, /Arizona Department of Real Estate/)
  // Every route out of the first question reaches the representation conversation.
  for (const first of ['oh-none', 'oh-lie', 'oh-why'])
    assert.ok(nodes.openhouse.choices.some((c) => c.to === first), 'openhouse offers ' + first)
  // Claiming you have an agent leads to the buyer-broker question, not straight past it.
  assert.ok(nodes['oh-lie'].choices.some((c) => c.to === 'oh-signed'))
  assert.ok(nodes['oh-lie'].text.join(' ').includes('buyer-broker'))
  // Saying you signed gets you shown the door with your questions answered, and no agent.
  const s = initialState()
  s.done = ['cottage']
  follow(s, ['openhouse', 'oh-lie', 'oh-signed'])
  assert.equal(s.agent, null)
  assert.ok(s.metPercival, 'you have met the listing agent, which is not the same as having one')
  assert.ok(!s.done.includes('homes'), 'and you have not got a house under contract')
  assert.equal(nextStep(s).id, 'guild')
  // Dual agency is disclosed and signed for, never assumed.
  assert.ok(nodes['oh-dual'].lesson.includes('writing'))
  assert.equal(nodes['oh-hire'].dual, true)
  assert.equal(nodes['office-hire-wren'].dual, undefined)
  assert.equal(nodes['office-hire-wren'].sign, true)
}

/* ---------- the opening plays before it talks ---------- */
{
  assert.equal(initialState().node, 'wake')
  assert.equal(nodes.wake.minigame, 'rent-day', 'the landlord scene opens with play')
  assert.ok(nodes.wake.minigameLabel, 'the opening game is featured, not a footnote')
  assert.ok(nodes.wake.text.join(' ').includes('asleep'), 'you start the story asleep')
  assert.equal(nodes.wake.choices.length, 1, 'one way out of the opening scene')
  // Two scenes and one question, then you are on the map.
  assert.deepEqual(
    nodes.rowan.choices.map((c) => c.set?.goal),
    ['stability', 'space', 'control'],
    'Rowan asks the one question that matters',
  )
  for (const c of nodes.rowan.choices) assert.equal(c.to, '@next', 'and then gets out of the way')
  for (const [goal] of [['stability'], ['space'], ['control']]) {
    const s = initialState()
    const g = nodes.rowan.choices.find((c) => c.set.goal === goal)
    // Action choices (@next and friends) must record the answer without moving the player.
    s.node = 'rowan'
    applyChoice(s, g)
    assert.equal(s.profile.goal, goal, 'dialogue sets the profile goal')
    assert.equal(s.vars.priority, goal)
    assert.equal(s.node, 'rowan', 'applyChoice must not move the player')
    assert.equal(learningPlan(s.profile).tasks.length, 3)
  }
}

/* ---------- the portal is a bonus, not a gate ---------- */
{
  const s = initialState()
  follow(s, ['portal-open', 'ledger', 'ledger-dispute'])
  assert.ok(s.inventory.includes('rune'))
  assert.equal(s.coins, 25)
  assert.equal(s.done.length, 0, 'portal does not complete quest locations')
  enter(s, nodes['ledger-dispute'])
  assert.equal(s.coins, 25, 'rune coins awarded once')
  assert.ok(!s.ended)
  // Credit sources only appear in the bonus portal scenes, never on the homebuying quest path.
  const portalNodes = new Set(['portal', 'portal-open', 'ledger', 'ledger-dispute'])
  for (const [id, n] of Object.entries(nodes))
    if (['credit', 'dispute', 'rebuild', 'ftc'].includes(n.source)) assert.ok(portalNodes.has(id), id)
}

/* ---------- Albert's document hunt is required, and it is the player's paperwork ---------- */
{
  const s = initialState()
  assert.equal(mapDocs.length, 5)
  assert.ok(!collectDoc(s, 'paystub'), 'documents are not collectible before Albert marks the map')
  follow(s, ['castle', 'albert', 'albert-docs', 'albert-quest'])
  assert.ok(s.albertMet)
  assert.equal(s.docQuest, 'active')
  for (const d of mapDocs) assert.ok(collectDoc(s, d.id))
  assert.ok(!collectDoc(s, 'paystub'), 'each document once')
  assert.equal(s.docQuest, 'complete')
  follow(s, ['albert-done'])
  assert.ok(s.inventory.includes('satchel'))
  assert.equal(s.coins, 15)
  enter(s, nodes['albert-done'])
  assert.equal(s.coins, 15, 'satchel coins awarded once')
  assert.equal(s.done.length, 0, 'the hunt is a step on the way to the letter, not a place')
  // The wind took the player's paperwork, not Albert's.
  const albertProse = ['albert', 'albert-docs', 'albert-quest', 'albert-done']
    .map((id) => nodes[id].text.join(' '))
    .join(' ')
  assert.match(albertProse, /your paperwork|your cottage window|your papers/i)
  assert.ok(!/lost (my|his) /i.test(albertProse), 'Albert never loses anything')
  const r = restoreState(JSON.parse(JSON.stringify(s)))
  assert.equal(r.docQuest, 'complete')
  assert.equal(r.docs.length, 5)
  assert.ok(r.albertMet)
}

/* ---------- coin economy ---------- */
{
  const s = initialState()
  assert.ok(collectMapCoin(s, 'c1'))
  assert.ok(!collectMapCoin(s, 'c1'), 'each map coin once')
  assert.ok(!collectMapCoin(s, 'nope'))
  assert.equal(s.coins, 3)
  assert.equal(recordMinigame(s, { id: 'coin-catch', score: 100, coins: 12 }), 12)
  assert.equal(recordMinigame(s, { id: 'coin-catch', score: 50, coins: 8 }), 0, 'worse run adds nothing')
  assert.equal(recordMinigame(s, { id: 'coin-catch', score: 300, coins: 20 }), 8, 'only the improvement')
  assert.equal(s.minigames['coin-catch'].plays, 3)
  assert.equal(s.minigames['coin-catch'].score, 300)
  assert.equal(s.coins, 23)
  addCoins(s, -100)
  assert.equal(s.coins, 0, 'never negative')
  assert.equal(coinsToDollars(40), 4000)
  assert.ok(Math.abs(monthlyFor(300000, 0.065, 30) - 1896.2) < 0.5, 'amortization sanity')
  assert.ok(coinsToMonthlySavings(200) > 100 && coinsToMonthlySavings(200) < 140)
  assert.equal(config.presenter.nmls, '263103')
}

/* ---------- profile-based plans ---------- */
for (const focus of ['budget', 'process', 'homes']) {
  const profile = cleanProfile({
    name: 'River',
    question: focus,
    goal: 'space',
    timeline: 'soon',
    hero: 'wayfinder',
    complete: true,
  })
  const plan = learningPlan(profile)
  assert.equal(plan.tasks.length, 3)
  assert.ok(plan.tasks.every((t) => t.id.startsWith(focus + '-')))
  assert.match(plan.goal, /room/)
  assert.match(plan.pace, /conversation/)
}

/* ---------- save migration ---------- */
{
  // v1-v3 were a different quest. Who you are survives; the journey starts again.
  const migrated = restoreState({
    version: 3,
    started: true,
    done: ['cottage', 'market', 'guild', 'homes', 'gate'],
    inventory: ['compass', 'lens', 'map', 'key'],
    node: 'ending',
    location: 'gate',
    ended: true,
    coins: 42,
    coinsCollected: ['c1', 'bogus'],
    minigames: { 'coin-catch': { score: 300, coins: 20, plays: 4 } },
    profile: { name: 'Oak', hero: 'builder', complete: true },
    avatar: 'data:image/png;base64,AAAA',
    vars: { reserve: 1000 },
  })
  assert.equal(migrated.version, 4)
  assert.equal(migrated.node, 'wake')
  assert.equal(migrated.ended, false)
  assert.deepEqual(migrated.done, [], 'the old quest does not count toward the new one')
  assert.deepEqual(migrated.inventory, [])
  assert.equal(migrated.agent, null)
  assert.equal(migrated.preapproved, false)
  assert.equal(migrated.profile.name, 'Oak', 'your character survives')
  assert.equal(migrated.profile.hero, 'builder')
  assert.equal(migrated.avatar, 'data:image/png;base64,AAAA', 'so does your face')
  assert.equal(migrated.coins, 42, 'so do your coins')
  assert.deepEqual(migrated.coinsCollected, ['c1'])
  assert.equal(migrated.minigames['coin-catch'].score, 300)
  assert.ok(!unlocked(migrated, locations.find((l) => l.id === 'gate')))

  // A v4 save round-trips completely.
  const s = initialState()
  s.profile = cleanProfile({ name: 'Oak', question: 'homes', complete: true })
  s.planTasks = ['homes-needs']
  s.started = true
  s.coins = 42
  s.coinsCollected = ['c1', 'bogus']
  s.portal = 'open'
  s.avatar = 'data:image/png;base64,AAAA'
  s.lead = { plan: true }
  s.agent = 'wren'
  s.buyerBroker = true
  s.preapproved = true
  s.offer = 'accepted'
  s.offerTries = 1
  s.inspections = ['home', 'sewer', 'nonsense']
  s.inspectionSpend = 700
  s.node = 'inspect-report'
  const restored = restoreState(JSON.parse(JSON.stringify(s)))
  assert.equal(restored.version, 4)
  assert.equal(restored.profile.name, 'Oak')
  assert.deepEqual(restored.planTasks, ['homes-needs'])
  assert.equal(restored.coins, 42)
  assert.deepEqual(restored.coinsCollected, ['c1'])
  assert.equal(restored.portal, 'open')
  assert.equal(restored.avatar, s.avatar)
  assert.equal(restored.lead.plan, true)
  assert.equal(restored.agent, 'wren')
  assert.equal(restored.buyerBroker, true)
  assert.equal(restored.preapproved, true)
  assert.equal(restored.offer, 'accepted')
  assert.deepEqual(restored.inspections, ['home', 'sewer'], 'unknown inspections are dropped')
  assert.equal(restored.node, 'inspect-report')
  // Anything unrecognised falls back rather than throwing.
  assert.equal(restoreState({ ...JSON.parse(JSON.stringify(s)), agent: 'mallory' }).agent, null)
  assert.equal(restoreState({ ...JSON.parse(JSON.stringify(s)), offer: 'whatever' }).offer, 'none')
  assert.equal(restoreState({ ...JSON.parse(JSON.stringify(s)), node: 'nope' }).node, 'wake')
  assert.equal(restoreState({ ...JSON.parse(JSON.stringify(s)), avatar: 'javascript:alert(1)' }).avatar, null)
}

console.log(
  `Passed: ${variants} full journey variants across both first moves and all three agents; ` +
    `every scene link, item, widget and source; the paths (every place, coin and document reachable on foot); ` +
    `the open house and dual agency; the pre-approval gate; offers won, countered, lost and waived; ` +
    `paid inspections; the portal bonus; the coin economy; save migration v3 → v4.`,
)
