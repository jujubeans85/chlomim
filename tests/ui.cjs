const vm = require('node:vm'), fs = require('node:fs'), assert = require('node:assert/strict');
const commands = require('../studio/command-builder.js');
const ids = ['toast','shell-panel','source-url','generated-command','copy-command','clean-link','playlist-mode','file-path','csv-input','save-script','save-links','batch-status','batch-errors','folder-label','check-command','script-run'];
function element() {
  return {value:'', checked:false, textContent:'', disabled:false, hidden:false, listeners:{}, attributes:{},
    classList:{add(){},remove(){},toggle(){},contains(){return false}},
    setAttribute(k,v){this.attributes[k]=v}, addEventListener(k,f){this.listeners[k]=f}};
}
const elements = Object.fromEntries(ids.map(id => [id, element()]));
const formats = ['MP3','WAV','VIDEO','VIDAUD'].map(format => Object.assign(element(), {dataset:{format}, textContent:format}));
let boot, copied, clipboardFails=false;
const blobs=[], downloads=[], revoked=[], timers=[];
const context = {CansCommands:commands, console, Blob,
  URL:{createObjectURL(blob){blobs.push(blob);return 'blob:' + blobs.length},revokeObjectURL(url){revoked.push(url)}},
  navigator:{clipboard:{async writeText(text){if(clipboardFails)throw Error('Denied');copied=text}}},
  setTimeout(fn){timers.push(fn)}, clearTimeout(){},
  window:{setTimeout(){},addEventListener(k,f){boot=f}},
  document:{getElementById:id=>elements[id],querySelectorAll:selector=>selector==='.format-btn'?formats:[],body:{appendChild(){}},
    createElement(){return {click(){downloads.push({href:this.href,filename:this.download})},remove(){}}}}
};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../studio/main.js'),'utf8'), context);
boot();
const source=elements['source-url'];
function input(text){source.value=text;source.listeners.input()}
const links = n => Array.from({length:n},(_,i)=>'https://example.test/watch?v='+i+'&si=tracking');
const actionIds=['copy-command','clean-link','save-script','save-links'];
function disabled(expected){for(const id of actionIds)assert.equal(elements[id].disabled,expected,id)}
(async()=>{
  disabled(true);
  input(links(30).concat(links(2)).join('\n'));
  disabled(false);
  assert.match(elements['batch-status'].textContent,/32 \/ 200 links · 30 unique · 2 duplicates/);
  elements['clean-link'].listeners.click();
  assert.equal(source.value,commands.urls(links(30).join('\n')).join('\n'));
  assert.match(elements.toast.textContent,/30 links cleaned · 2 duplicates removed/);
  await elements['copy-command'].listeners.click();
  assert.equal(copied,commands.build(source.value));
  elements['save-links'].listeners.click();
  assert.equal(downloads.at(-1).filename,'cans-clean-links.txt');
  assert.equal(await blobs.at(-1).text(),source.value+'\n');
  for(const button of formats){
    button.listeners.click();
    assert.equal(button.attributes['aria-pressed'],'true');
    assert.equal(formats.filter(b=>b.attributes['aria-pressed']==='true').length,1);
    const folder=button.dataset.format==='VIDAUD'?'VIDEO':button.dataset.format;
    assert(elements['file-path'].textContent.endsWith(folder));
    assert(elements['folder-label'].textContent.endsWith(folder));
    assert(elements['check-command'].textContent.includes('/'+folder));
    elements['save-script'].listeners.click();
    assert.equal(downloads.at(-1).filename,'cans-batch-'+button.dataset.format.toLowerCase()+'.sh');
    assert.equal(await blobs.at(-1).text(),commands.script(source.value,button.dataset.format));
    assert.equal(elements['script-run'].textContent,'sh '+downloads.at(-1).filename);
  }
  elements['playlist-mode'].checked=true;elements['playlist-mode'].listeners.change();
  assert.match(elements['generated-command'].textContent,/--yes-playlist/);
  input(links(200).join('\n'));disabled(false);
  elements['save-script'].listeners.click();
  assert.match(await blobs.at(-1).text(),/200 URLs/);
  input(links(201).join('\n'));disabled(true);
  assert.match(elements['batch-errors'].textContent,/201 pasted/);
  const invalid='\nhttps://example.test/ok\n\njavascript:alert(1)';
  input(invalid);disabled(true);
  assert.equal(source.attributes['aria-invalid'],'true');
  assert.equal(elements['batch-errors'].hidden,false);
  assert.match(elements['batch-errors'].textContent,/Line 4:/);
  elements['clean-link'].listeners.click();assert.equal(source.value,invalid);
  const before=downloads.length;
  elements['save-script'].listeners.click();elements['save-links'].listeners.click();
  assert.equal(downloads.length,before,'Invalid input must not export a partial batch');
  const csvEvent={target:{files:[{size:30,text:async()=> 'url\nhttps://example.test/track'}],value:'selected'}};
  await elements['csv-input'].listeners.change(csvEvent);
  assert.equal(source.value,invalid);assert.equal(csvEvent.target.value,'');
  input('');await elements['csv-input'].listeners.change(csvEvent);
  assert.equal(source.value,'https://example.test/track');disabled(false);
  assert.equal(elements['batch-errors'].hidden,true);
  assert.equal(source.attributes['aria-invalid'],'false');
  clipboardFails=true;await elements['copy-command'].listeners.click();
  assert.match(elements.toast.textContent,/select command manually/);
  input('');disabled(true);
  timers.forEach(fn=>fn());assert.equal(revoked.length,blobs.length);
  console.log('PASS: 30/200-link UI; cleaning; clipboard/fallback; txt/sh contents; all formats; playlist toggle; invalid/overflow guards; CSV preservation; object URL cleanup (DOM simulation).');
})().catch(e=>{console.error(e);process.exit(1)});

