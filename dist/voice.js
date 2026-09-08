// The First Key — narration voice.
//
// Three tiers, best first:
//   1. Pre-rendered narration clips (dist/narration/*.mp3, listed in dist/narration/manifest.json).
//      Generate them with `node scripts/generate-narration.mjs --generate`. See docs/VOICE.md.
//   2. The best natural browser voice we can find — chosen by the player, or picked for them.
//      This is what stops Windows from defaulting to Microsoft David/Zira.
//   3. Silence. Narration is never required: every line is already on screen.
//
// Browser ES module. No dependencies, no eval, no network calls except one optional
// fetch of narration/manifest.json. Safe to import where speechSynthesis does not exist.

const VOICE_KEY = 'choicewright:voice'
const MANIFEST_FILE = 'narration/manifest.json'
const NARRATION_DIR = 'narration/'
const READY_TIMEOUT = 3000
const POLL_INTERVAL = 150
const RATE = 0.98
const PITCH = 1.0
const MAX_CHUNK = 220
const SAMPLE_LINE =
  'The lantern bridge is just ahead. Bring your questions, and we will find your first key together.'

/* ---------- small helpers ---------- */

function speech() {
  try {
    return typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis : null
  } catch {
    return null
  }
}

function canUtter() {
  try {
    return typeof window !== 'undefined' && typeof window.SpeechSynthesisUtterance === 'function'
  } catch {
    return false
  }
}

function readStore(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStore(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key)
    else localStorage.setItem(key, String(value))
    return true
  } catch {
    return false
  }
}

function clampVolume(v) {
  const n = Number(v)
  if (!isFinite(n)) return 1
  return Math.max(0, Math.min(1, n))
}

function call(fn, arg) {
  if (typeof fn !== 'function') return
  try {
    fn(arg)
  } catch {}
}

function here(rel) {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) return new URL(rel, import.meta.url).href
  } catch {}
  return rel
}

/* ---------- ranking ---------- */

// Names that signal a modern, natural-sounding engine.
const NEURAL = /\b(neural|natural)\b/i
const GOOGLE = /\bgoogle\b/i
const SIRI = /\bsiri\b/i
const UPGRADED = /\b(enhanced|premium|hd|studio|journey|wavenet|polyglot)\b/i
const GOOD_NAMES =
  /\b(samantha|ava|serena|allison|susan\s+reading|zoe|evan|nathan|noelle|joelle|jamie|isha|nicky|daniel|karen|moira|alex|tessa|fiona|oliver|arthur|aria|jenny|guy|libby|ryan|sonia|emma|brian|matilda|rachel|adam|bella|antoni|domi|elli|josh|sarah|charlotte|alice|george\s+\(natural\))\b/i

// Names that signal the old SAPI5 / eSpeak style engines. These go to the bottom of the list.
const LEGACY_MS = /\b(david|zira|mark|hazel|george|linda|richard|james|catherine|heera|ravi|sean|zira|eva)\b/i
const ROBOTIC = /\b(espeak|pico|festival|flite|eloquence|compact|robosoft|synthesizer|robot)\b/i
const MICROSOFT = /\bmicrosoft\b/i
const ONLINE = /\bonline\b/i

const REGIONS = {
  US: 'US',
  GB: 'UK',
  UK: 'UK',
  AU: 'Australia',
  NZ: 'New Zealand',
  IE: 'Ireland',
  IN: 'India',
  ZA: 'South Africa',
  CA: 'Canada',
  SG: 'Singapore',
  PH: 'Philippines',
  HK: 'Hong Kong',
  NG: 'Nigeria',
}

const QUALITY_WORD = {
  neural: 'natural',
  natural: 'natural',
  enhanced: 'enhanced',
  standard: 'standard',
  basic: 'basic',
}

function regionOf(lang) {
  const code = String(lang || '')
    .replace('_', '-')
    .split('-')[1]
  if (!code) return ''
  return REGIONS[code.toUpperCase()] || code.toUpperCase()
}

function shortName(name) {
  const clean = String(name || '')
    .replace(/^(microsoft|google|apple|amazon|ivona|chrome\s+os)\s+/i, '')
    .replace(/\s*\((?:enhanced|premium|natural|compact|united states|united kingdom)[^)]*\)/gi, ' ')
    .replace(/\s+online\b/gi, ' ')
    .replace(/\s*[-–—]\s*(english|en[-_]\w+)\b.*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return clean || String(name || 'Voice')
}

// Higher is better. Microsoft David/Zira/Mark and friends land far below zero.
function scoreVoice(v) {
  const hay = `${v.name || ''} ${v.voiceURI || ''}`
  let score = 0
  let quality = 'standard'

  if (NEURAL.test(hay)) {
    score += 100
    quality = 'neural'
  }
  if (GOOGLE.test(hay)) {
    score += 80
    if (quality === 'standard') quality = 'natural'
  }
  if (SIRI.test(hay)) {
    score += 78
    if (quality === 'standard') quality = 'natural'
  }
  if (UPGRADED.test(hay)) {
    score += 60
    if (quality === 'standard') quality = 'enhanced'
  }
  if (GOOD_NAMES.test(hay)) {
    score += 45
    if (quality === 'standard') quality = 'natural'
  }
  // Cloud voices are almost always the better ones.
  if (v.localService === false) score += 8

  const modernMicrosoft = MICROSOFT.test(hay) && (NEURAL.test(hay) || ONLINE.test(hay))
  if (MICROSOFT.test(hay) && !modernMicrosoft) {
    score -= 150
    quality = 'basic'
  }
  if (LEGACY_MS.test(hay) && !NEURAL.test(hay)) {
    score -= 150
    quality = 'basic'
  }
  if (ROBOTIC.test(hay)) {
    score -= 250
    quality = 'basic'
  }

  // Mild tie-breakers so the list is stable and reads naturally.
  const lang = String(v.lang || '').toLowerCase()
  if (lang.startsWith('en-us')) score += 4
  else if (lang.startsWith('en-gb')) score += 3
  else if (lang.startsWith('en')) score += 1
  if (v.default) score += 2

  return { score, quality }
}

function describe(v) {
  const { score, quality } = scoreVoice(v)
  const name = shortName(v.name)
  const region = regionOf(v.lang)
  const word = QUALITY_WORD[quality] || 'standard'
  return {
    id: v.voiceURI || v.name,
    name: v.name || name,
    label: region ? `${name} — ${word}, ${region}` : `${name} — ${word}`,
    quality,
    lang: v.lang || 'en-US',
    score,
    voice: v,
  }
}

function isEnglish(v) {
  const lang = String(v && v.lang ? v.lang : '').replace('_', '-')
  return /^en(-|$)/i.test(lang)
}

/* ---------- text preparation ---------- */

function cleanText(text) {
  return String(text == null ? '' : text)
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// Chrome silently stops long utterances. Sentence-sized chunks queued in order avoid it
// and make onend fire reliably.
function chunkText(text) {
  const clean = cleanText(text)
  if (!clean) return []
  if (clean.length <= MAX_CHUNK) return [clean]
  const pieces = []
  let buffer = ''
  const sentences = clean.match(/[^.!?…]+[.!?…]+["'”’)]*\s*|[^.!?…]+$/g) || [clean]
  for (const raw of sentences) {
    const sentence = raw.trim()
    if (!sentence) continue
    if (sentence.length > MAX_CHUNK) {
      if (buffer) {
        pieces.push(buffer)
        buffer = ''
      }
      for (const part of sentence.match(new RegExp(`[\\s\\S]{1,${MAX_CHUNK}}(\\s|$)`, 'g')) || [sentence])
        if (part.trim()) pieces.push(part.trim())
      continue
    }
    if (!buffer) buffer = sentence
    else if (buffer.length + sentence.length + 1 <= MAX_CHUNK) buffer += ' ' + sentence
    else {
      pieces.push(buffer)
      buffer = sentence
    }
  }
  if (buffer) pieces.push(buffer)
  return pieces
}

/* ---------- the narrator ---------- */

export class Narrator {
  constructor(options = {}) {
    this.storageKey = options.storageKey || VOICE_KEY
    this.manifestUrl = options.manifestUrl || here(MANIFEST_FILE)
    this.clipBase = options.clipBase || here(NARRATION_DIR)
    this.sampleLine = options.sampleLine || SAMPLE_LINE

    this._voices = []
    this._readyPromise = null
    this._manifest = null
    this._manifestPromise = null
    this._selected = readStore(this.storageKey) || null
    this._audio = null
    this._token = 0
    this._keepAlive = null

    // Warm the manifest without blocking anything. Failure is normal and silent.
    if (!options.lazyManifest) {
      try {
        Promise.resolve().then(() => this.loadManifest())
      } catch {}
    }
  }

  /* --- readiness --- */

  // Resolves once getVoices() has populated (it is async and fires `voiceschanged`).
  // Some browsers never fire it, so we also poll, and we always give up after a timeout.
  ready() {
    if (this._readyPromise) return this._readyPromise
    this._readyPromise = this._waitForVoices().then((list) => {
      this._voices = list
      return this.voices()
    })
    return this._readyPromise
  }

  _waitForVoices() {
    const synth = speech()
    if (!synth || typeof synth.getVoices !== 'function') return Promise.resolve([])
    const read = () => {
      try {
        const list = synth.getVoices()
        return Array.isArray(list) ? list : []
      } catch {
        return []
      }
    }
    const first = read()
    if (first.length) return Promise.resolve(first)

    return new Promise((resolve) => {
      let settled = false
      let poll = null
      let timer = null
      const onChanged = () => check()
      const cleanup = () => {
        if (poll) clearInterval(poll)
        if (timer) clearTimeout(timer)
        poll = timer = null
        try {
          synth.removeEventListener?.('voiceschanged', onChanged)
          if (synth.onvoiceschanged === onChanged) synth.onvoiceschanged = null
        } catch {}
      }
      const finish = (list) => {
        if (settled) return
        settled = true
        cleanup()
        resolve(list)
      }
      const check = () => {
        const list = read()
        if (list.length) finish(list)
      }
      try {
        synth.addEventListener?.('voiceschanged', onChanged)
        if (!synth.addEventListener) synth.onvoiceschanged = onChanged
      } catch {}
      poll = setInterval(check, POLL_INTERVAL)
      timer = setTimeout(() => finish(read()), READY_TIMEOUT)
      check()
    })
  }

  // True when narration can produce sound at all (a clip or a browser voice).
  isSupported() {
    return Boolean((speech() && canUtter()) || (this._manifest && Object.keys(this._manifest.clips || {}).length))
  }

  /* --- voice list --- */

  // Ranked, de-duplicated English voices: { id, name, label, quality }.
  voices() {
    const synth = speech()
    let raw = this._voices
    if (synth && typeof synth.getVoices === 'function') {
      try {
        const live = synth.getVoices()
        if (Array.isArray(live) && live.length) raw = this._voices = live
      } catch {}
    }
    if (!Array.isArray(raw) || !raw.length) return []

    // Prefer English; if a device somehow reports none, fall back to everything.
    let pool = raw.filter(isEnglish)
    if (!pool.length) pool = raw.slice()

    const described = pool.map(describe)
    described.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))

    const seen = new Set()
    const out = []
    for (const v of described) {
      const key = `${String(v.name).toLowerCase()}|${String(v.lang).toLowerCase()}`
      if (seen.has(key) || seen.has(v.id)) continue
      seen.add(key)
      seen.add(v.id)
      out.push(v)
    }
    return out.map(({ id, name, label, quality, lang }) => ({ id, name, label, quality, lang }))
  }

  // The best available voice by the ranking above, or null.
  defaultVoice() {
    const list = this.voices()
    return list.length ? list[0] : null
  }

  // The voice narration will actually use: the player's pick if it still exists, else the best one.
  currentVoice() {
    const list = this.voices()
    if (!list.length) return null
    if (this._selected) {
      const picked = list.find((v) => v.id === this._selected || v.name === this._selected)
      if (picked) return picked
    }
    return list[0]
  }

  // The stored preference id (may be null, may name a voice that is no longer installed).
  getVoice() {
    return this._selected
  }

  setVoice(id) {
    const value = id === null || id === undefined || id === '' ? null : String(id)
    this._selected = value
    writeStore(this.storageKey, value)
    return this.currentVoice()
  }

  _nativeVoice(id) {
    const want = id || this._selected
    const list = Array.isArray(this._voices) ? this._voices : []
    if (want) {
      const hit = list.find((v) => (v.voiceURI || v.name) === want) || list.find((v) => v.name === want)
      if (hit) return hit
    }
    const best = this.defaultVoice()
    if (!best) return null
    return list.find((v) => (v.voiceURI || v.name) === best.id) || null
  }

  /* --- pre-rendered clips --- */

  // Fetches narration/manifest.json once. Missing or broken is normal: we fall back to
  // browser speech forever and never log anything.
  loadManifest() {
    if (this._manifestPromise) return this._manifestPromise
    this._manifestPromise = (async () => {
      try {
        if (typeof fetch !== 'function') return null
        const res = await fetch(this.manifestUrl, { credentials: 'omit' })
        if (!res || !res.ok) return null
        const data = await res.json()
        if (!data || typeof data !== 'object' || !data.clips || typeof data.clips !== 'object') return null
        this._manifest = {
          voice: typeof data.voice === 'string' ? data.voice : '',
          generated: typeof data.generated === 'string' ? data.generated : '',
          clips: data.clips,
        }
        return this._manifest
      } catch {
        return null
      }
    })()
    return this._manifestPromise
  }

  manifest() {
    return this._manifest
  }

  clipUrl(key) {
    if (!this._manifest || !key) return null
    const file = this._manifest.clips[key]
    if (!file || typeof file !== 'string') return null
    try {
      return new URL(file, this.clipBase).href
    } catch {
      return this.clipBase + file
    }
  }

  hasRecordedAudio(key) {
    return Boolean(this.clipUrl(key))
  }

  /* --- playback --- */

  // speak(sceneKey, text, { onend, onerror, volume }) -> handle
  // Plays the pre-rendered clip for this scene when there is one, otherwise speaks the text
  // with the selected browser voice. Returns a handle with { key, mode, stop(), done }.
  speak(key, text, options = {}) {
    this.stop()
    const token = ++this._token
    const volume = clampVolume(options.volume === undefined ? 1 : options.volume)
    const handle = {
      key,
      mode: 'none',
      done: false,
      stop: () => {
        if (this._token === token) this.stop()
      },
    }

    const finish = (error) => {
      if (token !== this._token || handle.done) return
      handle.done = true
      this._clearKeepAlive()
      if (error) {
        if (typeof options.onerror === 'function') call(options.onerror, error)
        else call(options.onend)
      } else call(options.onend)
    }

    const speakFallback = () => {
      if (token !== this._token || handle.done) return
      handle.mode = 'speech'
      this._speak(text, { volume, token, onFinish: finish })
    }

    const url = this.clipUrl(key)
    if (url && typeof Audio === 'function') {
      try {
        const audio = new Audio(url)
        audio.volume = volume
        audio.preload = 'auto'
        audio.onended = () => finish(null)
        audio.onerror = () => {
          // Missing or unplayable file: quietly use the browser voice instead.
          if (token !== this._token) return
          this._audio = null
          speakFallback()
        }
        this._audio = audio
        handle.mode = 'clip'
        const played = audio.play()
        if (played && typeof played.catch === 'function')
          played.catch(() => {
            // Autoplay blocked or decode failed.
            if (token !== this._token) return
            this._audio = null
            speakFallback()
          })
        return handle
      } catch {
        this._audio = null
      }
    }

    speakFallback()
    return handle
  }

  _speak(text, { volume, token, onFinish, voiceId } = {}) {
    const synth = speech()
    const pieces = chunkText(text)
    if (!synth || !canUtter() || !pieces.length) {
      call(onFinish, new Error('speech-unavailable'))
      return
    }
    const native = this._nativeVoice(voiceId)
    try {
      synth.cancel()
    } catch {}

    let spoken = 0
    for (let i = 0; i < pieces.length; i++) {
      let u
      try {
        u = new window.SpeechSynthesisUtterance(pieces[i])
      } catch {
        call(onFinish, new Error('speech-unavailable'))
        return
      }
      if (native) u.voice = native
      u.lang = (native && native.lang) || 'en-US'
      u.rate = RATE
      u.pitch = PITCH
      u.volume = clampVolume(volume === undefined ? 1 : volume)
      const last = i === pieces.length - 1
      u.onend = () => {
        spoken++
        if (last && token === this._token) call(onFinish, null)
      }
      u.onerror = (event) => {
        if (token !== this._token) return
        const kind = (event && event.error) || 'speech-error'
        // Cancelling produces an "interrupted"/"canceled" error; that is not a failure.
        if (kind === 'interrupted' || kind === 'canceled') return
        call(onFinish, new Error(kind))
      }
      try {
        synth.speak(u)
      } catch {
        call(onFinish, new Error('speech-unavailable'))
        return
      }
    }
    this._startKeepAlive()
  }

  // Speaks one short sample line with a given voice, for the picker. Does not change the selection.
  preview(id, options = {}) {
    this.stop()
    const token = ++this._token
    const volume = clampVolume(options.volume === undefined ? 1 : options.volume)
    this._speak(options.text || this.sampleLine, {
      volume,
      token,
      voiceId: id || this._selected,
      onFinish: (err) => {
        if (token !== this._token) return
        this._clearKeepAlive()
        if (err && typeof options.onerror === 'function') call(options.onerror, err)
        else call(options.onend)
      },
    })
    return {
      key: '__preview__',
      mode: 'speech',
      stop: () => {
        if (this._token === token) this.stop()
      },
    }
  }

  // Cancels both clip playback and speech synthesis.
  stop() {
    this._token++
    this._clearKeepAlive()
    const audio = this._audio
    this._audio = null
    if (audio) {
      try {
        audio.onended = audio.onerror = null
        audio.pause()
        audio.currentTime = 0
      } catch {}
    }
    const synth = speech()
    if (synth) {
      try {
        synth.cancel()
      } catch {}
    }
  }

  get speaking() {
    if (this._audio && !this._audio.paused) return true
    const synth = speech()
    try {
      return Boolean(synth && (synth.speaking || synth.pending))
    } catch {
      return false
    }
  }

  _startKeepAlive() {
    this._clearKeepAlive()
    if (typeof setInterval !== 'function') return
    // Some engines pause themselves on long queues. Resuming only when paused is a no-op otherwise.
    this._keepAlive = setInterval(() => {
      const synth = speech()
      if (!synth) return this._clearKeepAlive()
      try {
        if (!synth.speaking && !synth.pending) return this._clearKeepAlive()
        if (synth.paused) synth.resume()
      } catch {
        this._clearKeepAlive()
      }
    }, 5000)
  }

  _clearKeepAlive() {
    if (this._keepAlive) clearInterval(this._keepAlive)
    this._keepAlive = null
  }
}

export const narrator = new Narrator()
export default narrator
