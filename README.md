# The First Key

An original Choicewright homebuying adventure set in Hearthvale, presented by Erik Miller of Patriot Home Mortgage. The opening quest is a roughly ten-minute introduction to a longer journey. Version 2.3 turns it into an actual purchase: you find out who works for whom, hire somebody who works for you, set a budget, recover your paperwork, get pre-approved, write an offer that can be refused, and pay for the inspections you choose.

Live at **erikmillerhlt.com/play** (source of truth is this repo; see *Deploying* below) and at homebuyersmindset.com.

## The experience

1. You are asleep. Bartleby Quill lets himself in, takes the rent plus a doorknob levy and a sunlight surcharge, and leaves. Play **Rent Day** and keep what you can.
2. Name your character and pick a look, or put your own face in the game — the photo is cropped, quantised and composited into the character's own head on your device, and never uploaded. One screen, then you are playing.
3. Rowan asks the one question that matters — what do you want behind your door — and gets out of the way. That is the whole of the front end.
4. Walk Hearthvale with WASD or the arrows, tap the map, or hold the mouse down and lead your character. **You stay on the roads**: the walkable network is derived from the map art itself, so there is no strolling across the pond or over the castle towers. Coins sit on the paths.
5. Two first moves, in either order. **The open house on Three-Door Lane**: Percival Bright asks whether you are working with an agent. Say no and he explains, straight, that he works for the seller. Say yes and he asks which one, and whether you signed a buyer-broker agreement — and if you did, he shows you the door and answers questions about the house only. Either way you find out he would happily represent you as well, and what that means. **Hearthvale Realty**: interview three agents and pick one.
6. Your agent takes you to the lender. Nobody at the gate writes a loan for a buyer with no one on their side.
7. **Get qualified.** Erik needs two things: a housing number you set yourself at Mira's shop, and every one of your five financial documents — which the Augusta wind scattered across Hearthvale this morning, and which Albert, the paperwork wizard, watched land. No budget and no documents, no letter. No letter, no offer.
8. **Write an offer.** Under asking, at asking, or over asking with the inspection waived. It can be countered, it can be accepted because your letter was stapled to it, and it can lose the house to somebody else on a Tuesday.
9. **Inspect what you choose to inspect.** General, roof, sewer, termite: each costs real money out of your emergency pouch before you own anything, and each finds different things. What you did not pay to look at is what you find out about later.
10. Handle the roof — negotiate, pay for it, or use the contingency and step back — then take the First Key and unlock Your Buying Plan, which you can send to Erik.
11. Off the marked paths, a ring of humming stones opens a preview of the Credit Compass side series.

The animated opening is optional and lives under How to play, so nothing stands between opening the page and playing.

## Hearthvale Arcade

Five original pixel games live in `dist/arcade/`. `/arcade/` is a room: five standing machines
with lit marquees, screen art, control decks and coin slots, in front of a pixel-art arcade hall.
Clicking a machine lifts it and opens it full-screen with the real game running inside its own
bezel — no page load, Escape or the back button returns to the row. Each game also runs inside
the story at the matching location, and still has its own shareable page with an Open Graph image
(`/arcade/<game>/`), which is what the machines' "Open its own page" links point at. A machine can
be linked directly with `/arcade/#play=coin-catch`.

The cabinet art lives in `dist/arcade/art/`: one screen per game plus the hall itself. The same
screen art is used as the thumbnail in the in-game arcade panel, so a game looks the same
wherever it is listed.

| Game | Where | Lesson |
| --- | --- | --- |
| Rent Day | Your cottage | Rent buys a month and never comes back. |
| Coin Catch | Mira’s shop | Keep emergency money separate from the down payment. |
| Offer Match | Erik at the gate | Compare the whole offer, not the advertised payment. |
| Inspection Hunt | Three-Door Lane | An inspection is not an appraisal. |
| Down Payment Dash | The Loan Castle | A bigger down payment lowers the payment and can remove mortgage insurance. |

Coins: path coins are worth 3, each game awards up to 40 (only improvements over your best run count), the portal awards 25. One coin is $100 of fictional down payment; the payment change uses standard 30-year amortization at the fictional rate in `config.js`.

## Contact forms and analytics

Everything is opt-in and the game never withholds progress if a player declines or delivery fails. Forms post to the erikmillerhlt.com lead API (`/api/lead/`), which verifies each request with Cloudflare Turnstile, checks the page origin, requires an Arizona ZIP code (Erik is licensed in Arizona only), queues the lead durably, and forwards it to GoHighLevel with the funnel tags `game-plan`, `game-question`, `game-portal`, and `game-episode` plus a `game-lead` tag. Each lead carries a one-line `game_context` summary of the player's fictional choices. When the API is not reachable from the page (any host other than erikmillerhlt.com, or verification not configured), the form is replaced by prefilled text and email links so the player still has a way to reach Erik.

`analytics.js` emits events (`game_start`, `location_enter`, `choice`, `coin_pickup`, `minigame_start`, `minigame_end`, `lead_open`, `lead_submit`, `contact_click`, `game_complete`, `plan_open`, `portal_found`, `portal_open`, `share`, and more) to whatever exists on the host page: `dataLayer`, `gtag`, Vercel `va`, or a first-party beacon endpoint. Add `?debug=1` to log events in the console.

## Narration voices

Read-aloud picks the best voice installed on the player's device and ranks robotic ones (Microsoft David, Zira, Mark) last, so it no longer defaults to the flat Windows voice. Players can change it in Sound & voice. For a premium narrator, `scripts/generate-narration.mjs` pre-renders every scene with ElevenLabs into `dist/narration/`, and the game plays those clips when present. Run it with `--dry-run` first to see the character count and cost. See [`docs/VOICE.md`](docs/VOICE.md).

## Configuration

`dist/config.js` holds the presenter defaults (name, NMLS, phone, email, legal line), the fictional rate, and the coin value. A host page can override any of it by defining `window.FIRST_KEY_CONFIG` before `app.js` loads; the erikmillerhlt.com build does this automatically from its business facts. URL parameters: `?partner=Name` (or `?agent=`) attributes the session to a referring agent and is passed through to GoHighLevel; `?debug=1` logs analytics.

## Run locally

Serve `dist/` over HTTP, for example:

```bash
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. The game uses JavaScript modules, so opening the HTML directly as a file is not supported. No dependency installation is required. Run `npm run check` and `npm test` for syntax and story-model checks (the tests cover 36 complete journey variants across both first moves and all three agents, the path network, the pre-approval gate, every offer outcome, paid inspections, the portal bonus, the coin economy, and save migration).

## Deploying

- **erikmillerhlt.com/play**: run `scripts/sync-to-website.sh ../erikmillerhlt` to copy `dist/` into the site repo’s `play/` directory, then commit there. The site build copies it to `public/play/`, injects the business facts and the Vercel Web Analytics script, and adds the pages to the sitemap.
- **homebuyersmindset.com**: serve `dist/` as-is (`.openai/hosting.json` points at it).

## Files

- `dist/story-data.js`: authored nodes, locations, agents, inspection kinds, map coins, documents, secret spots, episodes, items, sources, the purchase state machine (who represents you, whether you are pre-approved, where the offer stands), and save migration.
- `dist/paths.js`: where you can walk. A 192 x 128 bitmap of the road network, derived from the map art by `scripts/build-paths.py`, plus the routing and collision the movement engine uses.
- `dist/character.js`: the pixel adventurer, its walk cycle, and the compositing that puts a player's photo into the character's own head.
- `dist/profile.js`: character choices, profile validation, learning-plan rules.
- `dist/app.js`: map and movement engine, dialogue, arcade launcher, character setup and photo avatar, prologue, sound, Erik bubble, plan, series, share card.
- `dist/config.js`, `dist/analytics.js`, `dist/lead.js`, `dist/avatar.js`: presenter config, event tracking, contact forms, photo pixelator and share card.
- `dist/arcade/arcade-core.js`: shared mini-game runtime; `dist/arcade/*.js` the four games; `dist/arcade/<game>/index.html` their standalone pages; `dist/arcade/og/` share images.
- `dist/audio.js`: original procedural retro soundtrack and cues.
- `dist/style.css`, `dist/arcade/arcade.css`: presentation, reduced-motion support.
- `dist/assets/`: original map and character artwork, Erik’s headshot.
- `tests/story.test.mjs`: story model tests.
- `docs/`: product notes and the press release draft.

## Education and scope

The household, dollar amounts, characters, and property outcomes are fictional. Homebuying lessons link to CFPB, VA, and Arizona program sources reviewed September 8, 2026. Profiles personalize learning, not mortgage eligibility or credit scoring. The Credit Compass is a separately labeled series in development; the portal is a preview only. Photos are pixelated on the player’s device and never uploaded. Nothing is sent to Erik unless the player chooses to send it.
