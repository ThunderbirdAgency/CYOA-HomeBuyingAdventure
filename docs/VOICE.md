# Narration voice

> "The voice is Microsoft — how do I get a different voice in there? What if we connected 11 Labs?"

Short answer: there are three ways to narrate The First Key. Two of them are worth doing.
The third one — calling ElevenLabs live from the player's browser — is the one people ask for
first and the one you should not ship.

Everything below is handled by `dist/voice.js`, a dependency-free browser module.
Narration is never required: every line of the story is already on screen.

---

## Why it sounds like a robot today

The old narration code created a `SpeechSynthesisUtterance` and never set `.voice`.
When you do not pick a voice, the browser hands you the operating system's default —
which on Windows is **Microsoft David** or **Microsoft Zira**, the same 2013-era SAPI5
voices that read out error dialogs. They are the worst voices on the machine, and they
are the ones every Windows player was getting.

Almost every modern device already has something far better installed. It just has to be
asked for by name.

---

## Tier 1 — Pick a better browser voice (free, works today)

`dist/voice.js` reads the full list of installed voices, keeps the English ones, ranks them,
and picks the best one automatically. Names containing **Natural**, **Neural**, **Google**,
**Siri**, **Enhanced**, **Premium**, or the good Apple names (Samantha, Ava, Serena, Alex,
Daniel, Karen, Moira) go to the top. **Microsoft David, Zira, Mark, Hazel** and the eSpeak
family are pushed to the bottom of the list.

On a typical machine the automatic pick is:

| Platform | What it picks instead of the default |
| --- | --- |
| Windows 11 + Edge/Chrome | Microsoft Aria or Guy Online (Natural) |
| Windows without the online voices | Google US English |
| macOS / iOS | Samantha (Enhanced), Ava, or Alex |
| Android / Chrome OS | Google US English |
| Linux, bare containers | Often nothing at all — narration quietly does nothing |

Each voice also comes back with a human label like `Samantha — natural, US`, so a settings
panel can list them and let the player choose. The choice is remembered in `localStorage`
under `choicewright:voice`.

### Dropping it into `app.js`

```js
import { narrator } from './voice.js'

// Warm the voice list early — getVoices() is async on every browser.
narrator.ready()

$('#narrate').onclick = () => {
  if (reading) return stopNarration()
  if (!narrator.isSupported())
    return toast('Read-aloud is not available in this browser. All dialogue is on screen.')

  const node = episode.nodes[state.node]
  const text = [interpolate(node.title), ...node.text.map(interpolate), node.lesson || ''].join('. ')

  reading = true
  $('#narrate').setAttribute('aria-pressed', 'true')
  $('#narrate').textContent = '■ Stop reading'
  music.duck(true)

  narrator.speak(state.node, text, {
    volume: audioPrefs.voice / 100,
    onend: stopNarration,
    onerror: stopNarration,
  })
}

function stopNarration() {
  narrator.stop()
  reading = false
  $('#narrate').setAttribute('aria-pressed', 'false')
  $('#narrate').textContent = '◖ Read aloud'
  music.duck(false)
}
```

For a voice picker in the audio settings:

```js
await narrator.ready()
const list = narrator.voices()            // [{ id, name, label, quality, lang }, …]
const current = narrator.currentVoice()   // the one narration will actually use
// …render <option value={v.id}>{v.label}</option>…
select.onchange = () => narrator.setVoice(select.value)
preview.onclick  = () => narrator.preview(select.value)   // speaks one sample line
```

### The full `voice.js` API

| Call | Does |
| --- | --- |
| `await narrator.ready()` | Resolves once `getVoices()` has populated. Listens for `voiceschanged`, polls every 150 ms as a backstop, and gives up after 3 s so it can never hang. Returns the ranked list. |
| `narrator.voices()` | Ranked, de-duplicated English voices: `{ id, name, label, quality, lang }`. `quality` is `neural`, `natural`, `enhanced`, `standard`, or `basic`. Empty array if the device has none. |
| `narrator.defaultVoice()` | The best voice by that ranking, or `null`. |
| `narrator.currentVoice()` | The player's saved pick if it is still installed, otherwise `defaultVoice()`. |
| `narrator.setVoice(id)` / `narrator.getVoice()` | Read and write the saved preference (`localStorage`, key `choicewright:voice`). `setVoice(null)` clears it. |
| `narrator.speak(key, text, { onend, onerror, volume })` | Narrates one scene. Plays the pre-rendered clip for `key` if there is one, otherwise speaks `text` with the selected voice at `rate` 0.98 / `pitch` 1.0. Returns a handle `{ key, mode, done, stop() }` where `mode` is `clip`, `speech`, or `none`. |
| `narrator.stop()` | Cancels clip playback *and* speech synthesis. Safe to call at any time. |
| `narrator.preview(id)` | Speaks one short sample line with the given voice without changing the saved pick. |
| `narrator.hasRecordedAudio(key)` | Whether a pre-rendered clip exists for that scene. |
| `await narrator.loadManifest()` | Loads `narration/manifest.json` once. Returns `null` if it is missing or malformed — silently, no console noise. |
| `narrator.isSupported()` | Whether narration can make sound at all. |
| `narrator.speaking` | Whether something is playing right now. |

`Narrator` is also exported as a class if you want a second, differently configured instance.

**Scene keys are story node ids** — `letter`, `market`, `lender`, and so on. Pass `state.node`.

---

## Tier 2 — Pre-rendered ElevenLabs narration (the premium voice)

This is the right way to use ElevenLabs here. You render every scene once, on your machine,
commit the mp3 files, and ship them as static assets. Players get a studio-quality voice with
no API key anywhere near the browser, no per-play cost, no latency, and it works offline.

### 1. See what it will cost — free and offline

```bash
node scripts/generate-narration.mjs --dry-run
```

This reads `dist/story-data.js`, turns each node's title, paragraphs, and lesson into one
narration line, replaces `{{placeholders}}` with neutral wording (a recorded clip cannot know
the player's character name), and writes **`dist/narration/script.json`** — every node id with
its text and character count. It makes no network calls and spends nothing.

At the time of writing the story is **34 scenes and roughly 18,000 characters** — the dry run
prints the exact current number, which moves every time the story text is edited. ElevenLabs
bills about one credit per character, so one complete pass costs:

| Plan | Price | Credits/month | One full pass (~18k chars) | Share of the allowance |
| --- | --- | --- | --- | --- |
| Starter | $5/mo | 30,000 | ~$3 | ~60% |
| Creator | $22/mo | 100,000 | ~$4 | ~18% |
| Pro | $99/mo | 500,000 | ~$3.60 | ~4% |

Call it **three to five dollars to voice the whole game**, once. Prices move; run the dry run
before you budget. Every regeneration costs the same again, so read `script.json` and be happy
with the words before you spend anything.

### 2. Pick a voice

Find a voice in the ElevenLabs Voice Library and copy its **voice id** (the long string in the
URL or in the voice's detail panel). Rowan is a warm, unhurried storyteller — pick accordingly.

### 3. Render

```bash
export ELEVENLABS_API_KEY=…            # in your shell only. Never in a file in this repo.
node scripts/generate-narration.mjs --generate --voice <voice-id>
```

- Writes one mp3 per scene into **`dist/narration/<node-id>.mp3`**.
- Writes **`dist/narration/manifest.json`**:
  `{ "voice": "…", "model": "…", "generated": "ISO date", "clips": { "letter": "letter.mp3", … } }`
- **Skips clips that already exist**, so a re-run only fills gaps and only bills for what it renders.
  Use `--force` to re-render everything.
- Prints the billable character count and the estimated charge before it starts.

Useful flags: `--only letter,market,lender` (render a couple to audition a voice cheaply),
`--model <id>` (default `eleven_multilingual_v2`), `--format`, `--rate <usd-per-1k>` for the
estimate, `--help`.

The API key is read from the environment only. It is never written to a file and never printed.

### 4. Ship it

Commit the mp3s and `manifest.json` along with the rest of `dist/`. There is no build step —
`voice.js` fetches the manifest once at startup and starts using the clips automatically.
If the manifest is missing, empty, or a clip 404s or is blocked by autoplay rules, narration
falls back to the browser voice for that scene. Nothing breaks and nothing is logged.

A placeholder `dist/narration/manifest.json` with an empty `clips` object ships in the repo so
the startup fetch does not 404 in the console before you have generated anything. The generator
overwrites it.

Budget roughly 20–30 MB for a full set of mp3s at 128 kbps. If that matters, render at
`--format mp3_22050_32`, which is plenty for spoken narration.

**When the story text changes, the clips are stale.** Delete the mp3s for the nodes you edited
and re-run `--generate`; only those are re-rendered and re-billed.

---

## Tier 3 — Calling ElevenLabs live from the browser (do not do this)

The tempting version is: player clicks Read Aloud, the page POSTs the scene text to
`api.elevenlabs.io`, and plays back the mp3. Three reasons that is the wrong answer for this game:

1. **It exposes your API key.** Anything the browser can send, a player can read. The key would
   sit in `dist/*.js` — a static file, viewable in DevTools, in `view-source`, and in the
   deployed site's cache. An ElevenLabs key is a billing credential; a leaked one gets scraped
   and drained. There is no way to hide a key in client-side code. Not in an env var, not
   minified, not base64'd.

2. **The site's Content-Security-Policy would block it anyway.** The production page allows
   connections only to `'self'` and Cloudflare Turnstile (the lead API's bot check). A `fetch`
   to `api.elevenlabs.io` is refused by the browser before it leaves the machine. Widening
   `connect-src` to allow a third-party API host is a real security decision that also weakens
   the protection around the lead form, which is the one place on this site that handles
   people's contact details.

3. **It is worse for the player.** Every scene means a network round trip and a few seconds of
   silence before the voice starts. Every replay is billed again — a hundred players finishing
   the game costs a hundred times what pre-rendering costs once. And it does not work offline
   or on a bad connection, where the pre-rendered files still do.

If you genuinely need live synthesis later — dynamic text that cannot be rendered ahead of
time, such as reading back the player's own character name — the only safe shape is a
**serverless proxy**: a small function on `erikmillerhlt.com` (the existing lead API is already
there) that holds the key server-side, checks the origin, rate-limits per session, caps
characters per request, and returns the audio. The browser then talks only to `'self'`, which
the CSP already allows. That is a real piece of infrastructure with a real ongoing bill, and
it is not worth building for narration that is identical for every player.

**Pre-rendered is faster, cheaper, safer, and works offline.** Use Tier 2.

---

## Troubleshooting

**"I still hear Microsoft David."** The saved pick may be an old one. Clear it in the console
with `localStorage.removeItem('choicewright:voice')` and reload, or pick a voice from the list
explicitly. On Windows, install more voices under Settings → Time & Language → Speech, and note
that Edge exposes the good "Online (Natural)" voices to any Chromium browser once they are there.

**No voices at all.** Headless browsers, some Linux desktops, and locked-down kiosk machines
report an empty voice list. `voices()` returns `[]`, `defaultVoice()` returns `null`,
`speak()` reports an error through `onerror` rather than throwing, and the game carries on with
text only. This is the expected, tested behavior.

**Narration cuts off after ~15 seconds in Chrome.** Already handled: long text is queued as
sentence-sized utterances rather than one long one, which sidesteps the Chrome bug.

**Clips do not play on iOS.** Safari blocks audio that does not originate from a user gesture.
Narration starts from the Read Aloud button, which satisfies that. If a clip is still blocked,
`speak()` falls back to the browser voice automatically.
