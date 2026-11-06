const assert=require('node:assert/strict'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const api=require('../studio/command-builder.js');
const os=require('node:os'),path=require('node:path');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'cans-audit-'));
const env={...process.env,PATH:temporary+path.delimiter+process.env.PATH};
const batch=Array.from({length:30},(_,i)=>{const n=String(i+1).padStart(2,'0');return i<10?`https://www.youtube.com/watch?v=CansTest0${n}&list=PL_CANS_TEST&t=30&si=share${n}&utm_source=iphone`:i<18?`https://soundcloud.com/cans-audit-test/track-${n}?utm_source=clipboard&utm_medium=text&secret_token=s-test${n}`:i<24?`https://cans-audit-test.bandcamp.com/track/track-${n}?utm_campaign=crate`:`https://vimeo.com/${900000000+i}?h=test${n}&fbclid=share`;});
const expected=batch.map(s=>s.replace(/&si=share\d+&utm_source=iphone/,'').replace(/utm_source=clipboard&utm_medium=text&/,'').replace(/\?utm_campaign=crate/,'').replace(/&fbclid=share/,''));
const report=api.inspect([...batch,batch[0].replace('share01','duplicate'),batch[10]].join('\n'));
assert.equal(report.count,32);assert.equal(report.duplicates,2);assert.deepEqual(report.urls,expected);
assert.deepEqual(api.csv('title,url\n'+batch.map((url,i)=>`"Test ${i+1}","${url}"`).join('\n')),expected);
// Optionally verify a browser-downloaded clean-links TXT without executing media.
if(process.argv[2]){
 const exported=fs.readFileSync(process.argv[2],'utf8');
 assert.equal(exported,expected.join('\n')+'\n');
}
for(const format of ['MP3','WAV','VIDEO','VIDAUD']){
 fs.writeFileSync(path.join(temporary,'yt-dlp'),'#!/bin/sh\nprintf \'%s\\0\' "$@"\n',{mode:0o755});
 const script=api.script(batch.join('\n'),format);
 const result=spawnSync('sh',['-c',script],{encoding:'utf8',env});
 assert.equal(result.status,0);assert.equal(result.stderr,'');
 const args=result.stdout.split('\0').filter(Boolean);
 assert.deepEqual(args.slice(args.indexOf('--')+1),expected);
 assert.equal(spawnSync('sh',['-n'],{input:script}).status,0);
 fs.writeFileSync(path.join(temporary,'yt-dlp'),'#!/bin/sh\nexit 7\n',{mode:0o755});
 const failed=spawnSync('sh',['-c',script],{env});
 assert.equal(failed.status,7,'Script must propagate downloader failure');
}
fs.rmSync(temporary,{recursive:true,force:true});
console.log('PASS: realistic 30-link mix; 2 duplicates; CSV; 4 script formats; nonzero failure propagation; no media downloads.');
