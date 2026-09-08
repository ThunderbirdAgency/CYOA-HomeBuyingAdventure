// Where you can walk in Hearthvale.
//
// The town is a painting, not a tile map, so the walkable area is derived from the art itself:
// the dirt roads are the only warm mid-saturation colour in the picture, and the buildings are
// drawn in three-quarter view with their doors at the bottom, so a short list of roof rectangles
// clips the tops. The result is a 192 x 128 bitmap covering the map in percent coordinates —
// roads, doorsteps, the market porch and the castle bridge are in; roofs, water, cliffs and
// forest are out. scripts/build-paths.py regenerates it from dist/assets/hearthvale.webp.
//
// Everything here works in map percent (0-100 on both axes), the same units the player uses.

export const GRID_W = 192
export const GRID_H = 128

// One bit per cell, row-major, most-significant bit first, base64. 192 x 128 = 3072 bytes.
const PACKED =
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAA+AAAAAAAAAAAAAAAAAAAAAAAAAD+AAAA/AAAAAAAAAAAAA' +
  'AAAAAAAAAAAAD/gAAA/gAAAAAAAAAAAAAAAAAAAf/wAAA/4AAIPwAAAAAAAAAAAAAAAAAAAf/gAAAP4AA+H4AAAAAAAAAAAA' +
  'AAAAAAAP/AAAAH8AA/n8AAAAAAAAAAAAAAAAAAAP+AAAAD8AA/3+AAAAAAAAAAAAAAAAAAAP+AAAAD+AA//8AAAAAAAAAAAA' +
  'AAAAAAAP+AAAAD+AAf/8AAAAAAAAAAAAAAAAAAAP+AAAAD+AAH/4AAAAAAAAAAAAAAAAAAAP/AAAAB+AAB+QAAAAAAAAAAAA' +
  'AAAAABAP/gAAAB/AAA+AAAAAAAAAAAAAAAAAAD///4AAAA/AAA+AAAAAAAAAAAAAAAAAAH///+AAAA/gAA+AAAAAAAAAAAAA' +
  'AAAAAD////gAAA/gAB+AAAAAAAAAAAAAAAAAAB////8AAA/wAB+AAAAAAAAAAAAAAAAAAAf8D//AAH/wAB+AAAAAAAAAAAAA' +
  'AAAAAAH4Af/4D//8AD+AAAAAAAAAAAAAAAAAAAAAAA////////+AAAAAAAAAAAAAAAAAAAAAAA////////+AAAAAAAAAAAAA' +
  'AAAAAAAAAAH///////+AAAAAAAAAAAAAAAAAAAAAAAB///g////wAAAAAAAAAAAAAAAAAAAAAAAf/gAH///8AAAAAAAAAAAA' +
  'AAAAAAAAAAAP+AAA////AAAAAAAAAAAAAAAAAAAAAAAP8AAAAH//wAAAAAAAAAAAAAAAAAAAAAAP4AAAAAD/8AAAAAAAAAAA' +
  'AAAAAAAAAAAP4AAAAAAf8AAAAAAAAAAAAAAAAAAAAAAP4AAAAAAD+AAAAAAAAAAAAAAAAAAAAAAP4AAAAAAA+AAAAAAAAAAA' +
  'AAAAAAAAAAAP4AAAAAAAf/AAAAAAAAAAAAAAAAAAAAAP4AAAAAAAf/AAAAAAAAAAAAAAAAAAHAEPwAAAAAAAP/AAAAAAAAAA' +
  'AAAAAAAADwP/wAAAAAAAP/APv/4H/gAAAAAAAAAAD4f/gAAAAAAAD/AP//4P/AAAAAAAAAAAH8f/gAAAAAAAB/AH//4H+AAA' +
  'AAAAAHAAD8//AAAAAAAAB/AD//gH4AAAAAAAAPwAb//+AAAAAAAAB/AA/+IBwAAAAAAAAH4H///wAAAAAAAAD/gB//+H/gAA' +
  'AAAAAH8f///gAAAAAAAAB/wD/////wAAAAAAAD////+AAAAAAAAAB/8H/////4AAAAAAAD////8AAAAAAAAAA////////wAA' +
  'AAAAAD////8AAAAAAAAAA////////gAAAAAAAB////+AAAAAAAAAAAB//gADAAAAAAAAAB//wP+AAAAAAAAAAAB//gAAAAAA' +
  'AAAAAAfwAB/AAAAAAAAAAAB//gAAAAAAAAAAAAAAAA/gAAAAAAAAAAB//gAAAAAAAAAAAAAAAA/wAAAAAAAAAAAf/gAAAAAA' +
  'AAAAAAAAAA//4AAAAAAAAAAD/gAAAAAAAAAAAAAAAA//4AAAAAAAAAAB/gAAAAAAAAAAAAAAAA//4AAAAAAAAAAB/gAAAAAA' +
  'AAAAAAAAAB//4AAAAAAAAAAA/gAAAAAAAAAAAAAAAA//wAAAAAAAAAAA/gAAAAAAAAAAAAAAAAf/4AAAAAAAAAAA/gAAAAAA' +
  'AAAAAAAAAAAP/wAAAAAAAAAB/gAAAAAAAAAAAAAAAAAH/4AAAAAAAAAD/gAAAAAAAAAAAAAAAAAH/+AAAAAAAAAD/gAAAAAA' +
  'AAAAAAAAAAAH//wAAAAAAAAH/gAAAAAAAAAAAAAAAAAH//8AAAAAAAAP/gAAAAAAAAAAAAAAAAAP//8AAAAAAAAf/gAAAAAA' +
  'AAAAAAAAAAAf8f+AAAAAAAAf/AAAAAAAAAAAAAAAAAB/4H8AAAAAAAAf+AfAAAAAAAAAAAAAAAH/wB4AAAAAAAAf4AfAAAAA' +
  'AAAAAAAAAAP/gAAAAAAAAAAOAAfAAAAAAAAAAAAAAAf+AAAAAAAAAD+MAAfAAAAAAAAAAD//wAf4AAAAAAAAAH+/AB/AAAAA' +
  'AAAAAD//4A/wAAAAAAAAAH//wD+AAAAAAAAAAD//4A/gAAAAAAAAAP3/8D8AAAAAAAAAAA//4B/gAAAAAAAAAHn///4AAAAA' +
  'AAAAAAH/4B/gAAAAAAAAACD///wAAAAAAAAAAAH/4D/gAAAAAAAAAAB///gAAAAAAAAAABj/wD/AAAAAAAAAAAAf//gAAAAA' +
  'AAAAADz/4H/AAAAAAAAAAAAH//gAAAAAAAAAAH4P//+AAAAAAAAAAAAB//wAAAAAAAAAAD4P//+AAAAAAAAAAAAAH/gAAAAA' +
  'AAAAABw///8AAAAAAAAAAAAAAfgAAAAAAAAAAAf///wAAAAAAAAAAAAAAAAAAAAAAAAAAB////AAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAB///8AAAAAAAAAAAAAAAAAAAAAAAAAAAB///wAAAAAAAAAAAAAAAAAAAAAAAAAAAB/8AAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

const bits = (() => {
  const bin = atob(PACKED)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
})()

const col = (x) => Math.min(GRID_W - 1, Math.max(0, Math.floor((x / 100) * GRID_W)))
const row = (y) => Math.min(GRID_H - 1, Math.max(0, Math.floor((y / 100) * GRID_H)))
const cellX = (c) => ((c + 0.5) / GRID_W) * 100
const cellY = (r) => ((r + 0.5) / GRID_H) * 100

function cellOpen(c, r) {
  if (c < 0 || r < 0 || c >= GRID_W || r >= GRID_H) return false
  const i = r * GRID_W + c
  return (bits[i >> 3] & (1 << (7 - (i & 7)))) !== 0
}

/** Is this point on a path? Takes map percent. */
export function walkable(x, y) {
  return cellOpen(col(x), row(y))
}

/**
 * The nearest point you could actually stand on, searched outward in rings.
 * Returns the original point when it is already on a path.
 */
export function snapToPath(x, y, maxRings = 24) {
  const c = col(x)
  const r = row(y)
  if (cellOpen(c, r)) return { x, y }
  for (let d = 1; d <= maxRings; d++) {
    let best = null
    for (let dr = -d; dr <= d; dr++)
      for (let dc = -d; dc <= d; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== d) continue
        if (!cellOpen(c + dc, r + dr)) continue
        // Compare in pixel space: the map is 1.5:1, so a row is worth more than a column.
        const px = cellX(c + dc) - x
        const py = cellY(r + dr) - y
        const dist = px * px * 2.25 + py * py
        if (!best || dist < best.dist) best = { x: cellX(c + dc), y: cellY(r + dr), dist }
      }
    if (best) return { x: best.x, y: best.y }
  }
  return { x, y }
}

/** Can you walk straight from a to b without leaving the paths? */
export function clearLine(ax, ay, bx, by) {
  const steps = Math.ceil(Math.hypot((bx - ax) * 1.5, by - ay) * 4)
  for (let i = 0; i <= steps; i++) {
    const t = steps ? i / steps : 0
    if (!walkable(ax + (bx - ax) * t, ay + (by - ay) * t)) return false
  }
  return true
}

/**
 * Resolve one step of movement against the paths. When the straight step is blocked, try each
 * axis on its own so the walker slides along the edge of the road instead of sticking to it.
 * Returns where the walker actually ends up.
 */
export function slide(fromX, fromY, dx, dy) {
  if (walkable(fromX + dx, fromY + dy)) return { x: fromX + dx, y: fromY + dy, hit: false }
  if (dx && walkable(fromX + dx, fromY)) return { x: fromX + dx, y: fromY, hit: true }
  if (dy && walkable(fromX, fromY + dy)) return { x: fromX, y: fromY + dy, hit: true }
  return { x: fromX, y: fromY, hit: true }
}

/**
 * A walking route from one point to another, as a short list of waypoints along the roads.
 * Breadth-first over the grid, then straightened: consecutive cells are collapsed into the
 * longest straight runs that stay on a path, so the walker takes clean diagonals rather than
 * a staircase. Returns [] when there is no way through.
 */
export function route(fromX, fromY, toX, toY) {
  const start = snapToPath(fromX, fromY)
  const goal = snapToPath(toX, toY)
  const sc = col(start.x)
  const sr = row(start.y)
  const gc = col(goal.x)
  const gr = row(goal.y)
  if (!cellOpen(sc, sr) || !cellOpen(gc, gr)) return []
  if (sc === gc && sr === gr) return [{ x: goal.x, y: goal.y }]

  const total = GRID_W * GRID_H
  const prev = new Int32Array(total).fill(-1)
  const seen = new Uint8Array(total)
  const queue = new Int32Array(total)
  let head = 0
  let tail = 0
  const startIdx = sr * GRID_W + sc
  const goalIdx = gr * GRID_W + gc
  seen[startIdx] = 1
  queue[tail++] = startIdx
  let found = false
  while (head < tail) {
    const idx = queue[head++]
    if (idx === goalIdx) {
      found = true
      break
    }
    const c = idx % GRID_W
    const r = (idx - c) / GRID_W
    for (let i = 0; i < 4; i++) {
      const nc = c + (i === 0 ? 1 : i === 1 ? -1 : 0)
      const nr = r + (i === 2 ? 1 : i === 3 ? -1 : 0)
      if (!cellOpen(nc, nr)) continue
      const nIdx = nr * GRID_W + nc
      if (seen[nIdx]) continue
      seen[nIdx] = 1
      prev[nIdx] = idx
      queue[tail++] = nIdx
    }
  }
  if (!found) return []

  const cells = []
  for (let idx = goalIdx; idx !== -1; idx = prev[idx]) cells.push(idx)
  cells.reverse()
  const points = cells.map((idx) => {
    const c = idx % GRID_W
    return { x: cellX(c), y: cellY((idx - c) / GRID_W) }
  })
  points[points.length - 1] = { x: goal.x, y: goal.y }

  // Straighten: from each waypoint, reach as far ahead as the road allows.
  const out = []
  let i = 0
  while (i < points.length - 1) {
    let j = points.length - 1
    while (j > i + 1 && !clearLine(points[i].x, points[i].y, points[j].x, points[j].y)) j--
    out.push(points[j])
    i = j
  }
  return out
}
