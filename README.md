# The First Key

An original Choicewright homebuying adventure set in Hearthvale, presented by Erik Miller of Patriot Home Mortgage. The opening quest is a roughly ten-minute introduction to a longer journey. Version 2.0 adds the Hearthvale Arcade, a coin economy, free walking, a photo-to-pixel avatar, Erik as a character at the castle gate, Arizona field notes, a hidden Credit Compass portal, and optional contact forms that feed GoHighLevel.

Live at **erikmillerhlt.com/play** (source of truth is this repo; see *Deploying* below) and at homebuyersmindset.com.

## The experience

1. Rent day. Bartleby Quill wants his money, plus a doorknob levy. Play **Rent Day** and keep what you can.
2. Name your character and pick a look, or put your own face in the game (processed on-device, never uploaded). One screen, then you are playing.
3. Rowan asks what you want behind your door and when you might move. Those answers shape your buying plan; there is no setup form.
4. Walk Hearthvale with WASD or the arrows, or hold the mouse down and lead your character around. Coins sit on the paths.
5. Collect the Budget Compass, Clear-Sight Lens, and Homeward Map. Each guide has a game.
6. Explore a home and work through a repair discovery.
7. Meet Erik, the lender at the gate, under the Patriot Home Mortgage flag. Your coins become fictional down payment and you see what that does to a monthly payment. Ask about Arizona programs.
8. Say hello to Albert, the paperwork wizard, in the castle keep. The Augusta wind blew your paperwork across Hearthvale; Albert knows what a lender needs and where each page landed. Recover all five for the Ready Satchel.
9. Reach the lantern bridge to earn the First Key and unlock Your Buying Plan, which you can send to Erik.
10. Off the marked paths, a ring of humming stones opens a preview of the Credit Compass side series.

The animated opening is optional and lives under How to play, so nothing stands between opening the page and playing.

## Hearthvale Arcade

Five original pixel games live in `dist/arcade/`. Each runs inside the story at the matching location and on its own shareable page with Open Graph images.

| Game | Where | Lesson |
| --- | --- | --- |
| Rent Day | Your cottage | Rent buys a month and never comes back. |
| Coin Catch | Mira’s shop | Keep emergency money separate from the down payment. |
| Offer Match | The guild hall | Compare the whole offer, not the advertised payment. |
| Inspection Hunt | Three-Door Lane | An inspection is not an appraisal. |
| Down Payment Dash | The lantern bridge | A bigger down payment lowers the payment and can remove mortgage insurance. |

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

Open `http://localhost:8080`. The game uses JavaScript modules, so opening the HTML directly as a file is not supported. No dependency installation is required. Run `npm run check` and `npm test` for syntax and story-model checks (the tests cover 72 complete journey variants, the portal bonus, the coin economy, profile plans, and save migration).

## Deploying

- **erikmillerhlt.com/play**: run `scripts/sync-to-website.sh ../erikmillerhlt` to copy `dist/` into the site repo’s `play/` directory, then commit there. The site build copies it to `public/play/`, injects the business facts and the Vercel Web Analytics script, and adds the pages to the sitemap.
- **homebuyersmindset.com**: serve `dist/` as-is (`.openai/hosting.json` points at it).

## Files

- `dist/story-data.js`: authored nodes, locations, map coins, secret spots, episodes, items, sources, coin helpers, save-state migration.
- `dist/profile.js`: character choices, profile validation, learning-plan rules, next-destination selection.
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
