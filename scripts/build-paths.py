"""Derive the walkable path network for Hearthvale from the map art itself.

The dirt roads are the only warm mid-saturation colour in the picture, so a hue window finds
them. The buildings are drawn in three-quarter view with their doors at the bottom, so a short
list of roof rectangles clips the upper half of each one — otherwise the character can stroll
across the market roof and the castle towers.
"""
import base64, colorsys, os, sys, textwrap
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'dist', 'paths.js')
CELL = 8
im = Image.open(os.path.join(ROOT, 'dist', 'assets', 'hearthvale.webp')).convert('RGB')
W, H = im.size
px = im.load()
GW, GH = W // CELL, H // CELL

# Roofs, towers and upper facades: everything above each building's doorstep. Map percent.
ROOFS = [
    (18, 3, 31, 19),      # the guild chapel: spire, roof and upper facade
    (53, 2, 62, 17),      # the mapmaker's tower, above the door
    (22, 32, 31, 41),     # the provisioner's roof and awnings
    (17, 58, 27, 67),     # your cottage's thatch
    (69, 32, 92, 42),     # three-door lane: roofs and chimneys
    (65, 50, 71, 66),     # castle, west tower
    (79, 50, 86, 64),     # castle, east tower
]

def is_path(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    return 25 <= h * 360 <= 55 and 0.20 <= s <= 0.80 and v >= 0.42

frac = [[0.0] * GW for _ in range(GH)]
for cy in range(GH):
    for cx in range(GW):
        n = sum(1 for y in range(cy * CELL, (cy + 1) * CELL)
                  for x in range(cx * CELL, (cx + 1) * CELL) if is_path(*px[x, y]))
        frac[cy][cx] = n / (CELL * CELL)

def neighbours(g, x, y):
    return sum(g[y + dy][x + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1)
               if 0 <= x + dx < GW and 0 <= y + dy < GH and not (dx == 0 and dy == 0))

def erode(g, keep):
    return [[1 if g[y][x] and neighbours(g, x, y) >= keep else 0 for x in range(GW)] for y in range(GH)]

def dilate(g, need):
    return [[1 if g[y][x] or neighbours(g, x, y) >= need else 0 for x in range(GW)] for y in range(GH)]

def component(g, seeds):
    seen = [[0] * GW for _ in range(GH)]
    stack = [s for s in seeds if g[s[1]][s[0]]]
    for x, y in stack: seen[y][x] = 1
    while stack:
        x, y = stack.pop()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < GW and 0 <= ny < GH and g[ny][nx] and not seen[ny][nx]:
                seen[ny][nx] = 1; stack.append((nx, ny))
    return seen

def cell(xp, yp):
    return (min(GW - 1, max(0, int(xp / 100 * GW))), min(GH - 1, max(0, int(yp / 100 * GH))))

g = [[1 if frac[y][x] >= 0.34 else 0 for x in range(GW)] for y in range(GH)]
g = erode(g, 4)
g = dilate(g, 3)
g = dilate(g, 3)
for x0, y0, x1, y1 in ROOFS:
    cx0, cy0 = cell(x0, y0); cx1, cy1 = cell(x1, y1)
    for y in range(cy0, cy1 + 1):
        for x in range(cx0, cx1 + 1):
            g[y][x] = 0
seeds = [cell(30, 76), cell(28, 46)]
g = component(g, seeds)

total = sum(map(sum, g))
print('grid %dx%d  walkable %d cells (%.1f%%)' % (GW, GH, total, 100 * total / (GW * GH)))
LOCS = {'cottage': (23, 70), 'market': (28, 44), 'guild': (25, 20), 'lookout': (57, 23),
        'homes': (80, 45), 'gate': (75, 70), 'start': (30, 76)}
bad = []
for k, (xp, yp) in LOCS.items():
    cx, cy = cell(xp, yp)
    if g[cy][cx]:
        print('  %-8s (%2d,%2d) on the network' % (k, xp, yp)); continue
    best = min(((((x - cx) ** 2 + ((y - cy) * 1.5) ** 2) ** 0.5, x, y)
                for y in range(GH) for x in range(GW) if g[y][x]), default=None)
    bad.append(k)
    print('  %-8s (%2d,%2d) OFF — nearest walkable (%.1f, %.1f) at %.1f cells'
          % (k, xp, yp, (best[1] + .5) / GW * 100, (best[2] + .5) / GH * 100, best[0]))


if bad:
    raise SystemExit('these places are not reachable on foot: ' + ', '.join(bad))

# Pack one bit per cell, row-major, most-significant bit first, and drop it into dist/paths.js
# in place of the previous PACKED constant. The rest of that file is hand-written.
bits = bytearray((GW * GH + 7) // 8)
for y in range(GH):
    for x in range(GW):
        if g[y][x]:
            i = y * GW + x
            bits[i >> 3] |= 1 << (7 - (i & 7))
b64 = base64.b64encode(bytes(bits)).decode()
block = "const PACKED =\n" + "\n".join("  '%s' +" % c for c in textwrap.wrap(b64, 96)).rstrip(' +') + "\n"
js = open(OUT).read()
start = js.index('const PACKED =')
end = js.index('\n\n', start) + 1
open(OUT, 'w').write(js[:start] + block + js[end:])
print('wrote %s (%d bytes packed, %d base64 chars)' % (OUT, len(bits), len(b64)))
