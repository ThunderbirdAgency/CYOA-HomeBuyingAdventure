# The First Key — product and technical notes

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
