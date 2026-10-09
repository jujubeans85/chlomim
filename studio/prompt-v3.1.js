import {controls,defaults,modes,presets,normalizeRecipe,generatePrompt,parseExport,SCHEMA,VERSION,layerTypes,placements,newLayer} from './recipe-v3.mjs';
const $=id=>document.getElementById(id), KEY='juice-cans.audio-recipes.v3', OLD_KEY='juice-cans.audio-recipes.v2';
let recipe={...defaults}, saved=[], dirty=false, storageHealthy=true;
const notify=text=>{$('status').textContent=text;};
try { const current=localStorage.getItem(KEY), legacy=current===null?localStorage.getItem(OLD_KEY):null; const raw=JSON.parse(current??legacy??'[]'); if(!Array.isArray(raw)) throw Error(); saved=raw.map(x=>({id:String(x.id),name:String(x.name).slice(0,80),recipe:normalizeRecipe(x.recipe)})); if(legacy)notify('Your previous recipes are available. New saves use version 3; the old backup is untouched.'); }
catch { storageHealthy=false; notify('Saved recipes could not be read. Existing data has been left untouched. Export JSON to keep your work.'); }
function persist(next){try{if(!storageHealthy)throw Error();localStorage.setItem(KEY,JSON.stringify(next));saved=next;return true;}catch{notify('Browser storage unavailable. Export JSON to keep this recipe.');return false;}}
function refreshSaved(selected=''){$('saved').replaceChildren(new Option('Choose a saved recipe…',''),...saved.map(x=>new Option(x.name,x.id)));$('saved').value=selected;selection();}
function selection(){const yes=saved.some(x=>x.id===$('saved').value);for(const id of ['load','delete','update'])$(id).disabled=!yes;}
for(const p of presets){const b=document.createElement('button');b.className='preset';b.type='button';const strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=p.name;span.textContent=p.description;b.append(strong,span);b.onclick=()=>{if(!discard())return;recipe={...p.recipe};$('recipe-name').value=p.name;dirty=false;render();notify(`${p.name} loaded. Save it to keep your changes.`);};$('presets').append(b);}
for(const [id,[label,short]] of Object.entries(modes)){const b=document.createElement('button');b.type='button';b.className='mode';b.dataset.mode=id;b.innerHTML=`<strong>${label}</strong><span>${short}</span>`;b.onclick=()=>{recipe.mode=id;dirty=true;render();};$('modes').append(b);}
for(const c of controls){const div=document.createElement('div');div.className='control';div.innerHTML=`<div class="control-head"><label for="slider-${c.id}">${c.label}</label><div class="numeric"><input id="number-${c.id}" type="number" min="${c.min}" max="${c.max}" step="${c.step}" aria-label="${c.label} value" aria-describedby="hint-${c.id}"><span>${c.unit}</span></div></div><input id="slider-${c.id}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" aria-describedby="hint-${c.id}"><p class="hint" id="hint-${c.id}">${c.hint}</p>`;$(c.group+'-controls').append(div);for(const kind of ['slider','number']){const el=$(kind+'-'+c.id);el.addEventListener(kind==='slider'?'input':'change',()=>{const value=Number(el.value);if(!el.value||!Number.isFinite(value)){render();return;}recipe=normalizeRecipe({...recipe,[c.id]:value});dirty=true;render();});}}
function renderLayers(){
 const active=document.activeElement?.id;
 $('layers').replaceChildren();
 recipe.layers.forEach((layer,index)=>{
  const card=document.createElement('article');card.className='layer';
  const heading=document.createElement('div');heading.className='section-heading';
  const title=document.createElement('h3');title.textContent=`Layer ${index+1}`;
  const remove=document.createElement('button');remove.type='button';remove.className='quiet';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove layer ${index+1}`);remove.onclick=()=>{recipe.layers.splice(index,1);dirty=true;render();const next=document.getElementById(`layer-${Math.min(index,recipe.layers.length-1)}-type`);(next||$('add-layer')).focus();};heading.append(title,remove);card.append(heading);
  const grid=document.createElement('div');grid.className='select-grid';
  const fields=[['type','Sound',layerTypes],['placement','Placement',placements],['level','Relative level · dB',[-36,-3,1]],['density','Density · %',[5,75,1]],['pan','Pan · −left / +right %',[-50,50,1]]];
  for(const [key,labelText,spec] of fields){
   const label=document.createElement('label'),el=document.createElement(Array.isArray(spec)?'input':'select');label.textContent=labelText;el.id=`layer-${index}-${key}`;el.setAttribute('aria-label',`Layer ${index+1} ${labelText}`);
   if(Array.isArray(spec)){el.type='number';[el.min,el.max,el.step]=spec;}else for(const [value,text]of Object.entries(spec))el.add(new Option(text,value));
   el.value=layer[key];
   const updateLayer=()=>{if(el.type==='number'&&(!el.value||!Number.isFinite(Number(el.value))))return;recipe.layers[index][key]=el.type==='number'?Number(el.value):el.value;dirty=true;$('postprompt-textarea').value=generatePrompt(recipe);};
   el.addEventListener('input',updateLayer);
   el.addEventListener('change',()=>{updateLayer();recipe=normalizeRecipe(recipe);el.value=recipe.layers[index][key];});label.append(el);grid.append(label);
  }
  card.append(grid);$('layers').append(card);
 });
 $('empty-layers').hidden=recipe.layers.length>0;
 if(active?.startsWith('layer-'))document.getElementById(active)?.focus();
}
function render(){recipe=normalizeRecipe(recipe);for(const c of controls){$('slider-'+c.id).value=recipe[c.id];$('number-'+c.id).value=recipe[c.id];$('slider-'+c.id).setAttribute('aria-valuetext',`${recipe[c.id]} ${c.unit}`);}document.querySelectorAll('[data-field]').forEach(el=>{if(el.type==='checkbox')el.checked=recipe[el.dataset.field];else el.value=recipe[el.dataset.field];});document.querySelectorAll('[data-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.mode===recipe.mode)));$('mode-note').textContent=modes[recipe.mode][2];const polish=recipe.mode==='polish';for(const id of ['groove-fields','advanced-fields','layer-fields'])$(id).disabled=polish;$('add-layer').disabled=polish||recipe.layers.length>=4;$('target').disabled=recipe.timingScope==='layers-only';const triplet=recipe.subdivision==='16th-triplet';for(const kind of ['slider','number'])$(kind+'-swing').disabled=triplet;$('grid-note').textContent=triplet?'Triplets use six even positions per beat. Swing is held aside, not added on top.':'Swing and shuffle share one control. 50% is straight.';$('bpm-field').hidden=recipe.beatMode!=='fixed';$('bpm').disabled=recipe.beatMode!=='fixed';$('advanced-note').textContent=polish?'Polish keeps timing intact. These settings are retained but not applied.':'';$('layer-mode-note').textContent=polish?'Polish adds no sounds. Switch to Pocket or Rebuild to use layers.':'Additions follow the chosen grid. Choose “New layers only” above to preserve all source timing.';$('gift-fields').hidden=recipe.gift==='none';$('quality').disabled=recipe.stems==='none';renderLayers();$('postprompt-textarea').value=generatePrompt(recipe);}
$('add-layer').onclick=()=>{if(recipe.layers.length>=4||recipe.mode==='polish')return;recipe.layers.push(newLayer());dirty=true;render();document.getElementById(`layer-${recipe.layers.length-1}-type`).focus();};
$('recipe-form').onsubmit=e=>e.preventDefault();
document.querySelectorAll('[data-field]').forEach(el=>el.addEventListener(el.type==='number'?'change':'input',()=>{if(el.type==='number'&&!el.value){render();return;}recipe[el.dataset.field]=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value;dirty=true;if(el.tagName==='TEXTAREA'||el.id==='passage')$('postprompt-textarea').value=generatePrompt(recipe);else render();}));
$('recipe-name').oninput=()=>{dirty=true;};
function discard(){return !dirty||confirm('Replace your unsaved changes? Save a recipe first to keep them.');}
$('reset').onclick=()=>{if(!discard())return;recipe={...defaults};$('recipe-name').value='Gentle Pocket';dirty=false;render();notify('Reset to Gentle Pocket. Saved recipes are unchanged.');};
function name(){return $('recipe-name').value.trim().slice(0,80)||'Untitled recipe';}
$('save').onclick=()=>{const id=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;const next=[...saved,{id,name:name(),recipe:normalizeRecipe(recipe)}];if(persist(next)){dirty=false;refreshSaved(id);notify('Recipe saved in this browser.');}};
$('saved').onchange=selection;
$('load').onclick=()=>{const entry=saved.find(x=>x.id===$('saved').value);if(!entry||!discard())return;recipe={...entry.recipe};$('recipe-name').value=entry.name;dirty=false;render();notify('Saved recipe loaded.');};
$('update').onclick=()=>{const id=$('saved').value,entry=saved.find(x=>x.id===id);if(!entry||!confirm(`Replace saved recipe “${entry.name}” with current settings?`))return;if(persist(saved.map(x=>x.id===id?{id,name:name(),recipe:normalizeRecipe(recipe)}:x))){dirty=false;refreshSaved(id);notify('Saved recipe updated.');}};
$('delete').onclick=()=>{const entry=saved.find(x=>x.id===$('saved').value);if(!entry||!confirm(`Delete “${entry.name}” from this browser?`))return;if(persist(saved.filter(x=>x.id!==entry.id))){refreshSaved();notify('Saved recipe deleted. Current controls are unchanged.');}};
$('export').onclick=()=>{const data={schema:SCHEMA,version:VERSION,name:name(),recipe:normalizeRecipe(recipe),prompt:generatePrompt(recipe)};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=(name().replace(/[^a-z0-9_-]+/gi,'-')||'juice-cans')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Recipe JSON exported. Keep it as a backup or engine handoff.');};
$('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('Recipe file is too large (maximum 100 KB).');const data=parseExport(await file.text());if(!discard())return;recipe=data.recipe;$('recipe-name').value=data.name;dirty=true;render();notify('Recipe imported. Save it to keep it in this browser.');}catch(err){notify(err.message||'Could not import recipe.');}finally{e.target.value='';}};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(generatePrompt(recipe));notify('Prompt copied.');}catch{$('postprompt-textarea').focus();$('postprompt-textarea').select();notify('Select and copy the highlighted prompt using your browser’s Copy command.');}};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
refreshSaved();render();
