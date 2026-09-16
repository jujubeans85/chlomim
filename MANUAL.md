# Cans / chlomim

Open https://jujubeans85.github.io/chlomim/studio/ . The root also forwards here.

1. Paste one or more full HTTP(S) links, one per line, or import a CSV containing links.
2. Choose MP3, WAV, VIDEO or VID + AUD. Whole playlists are opt-in.
3. Copy the generated command into a-Shell after its prompt. The page does not run it.
4. Files are written beneath `$HOME/Documents/CRATE/<format>/`, shown in the Files app under a-Shell. Existing files are not overwritten. Conversion needs yt-dlp and ffmpeg in the execution environment.

VID + AUD downloads merged video/audio with metadata and a thumbnail; it does not split stems. The separate Audio prompt builder preserves Sundayjuice's descriptive controls; it produces editable text, not processed audio. OCR is not implemented. For a screenshot, use iOS Live Text and paste the links.

Command generation and shell argument isolation have automated coverage. Actual downloads, ffmpeg availability, clipboard access and installed iOS behavior still need a physical device check. Keep functional URL query parameters; do not truncate everything after `?`.

The canonical code is `studio/main.js` plus `studio/command-builder.js`. `studio/script.js`, plugins and grabber are historical experiments, not dependencies of this app. Carriage artwork and app identity are retained. Cache cleanup is scoped to this app and installation path. Add to Home Screen through Safari Share after loading the studio URL.
