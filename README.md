# The First Key

The first playable episode of **The Legend of Homeownership**, an original Choicewright adventure published by Peasant Publishing.

A roughly ten-minute, self-paced journey through Hearthvale: explore six locations, make fictional budget decisions, investigate a credit-report mismatch, and handle a repair discovery. Earn four items and download a field journal. Timing varies with reading speed, optional narration, and exploration.

## Play and run

Serve `dist/` with any static HTTP server. For example, run `python3 -m http.server 8080 --directory dist` from the project root and open `http://localhost:8080`. Opening `index.html` directly as a file is not supported because the game uses JavaScript modules.

- Select an unlocked location to walk there and interact.
- Alternatively focus the map, move with WASD or arrow keys, and press E near a location.
- Dialogue choices also accept number keys 1–3.
- Sound begins only after a user gesture. The soundtrack is an original procedural composition using Web Audio; no copyrighted game music or samples are included.
- Read-aloud is optional browser speech synthesis, not a live AI character.
- Progress is saved only in this browser. Field journals download as text.

## Structure

- `dist/story-data.js`: declarative story nodes, choices, variables, sources, places, rewards, and series metadata.
- `dist/app.js`: map interaction, dialogue, state, rewind, journal, and collection UI.
- `dist/audio.js`: original melody, harmony, bass, interaction cues, and tension variation.
- `dist/style.css`: responsive game interface and reduced-motion support.
- `dist/assets/hearthvale.webp`: original generated pixel-art map.
- `docs/PRODUCT.md`: accepted direction, credit-series research, and next milestones.
- `.openai/hosting.json`: private Sites deployment identity.

Run `npm run check` and `npm test`; no dependency installation is required.

## Educational scope

All households, prices, balances, property outcomes, and characters are fictional. Educational principles link to CFPB and FTC sources in the app and journal. Source review date: September 5, 2026. Scenarios do not calculate actual credit scores, determine loan eligibility, or execute disputes.

## Current delivery boundary

This is the requested first playable episode. It has no CRM connection, lead submission, server-side accounts, real financial-data input, or live AI dialogue. Share and download controls work. The Credit Compass is an explicitly labeled future series, not a second playable episode. Add approved contact destinations and an explicit-consent backend when moving from private review to commercial distribution.

This repository preserves the project source and artwork. No third-party framework or runtime service is required to play. Google Fonts is optional; system-font fallbacks are supplied.
