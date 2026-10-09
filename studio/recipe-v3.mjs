// One versioned recipe feeds the controls, prompt and future engine adapter.
export const SCHEMA = 'juice-cans.audio-recipe';
export const VERSION = 3;
export const layerTypes = {hat:'Soft closed hats',shaker:'Organic shaker',rim:'Dry rim / woodblock',tambourine:'Light tambourine',click:'Soft transient clicks',keys:'Warm electric keys',mallet:'Muted mallets',strings:'Soft string swell',texture:'Airy texture'};
export const placements = {gaps:'Between vocal phrases',under:'Under the groove',ends:'At phrase endings'};
export const newLayer = (type='hat') => ({type,level:-18,density:25,placement:'gaps',pan:0});
export const controls = [
 ['warmth','Warmth EQ',-6,6,.5,0,'dB','Broad low-mid colour; avoid muddy build-up.','tone'],
 ['bass','Bass EQ',-3,6,.5,1.5,'dB','Tight low end; retain kick and bass definition.','tone'],
 ['air','Air & sparkle',-3,6,.5,.5,'dB','High-shelf colour; protect sibilance.','tone'],
 ['compression','Compression ratio',1,6,.1,1.5,':1','1:1 bypasses compression. Threshold follows the source.','tone'],
 ['peak','True-peak ceiling',-6,-.1,.1,-3,'dBTP','A peak limit, not a loudness target.','tone'],
 ['width','Stereo widening',0,10,1,4,'/10','Intent amount; 0 keeps the original width. Check mono.','tone'],
 ['vocal','Vocal clarity',0,10,1,6,'/10','Intent amount; lift intelligibility without harshness.','tone'],
 ['saturation','Analog saturation',0,10,1,1,'/10','Intent amount; 0 bypasses added drive.','tone'],
 ['swing','Swing / shuffle',50,66,1,54,'%','50% is straight; one control avoids doubling the shuffle.','groove'],
 ['quantize','Grid correction',0,50,1,0,'%','Pull selected hits partway toward the chosen swing grid.','groove'],
 ['layback','Layback delay',0,20,1,4,'ms','Place selected parts behind the beat; keep the kick anchored.','groove'],
 ['humanize','Timing variation',0,12,1,8,'±ms','Maximum variation, not random displacement of every hit.','groove'],
 ['bounce','Bounce & attitude',0,10,1,3,'/10','Shape accents and dynamics to support the pocket.','groove'],
 ['velocity','Accent variation',0,24,1,8,'± MIDI','Bounded velocity variation on new MIDI notes; keep intentional accents.','accent'],
 ['attack','Attack shaping',-3,3,.5,0,'dB','New percussion layers only. Positive adds bite; negative softens.','transient'],
 ['sustain','Tail shaping',-3,3,.5,0,'dB','New percussion layers only. Negative shortens the perceived tail.','transient']
].map(([id,label,min,max,step,value,unit,hint,group])=>({id,label,min,max,step,value,unit,hint,group}));
export const defaults = {schema:SCHEMA,version:VERSION,mode:'pocket',protectVocals:true,target:'percussion',subdivision:'16th',timingScope:'source-and-layers',beatMode:'follow',bpm:108,accentPattern:'follow',cycle:4,seed:108,layerExports:true,layers:[],stems:'all',quality:'high',format:'wav-mp3',gift:'highlight',duration:20,passage:'Choose a complete, emotional musical phrase.',notes:'',...Object.fromEntries(controls.map(c=>[c.id,c.value]))};
export const modes = {polish:['Polish','Keep the performance','Tone and dynamics only. Original timing and arrangement stay intact.'],pocket:['Pocket','Find the feel','Subtle movement on selected parts. Keep the arrangement and vocal phrasing.'],rebuild:['Rebuild','Big-beat energy','Allow rhythmic rearrangement and new accents. Keep the hook recognisable; no glitch edits unless requested.']};
export const presets = [
 {id:'gentle',name:'Gentle Pocket',description:'Warm bass. Relaxed feel. Your gentler pass.',recipe:{...defaults}},
 {id:'polish',name:'Clean & Warm',description:'Light finish. Original groove untouched.',recipe:{...defaults,mode:'polish',warmth:1,bass:1,air:.5,width:2,vocal:3,stems:'none',gift:'none'}},
 {id:'swagger',name:'Funk & Swagger',description:'Bigger accents. Controlled movement.',recipe:{...defaults,mode:'rebuild',warmth:1,bass:1.5,compression:2,width:4,saturation:2,target:'drums-bass',swing:56,quantize:15,layback:6,humanize:5,bounce:6,gift:'none'}},
 {id:'triplets',name:'Triplet Accents',description:'Soft hats and rim. Original timing stays put.',recipe:{...defaults,subdivision:'16th-triplet',timingScope:'layers-only',layback:8,humanize:5,bounce:6,accentPattern:'syncopated',layers:[{...newLayer('hat'),placement:'under'},{...newLayer('rim'),density:12,level:-24,placement:'ends'}],gift:'none'}},
 {id:'gaps',name:'Space Between',description:'Warm keys in the gaps. A little emotion.',recipe:{...defaults,timingScope:'layers-only',swing:50,layback:5,humanize:4,bounce:2,layers:[{...newLayer('keys'),density:12,level:-24}],gift:'none'}},
 {id:'velvet-room',name:'Subtle · Velvet Room',description:'Barely-there keys and air. Source groove stays fixed.',recipe:{...defaults,mode:'pocket',protectVocals:true,beatMode:'follow',timingScope:'layers-only',warmth:.5,bass:.5,air:.5,compression:1.3,peak:-3,width:1,vocal:4,saturation:0,swing:50,quantize:0,layback:3,humanize:2,bounce:1,velocity:4,accentPattern:'ends',layers:[{...newLayer('keys'),level:-30,density:8},{...newLayer('texture'),level:-32,density:10,placement:'ends'}],gift:'none',notes:'An intimate, barely-there lift. Leave breathing space around the lead; keys and texture should feel like part of the room. Keep all source timing and the arrangement intact.'}},
 {id:'lazy-sunday',name:'Subtle · Lazy Sunday',description:'A soft shaker and a small, laid-back swing.',recipe:{...defaults,mode:'pocket',protectVocals:true,beatMode:'follow',target:'percussion',warmth:1,bass:1,air:.5,compression:1.5,peak:-3,width:2,vocal:5,saturation:0,swing:54,quantize:8,layback:8,humanize:4,bounce:3,velocity:6,attack:-1,sustain:-.5,accentPattern:'follow',layers:[{...newLayer('shaker'),level:-28,density:20,placement:'under',pan:10}],gift:'none',notes:'Relaxed, understated pocket. Use a quiet shaker to support the existing groove; retain the arrangement and let the lead breathe. Keep the kick and bass timing anchored.'}},
 {id:'big-beat-riot',name:'Extreme · Big-Beat Riot',description:'Heavy accents, syncopated drums and punchy layers.',recipe:{...defaults,mode:'rebuild',protectVocals:true,beatMode:'follow',target:'drums',warmth:2,bass:3,air:1.5,compression:3.5,peak:-1.9,width:6,vocal:7,saturation:2,swing:58,quantize:30,layback:8,humanize:5,bounce:10,velocity:18,attack:2,sustain:-1.5,accentPattern:'syncopated',layers:[{...newLayer('hat'),level:-14,density:60,placement:'under',pan:-12},{...newLayer('rim'),level:-16,density:30,placement:'ends',pan:10},{...newLayer('mallet'),level:-18,density:25}],gift:'none',notes:'Bold big-beat and funk transformation: rebuild the eligible drum accents into a recognisable four-bar call-and-response, with strong drops and returns around the hook. Keep the kick anchored and the vocal fixed. Make the impact come from contrast, punch and musical accents; avoid audible clipping, fuzz, glitch cuts and random jitter.'}},
 {id:'opera-voltage',name:'Extreme · Opera Voltage',description:'French-electro weight. Dramatic strings answer the lead.',recipe:{...defaults,mode:'rebuild',protectVocals:true,beatMode:'follow',timingScope:'layers-only',warmth:3.5,bass:3,air:2.5,compression:2.8,peak:-1.9,width:5,vocal:8,saturation:0,swing:51,quantize:0,layback:6,humanize:12,bounce:10,velocity:18,accentPattern:'follow',layers:[{...newLayer('strings'),level:-5,density:50},{...newLayer('texture'),level:-18,density:20,placement:'ends'}],gift:'none',notes:'French electro drama meets live opera: bold bass weight, dramatic string answers and quiet-to-loud contrast around the existing lead. Keep all source timing, natural phrasing and the hook recognisable. Duck swells under the vocal; build intensity without fuzz or clipping. If harmony or instrument availability prevents new string notes, flag it and offer a clearly labelled source-derived harmonic swell instead of guessing a chord progression.'}}
];
const choices={mode:Object.keys(modes),target:['percussion','drums','drums-bass'],subdivision:['16th','8th','16th-triplet'],timingScope:['source-and-layers','layers-only'],beatMode:['follow','fixed'],accentPattern:['follow','offbeat','syncopated','ends'],stems:['none','four','vocal-inst','all'],quality:['balanced','high'],format:['wav24','cd','wav-mp3'],gift:['none','highlight','voice']};
const bound=(value,min,max,step,fallback)=>{const v=typeof value==='number'&&Number.isFinite(value)?value:fallback;return Number(Math.min(max,Math.max(min,Math.round((v-min)/step)*step+min)).toFixed(2));};
export function normalizeRecipe(input={}) {
 if(!input || typeof input!=='object' || Array.isArray(input)) throw Error('Recipe must be an object.');
 if(input.schema!==undefined && input.schema!==SCHEMA) throw Error('This is not a Juice Cans audio recipe.');
 if(input.version!==undefined && ![2,VERSION].includes(input.version)) throw Error('Unsupported recipe version. Use a version 2 or 3 export.');
 const r={...defaults};
 for(const [k,values] of Object.entries(choices)) if(values.includes(input[k])) r[k]=input[k];
 for(const c of [...controls,{id:'duration',min:16,max:72,step:1,value:20},{id:'bpm',min:30,max:300,step:.1,value:108},{id:'cycle',min:1,max:16,step:1,value:4},{id:'seed',min:0,max:999999,step:1,value:108}]) {
  const v=typeof input[c.id]==='number'&&Number.isFinite(input[c.id])?input[c.id]:c.value;
  r[c.id]=Number(Math.min(c.max,Math.max(c.min,Math.round((v-c.min)/c.step)*c.step+c.min)).toFixed(2));
 }
 r.protectVocals=typeof input.protectVocals==='boolean'?input.protectVocals:true;
 r.layerExports=typeof input.layerExports==='boolean'?input.layerExports:true;
 r.layers=Array.isArray(input.layers)?input.layers.slice(0,4).filter(x=>x&&Object.hasOwn(layerTypes,x.type)).map(x=>({type:x.type,level:bound(x.level,-36,-3,1,-18),density:bound(x.density,5,75,1,25),placement:Object.hasOwn(placements,x.placement)?x.placement:'gaps',pan:bound(x.pan,-50,50,1,0)})):[];
 for(const [k,max] of [['passage',300],['notes',2000]]) if(typeof input[k]==='string') r[k]=input[k].slice(0,max);
 return r;
}
export function generatePrompt(input) {
 const r=normalizeRecipe(input), signed=n=>`${n>0?'+':''}${n}`;
 const p=[`Take the supplied tracks. Analyse BPM and musical key, reporting uncertainty and half/double-time alternatives where relevant. Keep the originals untouched.`,`${modes[r.mode][0]} mode: ${modes[r.mode][2]}`];
 if(r.protectVocals) p.push('Preserve vocal timing, pitch and natural phrasing; exclude vocals from all groove edits.');
 for(const [id,desc] of [['warmth','broad low-mid warmth EQ'],['bass','bass EQ with tight low-end control'],['air','high-shelf air EQ with sibilance control']]) if(r[id]!==0) p.push(`Apply ${signed(r[id])} dB ${desc}; choose frequency and bandwidth after listening.`);
 p.push(r.compression===1?'Bypass added compression.':`Use musical compression at ${r.compression.toFixed(1)}:1, adapting threshold, attack and release to preserve transients; aim for gentle gain reduction and report actual settings.`);
 if(r.vocal) p.push(`Vocal clarity intent ${r.vocal}/10: improve intelligibility gently; avoid exposing separation artifacts.`);
 if(r.saturation) p.push(`Analog saturation intent ${r.saturation}/10, retaining transient definition.`);
 p.push(r.width?`Stereo widening intent ${r.width}/10; keep deep bass centred and verify mono compatibility.`:'Preserve original stereo width.');
 if(r.mode!=='polish') {
  p.push(r.timingScope==='layers-only'?'Apply the timing map only to newly added layers. Keep all source timing intact. Never apply blanket micro-warping to the stereo master.':`Groove edits apply only to ${r.target==='percussion'?'hats and percussion':r.target==='drums'?'drums, excluding the anchored kick':'drums and bass, excluding the anchored kick'}, and any new layers. Use usable isolated stems or MIDI; if unavailable, leave source timing intact and report the limitation. Never apply blanket micro-warping to the stereo master.`);
  p.push(r.beatMode==='fixed'?`Use ${r.bpm} BPM as the requested grid tempo, not a measured result. Check downbeat alignment and compatibility with the source before rendering; report drift and do not stretch protected source parts to fit.`:'Fit a robust local beat map to the source, following genuine tempo movement. Report beat/downbeat confidence; if unreliable, request a corrected anchor or keep timing intact. Do not invent a stable beat grid.');
  p.push(`${r.subdivision==='16th-triplet'?'Use a 1/16-triplet grid: six evenly spaced positions per quarter-note beat. Do not apply a swing percentage on top of the triplets.':`Use a ${r.subdivision}-note swing grid at ${r.swing}% (50% = straight); swing and shuffle are the same operation here.`} Grid correction ${r.quantize}% toward that grid, then layback ${r.layback} ms and phrase-aware timing variation bounded by ±${r.humanize} ms. Apply this as one coherent timing map; preserve related transients and avoid flams. Newly generated notes start on the chosen grid; correction only applies to pre-existing deviations.`);
  p.push(`Bounce and attitude intent ${r.bounce}/10 through accents and dynamics; prioritise pocket and listenability over random timing. ${r.protectVocals?'Keep vocals fixed.':'Keep vocal timing natural; no vocal chopping unless explicitly requested.'}`);
  if(r.layers.length){
   p.push(`Add these layers without replacing the original hook. Layer level is an audition starting point in dB relative to the source excerpt's integrated loudness, measured on each isolated rendered layer over the same excerpt; it is not peak normalisation. Density is a target share of eligible grid positions within the chosen placement, not a strict quota.`);
   for(const [i,l] of r.layers.entries())p.push(`Layer ${i+1}: ${layerTypes[l.type]}; relative level ${l.level} dB; density ${l.density}%; placement: ${placements[l.placement].toLowerCase()}; pan ${l.pan===0?'centre':Math.abs(l.pan)+'% '+(l.pan<0?'left':'right')}.`);
   const pattern={follow:'echo the existing accent pattern',offbeat:'emphasise offbeats',syncopated:'use restrained syncopated accents',ends:'reserve accents for phrase endings'};
   p.push(`For new MIDI layers, ${pattern[r.accentPattern]}. Build a ${r.cycle}-bar phrase-aware pattern with velocity variation bounded by ±${r.velocity} MIDI units, keeping velocities within 1–127. Use variation seed ${r.seed} for repeatable timing and dynamics; do not apply fresh random jitter on each render. Keep harmonic notes together.`);
   p.push('For pitched layers, follow the actual chord movement and register; inferred key alone is insufficient. If harmony is uncertain, flag it before adding notes. Keep additions subordinate to the vocal, leaving breathing space and gently ducking beneath the lead where needed. Use available instruments or licensed sounds and report what was used; do not claim an unavailable instrument was rendered.');
   if(r.layers.some(l=>['hat','shaker','rim','tambourine','click'].includes(l.type)))p.push(`On new percussion layers only, shape transient attack by ${signed(r.attack)} dB and sustain by ${signed(r.sustain)} dB relative to the unshaped layer; 0 dB bypasses that stage. Audition for clicks, clipping and flams; preserve the original transients.`);
   if(r.layerExports)p.push('Export each added layer as a separate aligned WAV plus the generated MIDI where applicable; include tempo/beat-map information for Logic. Preserve mix-relative layer levels, with no independent stem normalisation.');
  }
 }
 if(r.stems!=='none') {
  const outputs={four:'vocals, drums, bass and other', 'vocal-inst':'vocals and a complementary instrumental',all:'vocals, drums, bass and other, plus a separate instrumental mix'};
  p.push(`Export ${outputs[r.stems]}. ${r.quality==='high'?'Prefer BS-RoFormer + HTDemucs ensemble where supported and beneficial; audition and report the models actually used.':'Use a suitable single separation model and report it.'} Check bleed and artifacts; do not promise perfectly clean stems. Export all stems with identical start time, length and sample rate; the instrumental is an alternate mix, not an extra additive stem.`);
 }
 p.push(`For the listening master, use a true-peak ceiling of ${r.peak} dBTP; measure after final encoding and report integrated LUFS without forcing loudness. Keep individual stems aligned and unnormalised relative to one another.`);
 p.push({wav24:'Export 24-bit WAV at the source sample rate.',cd:'Export 16-bit / 44.1 kHz WAV for CD, dithering once at the final bit-depth reduction.', 'wav-mp3':'Export 24-bit WAV at the source sample rate plus a high-quality MP3 listening copy.'}[r.format]);
 if(r.gift!=='none') p.push(`Create a ${r.duration}-second emotional gift edit with musical boundaries and gentle fades. Passage direction: ${r.passage||'Choose a complete emotional phrase.'}${r.gift==='voice'?' Add an intimate overlay only from a supplied voice recording; if missing, request it.':''}`);
 p.push('First produce a 20-second preview and a loudness-matched comparison with the original; wait for listening approval before the full render. Add BPM, key, energy and mood metadata, distinguishing measured values from subjective tags. Keep everything warm, personal and musical.');
 if(r.notes.trim()) p.push(`Additional direction (flag conflicts with the recipe before processing): ${r.notes.trim()}`);
 return p.join('\n\n');
}
export function parseExport(text) {
 const data=JSON.parse(text);
 if(data?.schema!==SCHEMA || ![2,VERSION].includes(data.version)) throw Error('Choose a Juice Cans version 2 or 3 recipe JSON file.');
 if(!data.recipe || typeof data.recipe!=='object' || Array.isArray(data.recipe)) throw Error('Recipe settings are missing.');
 return {name:typeof data.name==='string'?data.name.slice(0,80):'Imported recipe',recipe:normalizeRecipe(data.recipe)};
}
