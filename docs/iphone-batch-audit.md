# Cans: iPhone batch audit — 6 November 2026

## Verdict

The deployed app is usable as a batch cleaner and command helper. The recommended route is individual track/video URLs → BATCH CLEAN → MP3 → COPY BATCH DOWNLOAD → a-Shell. Actual iPhone execution remains unverified. No media was downloaded during this audit.

The audit used the existing application at https://jujubeans85.github.io/chlomim/studio/ and commit `72f6f9e5cb632998a46fbca9d812cdeced8f014a`. GitHub Actions run https://github.com/jujubeans85/chlomim/actions/runs/41957028139 reports completed/success at 02:44:04 UTC on 5 November (13:44:04 Sydney). Live HTML, command-builder.js, main.js, styles.css and sw.js were byte-identical to that commit. This document and the proposed correction are for review; they have not changed the public application.

## Evidence

| Check | Result | Boundary |
| --- | --- | --- |
| Existing commands, batch, UI and worker test suites | All passed | Node tests; UI and workers use simulated browser APIs |
| Live 30-link batch | 30 unique, ready | Remote Chrome, not Safari/iPhone |
| Two additional duplicates | 32 inputs → 30 unique, original order preserved | Exact cleaned URLs, not media-identity deduplication |
| Cleaning | Tracking tags removed; video IDs, list IDs, timestamps, SoundCloud secret_token and Vimeo h retained | Synthetic inputs; links were never fetched |
| Clipboard | Copied text exactly matched the displayed command | Remote browser clipboard, not iOS clipboard |
| Four format buttons and playlist toggle | Correct options and destination displayed | Does not demonstrate codecs/conversion on the phone |
| Live clean-links TXT download | 30 lines, byte-identical to expected output | Download completed in remote Chrome |
| Script export | All four generated contents match the commands and pass shell syntax/argument checks | Remote browser cancelled the .sh download; Safari saving remains unverified |
| Error reporting | Invalid input reported original lines 32 and 33; copy/script buttons disabled | Live page; original input retained |
| Overflow | 201 inputs rejected with explicit count | Live page; 200 accepted in automated tests |
| CSV | 30 quoted URL rows extracted and cleaned correctly | Parser/DOM tests, not physical iOS Files picker |
| Shell errors | A fake downloader returning status 7 produced script exit status 7 | Stub executable; no real downloader or media network request |
| Offline cache | Existing tests pass: fresh precache requests, scoped deletion/interception, skipWaiting/claim | No physical installed-PWA upgrade/offline test |

The mixed fixture contains ten YouTube-shaped watch URLs (`CansTest001` to `CansTest010`, deliberately ten-character synthetic IDs), eight SoundCloud-shaped track URLs, six Bandcamp-shaped track URLs and six Vimeo-shaped numeric URLs. All names, tokens and IDs are test data; numeric URLs may coincidentally identify real items, so do not execute downloads with this fixture. Only Cans' local text processing and stubbed shell argument handling were exercised. The test command never contacted these services.

## What the app actually guarantees

- Up to 200 nonblank input lines, including duplicates. A 201-line input is rejected even if deduplication would leave fewer than 200.
- Deduplication compares cleaned URL strings. `youtu.be/...` versus `youtube.com/watch?...`, reordered parameters, different timestamps and different hosts can remain separate entries for the same media.
- “Ready” means syntactically accepted. It does not mean reachable, supported by yt-dlp, authorised, downloadable or already downloaded.
- The shell command has retries, partial-download continuation, no-overwrites and continuation after ordinary download errors. It does not persist a download archive or give Cans a completion count. Conversion and website errors appear in a-Shell.
- The CSV parser looks for HTTP(S) cells. Non-URL cells are ignored, so a misspelled URL lacking its scheme may be omitted. Compare the imported count with your source list.
- **The playlist checkbox is not a universal batch-size guard.** yt-dlp documents `--no-playlist` as selecting a video when a URL refers to both a video and playlist. A playlist-only, channel, album or collection URL can still expand with the checkbox off. Use individual-item links for a predictable 30-item batch. This limitation is documented here; the narrow query-encoding correction does not change playlist policy.
- VIDEO selects best available streams and requests MP4 when merging. It does not guarantee an iPhone-compatible codec; a single-stream fallback may retain another container. VID + AUD adds metadata and a separate thumbnail, and writes to VIDEO. It does not create separate audio stems.
- WAV converts the source to WAV; it cannot restore quality lost in a compressed source. MP3 is the simplest starting point for a phone listening batch.

## One-time a-Shell setup — on the physical phone

Install or update **a-Shell by Nicolas Holzschuch**: https://apps.apple.com/au/app/a-shell/id1473805438 . Use the full app as the documented baseline. It includes Python, and its current command registry includes native ffmpeg and ffprobe. Check the actual installed app rather than installing a Python package named ffmpeg.

Run these commands individually:

```sh
python3 --version
ffmpeg -version
ffprobe -version
python3 -m pip install -U "yt-dlp[default]"
python3 -m pip install -U yt-dlp-apple-webkit-jsi
yt-dlp --version
yt-dlp -v
```

Current yt-dlp supports Python 3.11+. The `[default]` extra installs recommended Python dependencies including EJS. The Apple WebKit plugin is a separate, experimental JavaScript challenge provider featured in yt-dlp's own EJS guide. Its installation instructions explicitly support pip installation; the debug output should list `apple-webkit-jsi` as an external provider. Running `yt-dlp -v` without a URL may finish with a “must provide at least one URL” message; this is expected for this dependency check and downloads no media. Check the debug output for ffmpeg/ffprobe versions as well.

If Python is too old or ffmpeg/ffprobe is missing, update/reopen a-Shell first. If `yt-dlp` is not found but `python3 -m yt_dlp --version` works, the command's installation/PATH still needs correcting before Cans' literal `yt-dlp ...` command will run. Do not start a 30-item job to diagnose a missing dependency.

The Apple plugin does not promise to solve all YouTube access problems; its README says PO-token support is still being considered. Authentication, site changes, 403 responses and unavailable formats can still fail. Do not interpret them as a Cans cleaning failure without checking the original URL and a-Shell error.

## Everyday iPhone workflow

1. Open https://jujubeans85.github.io/chlomim/studio/ in Safari or the updated installed Cans app.
2. Paste individual track/video URLs, one per line. Leave whole playlists unchecked. Correct any reported invalid lines; cleaning/export is deliberately blocked while errors remain.
3. Tap **BATCH CLEAN**. Check the unique count. Keep a copy of your input in Notes or use **SAVE CLEAN LINKS (.txt)**; the textarea is not saved across reloads.
4. Choose **MP3** for listening, WAV for a deliberate editing need, or VIDEO/VID + AUD with the codec caveat above.
5. Tap **COPY BATCH DOWNLOAD**. Open a-Shell, paste at its idle prompt, allow iOS paste if prompted, and press Return. Do not paste the displayed `[~/Documents]$` prompt itself. If Cans reports copy failure, select/copy the generated command manually.
6. Keep a-Shell in the foreground while processing, with enough storage and a stable connection. iOS can suspend it in the background; unattended completion with the phone locked is not established.
7. Open **Files → Browse → On My iPhone → a-Shell → CRATE → MP3** (or WAV / VIDEO). The command uses `$HOME/Documents/CRATE/<format>/`; it is independent of the current shell directory. The folder appears after output is created. It does not automatically import into Photos or Music.

For a saved script, tap **SAVE BATCH SCRIPT (.sh)** and save/move it into **On My iPhone → a-Shell**, the app's Documents root. If Safari initially places it in Downloads, move it using Files. In a-Shell run:

```sh
cd "$HOME/Documents"
sh cans-batch-mp3.sh
```

Use the actual saved filename: Safari may append a number on repeated saves. For WAV/VIDEO/VID + AUD use the matching filename displayed in Cans. This fallback is content-verified but its iPhone Save-to-Files flow is still a device check. Prefer copying the command first.

To locate output from the terminal:

```sh
ls -lh "$HOME/Documents/CRATE/MP3"
```

## Refresh an old installed copy

First save any pasted URLs to Notes or a TXT file, because reload clears the unsaved textarea. With the phone online, open the **installed Cans app itself** and allow it to finish loading. Close it from the app switcher, then reopen it while still online. The first load can install the fresh worker; the next load uses its updated assets. In a Safari tab, use Reload after the initial online load.

Confirm that **DROP YOUR BATCH**, **BATCH CLEAN**, **COPY BATCH DOWNLOAD** and **SAVE BATCH SCRIPT (.sh)** are visible. If the Home Screen copy still shows old controls, open the exact `/chlomim/studio/` address in Safari and reload there to inspect the current version. Safari and an installed web app can have different state; refreshing Safari alone is not proof that the installed copy updated. Avoid clearing all Safari website data as a first step. If the icon still will not update, preserve your lists and re-add Cans from the verified studio page using Share → Add to Home Screen.

The reviewed worker uses fresh network requests during cache installation, claims clients and deletes only older caches belonging to this installation. It does not automatically redraw an already open page. The narrow correction keeps that design and only advances its cache/version identifiers.

## Reproduced defect and proposed correction

Cleaning this safe URL on the deployed code:

```text
https://example.test/media?token=a%20b~&signature=A%2fB&flag&utm_source=iphone
```

produces:

```text
https://example.test/media?token=a+b%7E&signature=A%2FB&flag=
```

Deleting a tracking parameter through URLSearchParams reserializes *all* query fields. Those changes can invalidate a signature dependent on exact bytes. The proposed correction filters raw query fields while decoding only parameter names for tracking-tag recognition. Expected output:

```text
https://example.test/media?token=a%20b~&signature=A%2fB&flag
```

The regression test checks encoded tracking names, raw retained values, bare/repeated parameters, fragments, idempotence, CSV, deduplication and literal shell arguments in all four formats. The correction changes no format choices, paths, UI layout or unrelated functionality. It cannot guarantee a signed link survives removal of a parameter included in the signature itself.

## Physical-device acceptance still required

- Version/dependency commands above succeed in the user's a-Shell installation.
- Paste the same synthetic 30-link fixture into Cans, clean and copy; confirm the full command arrives in a-Shell, but **do not execute the synthetic batch**.
- With one short, user-owned/permitted real item, execute one MP3 command; verify playback and the exact Files location. This validates extraction, ffmpeg conversion, storage and playback together.
- Save/open the .sh export and verify its filename/path, and test clipboard fallback if needed.
- Confirm touch targets, keyboard scrolling, installed-app online upgrade and subsequent offline reopening on the actual phone. CSS includes 48px button targets, a mobile viewport and responsive layout, but that is not device testing.
- Only after the one-item check passes, run the real 30-link batch. No bulk test download is required.

## Primary references

- Cans README and audited source: https://github.com/jujubeans85/chlomim/tree/72f6f9e5cb632998a46fbca9d812cdeced8f014a
- a-Shell documentation (files, home directory, packages, foreground suspension): https://github.com/holzschu/a-shell
- a-Shell native command registry: https://github.com/holzschu/a-shell/blob/master/Resources/commandDictionary.plist
- yt-dlp installation, dependencies, options and output formats: https://github.com/yt-dlp/yt-dlp
- yt-dlp JavaScript setup and featured Apple provider: https://github.com/yt-dlp/yt-dlp/wiki/EJS
- Apple provider installation and limits: https://github.com/grqz/yt-dlp-apple-webkit-jsi

External software documentation was inspected on 6 November 2026. Its current requirements can change independently of Cans.
