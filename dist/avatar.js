// Put yourself in the game: turn a photo into a pixel-art portrait, entirely in the browser.
// The photo never leaves the device. Only the tiny finished portrait (a 32×32 data URL) is stored.

// Hearthvale palette: warm skins, hair, greens, blues, golds. Keeps portraits looking like they belong on the map.
export const PALETTE = [
  [16, 40, 35], [28, 60, 48], [45, 68, 56], [60, 96, 72], [110, 150, 100], [172, 211, 161],
  [239, 208, 138], [214, 165, 82], [160, 110, 48], [110, 70, 30], [70, 42, 20], [40, 24, 14],
  [255, 224, 196], [240, 196, 160], [224, 172, 130], [198, 140, 100], [160, 105, 70], [120, 78, 52],
  [90, 56, 38], [60, 36, 24], [250, 240, 220], [210, 200, 180], [150, 150, 140], [95, 95, 90],
  [50, 50, 55], [20, 20, 28], [70, 100, 160], [40, 70, 130], [120, 160, 210], [200, 70, 60],
  [230, 130, 80], [250, 250, 245],
]

function nearest(r, g, b) {
  let best = 0,
    bd = Infinity
  for (let i = 0; i < PALETTE.length; i++) {
    const p = PALETTE[i]
    const d = (p[0] - r) ** 2 * 0.3 + (p[1] - g) ** 2 * 0.59 + (p[2] - b) ** 2 * 0.11
    if (d < bd) {
      bd = d
      best = i
    }
  }
  return PALETTE[best]
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image'))
    img.src = src
  })
}

/**
 * Pixelate an image or file into a square portrait.
 *
 * Two knobs control how "pixelated" the result looks, and they do different things:
 *   size        how many pixels across. Small = chunky blocks. 32 is very blocky; 64 keeps a face readable.
 *   paletteMix  how hard the colours snap to the Hearthvale palette. 1 posterises heavily (skin goes
 *               orange or grey), 0 keeps the photo's own colour. Around 0.45 reads as pixel art while
 *               still looking like the person.
 *
 * @param {File|Blob|HTMLImageElement|string} source
 * @param {object} [opts]  size (default 64), scale (output upscale, default 4),
 *                         focus 'top' keeps the upper part of portrait photos (faces),
 *                         palette false to skip snapping entirely, paletteMix 0..1 (default 0.45),
 *                         contrast (default 1.08)
 * @returns {Promise<string>} PNG data URL, size*scale pixels square
 */
export async function pixelate(source, opts = {}) {
  const size = opts.size || 64,
    scale = opts.scale || 4,
    usePalette = opts.palette !== false,
    mix = opts.paletteMix === undefined ? 0.45 : Math.max(0, Math.min(1, opts.paletteMix)),
    contrast = opts.contrast === undefined ? 1.08 : opts.contrast
  let img = source
  if (typeof source === 'string') img = await loadImage(source)
  else if (!(source instanceof HTMLImageElement)) {
    // Read the file as a data URL rather than a blob URL so it works under a strict img-src policy.
    const dataUrl = await new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result)
      fr.onerror = () => reject(new Error('read'))
      fr.readAsDataURL(source)
    })
    img = await loadImage(dataUrl)
  }
  const w = img.naturalWidth || img.width,
    h = img.naturalHeight || img.height
  if (!w || !h) throw new Error('empty image')
  // Square crop. For tall photos keep the head: start a little below the top.
  const side = Math.min(w, h)
  let sx = (w - side) / 2,
    sy = (h - side) / 2
  if (h > w && opts.focus !== 'center') sy = Math.min(h - side, h * 0.06)
  // Multi-step downscale for smoother sampling, then quantize.
  const stage = document.createElement('canvas')
  let cw = side,
    ch = side
  stage.width = cw
  stage.height = ch
  let sctx = stage.getContext('2d')
  sctx.drawImage(img, sx, sy, side, side, 0, 0, cw, ch)
  while (cw / 2 > size) {
    const next = document.createElement('canvas')
    next.width = Math.floor(cw / 2)
    next.height = Math.floor(ch / 2)
    next.getContext('2d').drawImage(stage, 0, 0, cw, ch, 0, 0, next.width, next.height)
    stage.width = next.width
    stage.height = next.height
    sctx = stage.getContext('2d')
    sctx.drawImage(next, 0, 0)
    cw = next.width
    ch = next.height
  }
  const small = document.createElement('canvas')
  small.width = size
  small.height = size
  const smctx = small.getContext('2d')
  smctx.imageSmoothingEnabled = true
  smctx.drawImage(stage, 0, 0, cw, ch, 0, 0, size, size)
  const data = smctx.getImageData(0, 0, size, size)
  const px = data.data
  // Gentle contrast lift so features survive, then an optional partial snap to the palette.
  // Blending rather than replacing is what keeps a real face looking like that face.
  for (let i = 0; i < px.length; i += 4) {
    let r = Math.max(0, Math.min(255, (px[i] - 128) * contrast + 128)),
      g = Math.max(0, Math.min(255, (px[i + 1] - 128) * contrast + 128)),
      b = Math.max(0, Math.min(255, (px[i + 2] - 128) * contrast + 128))
    if (usePalette && mix > 0) {
      const [pr, pg, pb] = nearest(r, g, b)
      r += (pr - r) * mix
      g += (pg - g) * mix
      b += (pb - b) * mix
    }
    px[i] = r
    px[i + 1] = g
    px[i + 2] = b
    px[i + 3] = 255
  }
  smctx.putImageData(data, 0, 0)
  const out = document.createElement('canvas')
  out.width = size * scale
  out.height = size * scale
  const octx = out.getContext('2d')
  octx.imageSmoothingEnabled = false
  octx.drawImage(small, 0, 0, size, size, 0, 0, out.width, out.height)
  return out.toDataURL('image/png')
}

/** Simple validation for stored avatars: only tiny PNG data URLs are accepted back from storage. */
export function validAvatar(s) {
  return typeof s === 'string' && s.startsWith('data:image/png;base64,') && s.length < 180000
}

/**
 * A square share card (1080×1080) with the pixel portrait, a headline, and the presenter line.
 * @returns {Promise<{blob: Blob, dataUrl: string}>} the blob for download/share, the data URL for preview
 */
export async function shareCard({ avatar, name, headline, subline, footer, coins }) {
  const c = document.createElement('canvas')
  c.width = 1080
  c.height = 1080
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 1080)
  g.addColorStop(0, '#0c211d')
  g.addColorStop(1, '#173a2f')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 1080, 1080)
  // Lantern glow
  const rg = ctx.createRadialGradient(540, 420, 40, 540, 420, 520)
  rg.addColorStop(0, 'rgba(239,208,138,.35)')
  rg.addColorStop(1, 'rgba(239,208,138,0)')
  ctx.fillStyle = rg
  ctx.fillRect(0, 0, 1080, 1080)
  ctx.imageSmoothingEnabled = false
  if (avatar) {
    try {
      const img = await loadImage(avatar)
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(340, 200, 400, 400, 40)
      ctx.clip()
      ctx.drawImage(img, 340, 200, 400, 400)
      ctx.restore()
      ctx.lineWidth = 12
      ctx.strokeStyle = '#efd08a'
      ctx.beginPath()
      ctx.roundRect(340, 200, 400, 400, 40)
      ctx.stroke()
    } catch {}
  }
  ctx.textAlign = 'center'
  ctx.fillStyle = '#efd08a'
  ctx.font = '700 34px "Space Grotesk", "DM Sans", sans-serif'
  ctx.fillText('THE FIRST KEY · THE LEGEND OF HOMEOWNERSHIP', 540, 120)
  ctx.fillStyle = '#f0f0df'
  ctx.font = '700 72px "Space Grotesk", "DM Sans", sans-serif'
  wrap(ctx, headline || `${name} earned the First Key`, 540, 700, 960, 80)
  ctx.fillStyle = '#a3b4a8'
  ctx.font = '500 36px "DM Sans", sans-serif'
  if (subline) wrap(ctx, subline, 540, 860, 900, 46)
  if (coins) {
    ctx.fillStyle = '#efd08a'
    ctx.font = '700 40px "DM Sans", sans-serif'
    ctx.fillText(`◉ ${coins} coins toward a bigger down payment`, 540, 940)
  }
  ctx.fillStyle = '#a3b4a8'
  ctx.font = '500 28px "DM Sans", sans-serif'
  ctx.fillText(footer || '', 540, 1030)
  const blob = await new Promise((resolve) => c.toBlob(resolve, 'image/png'))
  return { blob, dataUrl: c.toDataURL('image/png') }
}

function wrap(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(' ')
  let line = '',
    lines = []
  for (const w of words) {
    const t = line ? line + ' ' + w : w
    if (ctx.measureText(t).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else line = t
  }
  if (line) lines.push(line)
  const start = y - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((l, i) => ctx.fillText(l, x, start + i * lineHeight))
}
