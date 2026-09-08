import assert from 'node:assert/strict'
import {
  episode,
  locations,
  sources,
  items,
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
  restoreState,
  addCoins,
  collectMapCoin,
  collectDoc,
  recordMinigame,
} from '../dist/story-data.js'
import { learningPlan, cleanProfile, nextLocation } from '../dist/profile.js'
import { monthlyFor, coinsToDollars, coinsToMonthlySavings, config } from '../dist/config.js'

const nodes = episode.nodes
const MINIGAMES = ['rent-day', 'coin-catch', 'offer-match', 'inspection-hunt', 'down-payment-dash']
const ACTIONS = ['@next', '@plan', '@journal', '@series', '@card', '@close', '@portal-unlock']

/* ---------- authored graph is sound ---------- */
for (const [id, node] of Object.entries(nodes)) {
  assert.ok(node.text.length && node.choices.length, id + ' must have prose and a way forward')
  if (node.source) assert.ok(sources[node.source], id + ' source exists: ' + node.source)
  if (node.item) assert.ok(items.some((i) => i.id === node.item), id + ' item exists')
  if (node.minigame) assert.ok(MINIGAMES.includes(node.minigame), id + ' minigame exists')
  for (const c of node.choices)
    assert.ok(
      c.to.startsWith('@') ? ACTIONS.includes(c.to) : nodes[c.to],
      id + ' choice destination exists: ' + c.to,
    )
}
const seen = new Set()
function reach(id) {
  if (seen.has(id)) return
  seen.add(id)
  for (const c of nodes[id].choices) if (!c.to.startsWith('@')) reach(c.to)
}
locations.forEach((l) => reach(l.start))
secretSpots.forEach((s) => reach(s.start))
reach('portal-open') // opened by the @portal-unlock action
reach('albert-done') // opened when the last document is collected
assert.equal(seen.size, Object.keys(nodes).length, 'all authored scenes reachable')
for (const s of secretSpots) assert.ok(nodes[s.start], 'secret spot start exists')
for (const p of teaserPins) assert.ok(episodes.some((e) => e.number === p.episode), 'teaser pin episode exists')
assert.equal(episodes.filter((e) => e.status === 'playable').length, 1)
assert.equal(episodes.length, 5)
assert.ok(mapCoins.length >= 10 && new Set(mapCoins.map((c) => c.id)).size === mapCoins.length)
for (const c of mapCoins) assert.ok(c.x > 2 && c.x < 98 && c.y > 2 && c.y < 98, 'coin on the map')

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
const GATE_PATHS = [
  ['bridge', 'lender', 'bridge-choice', 'ending'],
  ['bridge', 'lender', 'arizona', 'bridge-choice', 'ending'],
  ['bridge', 'lender', 'lender-questions', 'arizona', 'lender-questions', 'bridge-choice', 'ending'],
]
let variants = 0
for (const order of [
  ['market', 'guild'],
  ['guild', 'market'],
])
  for (const reserve of [0, 1000, 3000, 4000])
    for (const outcome of ['negotiate', 'self-fund', 'step-back'])
      for (const gatePath of GATE_PATHS) {
        const s = initialState()
        assert.equal(unlocked(s, locations[3]), false)
        follow(s, ['letter', 'rowan', 'purpose'])
        assert.ok(s.profile.goal && s.profile.timeline, 'opening dialogue filled the profile')
        for (const id of order) {
          assert.ok(unlocked(s, locations.find((l) => l.id === id)))
          if (id === 'market') {
            follow(s, ['market', 'budget-choice', 'reserve'])
            s.vars.reserve = reserve
            follow(s, ['market-end'])
          } else follow(s, ['guild', 'guild-hasty', 'guild-end'])
        }
        assert.ok(unlocked(s, locations[3]))
        follow(s, ['course', 'course-end'])
        follow(s, ['homes', 'appraisal', 'inspection', outcome, 'homes-end'])
        assert.ok(unlocked(s, locations[5]))
        follow(s, gatePath)
        assert.equal(new Set(s.done).size, 6)
        assert.equal(s.inventory.length, 4)
        assert.ok(s.ended)
        assert.equal(s.visitedArizona, gatePath.includes('arizona'))
        assert.equal(s.vars.reserve, reserve, 'reserve must persist into repair scenario')
        enter(s, nodes.ending)
        assert.equal(s.inventory.length, 4, 'revisiting ending must not duplicate rewards')
        variants++
      }
assert.equal(variants, 72)

/* ---------- the opening asks the profile in dialogue, not on a form ---------- */
{
  const goals = nodes.rowan.choices.map((c) => c.set?.goal)
  assert.deepEqual(goals, ['stability', 'space', 'control'], 'Rowan asks the goal')
  const times = nodes.purpose.choices.map((c) => c.set?.timeline)
  assert.deepEqual(times, ['soon', 'later', 'exploring'], 'Rowan asks the timing')
  assert.equal(nodes.letter.minigame, 'rent-day', 'the landlord scene opens with play')
  assert.ok(nodes.letter.minigameLabel, 'the opening game is featured, not a footnote')
  for (const [goal, timeline] of [['stability', 'soon'], ['space', 'later'], ['control', 'exploring']]) {
    const s2 = initialState()
    const g = nodes.rowan.choices.find((c) => c.set.goal === goal)
    choose(s2, g)
    assert.equal(s2.profile.goal, goal, 'dialogue sets the profile goal')
    assert.equal(s2.vars.priority, goal)
    const t = nodes.purpose.choices.find((c) => c.set.timeline === timeline)
    choose(s2, t)
    assert.equal(s2.profile.timeline, timeline, 'dialogue sets the profile timing')
    // The learning plan must still resolve from a dialogue-built profile.
    assert.ok(learningPlan(s2.profile).tasks.length === 3)
  }
  // Answers on action choices (@next and friends) must be recorded without moving the player.
  for (const c of nodes.purpose.choices) {
    assert.ok(c.to.startsWith('@'), 'the timing question routes to an action')
    const s3 = initialState()
    s3.node = 'purpose'
    applyChoice(s3, c)
    assert.equal(s3.profile.timeline, c.set.timeline, 'action choice still records the answer')
    assert.equal(s3.node, 'purpose', 'applyChoice must not move the player')
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

/* ---------- Albert's document hunt ---------- */
{
  const s = initialState()
  assert.equal(mapDocs.length, 5)
  assert.ok(!collectDoc(s, 'paystub'), 'documents are not collectible before Albert asks')
  follow(s, ['lender', 'albert', 'albert-docs', 'albert-quest'])
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
  assert.equal(s.done.length, 0, 'the hunt is a bonus, not a quest location')
  const r = restoreState(JSON.parse(JSON.stringify(s)))
  assert.equal(r.docQuest, 'complete')
  assert.equal(r.docs.length, 5)
  assert.ok(r.albertMet)
  for (const d of mapDocs) assert.ok(!mapCoins.some((c) => Math.hypot(c.x - d.x, c.y - d.y) < 4), 'documents do not sit on coins')
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
  const s = initialState()
  s.profile = profile
  s.done = ['cottage']
  assert.equal(nextLocation(s, locations, unlocked).id, focus === 'process' ? 'guild' : 'market')
}

/* ---------- save migration ---------- */
const migrated = restoreState({
  version: 1,
  started: true,
  done: ['cottage', 'market', 'guild', 'archive', 'homes', 'gate'],
  inventory: ['compass', 'lens', 'ledger', 'key'],
  node: 'ending',
  location: 'gate',
  ended: true,
  vars: { reserve: 1000 },
})
assert.equal(migrated.version, 3)
assert.equal(migrated.node, 'course')
assert.equal(migrated.location, 'lookout')
assert.equal(migrated.ended, false)
assert.equal(migrated.vars.reserve, 1000)
assert.ok(!migrated.done.includes('archive'))
assert.ok(!migrated.inventory.includes('ledger'))
assert.ok(!migrated.inventory.includes('key'))
assert.equal(migrated.coins, 0)
assert.deepEqual(migrated.coinsCollected, [])
assert.equal(migrated.portal, 'hidden')
assert.ok(unlocked(migrated, locations.find((l) => l.id === 'lookout')))
assert.ok(!unlocked(migrated, locations.find((l) => l.id === 'gate')))

const v2 = restoreState({
  version: 2,
  started: true,
  done: ['cottage', 'market'],
  inventory: ['compass'],
  node: 'market-end',
  location: 'market',
  vars: { reserve: 2000 },
  player: { x: 40, y: 50 },
})
assert.equal(v2.version, 3)
assert.equal(v2.player.facing, 1)
assert.equal(v2.coins, 0)
assert.equal(v2.node, 'market-end')

const s = initialState()
s.profile = cleanProfile({ name: 'Oak', question: 'homes', complete: true })
s.planTasks = ['homes-needs']
s.started = true
s.coins = 42
s.coinsCollected = ['c1', 'bogus']
s.portal = 'open'
s.avatar = 'data:image/png;base64,AAAA'
s.lead = { plan: true }
const restored = restoreState(JSON.parse(JSON.stringify(s)))
assert.equal(restored.profile.name, 'Oak')
assert.deepEqual(restored.planTasks, ['homes-needs'])
assert.equal(restored.coins, 42)
assert.deepEqual(restored.coinsCollected, ['c1'])
assert.equal(restored.portal, 'open')
assert.equal(restored.avatar, s.avatar)
assert.equal(restored.lead.plan, true)
assert.equal(restoreState({ ...JSON.parse(JSON.stringify(s)), avatar: 'javascript:alert(1)' }).avatar, null)

console.log(
  `Passed: ${variants} full journey variants; all scene links, items, and sources; portal bonus; coin economy; profile plans; save migration v1/v2/v3; Albert's document hunt; dialogue-driven profile.`,
)
