const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const api = require('../studio/command-builder.js');
const formats = ['MP3', 'WAV', 'VIDEO', 'VIDAUD'];
const links = n => Array.from({length:n}, (_, i) => `https://example.test/watch?v=track${i}&list=crate&t=30&si=tracking&utm_source=test`);
const stub = 'yt-dlp() { printf \'%s\\0\' "$@"; }; ';
for (const size of [1, 30, 200]) {
  const input = links(size).join('\r\n');
  const expected = links(size).map(api.cleanUrl);
  for (const format of formats) {
    const command = api.build(input, format, true);
    const result = spawnSync('bash', ['-c', stub + command], {encoding:'utf8'});
    assert.equal(result.status, 0);
    const args = result.stdout.split('\0').filter(Boolean);
    assert.deepEqual(args.slice(args.indexOf('--') + 1), expected);
    for (const flag of ['--no-abort-on-error', '--continue', '--no-overwrites', '--yes-playlist']) assert(args.includes(flag));
    assert(!args.includes('--ignore-errors'), 'Postprocessing failures must not be reported as success');
    const script = api.script(input, format, true);
    assert(script.startsWith('#!/bin/sh\n'));
    assert(script.endsWith(command + '\n'), 'Script and clipboard must use the same command');
    const scriptResult = spawnSync('bash', ['-c', stub + '\n' + script], {encoding:'utf8'});
    assert.equal(scriptResult.stdout, result.stdout);
    assert.equal(scriptResult.status, 0);
    assert.equal(spawnSync('sh', ['-n'], {input:script}).status, 0);
  }
  assert.deepEqual(api.csv('title,url\n' + links(size).map((url, i) => `"Song ${i}","${url}"`).join('\n')), expected);
}
const mixed = '\n' + links(30).join('\n') + '\n\nnot-a-url\n' + links(1)[0];
const report = api.inspect(mixed);
assert.equal(report.count, 32);
assert.equal(report.urls.length, 30);
assert.equal(report.duplicates, 1);
assert.match(report.errors[0], /^Line 33:/, 'Error line numbers must match the original textarea');
assert.throws(() => api.build(mixed), /Line 33/);
assert.throws(() => api.script(mixed), /Line 33/);
const duplicates = links(30).concat(links(30)).join('\n');
assert.deepEqual(api.urls(duplicates), links(30).map(api.cleanUrl));
assert.equal(api.inspect(duplicates).duplicates, 30);
assert.throws(() => api.build(links(201).join('\n')), /up to 200/);
assert.throws(() => api.script(links(201).join('\n')), /up to 200/);
assert.throws(() => api.csv(links(201).join('\n')), /up to 200/);
assert.throws(() => api.build('\n \n'), /at least one/);
// Shell-significant input stays a single literal URL in exported scripts too.
const tricky = "https://example.test/?q=';echo%20INJECTED;'&other=$(whoami)&more=`id`";
const attackResult = spawnSync('bash', ['-c', stub + '\n' + api.script(tricky)], {encoding:'utf8'});
assert.equal(attackResult.status, 0);
assert.equal(attackResult.stderr, '');
assert.equal(attackResult.stdout.split('\0').filter(Boolean).at(-1), api.cleanUrl(tricky));
console.log('PASS: 1/30/200 URL batches in all 4 formats; script parity; CSV; order; deduplication; accurate errors; overflow rejection; script shell isolation.');
