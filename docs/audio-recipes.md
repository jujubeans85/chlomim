# Audio prompt recipes v2

The existing `studio/prompt.html` now offers Gentle Pocket, Clean & Warm, and Funk & Swagger presets. Polish preserves timing; Pocket targets selected isolated parts; Rebuild allows rhythmic rearrangement. The original Cans downloader is unchanged.

`studio/recipe.mjs` owns the version-2 schema, constraints, presets and prompt generation. Tone amounts use dB, groove timing uses milliseconds, swing/shuffle share one percentage, and subjective intent controls are labelled as such. True peak is distinct from loudness. An external processor must interpret intent settings, inspect the source, report actual settings/models and obtain listening approval after a 20-second preview. The page does not process audio or send engine jobs.

Recipes save under `juice-cans.audio-recipes.v2` in localStorage. They are local to this browser and origin. Save new, update, load and delete are explicit actions. Invalid or inaccessible storage is not overwritten; JSON export remains available. Export/import moves one named recipe at a time. Personal direction lives in `notes`, so prompt regeneration never silently discards manual prompt edits. The generated prompt is read-only and copyable.

Future engine handoff: consume the `recipe` object from the versioned JSON, validate it again, use one coherent groove map, preserve originals and vocal phrasing, and export aligned stems. No engine endpoint, credentials, telemetry or audio upload is introduced here.

Validation: `node --test tests/recipes.test.mjs`, plus the existing commands, UI and worker regression scripts. The service-worker cache version and asset list include the new module and stylesheet. Existing installed clients may need to close all Cans tabs and reopen for the new worker to activate.
