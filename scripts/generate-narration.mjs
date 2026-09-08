#!/usr/bin/env node
// Narration script builder and (optionally) ElevenLabs renderer for The First Key.
//
//   node scripts/generate-narration.mjs --dry-run     # default: writes dist/narration/script.json, no API calls
//   node scripts/generate-narration.mjs --generate --voice <elevenlabs-voice-id>
//
// The dry run is offline and free. Generating costs real money, so it requires the explicit
// --generate flag plus an ELEVENLABS_API_KEY in the environment. The key is never printed.
// See docs/VOICE.md.

import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import process from 'node:process'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const DIST = join(ROOT, 'dist')
const OUT_DIR = join(DIST, 'narration')
const STORY = join(DIST, 'story-data.js')
const CONFIG = join(DIST, 'config.js')

const API_BASE = 'https://api.elevenlabs.io/v1/text-to-speech'
const DEFAULT_MODEL = 'eleven_multilingual_v2'
const DEFAULT_FORMAT = 'mp3_44100_128'
// ElevenLabs Creator tier at the time of writing: $22 for 100,000 credits (1 credit ~ 1 character).
const DEFAULT_RATE_PER_1K = 0.22
const TIERS = [
  ['Starter', 5, 30000],
  ['Creator', 22, 100000],
  ['Pro', 99, 500000],
]

/* ---------- arguments ---------- */

function parseArgs(argv) {
  const opts = {
    generate: false,
    force: false,
    help: false,
    voice: process.env.ELEVENLABS_VOICE_ID || '',
    model: process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL,
    format: DEFAULT_FORMAT,
    rate: DEFAULT_RATE_PER_1K,
    only: null,
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const next = () => argv[++i]
    if (arg === '--generate') opts.generate = true
    else if (arg === '--dry-run' || arg === '--dry') opts.generate = false
    else if (arg === '--force') opts.force = true
    else if (arg === '--help' || arg === '-h') opts.help = true
    else if (arg === '--voice') opts.voice = String(next() || '')
    else if (arg.startsWith('--voice=')) opts.voice = arg.slice(8)
    else if (arg === '--model') opts.model = String(next() || DEFAULT_MODEL)
    else if (arg.startsWith('--model=')) opts.model = arg.slice(8)
    else if (arg === '--format') opts.format = String(next() || DEFAULT_FORMAT)
    else if (arg.startsWith('--format=')) opts.format = arg.slice(9)
    else if (arg === '--rate') opts.rate = Number(next()) || DEFAULT_RATE_PER_1K
    else if (arg.startsWith('--rate=')) opts.rate = Number(arg.slice(7)) || DEFAULT_RATE_PER_1K
    else if (arg === '--only') opts.only = String(next() || '')
    else if (arg.startsWith('--only=')) opts.only = arg.slice(7)
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`)
  }
  if (opts.only) opts.only = opts.only.split(',').map((s) => s.trim()).filter(Boolean)
  return opts
}

const HELP = `The First Key — narration script builder

  node scripts/generate-narration.mjs [--dry-run]
      Reads dist/story-data.js, builds one narration line per story node, writes
      dist/narration/script.json, and prints the total character count with a cost
      estimate. Makes no network calls. This is the default.

  node scripts/generate-narration.mjs --generate --voice <voice-id>
      Renders each line with the ElevenLabs text-to-speech API into dist/narration/*.mp3
      and writes dist/narration/manifest.json. Requires ELEVENLABS_API_KEY in the
      environment. This spends credits.

Options
  --voice <id>     ElevenLabs voice id (or set ELEVENLABS_VOICE_ID)
  --model <id>     ElevenLabs model id (default ${DEFAULT_MODEL})
  --format <fmt>   Output format (default ${DEFAULT_FORMAT})
  --only a,b,c     Limit to these node ids
  --force          Re-render clips that already exist
  --rate <usd>     Cost estimate rate per 1,000 characters (default ${DEFAULT_RATE_PER_1K})
  --help           This text
`

/* ---------- narration text ---------- */

// Placeholders become neutral wording: a pre-rendered clip cannot know the player's
// character name or their fictional numbers.
const NEUTRAL = {
  name: 'traveler',
  presenterName: 'Erik Miller',
  presenterRole: 'mortgage consultant',
  presenterCompany: 'Patriot Home Mortgage',
  assistantName: 'Albert Luc',
  assistantFirst: 'Albert',
  goalText: 'your goal',
  firstStop: 'your first stop',
  margin: 'what is left',
  reserve: 'your reserve',
  reserveResult: 'the result',
  afterRepair: 'what is left after the repair',
  timelineText: 'your timeline',
  questionText: 'your biggest question',
  priority: 'your priority',
  portalDelivery: 'the preview is on its way',
  partnerLine: '',
  homeName: 'the home you chose',
  focusText: 'your focus',
  fictionalRate: 'the fictional rate',
  endingText: 'your ending',
  docsStatus: 'your documents',
  coins: 'your coins',
  coinDollars: 'your coin total',
  coinSavings: 'the monthly difference',
}

const unknownPlaceholders = new Set()

// Real names read straight from dist/config.js when it loads, so the narration says
// "Erik Miller" rather than a placeholder. Falls back to the defaults above.
async function applyConfigNames() {
  try {
    if (!existsSync(CONFIG)) return
    const cfg = await import(pathToFileURL(CONFIG).href)
    const presenter = cfg.presenter || {}
    const assistant = cfg.assistant || {}
    if (presenter.name) NEUTRAL.presenterName = presenter.name
    if (presenter.role) NEUTRAL.presenterRole = String(presenter.role).toLowerCase()
    if (presenter.company) NEUTRAL.presenterCompany = presenter.company
    if (assistant.name) NEUTRAL.assistantName = assistant.name
    if (assistant.firstName || assistant.name)
      NEUTRAL.assistantFirst = assistant.firstName || String(assistant.name).split(' ')[0]
  } catch {
    // Config is optional; the defaults above are already sensible.
  }
}

function humanize(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .trim()
}

function neutralize(text) {
  return String(text == null ? '' : text).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (Object.prototype.hasOwnProperty.call(NEUTRAL, key)) return NEUTRAL[key]
    unknownPlaceholders.add(key)
    return humanize(key)
  })
}

function stripMarkup(text) {
  return String(text == null ? '' : text)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, ' and ')
    .replace(/&(?:ldquo|rdquo|quot);/gi, '"')
    .replace(/&(?:lsquo|rsquo|apos|#39);/gi, "'")
    .replace(/&(?:mdash|ndash|#8212|#8211);/gi, ', ')
    .replace(/&hellip;/gi, '...')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
}

function tidy(text) {
  return stripMarkup(neutralize(text))
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([.;:!?]){2,}/g, '$1')
    .trim()
}

function terminate(text) {
  const t = tidy(text)
  if (!t) return ''
  return /[.!?…"'”’)]$/.test(t) ? t : t + '.'
}

function narrationFor(node) {
  const parts = []
  if (node.title) parts.push(terminate(node.title))
  for (const paragraph of node.text || []) {
    const line = terminate(paragraph)
    if (line) parts.push(line)
  }
  if (node.lesson) parts.push(terminate(node.lesson))
  return parts.filter(Boolean).join(' ').replace(/\s{2,}/g, ' ').trim()
}

async function buildLines(only) {
  if (!existsSync(STORY)) throw new Error(`Cannot find ${relative(ROOT, STORY)}`)
  await applyConfigNames()
  const mod = await import(pathToFileURL(STORY).href)
  const episode = mod.episode
  if (!episode || !episode.nodes) throw new Error('dist/story-data.js did not export an episode with nodes')
  const lines = []
  for (const [id, node] of Object.entries(episode.nodes)) {
    if (only && !only.includes(id)) continue
    const text = narrationFor(node)
    if (!text) continue
    lines.push({ id, characters: text.length, text })
  }
  return { episode, lines }
}

/* ---------- cost ---------- */

function estimate(totalCharacters, ratePer1k) {
  return {
    characters: totalCharacters,
    ratePer1kUsd: Number(ratePer1k.toFixed(4)),
    usd: Number(((totalCharacters / 1000) * ratePer1k).toFixed(2)),
    note: 'ElevenLabs bills roughly one credit per character. Prices change; treat this as an estimate.',
  }
}

function money(n) {
  return '$' + n.toFixed(2)
}

/* ---------- ElevenLabs ---------- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function renderClip({ apiKey, voice, model, format, text }) {
  const url = `${API_BASE}/${encodeURIComponent(voice)}?output_format=${encodeURIComponent(format)}`
  const body = JSON.stringify({
    text,
    model_id: model,
    voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
  })
  let lastError = 'unknown error'
  for (let attempt = 1; attempt <= 3; attempt++) {
    let res
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body,
      })
    } catch (err) {
      lastError = `network error: ${err && err.message ? err.message : err}`
      await sleep(attempt * 1500)
      continue
    }
    if (res.ok) return Buffer.from(await res.arrayBuffer())
    let detail = ''
    try {
      detail = (await res.text()).slice(0, 300)
    } catch {}
    lastError = `HTTP ${res.status} ${res.statusText}${detail ? ' — ' + detail : ''}`
    if (res.status === 401 || res.status === 403 || res.status === 422) break
    await sleep(attempt * 2000)
  }
  throw new Error(lastError)
}

function fileNameFor(id) {
  const safe = String(id)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${safe || 'clip'}.mp3`
}

/* ---------- main ---------- */

async function main() {
  let opts
  try {
    opts = parseArgs(process.argv.slice(2))
  } catch (err) {
    console.error(err.message)
    console.error(HELP)
    process.exitCode = 1
    return
  }
  if (opts.help) {
    console.log(HELP)
    return
  }

  const { episode, lines } = await buildLines(opts.only)
  const total = lines.reduce((sum, l) => sum + l.characters, 0)
  const cost = estimate(total, opts.rate)
  await mkdir(OUT_DIR, { recursive: true })

  const script = {
    generated: new Date().toISOString(),
    source: 'dist/story-data.js',
    episode: episode.id || 'episode',
    episodeVersion: episode.version || null,
    nodeCount: lines.length,
    totalCharacters: total,
    estimate: cost,
    lines,
  }
  const scriptPath = join(OUT_DIR, 'script.json')
  await writeFile(scriptPath, JSON.stringify(script, null, 2) + '\n', 'utf8')

  console.log(`The First Key — narration script (${episode.title || episode.id || 'episode'})`)
  console.log(`  scenes            ${lines.length}`)
  console.log(`  characters        ${total.toLocaleString('en-US')}`)
  console.log(`  longest scene     ${lines.reduce((a, b) => (b.characters > a.characters ? b : a), lines[0] || { id: '-', characters: 0 }).id} (${Math.max(0, ...lines.map((l) => l.characters))} chars)`)
  console.log(`  wrote             ${relative(ROOT, scriptPath)}`)
  console.log('')
  console.log(`  estimated cost    ${money(cost.usd)} at ${money(cost.ratePer1kUsd)} per 1,000 characters`)
  for (const [name, price, credits] of TIERS) {
    const per1k = (price / credits) * 1000
    console.log(
      `    ${name.padEnd(8)} $${price}/mo for ${credits.toLocaleString('en-US')} credits → ${money((total / 1000) * per1k)} for one full pass (${((total / credits) * 100).toFixed(1)}% of the monthly allowance)`,
    )
  }
  console.log(`  ${cost.note}`)
  if (unknownPlaceholders.size)
    console.log(`  note: unmapped placeholders read as plain words: ${[...unknownPlaceholders].join(', ')}`)

  if (!opts.generate) {
    console.log('')
    console.log('Dry run: no API calls were made and nothing was charged.')
    console.log('To render audio:  ELEVENLABS_API_KEY=… node scripts/generate-narration.mjs --generate --voice <voice-id>')
    return
  }

  /* --- generate --- */
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    console.error('')
    console.error('ELEVENLABS_API_KEY is not set. Refusing to generate.')
    console.error('Set it in your shell (not in any file in this repository) and run again.')
    process.exitCode = 1
    return
  }
  if (!opts.voice) {
    console.error('')
    console.error('No voice id. Pass --voice <id> or set ELEVENLABS_VOICE_ID.')
    process.exitCode = 1
    return
  }

  const existing = new Set(await readdir(OUT_DIR).catch(() => []))
  const clips = {}
  const todo = []
  for (const line of lines) {
    const file = fileNameFor(line.id)
    clips[line.id] = file
    if (existing.has(file) && !opts.force) continue
    todo.push({ ...line, file })
  }
  const billable = todo.reduce((sum, l) => sum + l.characters, 0)

  console.log('')
  console.log(`Generating with voice ${opts.voice} · model ${opts.model} · format ${opts.format}`)
  console.log(`  ${todo.length} of ${lines.length} clips to render (${existing.size ? 'existing files are skipped unless --force' : 'nothing rendered yet'})`)
  console.log(`  billable characters ${billable.toLocaleString('en-US')} ≈ ${money((billable / 1000) * opts.rate)}`)
  console.log('')

  let ok = 0
  const failures = []
  for (const line of todo) {
    process.stdout.write(`  ${line.id} (${line.characters} chars) … `)
    try {
      const audio = await renderClip({
        apiKey,
        voice: opts.voice,
        model: opts.model,
        format: opts.format,
        text: line.text,
      })
      await writeFile(join(OUT_DIR, line.file), audio)
      ok++
      console.log(`ok, ${(audio.length / 1024).toFixed(0)} KB`)
    } catch (err) {
      failures.push({ id: line.id, error: err.message })
      console.log(`failed — ${err.message}`)
    }
    await sleep(250)
  }

  // Only list clips whose file actually exists on disk.
  const onDisk = new Set(await readdir(OUT_DIR).catch(() => []))
  const finalClips = {}
  for (const [id, file] of Object.entries(clips)) if (onDisk.has(file)) finalClips[id] = file

  const manifestPath = join(OUT_DIR, 'manifest.json')
  await writeFile(
    manifestPath,
    JSON.stringify(
      {
        voice: opts.voice,
        model: opts.model,
        format: opts.format,
        generated: new Date().toISOString(),
        episode: episode.id || 'episode',
        episodeVersion: episode.version || null,
        clips: finalClips,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  )

  console.log('')
  console.log(`  rendered ${ok} clip${ok === 1 ? '' : 's'}, ${Object.keys(finalClips).length} listed in ${relative(ROOT, manifestPath)}`)
  if (failures.length) {
    console.log(`  ${failures.length} failed: ${failures.map((f) => f.id).join(', ')}`)
    console.log('  Re-run the same command to retry only the missing ones.')
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : err)
  process.exitCode = 1
})
