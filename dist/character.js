// The First Key — character sprite system.
//
// Everything here is drawn from string sprite maps, in code, with no images and no network.
// The goal is a *little person* on the map: head, hair, torso with a cloak, arms that swing,
// legs that stride, boots that land. Not a portrait in a frame.
//
// The player's photo (optional) is composited INTO the head of that little person:
// the face is clipped to the character's own face pixels and the hair/hood is redrawn on
// top, so the photo reads as the character's face rather than a badge pasted on a body.
//
// Sprite maps are 16 columns wide. A one-pixel margin is added on every side when rendering
// so the dark outline has somewhere to live: the rendered frame is 18 x 24 sprite pixels.
//
// To tweak a pose: edit the strings. Every row must stay exactly 16 characters long
// (there is a length assertion in the dev harness; keep the columns lined up).
//
// Legend used by every map below:
//   .  transparent          K  skin            k  skin shadow
//   E  eye                  M  mouth           H  hair / cap    h  hair highlight
//   C  cloak                c  cloak shadow    A  sleeve (arm)
//   T  tunic                t  tunic shadow    B  belt / leather
//   G  gold                 g  gold shadow
//   L  trouser              l  trouser shadow  S  boot          s  boot shadow
//   P  paper / eye white    p  paper shadow    W  brass         w  brass shadow
//   *  lantern glow

export const CHARACTER_VERSION = 'char-2026-09-08.2'

/* ------------------------------------------------------------------ geometry */

export const SPRITE_W = 16 // sprite-map columns
export const SPRITE_H = 22 // sprite-map rows
export const MARGIN = 1 // one pixel of air all round for the outline
export const FRAME_W = SPRITE_W + MARGIN * 2 // 18 — frame width in sprite pixels
export const FRAME_H = SPRITE_H + MARGIN * 2 // 24 — frame height in sprite pixels
export const WALK_FRAMES = 4 // contact, passing, contact, passing (opposite legs)
export const IDLE_FRAMES = 2 // breathing bob
export const SHEET_FRAMES = WALK_FRAMES + IDLE_FRAMES // frames on the sprite sheet
export const PORTRAIT_GRID = 24 // portrait sprite-map is 24 x 24 …
export const PORTRAIT_PIXEL = 2 // … drawn 2 output pixels per sprite pixel …
export const PORTRAIT_SIZE = PORTRAIT_GRID * PORTRAIT_PIXEL // … so the character is ~48 x 48 …
export const PORTRAIT_FRAME = (PORTRAIT_GRID + 2) * PORTRAIT_PIXEL // … in a 52 x 52 frame at scale 1
export const HERO_IDS = ['scout', 'builder', 'wayfinder']

const OUTLINE = '#0c211d' // --bg: the darkest green in the game palette

/* ------------------------------------------------------------ palettes / heroes */

// Shared colours, straight out of the Hearthvale palette in avatar.js / style.css.
const SHARED = {
  E: '#2a1d14',
  M: '#9a5346',
  G: '#efd08a',
  g: '#d6a552',
  P: '#faf0dc',
  p: '#cbbfa4',
  W: '#e8c069',
  w: '#a8802e',
  '*': '#fff3cc',
}

const HERO_STYLES = {
  // The Scout — green cloak, brown side-swept hair with a ponytail, carries a spyglass.
  scout: {
    item: 'spyglass',
    legend: {
      ...SHARED,
      K: '#f0c4a0',
      k: '#c68c64',
      H: '#8a5a28',
      h: '#ac7838',
      C: '#4f7a52',
      c: '#2f4f3c',
      A: '#6e9664',
      T: '#d8c9a8',
      t: '#a89570',
      B: '#6e461e',
      L: '#557a62',
      l: '#3a5546',
      S: '#7a4a24',
      s: '#4e2e14',
    },
  },
  // The Builder — blue cloak, leather work cap with a brim, carries a rolled plan.
  builder: {
    item: 'plan',
    legend: {
      ...SHARED,
      K: '#c68c64',
      k: '#a06e46',
      H: '#3a2a1c',
      h: '#5a4230',
      C: '#3f5f96',
      c: '#284682',
      A: '#5a83c0',
      T: '#cbb894',
      t: '#9a8460',
      B: '#6e461e',
      L: '#4d5f88',
      l: '#334262',
      S: '#6e4a2a',
      s: '#452a16',
    },
  },
  // The Wayfinder — orange cloak worn hood-up, carries a lit lantern.
  wayfinder: {
    item: 'lantern',
    legend: {
      ...SHARED,
      K: '#e0ac82',
      k: '#b4784e',
      H: '#3a2416',
      h: '#5e3c22',
      C: '#c9703c',
      c: '#93502a',
      A: '#e68250',
      T: '#d8c0a0',
      t: '#a89070',
      B: '#5e3a1e',
      L: '#77604b',
      l: '#51402f',
      S: '#6e4a30',
      s: '#42281a',
    },
  },
}

function heroStyle(id) {
  return HERO_STYLES[id] || HERO_STYLES.scout
}

/* --------------------------------------------------------------- sprite maps */

// Head, rows 0-8. Bare skin; hair and features are stamped over it.
// A slightly oversized head keeps the character readable at 3x on the map and
// leaves real estate for the player's photo.
const HEAD = [
  '................', // 0  (hair lives here)
  '....KKKKKKKK....', // 1  crown
  '...KKKKKKKKKK...', // 2
  '...KKKKKKKKKK...', // 3  forehead
  '...KKKKKKKKKK...', // 4  eye line
  '...KKKKKKKKKK...', // 5
  '...KKKKKKKKKK...', // 6  nose
  '....KKKKKKKK....', // 7  mouth
  '.....KKKKKK.....', // 8  chin
]

// Eyes and mouth. Skipped entirely when a player photo supplies the face.
const FACE = [
  '................', // 0
  '................', // 1
  '................', // 2
  '................', // 3  forehead — kept clear so the eyes never merge with the fringe
  '.....E....E.....', // 4  eyes: one pixel wide, two tall — a face, not a bandit mask
  '.....E....E.....', // 5
  '................', // 6  (no nose — at this size a nose pixel reads as a smudge)
  '.......MM.......', // 7  mouth
  '................', // 8
]

// Hair / headwear per hero, rows 0-8. This is what makes the three read as different people,
// and it is redrawn on top of the photo so the face sits *inside* the character.
const HAIR = {
  scout: [
    '....hhhhhhhh....', // 0  highlight along the crown
    '...HHHHHHHHHH...', // 1  fringe
    '...HHHHHHHHHH...', // 2  fringe ends here — row 3 is forehead
    '.HHHH.......H...', // 3  ponytail root + temples
    '.HHH........H...', // 4  ponytail
    '..HH........H...', // 5
    '...H........H...', // 6  sideburns
    '................', // 7
    '................', // 8
  ],
  builder: [
    '....HHHHHHHH....', // 0  cap crown
    '...HHHHHHHHHH...', // 1
    '..BBBBBBBBBBBB..', // 2  leather brim
    '...h........h...', // 3  hair at the temples
    '...h........h...', // 4
    '...h........h...', // 5
    '...h........h...', // 6
    '................', // 7
    '................', // 8
  ],
  wayfinder: [
    '.....CCCCCC.....', // 0  hood crown, cloak colour
    '...CChhhhhhCC...', // 1  hair peeking out under the hood edge
    '..CCC......CCC..', // 2  hood opening — forehead shows through
    '..CC........CC..', // 3  hood cheeks
    '..CC........CC..', // 4
    '..CC........CC..', // 5
    '...CC......CC...', // 6
    '....C......C....', // 7  hood closes under the chin
    '................', // 8
  ],
}

// Torso, rows 9-14. Cloak down both sides, tunic in the middle, gold clasp, belt, flared hem.
const TORSO_TOP = 9
const TORSO = [
  '....CCTkkTCC....', // 9   shoulders, neck showing between the collar
  '...CCTTTTTTCC...', // 10  chest
  '...CCTTGGTTCC...', // 11  gold clasp
  '...CCTTTTTTCC...', // 12
  '...CCBBBBBBCC...', // 13  belt
  '..CCcTTTTTTcCC..', // 14  hem, cloak flaring out
]

// Arms, rows 10-17. Sleeves are the light cloak tone so they read against the cloak,
// and the hand pixel (KK) moves up and down between frames — that is the arm swing.
const ARM_TOP = 10
const ARMS = {
  // right arm forward (hand high), left arm back (hand low).
  // The inner `c` column is a one-pixel dark seam so the arm does not melt into the cloak.
  swingA: [
    '..Ac........cA..', // 10
    '..Ac........cA..', // 11
    '..Ac........cA..', // 12
    '..Ac........cA..', // 13
    '..Ac........KK..', // 14  right hand, forward
    '..Ac............', // 15
    '..KK............', // 16  left hand, trailing
    '................', // 17
  ],
  // mirror of swingA
  swingB: [
    '..Ac........cA..', // 10
    '..Ac........cA..', // 11
    '..Ac........cA..', // 12
    '..Ac........cA..', // 13
    '..KK........cA..', // 14  left hand, forward
    '............cA..', // 15
    '............KK..', // 16  right hand, trailing
    '................', // 17
  ],
  // mid-swing, arms nearly level (used on the passing frames)
  midA: [
    '..Ac........cA..', // 10
    '..Ac........cA..', // 11
    '..Ac........cA..', // 12
    '..Ac........cA..', // 13
    '..Ac........cA..', // 14
    '..Ac........KK..', // 15  right hand
    '..KK............', // 16  left hand a touch lower
    '................', // 17
  ],
  midB: [
    '..Ac........cA..', // 10
    '..Ac........cA..', // 11
    '..Ac........cA..', // 12
    '..Ac........cA..', // 13
    '..Ac........cA..', // 14
    '..KK........cA..', // 15  left hand
    '............KK..', // 16  right hand a touch lower
    '................', // 17
  ],
  idle: [
    '..Ac........cA..', // 10
    '..Ac........cA..', // 11
    '..Ac........cA..', // 12
    '..Ac........cA..', // 13
    '..Ac........cA..', // 14
    '..KK........KK..', // 15  both hands resting
    '................', // 16
    '................', // 17
  ],
}

// Legs, rows 15-21. L is the leading leg, l the trailing one, so the stride reads
// even though the sprite faces the camera. S/s are the boots.
const LEG_TOP = 15
const LEGS = {
  // contact: feet apart, weight landing. contactA leads with the left leg (L = leading).
  contactA: [
    '.....LLLlll.....', // 15  hips
    '....LL....ll....', // 16
    '....LL....ll....', // 17
    '...LL......ll...', // 18
    '...LL......ll...', // 19
    '..SSSS....ssss..', // 20  boots planted wide
    '..SSSS....ssss..', // 21
  ],
  contactB: [
    '.....lllLLL.....', // 15
    '....ll....LL....', // 16
    '....ll....LL....', // 17
    '...ll......LL...', // 18
    '...ll......LL...', // 19
    '..ssss....SSSS..', // 20
    '..ssss....SSSS..', // 21
  ],
  // passing: legs close together, one foot lifted clear of the ground.
  passingA: [
    '.....LLLlll.....', // 15
    '.....LL..ll.....', // 16
    '.....LL..ll.....', // 17
    '.....LL..ll.....', // 18
    '...SSSS..ll.....', // 19  left boot swinging through, off the ground
    '...SSSS..ssss...', // 20
    '.........ssss...', // 21  only the planted foot touches down
  ],
  passingB: [
    '.....lllLLL.....', // 15
    '.....ll..LL.....', // 16
    '.....ll..LL.....', // 17
    '.....ll..LL.....', // 18
    '.....ll..SSSS...', // 19  right boot swinging through
    '...ssss..SSSS...', // 20
    '...ssss.........', // 21
  ],
  idle: [
    '.....LLLlll.....', // 15
    '.....LL..ll.....', // 16
    '.....LL..ll.....', // 17
    '.....LL..ll.....', // 18
    '.....LL..ll.....', // 19
    '...SSSS..ssss...', // 20
    '...SSSS..ssss...', // 21
  ],
}

// One walk cycle: contact, passing, contact (other foot), passing (other foot).
// Arms are contralateral to the legs, which is what makes it look like walking.
const WALK = [
  { legs: 'contactA', arms: 'swingA' },
  { legs: 'passingA', arms: 'midA' },
  { legs: 'contactB', arms: 'swingB' },
  { legs: 'passingB', arms: 'midB' },
]

// Carried items. `offset` is where the map's first row sits relative to the row of the
// character's right hand, so the item follows the arm swing. Rows the hand should show
// through are left blank.
const ITEMS = {
  // A brass spyglass hanging from the hand: wide objective, narrow eyepiece ring.
  spyglass: {
    offset: 1,
    rows: [
      '...........WWW..', // objective
      '...........WWW..',
      '............ww..', // barrel narrows
      '............GG..', // eyepiece ring
    ],
  },
  // A rolled plan gripped mid-roll, tied with gold.
  plan: {
    offset: -3,
    rows: [
      '...........PPP..',
      '...........pPP..',
      '...........GGG..', // tie
      '................', // the hand grips here
      '...........PPP..',
      '...........ppp..',
    ],
  },
  // A lit lantern swinging below the hand: hook, cap, glowing pane, base.
  lantern: {
    offset: 1,
    glow: { x: 12.5, y: 3 }, // relative to the first row of the map
    rows: [
      '............G...', // hook
      '...........GGG..', // cap
      '...........G*G..', // the lit pane
      '...........G*G..',
      '...........GGG..', // base
    ],
  },
}

/* ----------------------------------------------------------- portrait sprite maps */

// A 24 x 24 head-and-shoulders version of the same character, for the dialogue panel.
// Rendered two output pixels per sprite pixel so it lands at about 48 x 48.
const P_HEAD = [
  '........................', // 0
  '........................', // 1
  '.......KKKKKKKKKK.......', // 2
  '......KKKKKKKKKKKK......', // 3
  '.....KKKKKKKKKKKKKK.....', // 4
  '.....KKKKKKKKKKKKKK.....', // 5
  '....KKKKKKKKKKKKKKKK....', // 6
  '....KKKKKKKKKKKKKKKK....', // 7
  '....KKKKKKKKKKKKKKKK....', // 8
  '....KKKKKKKKKKKKKKKK....', // 9
  '....KKKKKKKKKKKKKKKK....', // 10
  '....KKKKKKKKKKKKKKKK....', // 11
  '....KKKKKKKKKKKKKKKK....', // 12
  '.....KKKKKKKKKKKKKK.....', // 13
  '.....KKKKKKKKKKKKKK.....', // 14
  '......KKKKKKKKKKKK......', // 15
  '.......KKKKKKKKKK.......', // 16
  '........KKKKKKKK........', // 17  jaw
  '.........kkkkkk.........', // 18  neck
  '.........kkkkkk.........', // 19
  '........................', // 20
  '........................', // 21
  '........................', // 22
  '........................', // 23
]

const P_FACE = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '........................', // 3
  '........................', // 4
  '........................', // 5
  '........................', // 6
  '.......hhh....hhh.......', // 7   brows
  '........................', // 8
  '.......hhh....hhh.......', // 9   lashes
  '.......PEP....PEP.......', // 10  eyes
  '........................', // 11
  '...........kk...........', // 12  nose
  '.........M....M.........', // 13  mouth corners, lifted
  '..........MMMM..........', // 14  mouth
  '.........kkkkkk.........', // 15  chin shade
  '........................', // 16
  '........................', // 17
  '........................', // 18
  '........................', // 19
  '........................', // 20
  '........................', // 21
  '........................', // 22
  '........................', // 23
]

const P_BODY = [
  '....CCCCCkkkkkkCCCCC....', // 19  shoulders either side of the neck
  '...CCCCTTTTTTTTTTCCCC...', // 20
  '..CCCCTTTTTGGTTTTTCCCC..', // 21  clasp
  '..CCCCTTTTTTTTTTTTCCCC..', // 22
  '.CCCCCTTTTTTTTTTTTCCCCC.', // 23
]
const P_BODY_TOP = 19

const P_HAIR = {
  scout: [
    '........................', // 0
    '........HHHHHHHH........', // 1
    '......HHHHHHHHHHHH......', // 2
    '.....HHHHHHHHHHHHHH.....', // 3
    '....HHHHHHHHHHHHHHHH....', // 4
    '....HHHHHHHHHHHHHHHH....', // 5
    '....HHHHHH....HHHHHH....', // 6  fringe parted over the forehead
    '....HHHH........HHHH....', // 7
    '....HHH..........HHH....', // 8
    '....HH............HH....', // 9
    '....HH............HH....', // 10
    '....HH............HH....', // 11
    '....H..............H....', // 12
    '....H..............H....', // 13
    '........................', // 14
    '........................', // 15
    '........................', // 16
    '........................', // 17
    '........................', // 18
    '........................', // 19
    '........................', // 20
    '........................', // 21
    '........................', // 22
    '........................', // 23
  ],
  builder: [
    '........................', // 0
    '......HHHHHHHHHHHH......', // 1  cap
    '.....HHHHHHHHHHHHHH.....', // 2
    '....HHHHHHHHHHHHHHHH....', // 3
    '....HHHHHHHHHHHHHHHH....', // 4
    '...BBBBBBBBBBBBBBBBBB...', // 5  brim
    '..BBBBBBBBBBBBBBBBBBBB..', // 6
    '....hh............hh....', // 7  hair at the temples
    '....hh............hh....', // 8
    '....hh............hh....', // 9
    '....h..............h....', // 10
    '....h..............h....', // 11
    '........................', // 12
    '........................', // 13
    '........................', // 14
    '........................', // 15
    '........................', // 16
    '........................', // 17
    '........................', // 18
    '........................', // 19
    '........................', // 20
    '........................', // 21
    '........................', // 22
    '........................', // 23
  ],
  wayfinder: [
    '........CCCCCCCC........', // 0  hood
    '......CCCCCCCCCCCC......', // 1
    '.....CCCCCCCCCCCCCC.....', // 2
    '....CCCCCCCCCCCCCCCC....', // 3
    '...CCCCHHHHHHHHHHCCCC...', // 4  hair inside the hood
    '...CCCHHHHHHHHHHHHCCC...', // 5
    '...CCCHHHH....HHHHCCC...', // 6
    '...CCC............CCC...', // 7  hood cheeks
    '...CCC............CCC...', // 8
    '...CCC............CCC...', // 9
    '...CCC............CCC...', // 10
    '...CCC............CCC...', // 11
    '...CCC............CCC...', // 12
    '....CC............CC....', // 13
    '.....C............C.....', // 14
    '........................', // 15
    '........................', // 16
    '........................', // 17
    '........................', // 18
    '........................', // 19
    '........................', // 20
    '........................', // 21
    '........................', // 22
    '........................', // 23
  ],
}

// The Scout's ponytail, stamped separately so it can hang off the left edge of the portrait.
const P_PONYTAIL = { x: 0, y: 7, rows: ['..HHH', '.HHHH', 'HHHHH', 'HHHH.', 'HHH..', '.HH..'] }

/* ------------------------------------------------------------------ grid engine */

function blankGrid(w, h) {
  const n = w * h
  return { w, h, key: new Array(n).fill(null), color: new Array(n).fill(null), role: new Array(n).fill(null) }
}

// Stamp a sprite map into the grid. `role` is 'face' | 'hair' | 'body' | 'item' and drives
// the photo compositing: the photo is clipped to 'face' cells and 'hair' is redrawn over it.
function stamp(g, rows, ox, oy, legend, role) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y]
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.') continue
      const color = legend[ch]
      if (!color) continue
      const gx = ox + x
      const gy = oy + y
      if (gx < 0 || gy < 0 || gx >= g.w || gy >= g.h) continue
      const i = gy * g.w + gx
      g.key[i] = ch
      g.color[i] = color
      g.role[i] = role
    }
  }
}

function flipGrid(g) {
  const out = blankGrid(g.w, g.h)
  for (let y = 0; y < g.h; y++)
    for (let x = 0; x < g.w; x++) {
      const from = y * g.w + x
      const to = y * g.w + (g.w - 1 - x)
      out.key[to] = g.key[from]
      out.color[to] = g.color[from]
      out.role[to] = g.role[from]
    }
  out.glow = g.glow ? { x: g.w - g.glow.x, y: g.glow.y } : null
  return out
}

// Find the row of the character's right hand in an arm map, so items hang off it.
function handRow(armRows) {
  for (let y = armRows.length - 1; y >= 0; y--) if (armRows[y].slice(8).includes('K')) return ARM_TOP + y
  return ARM_TOP + 5
}

/**
 * Build the sprite grid for one frame. Exposed mostly for tests/tools.
 * @param {object} opts hero, pose ('walk'|'idle'), frame, facing
 */
export function buildGrid(opts = {}) {
  const style = heroStyle(opts.hero)
  const legend = style.legend
  const pose = opts.pose === 'idle' ? 'idle' : 'walk'
  const g = blankGrid(FRAME_W, FRAME_H)
  const ox = MARGIN
  const oy = MARGIN

  let armsKey, legsKey, headDy
  if (pose === 'idle') {
    const f = Math.abs(Math.round(opts.frame || 0)) % IDLE_FRAMES
    armsKey = 'idle'
    legsKey = 'idle'
    headDy = f // the breathing bob: the head settles one pixel on the out-breath
  } else {
    const f = Math.abs(Math.round(opts.frame || 0)) % WALK_FRAMES
    armsKey = WALK[f].arms
    legsKey = WALK[f].legs
    headDy = 0
  }
  const armRows = ARMS[armsKey]
  const legRows = LEGS[legsKey]

  // Item first so the hand and sleeve sit over the grip.
  const item = ITEMS[style.item]
  if (item) {
    const top = handRow(armRows) + item.offset
    stamp(g, item.rows, ox, oy + top, legend, 'item')
    if (item.glow) g.glow = { x: ox + item.glow.x, y: oy + top + item.glow.y }
  }
  stamp(g, TORSO, ox, oy + TORSO_TOP, legend, 'body')
  stamp(g, legRows, ox, oy + LEG_TOP, legend, 'body')
  stamp(g, armRows, ox, oy + ARM_TOP, legend, 'body')
  stamp(g, HEAD, ox, oy + headDy, legend, 'face')
  if (!opts.face) stamp(g, FACE, ox, oy + headDy, legend, 'face')
  stamp(g, HAIR[opts.hero] || HAIR.scout, ox, oy + headDy, legend, 'hair')

  return opts.facing === -1 ? flipGrid(g) : g
}

/** Build the portrait grid (24 x 24 sprite pixels). */
export function buildPortraitGrid(opts = {}) {
  const heroId = HERO_IDS.includes(opts.hero) ? opts.hero : 'scout'
  const legend = heroStyle(heroId).legend
  const g = blankGrid(PORTRAIT_GRID + 2, PORTRAIT_GRID + 2)
  const ox = 1
  const oy = 1
  if (heroId === 'scout') stamp(g, P_PONYTAIL.rows, ox + P_PONYTAIL.x, oy + P_PONYTAIL.y, legend, 'hair')
  stamp(g, P_BODY, ox, oy + P_BODY_TOP, legend, 'body')
  stamp(g, P_HEAD, ox, oy, legend, 'face')
  if (!opts.face) stamp(g, P_FACE, ox, oy, legend, 'face')
  stamp(g, P_HAIR[heroId], ox, oy, legend, 'hair')
  return opts.facing === -1 ? flipGrid(g) : g
}

/* -------------------------------------------------------------------- rendering */

function makeCanvas(w, h) {
  if (typeof document === 'undefined') throw new Error('character.js needs a browser document')
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  return c
}

// A one-pixel dark rim around the whole silhouette, so the character reads on the map.
function outlineCells(g) {
  const cells = []
  for (let y = 0; y < g.h; y++)
    for (let x = 0; x < g.w; x++) {
      if (g.color[y * g.w + x]) continue
      let touching = false
      for (let dy = -1; dy <= 1 && !touching; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue
          if (g.color[ny * g.w + nx]) {
            touching = true
            break
          }
        }
      if (touching) cells.push([x, y])
    }
  return cells
}

function cellsWithRole(g, role) {
  const cells = []
  for (let y = 0; y < g.h; y++)
    for (let x = 0; x < g.w; x++) if (g.role[y * g.w + x] === role) cells.push([x, y])
  return cells
}

function bounds(cells) {
  if (!cells.length) return null
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity
  for (const [x, y] of cells) {
    if (x < x0) x0 = x
    if (y < y0) y0 = y
    if (x > x1) x1 = x
    if (y > y1) y1 = y
  }
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }
}

// Draw the photo into the character's own face pixels, then let the caller put the hair back.
function paintFace(ctx, g, cells, face, scale, ox, oy, tint) {
  const box = bounds(cells)
  if (!box || !face) return
  const fw = face.naturalWidth || face.width
  const fh = face.naturalHeight || face.height
  if (!fw || !fh) return
  ctx.save()
  ctx.beginPath()
  for (const [x, y] of cells) ctx.rect(ox + x * scale, oy + y * scale, scale, scale)
  ctx.clip()
  // Cover the face box, cropping the photo rather than squashing it.
  const dw = box.w * scale
  const dh = box.h * scale
  // Overscan a little so the eyes and mouth land inside the visible mask rather than at its edge.
  const s = Math.max(dw / fw, dh / fh) * 1.16
  const w = fw * s
  const h = fh * s
  ctx.imageSmoothingEnabled = true
  if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    face,
    Math.round(ox + box.x * scale + (dw - w) / 2),
    Math.round(oy + box.y * scale + (dh - h) / 2),
    Math.round(w),
    Math.round(h),
  )
  // A whisper of the character's own skin tone so the photo belongs to the palette.
  if (tint) {
    ctx.globalAlpha = 0.14
    ctx.fillStyle = tint
    ctx.fillRect(ox + box.x * scale, oy + box.y * scale, dw, dh)
    ctx.globalAlpha = 1
  }
  ctx.restore()
}

function paintGrid(ctx, g, opts) {
  const scale = Math.max(1, Math.round(opts.scale || 3))
  const ox = Math.round(opts.x || 0)
  const oy = Math.round(opts.y || 0)
  ctx.save()
  ctx.imageSmoothingEnabled = false

  if (opts.shadow) {
    // A flattened pixel shadow, three rows tall, so the character sits on the ground.
    const rows = [
      [3, 13],
      [4, 12],
    ]
    ctx.fillStyle = 'rgba(6,18,15,0.3)'
    rows.forEach(([a, b], i) =>
      ctx.fillRect(ox + (a + MARGIN) * scale, oy + (FRAME_H - 2 + i) * scale, (b - a) * scale, scale),
    )
  }

  if (g.glow) {
    // Lantern light. Painted under the sprite so it never washes out the pixels.
    const cx = ox + g.glow.x * scale
    const cy = oy + g.glow.y * scale
    const r = 4.5 * scale
    const rg = ctx.createRadialGradient(cx, cy, scale * 0.5, cx, cy, r)
    rg.addColorStop(0, 'rgba(255,232,168,0.40)')
    rg.addColorStop(0.55, 'rgba(255,232,168,0.12)')
    rg.addColorStop(1, 'rgba(255,232,168,0)')
    ctx.fillStyle = rg
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
  }

  if (opts.outline !== false) {
    ctx.fillStyle = opts.outlineColor || OUTLINE
    for (const [x, y] of outlineCells(g)) ctx.fillRect(ox + x * scale, oy + y * scale, scale, scale)
  }

  for (let y = 0; y < g.h; y++)
    for (let x = 0; x < g.w; x++) {
      const c = g.color[y * g.w + x]
      if (!c) continue
      ctx.fillStyle = c
      ctx.fillRect(ox + x * scale, oy + y * scale, scale, scale)
    }

  if (opts.face) {
    const legend = heroStyle(opts.hero).legend
    paintFace(ctx, g, cellsWithRole(g, 'face'), opts.face, scale, ox, oy, legend.K)
    // Hair / hood goes back on top so the face is framed by the character, not stuck on it.
    for (const [x, y] of cellsWithRole(g, 'hair')) {
      ctx.fillStyle = g.color[y * g.w + x]
      ctx.fillRect(ox + x * scale, oy + y * scale, scale, scale)
    }
    if (opts.outline !== false) {
      ctx.fillStyle = opts.outlineColor || OUTLINE
      for (const [x, y] of outlineCells(g)) ctx.fillRect(ox + x * scale, oy + y * scale, scale, scale)
    }
  }
  ctx.restore()
  return { width: g.w * scale, height: g.h * scale, scale }
}

/**
 * Draw one frame of the pixel adventurer onto a 2D context.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} [opts]
 * @param {'scout'|'builder'|'wayfinder'} [opts.hero='scout']
 * @param {number} [opts.frame=0]           0-3 for the walk cycle, 0-1 for the idle bob
 * @param {'walk'|'idle'} [opts.pose='walk']
 * @param {1|-1} [opts.facing=1]
 * @param {HTMLCanvasElement|HTMLImageElement|null} [opts.face=null]  player face from faceFromPhoto()
 * @param {number} [opts.scale=3]           output pixels per sprite pixel
 * @param {number} [opts.x=0] @param {number} [opts.y=0]
 * @param {boolean} [opts.outline=true] @param {boolean} [opts.shadow=false]
 * @returns {{width:number, height:number, scale:number}}
 */
export function drawCharacter(ctx, opts = {}) {
  return paintGrid(ctx, buildGrid(opts), opts)
}

/* ------------------------------------------------------------- photo → pixel face */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image'))
    img.src = src
  })
}

// Files are read as data URLs, never blob: URLs — the site's CSP forbids blob:.
function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result)
    fr.onerror = () => reject(new Error('read'))
    fr.readAsDataURL(file)
  })
}

async function toImage(source) {
  if (!source) throw new Error('no image')
  if (typeof source === 'string') return loadImage(source)
  if (typeof HTMLImageElement !== 'undefined' && source instanceof HTMLImageElement) return source
  if (typeof HTMLCanvasElement !== 'undefined' && source instanceof HTMLCanvasElement) return source
  return loadImage(await readAsDataUrl(source))
}

// Adaptive median-cut quantisation. Unlike a fixed 32-colour palette this keeps the
// player's actual skin, hair and eye colours — it only sands off the noise.
function medianCut(data, colors) {
  const idx = []
  for (let i = 0; i < data.length; i += 4) idx.push(i)
  let boxes = [idx]
  while (boxes.length < colors) {
    let pick = -1
    let bestRange = -1
    let channel = 0
    for (let b = 0; b < boxes.length; b++) {
      const box = boxes[b]
      if (box.length < 2) continue
      const mn = [255, 255, 255]
      const mx = [0, 0, 0]
      for (const p of box)
        for (let c = 0; c < 3; c++) {
          const v = data[p + c]
          if (v < mn[c]) mn[c] = v
          if (v > mx[c]) mx[c] = v
        }
      for (let c = 0; c < 3; c++) {
        const range = (mx[c] - mn[c]) * (c === 1 ? 1.2 : 1)
        if (range > bestRange) {
          bestRange = range
          pick = b
          channel = c
        }
      }
    }
    if (pick < 0 || bestRange <= 2) break
    const box = boxes[pick]
    box.sort((a, b) => data[a + channel] - data[b + channel])
    const mid = box.length >> 1
    boxes = boxes.slice(0, pick).concat([box.slice(0, mid), box.slice(mid)], boxes.slice(pick + 1))
  }
  for (const box of boxes) {
    if (!box.length) continue
    let r = 0
    let g = 0
    let b = 0
    for (const p of box) {
      r += data[p]
      g += data[p + 1]
      b += data[p + 2]
    }
    r = Math.round(r / box.length)
    g = Math.round(g / box.length)
    b = Math.round(b / box.length)
    for (const p of box) {
      data[p] = r
      data[p + 1] = g
      data[p + 2] = b
    }
  }
}

/**
 * Turn a photo into a small, gently reduced face tile for the character's head.
 *
 * Deliberately much less blocky than the old 32×32 / 32-colour portrait: 64×64 by default,
 * smooth multi-step downscaling, and an *adaptive* palette (the photo's own colours) rather
 * than a fixed one, so the player still recognises themselves.
 *
 * @param {File|Blob|HTMLImageElement|HTMLCanvasElement|string} source
 * @param {object} [opts]
 * @param {number} [opts.size=64]      output tile, in pixels square
 * @param {number} [opts.quantize=40]  adaptive palette size; 0 disables quantisation entirely
 * @param {number} [opts.headFraction=0.5]   how much of the photo's height the head crop takes
 * @param {number} [opts.headY=0.34]   vertical centre of the crop, 0 = top of the photo
 * @param {number} [opts.contrast=1.06] @param {number} [opts.saturation=1.08]
 * @returns {Promise<{canvas: HTMLCanvasElement, dataUrl: string, size: number}>}
 */
export async function faceFromPhoto(source, opts = {}) {
  const size = Math.max(16, Math.round(opts.size || 64))
  const quantize = opts.quantize === undefined ? 40 : Math.max(0, Math.round(opts.quantize))
  const img = await toImage(source)
  const w = img.naturalWidth || img.width
  const h = img.naturalHeight || img.height
  if (!w || !h) throw new Error('empty image')

  // Head-finding heuristic: on a portrait photo the face sits near the top, centred.
  // Take a square around the upper third rather than the middle of the frame.
  const frac = Math.min(1, Math.max(0.25, opts.headFraction === undefined ? 0.5 : opts.headFraction))
  const side = Math.max(8, Math.round(Math.min(w, h > w ? h * frac : h)))
  const cx = w / 2
  const cy = h > w * 1.05 ? h * (opts.headY === undefined ? 0.34 : opts.headY) : h / 2
  const sx = Math.round(Math.min(Math.max(0, cx - side / 2), w - side))
  const sy = Math.round(Math.min(Math.max(0, cy - side / 2), Math.max(0, h - side)))

  // Halve repeatedly with smoothing on: box-filtered downscale, no aliasing crunch.
  let stage = makeCanvas(side, side)
  stage.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, side, side)
  let cur = side
  while (cur / 2 > size) {
    const next = makeCanvas(Math.floor(cur / 2), Math.floor(cur / 2))
    const nctx = next.getContext('2d')
    nctx.imageSmoothingEnabled = true
    nctx.drawImage(stage, 0, 0, cur, cur, 0, 0, next.width, next.height)
    stage = next
    cur = next.width
  }
  const out = makeCanvas(size, size)
  const octx = out.getContext('2d')
  octx.imageSmoothingEnabled = true
  if ('imageSmoothingQuality' in octx) octx.imageSmoothingQuality = 'high'
  octx.drawImage(stage, 0, 0, cur, cur, 0, 0, size, size)

  const imgData = octx.getImageData(0, 0, size, size)
  const px = imgData.data
  const contrast = opts.contrast === undefined ? 1.06 : opts.contrast
  const saturation = opts.saturation === undefined ? 1.08 : opts.saturation
  for (let i = 0; i < px.length; i += 4) {
    let r = px[i]
    let g = px[i + 1]
    let b = px[i + 2]
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    r = lum + (r - lum) * saturation
    g = lum + (g - lum) * saturation
    b = lum + (b - lum) * saturation
    r = (r - 128) * contrast + 128
    g = (g - 128) * contrast + 128
    b = (b - 128) * contrast + 128
    px[i] = Math.max(0, Math.min(255, r))
    px[i + 1] = Math.max(0, Math.min(255, g))
    px[i + 2] = Math.max(0, Math.min(255, b))
    px[i + 3] = 255
  }
  if (quantize >= 2) medianCut(px, quantize)
  octx.putImageData(imgData, 0, 0)
  return { canvas: out, dataUrl: out.toDataURL('image/png'), size }
}

/* --------------------------------------------------------------- composed outputs */

async function resolveFace(opts) {
  if (!opts.face && !opts.photo) return null
  // `face` is an already-cropped face: a canvas straight from faceFromPhoto(), or — far more
  // often — the data URL we saved to storage and reload on every visit. It has to become a
  // drawable before paintFace() sees it, otherwise that reads naturalWidth off a string, gets
  // undefined, and skips the face without a word. toImage() passes canvases and images through.
  if (opts.face) return toImage(opts.face)
  const { canvas } = await faceFromPhoto(opts.photo, opts.faceOptions || {})
  return canvas
}

/**
 * The whole character with the player's face composited into the head.
 * This is the piece that makes the uploaded photo actually *become* the character.
 *
 * @param {object} [opts] hero, frame, pose, facing, scale, shadow, plus either
 *                        `face` (a canvas from faceFromPhoto) or `photo` (a File/Blob/URL).
 * @returns {Promise<{dataUrl:string, canvas:HTMLCanvasElement, width:number, height:number, frameWidth:number, frameHeight:number, scale:number, version:string}>}
 */
export async function composeCharacter(opts = {}) {
  const scale = Math.max(1, Math.round(opts.scale || 6))
  const face = await resolveFace(opts)
  const canvas = makeCanvas(FRAME_W * scale, FRAME_H * scale)
  const ctx = canvas.getContext('2d')
  drawCharacter(ctx, { ...opts, face, scale, x: 0, y: 0 })
  return {
    dataUrl: canvas.toDataURL('image/png'),
    canvas,
    width: canvas.width,
    height: canvas.height,
    frameWidth: FRAME_W * scale,
    frameHeight: FRAME_H * scale,
    scale,
    version: CHARACTER_VERSION,
  }
}

/**
 * The 4 walk frames side by side, followed by the 2 idle frames — one strip a caller can
 * animate with `background-position` in `steps()`.
 *
 * @param {object} [opts] hero, facing, scale, face/photo, walkOnly
 * @returns {Promise<{dataUrl:string, canvas:HTMLCanvasElement, frames:number, walkFrames:number, idleFrames:number, frameWidth:number, frameHeight:number, width:number, height:number, scale:number, version:string}>}
 */
export async function spriteSheet(opts = {}) {
  const scale = Math.max(1, Math.round(opts.scale || 3))
  const face = await resolveFace(opts)
  const idleCount = opts.walkOnly ? 0 : IDLE_FRAMES
  const frames = WALK_FRAMES + idleCount
  const fw = FRAME_W * scale
  const fh = FRAME_H * scale
  const canvas = makeCanvas(fw * frames, fh)
  const ctx = canvas.getContext('2d')
  for (let i = 0; i < WALK_FRAMES; i++)
    drawCharacter(ctx, { ...opts, face, scale, pose: 'walk', frame: i, x: i * fw, y: 0 })
  for (let i = 0; i < idleCount; i++)
    drawCharacter(ctx, { ...opts, face, scale, pose: 'idle', frame: i, x: (WALK_FRAMES + i) * fw, y: 0 })
  return {
    dataUrl: canvas.toDataURL('image/png'),
    canvas,
    frames,
    walkFrames: WALK_FRAMES,
    idleFrames: idleCount,
    frameWidth: fw,
    frameHeight: fh,
    width: canvas.width,
    height: canvas.height,
    scale,
    version: CHARACTER_VERSION,
  }
}

/**
 * A head-and-shoulders version of the same character for the dialogue panel, so the face
 * talking to the player is the face walking the map.
 *
 * @param {object} [opts] hero, facing, scale (multiplies PORTRAIT_FRAME), face/photo, outline, background
 * @returns {Promise<{dataUrl:string, canvas:HTMLCanvasElement, size:number, width:number, height:number, version:string}>}
 *          size/width/height are PORTRAIT_FRAME * scale (52 at scale 1: a 48px character plus outline margin)
 */
export async function portrait(opts = {}) {
  const scale = Math.max(1, Math.round(opts.scale || 1)) * PORTRAIT_PIXEL
  const face = await resolveFace(opts)
  const g = buildPortraitGrid({ ...opts, face })
  const canvas = makeCanvas(g.w * scale, g.h * scale)
  const ctx = canvas.getContext('2d')
  if (opts.background) {
    ctx.fillStyle = opts.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  paintGrid(ctx, g, { ...opts, face, scale, x: 0, y: 0, shadow: false })
  return {
    dataUrl: canvas.toDataURL('image/png'),
    canvas,
    size: canvas.width,
    width: canvas.width,
    height: canvas.height,
    version: CHARACTER_VERSION,
  }
}

/** Cheap validation for anything read back out of storage. */
export function validCharacterImage(s) {
  return typeof s === 'string' && s.startsWith('data:image/png;base64,') && s.length < 400000
}
