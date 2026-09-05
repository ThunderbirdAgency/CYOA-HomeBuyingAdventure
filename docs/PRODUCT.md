# The First Key — technical notes

The application is a static browser game. Serve the dist directory over HTTP or HTTPS.

## Engine

story-data.js defines an episode as named nodes containing a speaker, prose, choices, optional widgets, a source ID, completion flags, and rewards. Locations define coordinates and prerequisite completions. New episodes can reuse the renderer, audio system, and journal pattern with separate story data and a distinct local-storage key.

app.js renders the map and dialogue, resolves story variables, snapshots choices for rewind, and generates a downloadable journal. Progress stays in browser storage. No real financial information is requested or transmitted.

## Audio and artwork

The original score uses browser oscillators for melody, arpeggios, bass, and cues. A user gesture starts audio. Read-aloud is optional browser speech synthesis. The map is original generated artwork.

## Current boundaries

The First Key is playable. The Credit Compass is labeled as a series in development. No live AI endpoint, CRM, lead submission, or server-side account is implemented. Public educational copy links to the CFPB and FTC; all dollar examples and scenario outcomes are fictional.

## Verification

JavaScript syntax and static asset references were checked. The data-level test covers 24 complete journey variants, prerequisite gates, reserve persistence, valid source references, and repeat-safe rewards. Browser rendering, device audio, and observed play duration remain untested.

Business-planning notes are maintained separately from this public technical documentation.
