# Audio prompt recipes v3

The existing `studio/prompt.html` adds behind-the-scenes musical controls and up to four optional sound layers. It still writes recipes and prompts; it does not process audio or submit engine jobs. The original Cans downloader is unchanged.

## Musical controls

- Timing scope separates selected source parts + additions from new layers only. Vocals are protected by default. Polish retains advanced settings but omits them from processing instructions and disables their controls.
- Grid choices: eighth notes, sixteenth notes or sixteenth-note triplets. Triplets mean six equal positions per quarter-note beat. Swing is disabled and omitted for triplets, with its value retained for switching back. Swing/shuffle are one operation.
- Beat reference follows a confidence-checked local beat map or a requested fixed BPM. A fixed BPM is explicitly not an analysis result. Protected source parts must not be stretched to force a fit.
- New MIDI accents: follow existing accents, offbeats, syncopation or phrase endings; 1–16-bar patterns; bounded velocity variation; repeatable variation seed. Existing correction, layback and timing variation form one coherent map. Notes generated on-grid do not receive a meaningless additional correction.
- Attack/tail shaping applies only to new percussion, with zero bypassing the stage.
- Sound layers: hats, shaker, rim/woodblock, tambourine, transient clicks, electric keys, mallets, strings or texture. Each has relative level, density, vocal-gap/under-groove/phrase-ending placement and pan. Tonal additions follow actual chords, not merely a key label. Instrument availability must be reported.
- Optional layer WAV/MIDI export requests aligned, mix-relative stems and beat-map information for Logic. Every recipe still requests a 20-second preview and listening approval before full render.

New presets: **Triplet Accents** (hats and rim; source fixed) and **Space Between** (warm keys in vocal gaps). Gentle Pocket, Clean & Warm and Funk & Swagger remain available.

## Schema and persistence

`studio/recipe-v3.mjs` owns schema v3, validation, presets and prompt generation. `prompt-v3.js` uses `juice-cans.audio-recipes.v3` localStorage. If this key is absent, it reads and migrates v2 recipes in memory. The first explicit save writes v3; v2 storage is never overwritten. Both v2 and v3 JSON imports work. Future versions are rejected. Malformed or inaccessible storage is preserved and writes are blocked; JSON export remains available.

Recipes add `timingScope`, `beatMode`, `bpm`, `accentPattern`, `cycle`, `seed`, `velocity`, `attack`, `sustain`, `layerExports` and `layers`. Each layer holds `type`, `level` (−36 to −3 dB), `density` (5–75%), `placement` and `pan` (−50 to +50%). These are instructions for an external processor, not measured or rendered results. The level is a starting point relative to source integrated loudness measured over the same excerpt; the processor must handle near-silent layers and audition the result. Density is a target, not a quota.

Old v2 and legacy JS/CSS modules are retained to protect cached clients. New HTML uses versioned v3 assets; the scoped service-worker cache is bumped and includes them. Existing installed clients may need all Cans tabs closed and reopened to activate the new worker.

## Validation

Run `node --test tests/recipes.test.mjs`, plus `node tests/commands.cjs`, `node tests/ui.cjs`, `node tests/workers.cjs`. Validate the live UI, layer changes, triplet/swing exclusion, mode disabling and saving/reloading after deployment.

No engine endpoint, credentials, telemetry connection or audio upload is introduced. Full audio renders remain subject to listening approval.
