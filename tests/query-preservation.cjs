const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const api = require('../studio/command-builder.js');

const expected = 'https://example.test/media?token=a%20b~&signature=A%2fB&flag&x=1&x=2&literal=utm_source#t=30';
const input = expected.replace('#t=30', '&utm_source=iphone&%75tm_medium=share&si=123#t=30');
assert.equal(api.cleanUrl(input), expected, 'Retained query fields must keep their original encoding and order');
assert.equal(api.cleanUrl(expected), expected);
assert.equal(api.cleanUrl(api.cleanUrl(input)), expected, 'Cleaning must be idempotent');
assert.deepEqual(api.urls(input + '\n' + expected), [expected], 'Tracked and clean variants deduplicate');
assert.deepEqual(api.csv('url\n"' + input + '"'), [expected]);
assert.equal(api.cleanUrl('https://example.test/?utm_source=x&si=y#part'), 'https://example.test/#part');
assert.equal(api.cleanUrl('https://example.test/?broken=%ZZ&%ZZ=raw&utm_source=x'), 'https://example.test/?broken=%ZZ&%ZZ=raw');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'cans-query-test-'));
try {
  fs.writeFileSync(path.join(temporary, 'yt-dlp'), '#!/bin/sh\nprintf \'%s\\0\' "$@"\n', {mode:0o755});
  for (const format of ['MP3', 'WAV', 'VIDEO', 'VIDAUD']) {
    const result = spawnSync('sh', ['-c', api.script(input, format)], {encoding:'utf8', env:{...process.env, PATH:temporary + path.delimiter + process.env.PATH}});
    assert.equal(result.status, 0);
    assert.equal(result.stderr, '');
    assert.equal(result.stdout.split('\0').filter(Boolean).at(-1), expected);
  }
} finally { fs.rmSync(temporary, {recursive:true, force:true}); }
console.log('PASS: raw query encoding, repeated/bare fields, fragment, encoded tracking keys, CSV, deduplication and all script formats.');
