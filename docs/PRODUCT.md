# The First Key — technical notes

Version 1.1 adds three selectable adventurers, a nickname and keepsake, an editable learning profile, a captioned animated prologue, explicit win conditions, one-click next-destination guidance, separate music and voice volume controls, and an interactive buying-plan checklist.

The mapmaker’s tower replaces the former credit archive. The opening quest focuses on homebuying. The Credit Compass remains a separately labeled future series.

## Architecture

The static game is served from dist/. story-data.js holds authored dialogue, choices, rewards, source references, quest gates, and save migration. profile.js validates profile choices and maps the learning focus to a three-step plan. app.js renders the game and setup flows. audio.js composes original retro music using Web Audio. Original character and map artwork lives in dist/assets/.

Progress and profile information stay in the browser. The profile determines educational direction, not financial eligibility. No financial records are requested, and no CRM, application, or live AI endpoint is connected.

Previous-version saves retain relevant non-credit progress. The replacement mapmaker task must be completed before the revised ending is earned. The plan is a self-guided checklist rather than a second playable episode.

## Checks

All JavaScript modules pass syntax checks. Tests cover 24 complete story variants, valid story links and sources, quest gates, reserve persistence, profile-specific plans, previous-save migration, and repeat-safe rewards. Static asset references were checked. Browser rendering, actual sound playback, and play duration were not tested in this session.
