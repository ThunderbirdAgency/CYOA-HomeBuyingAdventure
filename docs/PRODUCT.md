# The First Key — product and technical notes

## Version 2.2 — play first (September 2026)

Playtest feedback was that the game front-loaded reading and the player did not feel like a character:
"you're keeping people in the wordy section instead of the playing section", "the character looks like a
playing card", "they move really fast and are not led by the mouse", "the voice is Microsoft", the images
were too pixelated, and the uploaded photo "didn't fundamentally change the character". This version answers
each of those.

- **Play in the first ten seconds.** The opening is now Bartleby Quill, the landlord, arriving for rent plus a
  doorknob levy and a sunlight surcharge, with **Rent Day** (a new mini-game) as the featured action on that
  scene. The four-slide prologue no longer plays automatically; it lives under How to play.
- **No setup form.** Character setup is one screen: name and look. Rowan asks what the player wants behind
  their door and when they might move, so the profile is built through dialogue. `applyChoice()` records
  answers on choices that route to an action, which `choose()` previously dropped.
- **A real character.** `character.js` draws a 16×22 pixel adventurer with a four-frame walk cycle and three
  distinct heroes. The player's photo is composited into the character's own head, masked to the face pixels
  with the hair drawn back over the top, so the photo becomes who walks the map and who appears in dialogue.
  The card border, radius and glow are gone.
- **Walking feels like walking.** Speed cut from 30 to 16 percent per second with acceleration, direction
  normalised in pixel space so diagonals travel straight instead of curving around the destination, and
  holding the mouse down leads the character like a leash. Walk frames advance with distance travelled.
- **Better voices.** `voice.js` ranks the device's voices, prefers natural and neural ones, and ranks
  Microsoft David, Zira and Mark last. Players can pick and preview a voice. Pre-rendered ElevenLabs
  narration is supported through a manifest, with a generator script and a dry-run cost estimate.
- **Less pixelated portraits.** `pixelate()` gained a `paletteMix` so colours blend toward the palette rather
  than snapping to it; presenter portraits went from 40px hard-snapped to 72px at 0.35 mix, which is the
  difference between a smudge and a recognisable person. Player faces are extracted at 64px with an adaptive
  palette taken from the photo.
- **More reasons to play.** Every location's game has an in-world name and a reason ("Mira's coin game",
  "Sage's scroll test", "Search the house", "Run for the down payment"). Main-path prose was cut by about
  200 words.

## Version 2.0 (September 2026)

Built on the 1.1 episode. Adds:

- **Hearthvale Arcade**: four original mini-games (Coin Catch, Offer Match, Inspection Hunt, Down Payment Dash) that run inside the story at the matching location and on standalone, shareable pages with Open Graph images. Shared runtime in `arcade-core.js` handles the canvas, loop, input, sound, start and end screens.
- **Coin economy**: path coins, arcade coins (best-run improvements only), portal coins. Erik converts coins to fictional down payment at the gate and shows the monthly payment change.
- **Movement**: hold-to-walk with velocity, walk bob and dust, tap-to-walk, click-to-travel that walks to the destination, on-screen d-pad, enter prompt near places, follow camera on phones (toggle in the map corner).
- **Erik as a character**: the one real person in Hearthvale. Scenes `lender`, `arizona`, `lender-questions` at the gate; a Patriot Home Mortgage flag animates on the castle tower; a persistent speech bubble with call, text, email, ask-a-question, and send-my-plan.
- **Photo avatar**: upload a photo in character setup; `avatar.js` pixelates it on-device to a 32×32 palette portrait used on the map token, in dialogue, on the plan, and on a downloadable share card.
- **Arizona field notes**: Home Plus (AZ IDA), Home in Five Advantage (Maricopa County), VA, FHA, with sources and a lesson. Recorded in the journal.
- **Credit Compass portal**: a secret spot near the waterfall. Walking near it reveals it; entering it offers an optional contact form and opens a three-scene preview (Hidden Ledger, False Entry) that awards the Compass Rune and 25 coins whether or not the form is sent.
- **Episode teases**: Episodes 2 through 5 listed in the Series panel with a “Tell me when it opens” form; Episode 2 has a locked pin on the hilltop house.
- **Contact forms**: `lead.js` posts to the erikmillerhlt.com lead API with a game-context summary. Never blocks progress.
- **Analytics**: `analytics.js` event bus to dataLayer / gtag / Vercel va / beacon.
- **Partner hook**: `?partner=Name` attributes the session and reaches GoHighLevel as a tag. The Nell character line uses `{{agentName}}` so a co-branded agent can be substituted later.

## Architecture

Static, no build step, ES modules from `dist/`. `story-data.js` holds authored content and the pure state helpers; `app.js` renders. Save state is version 3 in localStorage and migrates from versions 1 and 2. Mini-games are lazy-loaded modules so the main bundle stays small. The site build for erikmillerhlt.com copies `dist/` to `/play/` and injects `window.FIRST_KEY_CONFIG` so business facts live in one place.

## Compliance notes

- Presenter identity, NMLS numbers, and the legal line appear in the footer, the Erik bubble, the lead forms, and the share pages.
- Every form says what is sent, that it is optional, and that it is not an application or credit pull. SMS consent is a separate unchecked checkbox and is tagged either way for the GHL workflow.
- Arizona program facts are dated and linked; the copy says terms change and a licensed lender confirms eligibility.
- The Credit Compass preview promises no score outcomes.

## Checks

`npm run check` syntax-checks every module. `npm test` covers 72 full journey variants, scene links, items, sources, the portal bonus, the coin economy, profile plans, and save migration. Headless Chromium playthroughs (desktop 1380×900 and iPhone-size 390×844 with touch) ran the full quest, the in-story arcade, the lead forms, the share card, walking, coin pickup, and the portal with zero page errors. Each mini-game passed an input-mash smoke test to its end screen. Real audio output, real touch hardware, and the Google-hosted pixel font were not exercised in the sandbox.

## Ideas queued

- Agent co-branding: an agent’s name and pixel portrait as Nell, Erik as the lender, both credited at the end and on the share card.
- Spanish text layer.
- Episode 2, The Pre-Approval Scroll.

## v2.3 — the purchase, and the roads

Two defects and one structural change.

**The photo never reached the character.** `state.avatar` is a data URL, but `resolveFace()` passed it straight to the canvas painter, which reads `naturalWidth`, got `undefined`, and skipped the face without a word. Every player who uploaded a photo got the generic adventurer and no error. `resolveFace()` now loads strings and blobs into an image first; canvases and `<img>` elements still pass through untouched. The same bug silenced the setup preview, which is why nobody caught it by looking.

**You could walk anywhere, including over the castle.** There was no collision at all — movement was clamped to a rectangle. The town is a painting rather than a tile map, so the walkable area is now derived from the painting: the dirt roads are the only warm mid-saturation colour in the picture, and a short list of roof rectangles clips the tops of the six buildings, which are drawn in three-quarter view with their doors at the bottom. `scripts/build-paths.py` regenerates the 192 x 128 bitmap from the art and refuses to emit one where any of the six places is unreachable. Walking slides along the edge of a road instead of sticking to it; tapping a far corner routes around the pond rather than into it.

While fixing that, the map itself turned out to have been rendering wrong since the camera layer was added: the CSS sized the map image with `.world > img`, and the image had stopped being a direct child, so it rendered at its natural 1536 x 1024 inside a 944-pixel box. The page showed the top-left corner of Hearthvale and every pin sat somewhere other than the place it named. One selector.

**The story is now a purchase rather than a tour.** You wake up, get robbed by your landlord, and go outside. From there the town is open. The open house and the realty office are both valid first moves; the listing agent tells you, straight, that he works for the seller, and asks whether you have an agent — lie and he asks which one and whether you signed a buyer-broker agreement, then shows you the door. Dual agency is offered honestly and signed for in writing or not at all. Your agent takes you to the lender, who will not write a letter until you have set a housing number at Mira's and recovered all five documents from the Augusta wind. The letter is what makes an offer credible: at asking with the letter attached it beats an identical offer without one, under asking gets countered and then loses the house, and waiving the inspection wins it and costs you the right to ask. Inspections are chosen and paid for out of the emergency pouch, and what you did not pay to look at is what you find out about later.

Old saves (v1-v3) were a different quest with no agent, no offer and no pre-approval. There is no honest mapping, so they keep the player's character, photo, coins and mini-game records, and the journey starts again.
