/* Backup, local icons and external-chat theme exchange share the existing theme system. */
const CalcFeatures=(()=>{
 'use strict';
 const SERVICES=[{id:'chatgpt',name:'ChatGPT',url:'https://chatgpt.com/'},{id:'claude',name:'Claude',url:'https://claude.ai/'},{id:'gemini',name:'Gemini',url:'https://gemini.google.com/'}];
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
 const button=(name,fn,cls='pill')=>{const b=el('button',cls,name);b.type='button';b.onclick=fn;return b};
 const label=(name,input)=>{const l=el('label','feature-label',name);l.append(input);return l};
 let app,exportedText=null,verifiedExport=false,exportBusy=false;
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
  try{
   const data=CalcData.backup(),text=JSON.stringify(data,null,2),date=new Date(),day=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
   exportedText=text;verifiedExport=false;download(new Blob([text],{type:'application/json'}),'chunky-calculator-backup-'+day+'.json');
   status(n,'Backup download requested. Save it to Files, then tap Verify Saved Backup and choose that file. Reinstall stays locked until it checks out.');
  }catch(err){exportedText=null;verifiedExport=false;status(n,'Backup could not be created: '+err.message,true)}finally{exportBusy=false}
 }
 function verifyBackup(n,after){
  if(!exportedText){status(n,'First use Export Everything in this session, then save the file.',true);return}
  filePicker(async file=>{try{const text=await fileText(file),value=CalcData.parseBackup(text),expected=CalcData.parseBackup(exportedText);
   if(JSON.stringify(value)!==JSON.stringify(expected))throw Error('Choose the exact backup you just exported in this session.');
   verifiedExport=true;status(n,'Backup verified. Your saved file opens correctly.');if(after)after();
  }catch(err){verifiedExport=false;status(n,err.message,true)}});
 }
 function importBackup(n){filePicker(async file=>{
  try{const value=CalcData.parseBackup(await fileText(file)),settings=value.data.localStorage.cc_set,history=value.data.localStorage.cc_hist||[];
   if(!confirm('Replace this calculator’s saved settings, themes, history and icon preferences with this backup?\n\n'+(settings.customThemes?.length||0)+' custom themes · '+history.length+' calculations\n\nThis cannot be undone. Export your current data first if you want to keep it.'))return;
   CalcData.restore(value);status(n,'Backup restored. Reloading…');location.reload();
  }catch(err){status(n,err.message,true)}
 })}
 function backupControls(host){
  const controls=el('div','feature-actions'),message=live(el('p','feature-note'));
  controls.append(button('Export Everything',()=>exportBackup(message),'chip'),button('Verify Saved Backup',()=>verifyBackup(message),'chip'),button('Import Backup',()=>importBackup(message),'chip'),button('Customize App Icon',openIcons,'chip'));
  host.append(controls,message);
 }
 function reinstall(host){
  const box=el('section','reinstall-guide'),message=live(el('p','feature-note'));
  box.append(el('h3','','On your iPhone'));
  if(!verifiedExport){
   box.append(el('p','','Keep your current app installed. Export Everything from that installed app and verify the saved file before any reinstall.'),message);
   const actions=el('div','feature-actions');actions.append(button('Export Everything',()=>exportBackup(message)),button('Verify Saved Backup',()=>verifyBackup(message,()=>{box.remove();reinstall(host)})));box.append(actions);host.append(box);return;
  }
  box.append(el('p','backup-verified','Backup verified this session. Keep that file until everything is restored.'));
  const list=el('ol');[
   'Export Everything from your currently installed Chunky Calculator.',
   'Confirm that the backup file was saved and passes Verify Saved Backup.',
   'Delete the existing Chunky Calculator Home Screen app.',
   'Open the normal Chunky Calculator website in Safari.',
   'Import your backup into the Safari version.',
   'Open Customize App Icon.',
   'Select one of the generated icons.',
   'Press Prepare App Icon.',
   'In Safari, tap Share → Add to Home Screen. Check that the preview shows your chosen icon; cancel if it does not.',
   'Make sure Open as Web App is enabled.',
   'Tap Add.',
   'Open your newly installed app.',
   'Import the SAME backup once more inside the installed app.'
  ].forEach(t=>list.append(el('li','',t)));box.append(list,el('p','feature-note','Safari and the installed Home Screen app may have separate storage. The second import restores your data inside the new app. Importing also restores the icon preference in that backup; it does not change an icon already installed by iOS.'));
  host.append(box);
 }
 function openIcons(){
  const {body}=popup('Customize App Icon'),s=app.settings,p=s.skin==='custom'?CalcThemes.palette(s.custom):CalcThemes.snapshot(),name=s.skin==='custom'?(s.customThemes.find(t=>t.id===s.customThemeId)?.name||'Custom'):s.skin[0].toUpperCase()+s.skin.slice(1);
  const intro=el('p','feature-note','Five icons from '+name+'. Made entirely on this device.'),grid=el('div','icon-grid'),message=live(el('p','feature-note')),actions=el('div','feature-actions'),guide=el('div');grid.setAttribute('role','group');grid.setAttribute('aria-label','App icon variations');
  let icons=[],selected=0;
  function draw(){grid.replaceChildren();icons.forEach((r,i)=>{const b=button('',()=>{selected=i;highlight()} ,'icon-choice'),img=el('img');img.src=CalcIcons.dataURL(r,192);img.alt='';b.setAttribute('aria-label','Icon variation '+(i+1));b.append(img,el('span','','Variation '+(i+1)));grid.append(b)});highlight()}
  function highlight(){[...grid.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)))}
  function regenerate(){icons=CalcIcons.generate(p,name);selected=0;draw()}
  const prepare=button('Prepare App Icon',async()=>{prepare.disabled=true;try{const r=icons[selected];await CalcIcons.install(r);CalcData.write('icon',r);status(message,'Icon prepared locally. Check the icon in Safari’s Add to Home Screen preview before adding. iOS may ignore locally generated icons on some versions.');guide.replaceChildren();reinstall(guide)}catch(err){status(message,'Could not prepare the icon: '+err.message,true)}finally{prepare.disabled=false}});
  actions.append(button('Regenerate',regenerate),prepare,button('Save Icon Image',()=>download(dataBlob(CalcIcons.dataURL(icons[selected],512)),'chunky-calculator-icon.png')));
  body.append(intro,grid,actions,message,el('p','feature-note','An already installed app keeps its existing iPhone icon. Nothing is uploaded. Safari decides which icon it accepts; this cannot be guaranteed for an entirely local icon.'),guide);regenerate();const saved=CalcData.read('icon');if(saved&&JSON.stringify(saved.colors)===JSON.stringify(p)){icons[saved.variant]=saved;selected=saved.variant;draw()}
 }
 function dataBlob(url){const bytes=Uint8Array.from(atob(url.split(',')[1]),c=>c.charCodeAt(0));return new Blob([bytes],{type:'image/png'})}
 function prompt(preferences){
  const defs=CalcThemes.properties,s=app.settings,colors=s.skin==='custom'?CalcThemes.palette(s.custom):CalcThemes.snapshot();
  return `Design a custom theme for my Chunky Calculator. My preferences:\n${preferences.trim()||'Create a thoughtful, balanced theme with readable text.'}\n\n`+
   `If I attach images, screenshots, inspiration pictures, logos, color palettes, or arrays of colors to THIS AI conversation, analyze and use them. Before designing, decide whether you need clarification. If attachments or colors are present and I have not specified a color policy, ask: “Do you want me to use only the colors from your attachments, or can I introduce additional complementary colors?” Wait for my answer when clarification is needed. If there are no attachments or color arrays, use my written preferences without requiring images.\n\n`+
   `The current calculator supports exactly the color properties below. Fill every required property. Optional individual-part properties override their inherited category; omit them unless an individual override is useful. All colors must be strings matching #RRGGBB (six hex digits, no alpha). The editor's Hue (0–360), Saturation (0–100), and Lightness (0–100) sliders convert to these colors; do not output slider properties. Gradients, transparency, fonts, font weights, geometry, radius, spacing, glow, hover/pressed styling and shadow dimensions are not editable in this version. They must stay unchanged. Shadow colors ARE editable where listed. Do not invent properties. Aim for readable contrast.\n\n`+
   `Chunky Theme Format version 1:\nRoot keys: format (exactly "chunky-theme"), version (integer 1), name (plain text, 1–40 characters), theme (the color object). No other root keys.\nTheme property definitions (generated from the calculator editor):\n${JSON.stringify(defs,null,2)}\n\n`+
   `Current palette as a complete valid example (change colors and name to satisfy my preferences):\n${JSON.stringify({format:'chunky-theme',version:1,name:'My new theme',theme:colors},null,2)}\n\n`+
   `You may briefly explain your design first. Finish with ONE clearly separated, copyable JSON code block containing the complete Chunky Theme object. Use valid JSON: no comments, no trailing commas, no JavaScript, no HTML, no executable code, no CSS declarations, no URLs, and no unsupported fields. Do not output multiple competing theme blocks. If clarification is needed first, ask before producing the final block.`;
 }
 function openAI(onSaved){
  const view=popup('AI Theme Generator'),{body}=view,state=CalcData.read('ai',{service:'chatgpt',preferences:'',importText:''}),service=el('select','hex-input'),preferences=el('textarea','hex-input'),paste=el('textarea','hex-input theme-json'),message=live(el('p','feature-note')),importMessage=live(el('p','feature-note')),preview=el('div','ai-preview');
  SERVICES.forEach(s=>{const o=el('option','',s.name);o.value=s.id;service.append(o)});service.value=state.service;service.setAttribute('aria-label','AI Service');preferences.rows=4;preferences.maxLength=10000;preferences.placeholder='Dark aviation cockpit, with mostly blue and small orange accents…';preferences.value=state.preferences;preferences.setAttribute('aria-label','Describe the theme you want');
  paste.rows=6;paste.maxLength=100000;paste.spellcheck=false;paste.autocapitalize='off';paste.value=state.importText;paste.placeholder='Paste the Chunky Theme JSON here';paste.setAttribute('aria-label','Import AI Theme');
  const saveDraft=()=>{try{CalcData.write('ai',{service:service.value,preferences:preferences.value,importText:paste.value})}catch(err){status(message,'Draft could not be saved: '+err.message,true)}};
  service.onchange=preferences.oninput=saveDraft;paste.oninput=()=>{saveDraft();preview.replaceChildren();importMessage.textContent=''};
  const fallback=el('div'),go=button('Go to AI',async()=>{
   const selected=SERVICES.find(s=>s.id===service.value),full=prompt(preferences.value);saveDraft();fallback.replaceChildren();
   // Reserve a window during the user gesture. Never send user text through a URL.
   const tab=window.open('about:blank','_blank');if(tab)tab.opener=null;
   try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(full);status(message,'Theme prompt copied. Upload any inspiration, screenshot, logo or palette images directly in '+selected.name+', then paste the copied prompt.');if(tab)tab.location.replace(selected.url);else status(message,message.textContent+' Tap Open '+selected.name+' below if the new tab was blocked.')}
   catch(_){if(tab)tab.close();status(message,'Automatic copying was blocked. Copy the prompt below, then open '+selected.name+'. Upload any inspiration or palette images there and paste your prompt.',true);const area=el('textarea','hex-input');area.rows=8;area.value=full;area.readOnly=true;area.setAttribute('aria-label','Generated theme prompt');fallback.replaceChildren(area);area.focus();area.select()}
   const link=el('a','pill','Open '+selected.name);link.href=selected.url;link.target='_blank';link.rel='noopener noreferrer';fallback.append(link);
  });
  const previewButton=button('Preview Theme',()=>{
   preview.replaceChildren();try{const theme=CalcThemes.parseTheme(paste.value);status(importMessage,'Valid theme. Preview it before saving.');
    const title=el('h3','',theme.name),samples=el('div','ai-samples');samples.append(CalcThemes.sample(theme.theme),CalcThemes.sample(theme.theme,1));
    const actions=el('div','feature-actions');actions.append(button('Save Theme',()=>{
     try{const next=CalcThemes.savedSettings(app.settings,null,theme.name,theme.theme);CalcData.write('settings',next);Object.assign(app.settings,next);app.changed();view.close();if(typeof onSaved==='function')onSaved()}catch(err){status(importMessage,err.message,true)}
    }),button('Cancel',()=>{preview.replaceChildren();status(importMessage,'Preview canceled. Your saved theme is unchanged.')}));preview.append(title,samples,actions);preview.scrollIntoView({block:'nearest'});
   }catch(err){status(importMessage,err.message,true)}
  });
  body.append(label('AI Service',service),label('Describe the theme you want',preferences),go,message,fallback,el('hr'),el('h3','','Import AI Theme'),el('p','feature-note','Copy the final JSON block from your chatbot and paste it below.'),label('Theme JSON',paste),previewButton,importMessage,preview);
 }
 function init(settings,changed){app={settings,changed};document.addEventListener('chunky-open-ai',openAI);const r=CalcData.read('icon');if(r)CalcIcons.install(r).catch(()=>{});navigator.serviceWorker?.addEventListener('controllerchange',()=>{const r=CalcData.read('icon');if(r)CalcIcons.install(r).catch(()=>{})})}
 return {init,backupControls,openAI,openIcons,prompt,SERVICES};
})();
