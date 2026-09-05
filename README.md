# The First Key

An original Choicewright homebuying adventure set in Hearthvale. The opening quest is designed as a roughly ten-minute introduction to a longer journey.

## The experience

1. Choose one of three original adventurers, add a nickname, and pick a keepsake.
2. Set your homeownership goal, timing, and biggest question.
3. Watch the short animated pixel-art prologue, or skip it.
4. Collect the Budget Compass, Clear-Sight Lens, and Homeward Map.
5. Explore a home and work through a repair discovery.
6. Reach the lantern bridge to earn the First Key and unlock Your Buying Plan.

A persistent objective and Go to button identify the next destination. Players may click locations or focus the map and use WASD/arrows and E. Dialogue choices also accept 1–3. Previous choice enables alternative paths.

Your Buying Plan is an interactive checklist personalized by the player's chosen learning focus, goal, and timing. Profiles can be edited at any time. Profiles, plan progress, and game progress stay on the current device; nothing is submitted to a lender or agent.

## Run locally

Serve `dist/` over HTTP, for example:

```bash
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. The game uses JavaScript modules, so opening the HTML directly as a file is not supported.

No dependency installation is required. Run `npm run check` and `npm test` for syntax and story-model checks.

## Files

- `dist/story-data.js`: authored nodes, locations, variables, rewards, sources, save-state migration.
- `dist/profile.js`: character choices, profile validation, learning-plan rules, next-destination selection.
- `dist/app.js`: map, dialogue, character setup, animated prologue, sound controls, profile editor, and checklist.
- `dist/audio.js`: original procedural retro soundtrack and cues; music gain and narration ducking.
- `dist/style.css`: responsive presentation and reduced-motion support.
- `dist/assets/`: original generated map and character artwork.
- `tests/story.test.mjs`: complete journey variants, progression, save migration, and profile-specific plans.

## Audio

Sound starts after a user gesture. Music and browser read-aloud voice have separate volume controls. Music can be muted without changing the saved volume. Read-aloud is optional browser speech synthesis, not a live AI character. The prologue is animated artwork and captions, not an MP4 or a live-rendered video stream.

## Education and scope

The household, dollar amounts, characters, and property outcomes are fictional. Homebuying lessons link to CFPB sources reviewed September 5, 2026. Profiles personalize learning, not mortgage eligibility or credit scoring. The Credit Compass is a separately labeled series in development; credit-repair content is not part of this homebuying episode.

No server accounts, CRM submission, lead-capture backend, or live AI dialogue is connected. Browser rendering, actual audio playback, and observed play time have not been tested in this session.
