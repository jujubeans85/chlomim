const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const api = require('../studio/command-builder.js');
const attacks = [
 'https://example.test/?q=$(printf%20INJECTED)',
 'https://example.test/?q=`printf%20INJECTED`',
 "https://example.test/?q=';echo%20INJECTED;'",
 'https://example.test/watch?v=abc&list=xyz&t=90',
 'https://example.test/path?x=%22&y=%5C'
];
for (const format of ['MP3','WAV','VIDEO','VIDAUD']) {
 for (const input of attacks) {
  const command=api.build(input,format);
  const result=spawnSync('bash',['-c',"yt-dlp() { printf '%s\\0' \"$@\"; }; "+command],{encoding:'utf8'});
  assert.equal(result.status,0);assert.equal(result.stderr,'');
  const args=result.stdout.split('\0').filter(Boolean);
  assert.equal(args.at(-1),api.cleanUrl(input));
  assert.equal(args.at(-2),'--');
  assert(args.includes('--no-overwrites'));assert(args.includes('--no-playlist'));
 }
}
for(const input of ['file:///etc/passwd','javascript:alert(1)','--exec=oops','https://user:pass@example.test','https://example.test/\necho nope']) assert.throws(()=>api.build(input));
assert.equal(api.urls('https://example.test\nhttps://example.test').length,1);
assert.equal(api.cleanUrl('https://youtube.com/watch?v=abc&list=xyz&si=tracking'),'https://youtube.com/watch?v=abc&list=xyz');
assert.deepEqual(api.csv('name,url\r\n"Song, title","https://example.test/?a=1,2"'),['https://example.test/?a=1,2']);
assert.throws(()=>api.csv('"unfinished'));
assert.throws(()=>api.build('https://example.test','BAD'));
console.log('PASS: 20 shell argument isolation cases; URL validation, functional queries, CSV, formats, deduplication.');
