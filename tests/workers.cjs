const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
async function check(file,scope,own,foreign){
 const handlers={},deleted=[],lookups=[];let pending,skipped=false,claimed=false;
 const cache={addAll:async()=>{},match:async request=>{lookups.push(request);return undefined}};
 const ctx={URL,Promise,self:{skipWaiting:async()=>{skipped=true},clients:{claim:async()=>{claimed=true}},registration:{scope,unregister:async()=>true},addEventListener:(t,f)=>handlers[t]=f},
 caches:{open:async()=>cache,keys:async()=>[own,foreign,'font-juice-v1'],delete:async k=>deleted.push(k)},fetch:async()=>({ok:true})};
 vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx);
 handlers.install({waitUntil:p=>pending=p});await pending;
 assert(skipped,'New batch cache must activate without waiting for every open tab to close');
 handlers.activate({waitUntil:p=>pending=p});await pending;
 assert(claimed);assert(deleted.includes(own));
 assert(!deleted.includes(foreign));assert(!deleted.includes('font-juice-v1'));
 if(handlers.fetch){
  let intercepted=false;handlers.fetch({request:{url:new URL('../other/app.js',scope).href,method:'GET'},respondWith(){intercepted=true}});
  assert.equal(intercepted,false,'foreign app requests must pass through');
 }
}
(async()=>{
 await check(require('node:path').join(__dirname,'../sw.js'),'https://example.test/chlomim/','chlomim:/chlomim/:old','chlomim:/preview/:old');
 console.log('PASS: cache deletion and fetch interception stay within the Cans installation.');
})().catch(e=>{console.error(e);process.exit(1)});

