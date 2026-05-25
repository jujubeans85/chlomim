# THE STUDIO - CRATE JUICE™ Evolving Manual

## Core Features (Current)
- Vintage analog gear aesthetic with handwritten tape-deck buttons
- Txt Box: Paste YouTube URL(s) (one per line)
- Format selectors: MP3, WAV (default with ✓), VID ONLY, VID + AUD
- DROP TO CRATE → Generates professional yt-dlp bash script for A-Shell
- A-SHELL COMMAND panel with COPY button
- UPLOAD SHAZAM CSV → parses CSV and generates batch download scripts

## A-Shell Usage
1. Copy script from A-SHELL panel
2. In A-Shell: `cat > download.sh` → paste → Ctrl+D
3. `chmod +x download.sh`
4. `./download.sh`
5. Files saved to `~/Documents/` for easy Logic/DJ import

## Plugins (located in /plugins/)
- custom_plugin.py and shazam_search.py
- Copy to `~/.config/yt-dlp/plugins/` in A-Shell
- Automatically used by generated scripts

## Shazam Workflow
- Export from Shazam app
- Upload CSV in THE STUDIO
- Get instant batch yt-dlp script using ytsearch:"Artist - Title"

## iOS Shortcuts for Auto CSV
[Full JSON example will be in the PRO TOOLS panel]

## Launchpad Mini MK2 + Logic Pro Mapping (for stems)
- After Logic AI Stem Splitter:
  - Track 1-4: 16 pads each (4 stems x 4 tracks)
  - Color coding: Red=Vox, Orange=Drums, Yellow=Bass, Green=Other
  - Use Novation Components to save template

## Pro Tools Panel (in app)
- Stem separation (Logic AI)
- Spectral / frequency / harmonic manipulation
- Groove extraction & application

Keep this file updated with every iteration.

Last updated: May 25 2026