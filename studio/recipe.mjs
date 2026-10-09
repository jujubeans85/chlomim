// One versioned recipe feeds the controls, prompt and future engine adapter.
export const SCHEMA = 'juice-cans.audio-recipe';
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
 ['bounce','Bounce & attitude',0,10,1,3,'/10','Shape accents and dynamics to support the pocket.','groove']
].map(([id,label,min,max,step,value,unit,hint,group])=>({id,label,min,max,step,value,unit,hint,group}));
export const defaults = {schema:SCHEMA,version:2,mode:'pocket',protectVocals:true,target:'percussion',subdivision:'16th',stems:'all',quality:'high',format:'wav-mp3',gift:'highlight',duration:20,passage:'Choose a complete, emotional musical phrase.',notes:'',...Object.fromEntries(controls.map(c=>[c.id,c.value]))};
export const modes = {polish:['Polish','Keep the performance','Tone and dynamics only. Original timing and arrangement stay intact.'],pocket:['Pocket','Find the feel','Subtle movement on selected parts. Keep the arrangement and vocal phrasing.'],rebuild:['Rebuild','Big-beat energy','Allow rhythmic rearrangement and new accents. Keep the hook recognisable; no glitch edits unless requested.']};
export const presets = [
 {id:'gentle',name:'Gentle Pocket',description:'Warm bass. Relaxed feel. Your gentler pass.',recipe:{...defaults}},
 {id:'polish',name:'Clean & Warm',description:'Light finish. Original groove untouched.',recipe:{...defaults,mode:'polish',warmth:1,bass:1,air:.5,width:2,vocal:3,stems:'none',gift:'none'}},
 {id:'swagger',name:'Funk & Swagger',description:'Bigger accents. Controlled movement.',recipe:{...defaults,mode:'rebuild',warmth:1,bass:1.5,compression:2,width:4,saturation:2,target:'drums-bass',swing:56,quantize:15,layback:6,humanize:5,bounce:6,gift:'none'}}
];
const choices={mode:Object.keys(modes),target:['percussion','drums','drums-bass'],subdivision:['16th','8th'],stems:['none','four','vocal-inst','all'],quality:['balanced','high'],format:['wav24','cd','wav-mp3'],gift:['none','highlight','voice']};
export function normalizeRecipe(input={}) {
 if(!input || typeof input!=='object' || Array.isArray(input)) throw Error('Recipe must be an object.');
 if(input.schema!==undefined && input.schema!==SCHEMA) throw Error('This is not a Juice Cans audio recipe.');
 if(input.version!==undefined && input.version!==2) throw Error('Unsupported recipe version. Use a version 2 export.');
 const r={...defaults};
 for(const [k,values] of Object.entries(choices)) if(values.includes(input[k])) r[k]=input[k];
 for(const c of [...controls,{id:'duration',min:16,max:72,step:1,value:20}]) {
  const v=typeof input[c.id]==='number'&&Number.isFinite(input[c.id])?input[c.id]:c.value;
  r[c.id]=Number(Math.min(c.max,Math.max(c.min,Math.round((v-c.min)/c.step)*c.step+c.min)).toFixed(2));
 }
 r.protectVocals=typeof input.protectVocals==='boolean'?input.protectVocals:true;
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
  p.push(`Groove edits apply only to ${r.target==='percussion'?'hats and percussion':r.target==='drums'?'drums, excluding the anchored kick':'drums and bass, excluding the anchored kick'}. Use usable isolated stems or MIDI; if unavailable, leave source timing intact and report the limitation. Never apply blanket micro-warping to the stereo master.`);
  p.push(`Use a ${r.subdivision}-note swing grid at ${r.swing}% (50% = straight); swing and shuffle are the same operation here. Grid correction ${r.quantize}% toward that grid, then layback ${r.layback} ms and phrase-aware timing variation bounded by ±${r.humanize} ms. Apply this as one coherent timing map; preserve related transients and avoid flams.`);
  p.push(`Bounce and attitude intent ${r.bounce}/10 through accents and dynamics; prioritise pocket and listenability over random timing. ${r.protectVocals?'Keep vocals fixed.':'Keep vocal timing natural; no vocal chopping unless explicitly requested.'}`);
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
 if(data?.schema!==SCHEMA || data.version!==2) throw Error('Choose a Juice Cans version 2 recipe JSON file.');
 if(!data.recipe || typeof data.recipe!=='object' || Array.isArray(data.recipe)) throw Error('Recipe settings are missing.');
 return {name:typeof data.name==='string'?data.name.slice(0,80):'Imported recipe',recipe:normalizeRecipe(data.recipe)};
}
