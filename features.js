/* Backup exchange and external-chat theme creation. */
const CalcFeatures=(()=>{
 'use strict';
 const SERVICES=[{id:'chatgpt',name:'ChatGPT',url:'https://chatgpt.com/'},{id:'claude',name:'Claude',url:'https://claude.ai/'},{id:'gemini',name:'Gemini',url:'https://gemini.google.com/'}];
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
 const button=(name,fn,cls='pill')=>{const b=el('button',cls,name);b.type='button';b.onclick=fn;return b};
 const label=(name,input)=>{const l=el('label','feature-label',name);l.append(input);return l};
 let app,exportBusy=false;
 const live=n=>{n.setAttribute('role','status');n.setAttribute('aria-live','polite');return n};
 function popup(title){
  const focused=document.activeElement,modal=el('div','sheet on theme-popup feature-popup'),panel=el('div','panel'),header=el('div','ph'),body=el('div','theme-body feature-body');
  modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',title);
  const blocked=[...document.querySelectorAll('body > .sheet,body > .app')].map(node=>({node,inert:node.inert,hidden:node.getAttribute('aria-hidden')}));focused?.blur();blocked.forEach(({node})=>{node.inert=true;node.setAttribute('aria-hidden','true')});
  const close=()=>{modal.remove();blocked.forEach(({node,inert,hidden})=>{node.inert=inert;if(hidden===null)node.removeAttribute('aria-hidden');else node.setAttribute('aria-hidden',hidden)});if(focused?.isConnected)focused.focus()};
  const done=button('Close',close);header.append(el('b','',title),done);panel.append(header,body);modal.append(panel);document.body.append(modal);
  modal.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const items=[...panel.querySelectorAll('button,input,select,textarea,a[href]')].filter(n=>!n.disabled&&!n.hidden&&n.getClientRects().length),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});done.focus();return {modal,panel,body,close};
 }
 function download(blob,name){const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
 function filePicker(onFile){const input=el('input');input.type='file';input.accept='.json,application/json';input.hidden=true;document.body.append(input);input.onchange=async()=>{try{if(input.files[0])await onFile(input.files[0])}finally{input.remove()}};input.addEventListener('cancel',()=>input.remove());input.click()}
 async function fileText(file){if(file.size>12000000)throw Error('Choose a backup smaller than 12 MB.');return file.text()}
 function status(n,msg,error=false){n.textContent=msg;n.classList.toggle('theme-error',error)}
 function exportBackup(n){
  if(exportBusy)return;exportBusy=true;
  try{const text=JSON.stringify(CalcData.backup(),null,2),date=new Date(),day=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');download(new Blob([text],{type:'application/json'}),'chunky-calculator-backup-'+day+'.json');status(n,'Backup exported.')}
  catch(err){status(n,'Backup could not be created: '+err.message,true)}finally{exportBusy=false}
 }
 function importBackup(n){filePicker(async file=>{
  try{const value=CalcData.parseBackup(await fileText(file)),settings=value.data.localStorage.cc_set,history=value.data.localStorage.cc_hist||[];
   if(!confirm('Replace this calculator’s saved settings, themes and history with this backup?\n\n'+(settings.customThemes?.length||0)+' custom themes · '+history.length+' calculations\n\nThis cannot be undone. Export your current data first if you want to keep it.'))return;
   CalcData.restore(value);status(n,'Backup restored. Reloading…');location.reload();
  }catch(err){status(n,err.message,true)}
 })}
 function backupControls(host){const controls=el('div','feature-actions'),message=live(el('p','feature-note'));controls.append(button('Export',()=>exportBackup(message),'chip'),button('Import',()=>importBackup(message),'chip'));host.append(controls,message)}
 function prompt(preferences){
  const defs=CalcThemes.properties,s=app.settings,colors=s.skin==='custom'?CalcThemes.palette(s.custom):CalcThemes.snapshot();
  return `Design a custom theme for my Chunky Calculator. My preferences:\n${preferences.trim()||'Create a thoughtful, balanced theme with readable text.'}\n\n`+
   `If I attach images, screenshots, inspiration pictures, logos, color palettes, or arrays of colors to THIS AI conversation, analyze and use them. Before designing, decide whether you need clarification. If attachments or colors are present and I have not specified a color policy, ask: “Do you want me to use only the colors from your attachments, or can I introduce additional complementary colors?” Wait for my answer when clarification is needed. If there are no attachments or color arrays, use my written preferences without requiring images.\n\n`+
   `The current calculator supports exactly the color properties below. Fill every required property. Optional individual-part properties override their inherited category; omit them unless an individual override is useful. All colors must be strings matching #RRGGBB (six hex digits, no alpha). The editor's Hue (0–360), Saturation (0–100), and Lightness (0–100) sliders convert to these colors; do not output slider properties. Gradients, transparency, fonts, font weights, geometry, radius, spacing, glow, hover/pressed styling and shadow dimensions are not editable in this version. They must stay unchanged. Shadow colors ARE editable where listed. Do not invent properties. Aim for readable contrast.\n\n`+
   `Chunky Theme Format version 1:\nRoot keys: format (exactly "chunky-theme"), version (integer 1), name (plain text, 1–40 characters), theme (the color object). No other root keys.\nTheme property definitions (generated from the calculator editor):\n${JSON.stringify(defs,null,2)}\n\n`+
   `Current palette as a complete valid example (change colors and name to satisfy my preferences):\n${JSON.stringify({format:'chunky-theme',version:1,name:'My new theme',theme:colors},null,2)}\n\n`+
   `You may briefly explain your design first. Finish with ONE clearly separated, copyable JSON code block containing the complete Chunky Theme object. Use valid JSON: no comments, no trailing commas, no JavaScript, no HTML, no executable code, no CSS declarations, no URLs, and no unsupported fields. Do not output multiple competing theme blocks. If clarification is needed first, ask before producing the final block.`;
 }
 function copyPrompt(text){
  const area=el('textarea','hex-input');area.value=text;area.readOnly=true;area.setAttribute('aria-hidden','true');area.style.cssText='position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none';document.body.append(area);area.focus();area.select();area.setSelectionRange(0,text.length);
  let copied=false;try{copied=document.execCommand('copy')}catch(_){}
  area.remove();if(copied)return Promise.resolve(true);
  if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text).then(()=>true,()=>false);
  return Promise.resolve(false);
 }
 function openAI(onSaved){
  const view=popup('AI Theme Generator'),{body}=view,service=el('select','hex-input'),preferences=el('textarea','hex-input'),message=live(el('p','feature-note')),importMessage=live(el('p','feature-note')),preview=el('div','ai-preview');
  SERVICES.forEach(s=>{const o=el('option','',s.name);o.value=s.id;service.append(o)});service.value='chatgpt';service.setAttribute('aria-label','AI Service');preferences.rows=4;preferences.maxLength=10000;preferences.placeholder='Dark aviation cockpit, with mostly blue and small orange accents…';preferences.setAttribute('aria-label','Describe the theme you want');
  const fallback=el('div'),go=button('Go to AI',async()=>{
   const selected=SERVICES.find(s=>s.id===service.value),full=prompt(preferences.value);fallback.replaceChildren();go.disabled=true;
   const copyTask=copyPrompt(full),tab=window.open(selected.url,'_blank');if(tab)try{tab.opener=null}catch(_){}
   const copied=await copyTask;
   if(copied)status(message,'Theme prompt copied. Paste it into '+selected.name+', and attach any inspiration images there.');
   else{status(message,'The AI opened, but iOS blocked automatic copying. Copy the prompt below.',true);const area=el('textarea','hex-input');area.rows=8;area.value=full;area.readOnly=true;area.setAttribute('aria-label','Generated theme prompt');fallback.append(area);area.focus();area.select()}
   if(!tab)location.assign(selected.url);else go.disabled=false;
  });
  function displayTheme(theme){
   preview.replaceChildren();status(importMessage,'Valid theme. Preview it before saving.');
   const title=el('h3','',theme.name),samples=el('div','ai-samples');samples.append(CalcThemes.sample(theme.theme),CalcThemes.sample(theme.theme,1));
   const actions=el('div','feature-actions');actions.append(button('Save Theme',()=>{
    try{const next=CalcThemes.savedSettings(app.settings,null,theme.name,theme.theme);CalcData.write('settings',next);Object.assign(app.settings,next);app.changed();view.close();if(typeof onSaved==='function')onSaved()}catch(err){status(importMessage,err.message,true)}
   }),button('Cancel',()=>{preview.replaceChildren();status(importMessage,'Preview canceled. Your saved theme is unchanged.')}));preview.append(title,samples,actions);preview.scrollIntoView({block:'nearest'});
  }
  function manualPaste(seed='',problem=''){
   const manual=popup('Paste Theme JSON');manual.modal.classList.add('theme-choice-popup','manual-paste-popup');
   const field=el('textarea','hex-input theme-json'),note=live(el('p','feature-note'));field.rows=8;field.maxLength=100000;field.spellcheck=false;field.autocapitalize='off';field.placeholder='Paste the Chunky Theme JSON here';field.value=seed;field.setAttribute('aria-label','Theme JSON');
   const previewManual=button('Preview Theme',()=>{try{const theme=CalcThemes.parseTheme(field.value);manual.close();displayTheme(theme)}catch(err){status(note,err.message,true);field.focus();field.select()}});
   manual.body.append(label('Theme JSON',field),previewManual,note);if(problem)status(note,problem,true);field.focus();field.select();
  }
  const pastePreview=button('Paste and Preview',async()=>{
   pastePreview.disabled=true;importMessage.textContent='';
   try{
    if(!navigator.clipboard?.readText)throw Error('Clipboard reading is unavailable.');
    const text=await navigator.clipboard.readText();if(!text.trim())throw Error('Your clipboard is empty.');
    try{displayTheme(CalcThemes.parseTheme(text))}catch(err){manualPaste(text,err.message)}
   }catch(err){manualPaste('',err.message||'Automatic paste was blocked. Paste the theme manually.')}
   finally{pastePreview.disabled=false}
  });
  body.append(label('AI Service',service),label('Describe the theme you want',preferences),go,message,fallback,el('hr'),el('h3','','Import AI Theme'),el('p','feature-note','Copy the final JSON block, then come back here.'),pastePreview,importMessage,preview);
 }
 function init(settings,changed){app={settings,changed};document.addEventListener('chunky-open-ai',openAI)}
 return {init,backupControls,openAI,prompt,SERVICES};
})();
