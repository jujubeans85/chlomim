/* Cans command builder v1. No downloads or shell execution in the browser. */
(function (root) {
  'use strict';
  function cleanUrl(value) {
    const raw = String(value || '').trim();
    if (!raw || /[\x00-\x20\x7f]/.test(raw)) throw new Error('Use a complete web link, without spaces.');
    let url;
    try { url = new URL(raw); } catch { throw new Error('Use a complete https:// or http:// link.'); }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
      throw new Error('Use a public HTTP or HTTPS link without a login.');
    // Keep functional query parameters (video IDs, playlists, signatures and timestamps).
    for (const key of [...url.searchParams.keys()]) {
      if (/^utm_/i.test(key) || ['si', 'fbclid', 'igsh', 'igshid'].includes(key)) url.searchParams.delete(key);
    }
    return url.href;
  }
  function quote(value) { return "'" + String(value).replace(/'/g, "'\"'\"'") + "'"; }
  function urls(text) {
    const lines = String(text).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) throw new Error('Paste at least one link.');
    if (lines.length > 200) throw new Error('Use up to 200 links per batch.');
    return [...new Set(lines.map((line, i) => {
      try { return cleanUrl(line); } catch (e) { throw new Error(`Line ${i + 1}: ${e.message}`); }
    }))];
  }
  function build(text, format = 'MP3', playlist = false) {
    const options = {
      MP3: '-x --audio-format mp3 --audio-quality 0',
      WAV: '-x --audio-format wav',
      VIDEO: '-f "bv*+ba/b" --merge-output-format mp4',
      VIDAUD: '-f "bv*+ba/b" --write-thumbnail --embed-metadata --merge-output-format mp4'
    };
    if (!Object.hasOwn(options, format)) throw new Error('Choose a supported format.');
    const folder = format === 'VIDAUD' ? 'VIDEO' : format;
    return `yt-dlp --retries 3 --fragment-retries 3 --no-overwrites ${playlist ? '--yes-playlist' : '--no-playlist'} ${options[format]} -o "$HOME/Documents/CRATE/${folder}/%(title)s [%(id)s].%(ext)s" -- ${urls(text).map(quote).join(' ')}`;
  }
  function csv(text) {
    if (text.length > 2000000) throw new Error('Use a CSV smaller than 2 MB.');
    const fields = []; let field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (quoted && text[i + 1] === '"') { field += '"'; i++; }
        else quoted = !quoted;
      } else if (!quoted && /[,\t\r\n]/.test(c)) { fields.push(field); field = ''; }
      else field += c;
    }
    if (quoted) throw new Error('CSV contains an unfinished quoted field.');
    fields.push(field);
    const found = fields.map(s => s.trim()).filter(s => /^https?:\/\//i.test(s));
    if (!found.length) throw new Error('No web links found in the CSV.');
    return urls(found.join('\n'));
  }
  const api = { cleanUrl, quote, urls, build, csv };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CansCommands = api;
})(globalThis);
