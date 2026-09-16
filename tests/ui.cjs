const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const commands=require('../studio/command-builder.js');
const ids=['toast','shell-panel','source-url','generated-command','copy-command','clean-link','playlist-mode','file-path','csv-input'];
const elements=Object.fromEntries(ids.map(id=>[id,{value:'',checked:false,textContent:'',disabled:false,listeners:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(k,f){this.listeners[k]=f}}]));
let boot;
const context={CansCommands:commands,console,navigator:{},setTimeout(){},clearTimeout(){},window:{setTimeout(){},addEventListener(k,f){boot=f}},document:{getElementById:id=>elements[id],querySelectorAll:()=>[]}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../studio/main.js'),'utf8'),context);boot();
assert(elements['copy-command'].disabled);
elements['source-url'].value='https://example.test/track';elements['source-url'].listeners.input();
assert(!elements['copy-command'].disabled);assert.match(elements['generated-command'].textContent,/yt-dlp/);
elements['source-url'].value='javascript:alert(1)';elements['source-url'].listeners.input();assert(elements['copy-command'].disabled);
(async()=>{
const input=elements['csv-input'];const event={target:{files:[{size:30,text:async()=> 'url\nhttps://example.test/track'}],value:'selected'}};
await input.listeners.change(event);assert.equal(elements['source-url'].value,'javascript:alert(1)');assert.equal(event.target.value,'');
elements['source-url'].value='';await input.listeners.change(event);assert.equal(elements['source-url'].value,'https://example.test/track');assert(!elements['copy-command'].disabled);
console.log('PASS: UI boot, invalid-input copy guard, successful command, CSV preservation and repeat import reset (DOM simulation).');
})().catch(e=>{console.error(e);process.exit(1)});
