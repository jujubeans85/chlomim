# Cans / chlomim

Open https://jujubeans85.github.io/chlomim/studio/ . The root also forwards here.

1. Paste up to **200 full HTTP(S) links**, one per line, or import a CSV containing links. Batches of 30 or more are supported.
2. Tap **BATCH CLEAN** to remove tracking tags and duplicate links, keeping the first occurrence in order. The counter shows unique links and duplicates; invalid lines are listed without deleting your input. Fix errors before copying or exporting. Over-limit batches are rejected, never truncated.
3. Choose MP3, WAV, VIDEO or VID + AUD. Whole playlists are opt-in and can expand beyond the number of source URLs.
4. Tap **COPY BATCH DOWNLOAD**, open a-Shell, paste after its prompt and press Return. All URLs run in one command, with retries, continuation after unavailable downloads and partial-download resume. The page does not execute it.
5. Alternatively, **SAVE BATCH SCRIPT (.sh)** exports that same command. Save it in a-Shell's Documents folder, then run the displayed command, e.g. `sh cans-batch-mp3.sh`. **SAVE CLEAN LINKS (.txt)** exports the deduplicated URL list. These browser downloads are text/script files, not media.
6. Media files are written beneath `$HOME/Documents/CRATE/<format>/`, shown in the Files app under a-Shell. Existing files are not overwritten. Conversion needs yt-dlp and ffmpeg in the execution environment. Review errors in a-Shell; the browser cannot report download completion.

VID + AUD downloads merged video/audio with metadata and a thumbnail; it does not split stems. The separate Audio prompt builder preserves Sundayjuice's descriptive controls; it produces editable text, not processed audio. OCR is not implemented. For a screenshot, use iOS Live Text and paste the links.

Command generation, 30/200-link batches, overflow, shell argument isolation, exports and UI states have automated coverage. Run `node tests/commands.cjs`, `node tests/batch.cjs`, `node tests/ui.cjs` and `node tests/workers.cjs`. Actual media downloads, ffmpeg availability and installed iOS behavior still need a physical device check. Keep functional URL query parameters; do not truncate everything after `?`. If an installed copy shows the old controls, let it load online once, then reload to use the updated offline cache.

The canonical code is `studio/main.js` plus `studio/command-builder.js`. `studio/script.js`, plugins and grabber are historical experiments, not dependencies of this app. Carriage artwork and app identity are retained. Cache cleanup is scoped to this app and installation path. Add to Home Screen through Safari Share after loading the studio URL.

