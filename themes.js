/* Shared by the first-paint theme restore and the Settings editor. */
const CalcThemes=(()=>{
 const fields=[['bg','Background'],['panel','Keypad panel'],['screen','Display background'],['ink','Answer text'],['dim','History text'],['key','Number keys'],['keytx','Number text'],['fn','Function keys'],['fntx','Function text'],['op','Operator keys'],['optx','Operator text'],['ib','Settings button'],['ibtx','Settings icon'],['keyd','Number key shadows'],['fnd','Function key shadows'],['opd','Operator key shadows']];
 const defaults={bg:'#efe6d4',panel:'#e2d7c0',screen:'#1c1b19',ink:'#f4ecd8',dim:'#8d8672',key:'#faf4e6',keytx:'#2a2822',fn:'#d9ccb0',fntx:'#2a2822',op:'#ff7a3d',optx:'#ffffff',ib:'#3c3b38',ibtx:'#f4ecd8',keyd:'#cfc3a8',fnd:'#b3a583',opd:'#c4501c'};
 const styleFields=[
  {id:'keyGap',label:'Space between keys',min:4,max:24,step:1,default:12,unit:'px'},
  {id:'keyRadius',label:'Key roundness',min:6,max:40,step:1,default:20,unit:'px'},
  {id:'displayRadius',label:'Display roundness',min:12,max:56,step:1,default:32,unit:'px'},
  {id:'panelRadius',label:'Keypad roundness',min:14,max:56,step:1,default:30,unit:'px'},
  {id:'panelPadding',label:'Keypad padding',min:8,max:28,step:1,default:14,unit:'px'},
  {id:'layoutGap',label:'Display spacing',min:6,max:28,step:1,default:12,unit:'px'},
  {id:'displayHeight',label:'Display height',min:20,max:42,step:1,default:29,unit:'%'},
  {id:'keyFont',label:'Key text size',min:-8,max:16,step:1,default:0,unit:'size'},
  {id:'displayScale',label:'Display text size',min:70,max:150,step:5,default:100,unit:'%'},
  {id:'keyDepth',label:'Key depth',min:0,max:14,step:1,default:7,unit:'px'}
 ];
 const fontChoices=[
  ['rounded','Rounded'],['clean','Clean'],['bold','Heavy'],['condensed','Condensed'],
  ['geometric','Geometric'],['retro','Retro'],['classic','Classic serif'],['elegant','Elegant serif'],
  ['typewriter','Typewriter'],['mono','Monospace'],['handwritten','Handwritten'],['marker','Marker'],['friendly','Playful']
 ];
 const fontStacks={
  rounded:'ui-rounded,"SF Pro Rounded","Arial Rounded MT Bold","Nunito",system-ui,sans-serif',
  clean:'-apple-system,BlinkMacSystemFont,"Helvetica Neue","Segoe UI",system-ui,sans-serif',
  bold:'Impact,"Arial Black","Avenir Next Heavy",system-ui,sans-serif',
  condensed:'"Avenir Next Condensed","Arial Narrow","Helvetica Neue Condensed",sans-serif',
  geometric:'Futura,"Avenir Next","Century Gothic",sans-serif',
  retro:'Copperplate,Futura,"Arial Black",sans-serif',
  classic:'Georgia,"Times New Roman",serif',
  elegant:'Didot,"Bodoni 72","Bodoni MT",serif',
  typewriter:'"American Typewriter","Courier New",serif',
  mono:'"SFMono-Regular",Menlo,Consolas,"Liberation Mono",monospace',
  handwritten:'Noteworthy,"Bradley Hand","Segoe Print",cursive',
  marker:'"Marker Felt","Chalkboard SE","Comic Sans MS",cursive',
  friendly:'"Chalkboard SE","Comic Sans MS","Trebuchet MS",cursive'
 };
 const styleDefaults=Object.fromEntries([...styleFields.map(x=>[x.id,x.default]),['font','rounded']]);
 function appearance(value){
  const source=value&&typeof value==='object'&&!Array.isArray(value)?value:{},out={};
  styleFields.forEach(def=>{const n=Number(source[def.id]);out[def.id]=Number.isFinite(n)?Math.min(def.max,Math.max(def.min,Math.round(n/def.step)*def.step)):def.default});
  out.font=fontChoices.some(([id])=>id===source.font)?source.font:styleDefaults.font;return out;
 }
 function validateStyle(value){
  record(value,'Theme style');safeTree(value);only(value,[...styleFields.map(x=>x.id),'font'],'Theme style');
  styleFields.forEach(def=>{if(value[def.id]!==undefined&&(typeof value[def.id]!=='number'||!Number.isFinite(value[def.id])||value[def.id]<def.min||value[def.id]>def.max))throw Error(def.label+' must be between '+def.min+' and '+def.max+'.')});
  if(value.font!==undefined&&!fontChoices.some(([id])=>id===value.font))throw Error('Unknown font style.');return appearance(value);
 }
 const basicKeys=['AC','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','±','0','.','='],advancedKeys=['^','√','(',')','x²','x³','x⁻¹','π','sin','cos','tan','Deg','asin','acos','atan','abs','ln','log','e','!'];
 const targets=[
  {id:'canvas',name:'Outer background',selector:'.app',parts:{fill:['bg','background']}},
  {id:'display',name:'Display',selector:'.screen',parts:{fill:['screen','background']}},
  {id:'history',name:'History text',selector:'.tape',parts:{text:['dim','color']}},
  {id:'answer',name:'Answer',selector:'.main',parts:{text:['ink','color']}},
  {id:'expression',name:'Expression',selector:'.expr',parts:{text:['dim','color']}},
  {id:'panel',name:'Keypad panel',selector:'.pad',parts:{fill:['panel','background']}},
  {id:'gear',name:'Settings button',selector:'#gear',parts:{fill:['ib','background'],text:['ibtx','color'],shadow:['fnd','--part-shadow']}},
  {id:'bar',name:'Hold bar',selector:'#fx',parts:{fill:['fn','background'],text:['fntx','color'],shadow:['fnd','--sd']}}
 ];
 [basicKeys,advancedKeys].forEach((keys,mode)=>keys.forEach((k,i)=>{const group=mode?'fn':i%4===3?'op':i<3||i===16?'fn':'key';targets.push({id:(mode?'a':'b')+i,name:k+' key'+(mode?' (advanced)':''),mode,selector:(mode?'.advg':'.basic')+' [data-k="'+k+'"]',parts:{fill:[group,'background'],text:[group==='key'?'keytx':group==='fn'?'fntx':'optx','color'],shadow:[group==='key'?'keyd':group==='fn'?'fnd':'opd','--sd']}})}));
 const specifics=targets.flatMap(target=>Object.entries(target.parts).map(([part,[base,property]])=>({id:'part_'+target.id+'_'+part,name:target.name+' · '+part,base,property,target,part})));
 const specific=id=>specifics.find(x=>x.id===id),valueFor=(p,id)=>color(p&&p[id])||(specific(id)?p[specific(id).base]:defaults[id]);
 function color(value){
  if(typeof value!=='string')return null;
  let v=value.trim();if(/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(v))v='#'+v;
  if(/^#[0-9a-f]{3}$/i.test(v))v='#'+[...v.slice(1)].map(x=>x+x).join('');
  return /^#[0-9a-f]{6}$/i.test(v)?v.toLowerCase():null;
 }
 const palette=p=>Object.fromEntries([...fields.map(([k])=>[k,color(p&&p[k])||defaults[k]]),...specifics.filter(x=>color(p&&p[x.id])).map(x=>[x.id,color(p[x.id])])]);
 function timeline(read,write){const steps=[];return {get length(){return steps.length},clear(){steps.length=0},push(){const snapshot=JSON.stringify(read());if(steps.at(-1)!==snapshot)steps.push(snapshot)},undo(){if(steps.length)write(JSON.parse(steps.pop()))}}}
 // One definition source for the editor, AI contract, saved themes and backups.
 const builtins=['cream','night','black','white','mint'];
 const builtinNames={cream:'Cream',night:'Midnight',black:'Black',white:'White',mint:'Mint'};
 const builtinPalettes={
  cream:{...defaults},
  night:{bg:'#0e1020',panel:'#171a33',screen:'#080915',ink:'#e9ecff',dim:'#6b719e',key:'#2a2f5c',keyd:'#14183a',keytx:'#e9ecff',op:'#7c5cff',opd:'#4630b8',optx:'#ffffff',fn:'#3a4080',fnd:'#1d2150',fntx:'#e9ecff',ib:'#2b2c39',ibtx:'#e9ecff'},
  black:{bg:'#000000',panel:'#191919',screen:'#080808',ink:'#ffffff',dim:'#999999',key:'#333333',keyd:'#171717',keytx:'#ffffff',op:'#ff9500',opd:'#a85e00',optx:'#ffffff',fn:'#555555',fnd:'#2a2a2a',fntx:'#ffffff',ib:'#333333',ibtx:'#ffffff'},
  white:{bg:'#ffffff',panel:'#f1f1f3',screen:'#ffffff',ink:'#111111',dim:'#8e8e93',key:'#ffffff',keyd:'#d1d1d6',keytx:'#111111',op:'#ff9500',opd:'#c26f00',optx:'#ffffff',fn:'#e5e5ea',fnd:'#c7c7cc',fntx:'#111111',ib:'#f0f0f0',ibtx:'#111111'},
  mint:{bg:'#d7efe4',panel:'#bfe3d3',screen:'#12342b',ink:'#d9fff0',dim:'#5f9985',key:'#f2fffa',keyd:'#98c9b6',keytx:'#12342b',op:'#17b377',opd:'#0b7a50',optx:'#ffffff',fn:'#a9d8c5',fnd:'#7fb59f',fntx:'#12342b',ib:'#34564d',ibtx:'#d9fff0'}
 };
 const properties=Object.fromEntries([...fields.map(([id,label])=>[id,{label,type:'color',required:true}]),...specifics.map(x=>[x.id,{label:x.name,type:'color',required:false,inherits:x.base}])]);
 function record(value,label){if(!value||typeof value!=='object'||Array.isArray(value))throw Error(label+' must be a JSON object.');return value}
 function safeTree(value,depth=0){
  if(depth>20)throw Error('This file is nested too deeply.');
  if(value&&typeof value==='object')for(const key of Object.keys(value)){if(['__proto__','constructor','prototype'].includes(key))throw Error('Unsafe property: '+key);safeTree(value[key],depth+1)}
 }
 function only(value,keys,label){record(value,label);for(const key of Object.keys(value))if(!keys.includes(key))throw Error(label+': unsupported property “'+key+'”.')}
 function validatePalette(value,complete=true){
  record(value,'Theme');safeTree(value);const out={};
  for(const [key,v] of Object.entries(value)){if(!Object.hasOwn(properties,key))throw Error('Unsupported theme property: '+key);if(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v))throw Error(properties[key].label+' needs a six-digit hex color, such as #123ABC.');out[key]=v.toLowerCase()}
  if(complete)for(const [key,def] of Object.entries(properties))if(def.required&&!Object.hasOwn(out,key))throw Error('Missing '+def.label+' ('+key+').');
  return out;
 }
 function themeBlock(value){
  safeTree(value);only(value,['format','version','name','theme'],'Theme block');
  if(value.format!=='chunky-theme')throw Error('Expected a Chunky Theme JSON block.');
  if(value.version!==1)throw Error('Theme version '+value.version+' is not supported. This app supports version 1.');
  if(typeof value.name!=='string'||!value.name.trim()||value.name.length>40||/[<>\x00-\x1f]/.test(value.name))throw Error('Use a plain theme name between 1 and 40 characters.');
  return {format:'chunky-theme',version:1,name:value.name.trim(),theme:validatePalette(value.theme)};
 }
 function parseTheme(text){
  if(typeof text!=='string'||text.length>100000)throw Error('Paste one theme JSON block under 100 KB.');
  text=text.trim();const fenced=text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);if(fenced)text=fenced[1];
  let value;try{value=JSON.parse(text)}catch(_){throw Error('That is not valid JSON. Copy only the final Chunky Theme block.')}return themeBlock(value);
 }
 function deleteTheme(s,id){
  if(builtins.includes(id)){
   const deleted=[...new Set([...(s.deletedBuiltins||[]),id])],overrides={...(s.builtinOverrides||{})};delete overrides[id];
   const next={...s,deletedBuiltins:deleted,builtinOverrides:overrides};
   if(s.skin===id){const fallback=builtins.find(x=>!deleted.includes(x)),custom=s.customThemes[0];if(fallback){next.skin=fallback;delete next.customThemeId;delete next.custom;delete next.customStyle}else if(custom){next.skin='custom';next.customThemeId=custom.id;next.custom={...custom.colors};next.customStyle=appearance(custom.style)}else{next.skin='cream';delete next.customThemeId;delete next.custom;delete next.customStyle}}
   return next;
  }
  if(!s.customThemes.some(t=>t.id===id))throw Error('Only saved themes can be deleted.');
  const next={...s,customThemes:s.customThemes.filter(t=>t.id!==id)};
  if(s.customThemeId===id){const fallback=builtins.find(x=>!(s.deletedBuiltins||[]).includes(x)),custom=next.customThemes[0];if(fallback){next.skin=fallback;delete next.customThemeId;delete next.custom;delete next.customStyle}else if(custom){next.skin='custom';next.customThemeId=custom.id;next.custom={...custom.colors};next.customStyle=appearance(custom.style)}else{next.skin='cream';delete next.customThemeId;delete next.custom;delete next.customStyle}}
  return next;
 }
 function deleteElement(p,id){if(!specific(id)||!Object.hasOwn(p,id))throw Error('This part has no custom override.');const next={...p};delete next[id];return next}
 function restore(s){
  s.customThemes=(Array.isArray(s.customThemes)?s.customThemes:[]).filter(t=>t&&typeof t.id==='string'&&typeof t.name==='string').map(t=>({id:t.id,name:t.name.slice(0,40),colors:palette(t.colors),style:appearance(t.style)}));
  s.deletedBuiltins=[...new Set((Array.isArray(s.deletedBuiltins)?s.deletedBuiltins:[]).filter(id=>builtins.includes(id)))];
  s.builtinOverrides=Object.fromEntries(Object.entries(s.builtinOverrides&&typeof s.builtinOverrides==='object'?s.builtinOverrides:{}).filter(([id,t])=>builtins.includes(id)&&t&&typeof t.name==='string').map(([id,t])=>[id,{name:t.name.slice(0,40),colors:palette(t.colors),style:appearance(t.style)}]));
  if(!s.customThemes.length&&s.custom){const t={id:'legacy-custom',name:'My theme',colors:palette(s.custom),style:appearance(s.customStyle)};s.customThemes.push(t);if(s.skin==='custom')s.customThemeId=t.id}
  const active=s.customThemes.find(t=>t.id===s.customThemeId);
  if(s.skin==='custom'&&active){s.custom={...active.colors};s.customStyle=appearance(active.style)}
  if(s.skin!=='custom'&&!builtins.includes(s.skin))s.skin='cream';
  if(s.skin!=='custom')delete s.customStyle;
  return s;
 }
 function savedSettings(s,id,name,colors,style){
  name=name.trim();if(!name)throw Error('Give your theme a name.');
  if(s.customThemes.some(t=>t.id!==id&&t.name.toLowerCase()===name.toLowerCase()))throw Error('That name is already used. Choose another name.');
  const t={id:id||('theme-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)),name:name.slice(0,40),colors:palette(colors),style:appearance(style)};
  return {...s,skin:'custom',customThemeId:t.id,custom:{...t.colors},customStyle:{...t.style},customThemes:[...s.customThemes.filter(x=>x.id!==t.id),t]};
 }
 function apply(s){
  const root=document.documentElement,raw=s.skin==='custom'?s.custom:s.builtinOverrides?.[s.skin]?.colors,p=palette(raw),rawStyle=s.skin==='custom'?s.customStyle:s.builtinOverrides?.[s.skin]?.style,a=appearance(rawStyle);
  root.dataset.skin=s.skin;root.dataset.font=a.font;
  fields.forEach(([k])=>{if(raw)root.style.setProperty('--'+k,p[k]);else root.style.removeProperty('--'+k)});
  const styleVars={'--key-gap':a.keyGap+'px','--key-radius':a.keyRadius+'px','--display-radius':a.displayRadius+'px','--panel-radius':a.panelRadius+'px','--panel-padding':a.panelPadding+'px','--layout-gap':a.layoutGap+'px','--display-height':a.displayHeight+'%','--key-font-add':a.keyFont+'px','--display-font-scale':a.displayScale/100,'--key-depth':a.keyDepth+'px','--app-font':fontStacks[a.font]};
  Object.entries(styleVars).forEach(([key,value])=>root.style.setProperty(key,value));
  if(document.getElementById){let style=document.getElementById('specific-theme-colors');if(!style){style=document.createElement('style');style.id='specific-theme-colors';document.head.append(style)}style.textContent=raw?specifics.filter(x=>color(raw[x.id])).map(x=>x.target.selector+':not(.hot){'+x.property+':'+p[x.id]+'}').join('\n'):''}
 }
 function snapshot(){const css=getComputedStyle(document.documentElement);return Object.fromEntries(fields.map(([k])=>[k,color(css.getPropertyValue('--'+k))||defaults[k]]))}
 function toHsl(hex){
  const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo,l=(hi+lo)/2;
  const s=d?d/(1-Math.abs(2*l-1)):0;let h=0;
  if(d)h=60*(hi===r?((g-b)/d+6)%6:hi===g?(b-r)/d+2:(r-g)/d+4);
  return [Math.round(h),Math.round(s*100),Math.round(l*100)];
 }
 function fromHsl(h,s,l){
  s/=100;l/=100;const a=s*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0')};
  return '#'+f(0)+f(8)+f(4);
 }
 const soft=(h)=>({bg:fromHsl(h,30,93),panel:fromHsl(h,25,86),screen:fromHsl(h,17,22),ink:fromHsl(h,40,95),dim:fromHsl(h,20,70),key:fromHsl(h,35,97),keytx:fromHsl(h,22,23),fn:fromHsl(h,28,80),fntx:fromHsl(h,22,23),op:fromHsl(h,34,69),optx:fromHsl(h,28,16),ib:fromHsl(h,16,32),ibtx:fromHsl(h,40,95),keyd:fromHsl(h,20,77),fnd:fromHsl(h,22,65),opd:fromHsl(h,27,51)});
 const presets=[['Blush',soft(350)],['Sage',soft(135)],['Lavender',soft(265)],['Sand',soft(38)],['Sky',soft(205)]];
 const element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e};
 function sample(p,mode=0,interactive=false,look){
  const el=element,root=el('div','mini-calc'+(interactive?' pick-calc':'')),a=appearance(look);root.dataset.target='canvas';
  fields.forEach(([k])=>root.style.setProperty('--'+k,p[k]));
  const previewVars={'--preview-font':fontStacks[a.font],'--preview-key-gap':Math.max(2,a.keyGap*.42)+'px','--preview-key-radius':Math.max(3,a.keyRadius*.34)+'px','--preview-display-radius':Math.max(6,a.displayRadius*.38)+'px','--preview-panel-radius':Math.max(7,a.panelRadius*.4)+'px','--preview-panel-padding':Math.max(4,a.panelPadding*.43)+'px','--preview-layout-gap':Math.max(3,a.layoutGap*.5)+'px','--preview-key-font':Math.max(8,12+a.keyFont*.2)+'px','--preview-pick-key-font':Math.max(12,18+a.keyFont*.35)+'px','--preview-answer-font':27*a.displayScale/100+'px','--preview-pick-answer-font':34*a.displayScale/100+'px','--preview-key-depth':Math.max(0,a.keyDepth*.3)+'px','--preview-display-height':Math.max(48,64+(a.displayHeight-29)*1.2)+'px','--preview-pick-display-height':Math.max(68,88+(a.displayHeight-29)*2)+'px'};
  Object.entries(previewVars).forEach(([key,value])=>root.style.setProperty(key,value));
  const node=(tag,cls,text,id)=>{const n=el(tag,cls,text);n.dataset.target=id;return n};
  const screen=node('div','mini-screen','','display'),history=node('div','mini-history','24 × 5 = 120','history'),expression=node('div','mini-expression','24 × 5 =','expression'),answer=node('div','mini-answer','120','answer');screen.append(history,expression,answer);
  const pad=node('div','mini-pad','','panel'),gear=node('span','mini-gear','','gear');gear.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.56-1.03H3v-4h.08A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1.03-1.56V3h4v.08A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.56 1.03H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z"/></svg>';pad.append(gear,node('span','mini-key fn fx-sample','ƒ(x) hold & slide','bar'));
  (mode?advancedKeys:basicKeys).forEach((k,i)=>pad.append(node('span','mini-key'+(mode?' fn':i%4===3?' op':i<3||i===16?' fn':''),k,(mode?'a':'b')+i)));
  root.append(screen,pad);
  // Inline colors here use the same saved targets as the actual calculator.
  [root,...root.querySelectorAll('[data-target]')].forEach(n=>{const t=targets.find(t=>t.id===n.dataset.target);Object.entries(t.parts).forEach(([part,[base]])=>{const v=p['part_'+t.id+'_'+part];if(v)n.style.setProperty(part==='fill'?'background':part==='text'?'color':'--mini-shadow',v)})});
  if(!interactive){root.setAttribute('role','img');root.setAttribute('aria-label','Live calculator color preview')}
  return root;
 }
 function nearest(items,current,direction){
  const from=items.find(x=>x.id===current);if(!from)return items[0];
  const axis=direction==='left'||direction==='right'?'x':'y',cross=axis==='x'?'y':'x',sign=direction==='left'||direction==='up'?-1:1;
  return items.filter(x=>x.id!==current&&(x[axis]-from[axis])*sign>2).sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)+Math.abs(a[cross]-from[cross])*2-Math.hypot(b.x-from.x,b.y-from.y)-Math.abs(b[cross]-from[cross])*2)[0];
 }
 function pickElement(p,current,onConfirm,look,onClose){
  const el=element,focused=document.activeElement,modal=el('div','sheet on theme-popup element-popup'),panel=el('div','panel'),header=el('div','ph'),cancel=el('button','pill','Cancel'),confirm=el('button','pill','Confirm');
  modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Pick a calculator part');cancel.type=confirm.type='button';
  const modeRow=el('div','pick-modes'),body=el('div','pick-body'),footer=el('div','pick-footer'),name=el('div','pick-name'),parts=el('div','pick-parts');name.setAttribute('aria-live','polite');
  header.append(cancel,modeRow,confirm);footer.append(name,parts);panel.append(header,el('p','pick-hint','Tap the part you want to customize.'),body,footer);modal.append(panel);document.body.append(modal);
  let chosen=specific(current),target=chosen?chosen.target:targets.find(t=>t.id==='b4'),part=chosen?chosen.part:'fill',mode=target.mode||0,calc;
  const close=()=>{modal.remove();if(focused&&focused.isConnected)focused.focus();if(onClose)onClose()};
  const modeButtons=[0,1].map(m=>{const b=el('button','pill',m?'Advanced keys':'Basic keys');b.type='button';b.onclick=()=>{mode=m;if(target.mode!==undefined&&target.mode!==mode){target=targets.find(t=>t.id===(m?'a0':'b0'));part='fill'}draw()};modeRow.append(b);return b});
  function select(t){target=t;if(!target.parts[part])part=Object.keys(target.parts)[0];highlight()}
  function highlight(){
   for(const n of [calc,...calc.querySelectorAll('[data-target]')])n.classList.toggle('pick-selected',n.dataset.target===target.id);
   name.textContent=target.name;parts.replaceChildren();Object.keys(target.parts).forEach(p=>{const b=el('button','pill',p==='fill'?'Fill':p==='text'?'Text / icon':'Shadow');b.type='button';b.setAttribute('aria-pressed',String(part===p));b.onclick=()=>{part=p;highlight()};parts.append(b)})
  }
  function draw(){calc=sample(p,mode,true,look);body.replaceChildren(calc);calc.onclick=e=>{const n=e.target.closest('[data-target]');if(n)select(targets.find(t=>t.id===n.dataset.target))};modeButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(mode===i)));highlight()}
  function move(direction){const items=[calc,...calc.querySelectorAll('[data-target]')].map(n=>{const r=n.getBoundingClientRect();return {id:n.dataset.target,x:r.left+r.width/2,y:r.top+r.height/2,node:n}}),next=nearest(items,target.id,direction);if(next){select(targets.find(t=>t.id===next.id));next.node.scrollIntoView({block:'nearest',inline:'nearest'})}}
  cancel.onclick=close;confirm.onclick=()=>{onConfirm('part_'+target.id+'_'+part);close()};
  modal.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close()}const d={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[e.key];if(d){e.preventDefault();move(d)}if(e.key==='Tab'){const buttons=[...panel.querySelectorAll('button')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus()}}});
  draw();cancel.focus();
 }
 function editor(host,s,onChange,beforeChange=()=>{},hooks={}){
  const el=element,box=el('section','custom-editor');box.setAttribute('aria-label','Custom theme editor');
  const preview=el('div','mini-preview'),colorPane=el('section','editor-pane color-pane'),layoutPane=el('section','editor-pane layout-pane');layoutPane.hidden=true;
  box.append(preview);colorPane.append(el('p','','Pick a soft palette, adjust a group, or choose one specific part. Save when you’re happy with it.'));
  const presetsRow=el('div','custom-presets');
  presets.forEach(([name,p])=>{const b=el('button','',name);b.type='button';b.onclick=()=>{finish();beforeChange();s.custom={...p};commit();sync()};presetsRow.append(b)});colorPane.append(presetsRow);
  const controls=el('div','color-controls'),part=el('select');part.setAttribute('aria-label','Calculator element');
  const label=(name,input)=>{const l=el('label','',name);l.append(input);return l};
  const selectRow=el('div','part-select-row'),selectPart=el('button','pill','Select');selectPart.type='button';selectPart.setAttribute('aria-label','Select a specific element');selectRow.append(part,selectPart);controls.append(label('Choose a part',selectRow));
  const reuse=el('div','reuse-colors'),individual=el('div','reuse-colors individual-colors'),individualLabel=el('p','','Individual parts');reuse.setAttribute('aria-label','Reusable element colors');individual.setAttribute('aria-label','Reusable individual colors');controls.append(el('p','','Reuse a color · one per element'),reuse,individualLabel,individual);
  const swatches=[];
  function swatch(key,name,host){const b=el('button','color-swatch');b.type='button';b.dataset.element=key;b.onclick=()=>{finish();update(valueFor(palette(s.custom),key));finish()};host.append(b);swatches.push({key,name,b})}
  fields.forEach(([key,name])=>swatch(key,name,reuse));
  const row=el('div','color-entry'),picker=el('input'),hex=el('input','hex-input');picker.type='color';picker.setAttribute('aria-label','Color picker');hex.type='text';hex.maxLength=7;hex.spellcheck=false;hex.autocomplete='off';hex.setAttribute('aria-label','Hex color');
  row.append(picker,label('Hex color',hex));controls.append(row);
  const ranges=['Hue','Saturation','Lightness'].map((name,i)=>{const input=el('input');input.type='range';input.min=0;input.max=i?100:360;input.step=1;input.setAttribute('aria-label',name);controls.append(label(name,input));return input});
  const hint=el('p','','Lower saturation for muted tones. Raise lightness for pastels.');hint.setAttribute('aria-live','polite');controls.append(hint);
  const layout=el('section','layout-controls'),layoutTitle=el('h3','','Shape, spacing & type'),layoutHint=el('p','','These controls change the whole calculator for this theme.'),fontSelect=el('select'),fontLabel=el('label','style-font-label','Font style');
  fontChoices.forEach(([id,name])=>{const option=el('option','',name);option.value=id;fontSelect.append(option)});fontSelect.setAttribute('aria-label','Font style');fontLabel.append(fontSelect);layout.append(layoutTitle,layoutHint,fontLabel);
  const layoutInputs=new Map();
  const formatStyle=(def,value)=>def.unit==='size'?(100+value*3)+'%':value+def.unit;
  styleFields.forEach(def=>{const row=el('label','layout-control'),head=el('span','layout-control-head'),title=el('span','',def.label),value=el('output'),input=el('input');input.type='range';input.min=def.min;input.max=def.max;input.step=def.step;input.setAttribute('aria-label',def.label);head.append(title,value);row.append(head,input);layout.append(row);layoutInputs.set(def.id,{input,value,def})});
  colorPane.append(controls);layoutPane.append(layout);box.append(colorPane,layoutPane);host.append(box);
  let active='bg',editing=false,styleEditing=false;
  function finish(){editing=styleEditing=false}
  function options(){
   const extras=specifics.filter(x=>s.custom[x.id]);part.replaceChildren();
   const option=(value,name)=>{const o=el('option','',name);o.value=value;part.append(o)};
   fields.forEach(([key,name])=>option(key,name));extras.forEach(x=>option(x.id,x.name));
   if(specific(active)&&!s.custom[active])active=specific(active).base;part.value=active;
   individual.replaceChildren();swatches.splice(fields.length);extras.forEach(x=>swatch(x.id,x.name,individual));individual.hidden=individualLabel.hidden=!extras.length;
  }
  function paintSwatches(){swatches.forEach(({key,name,b})=>{const v=valueFor(s.custom,key);b.style.background=v;b.title=name+': '+v;b.setAttribute('aria-label','Use '+name+' color '+v);b.setAttribute('aria-current',String(key===active))})}
  function commit(){s.custom=palette(s.custom);s.style=appearance(s.style);options();preview.replaceChildren(sample(s.custom,specific(active)?.target.mode||0,false,s.style));paintSwatches();onChange();if(hooks.selection)hooks.selection(active,Object.hasOwn(s.custom,active)&&!!specific(active))}
  function syncStyle(){const a=appearance(s.style);fontSelect.value=a.font;layoutInputs.forEach(({input,value,def},id)=>{input.value=a[id];value.textContent=formatStyle(def,a[id])})}
  function sync(){const v=valueFor(palette(s.custom),active);part.value=active;picker.value=v;hex.value=v;hex.removeAttribute('aria-invalid');paintSwatches();toHsl(v).forEach((n,i)=>ranges[i].value=n);syncStyle()}
  function update(v,sliders=false,preserveHex=false){if(valueFor(s.custom,active)===v)return;if(!editing){beforeChange();editing=true}s.custom={...palette(s.custom),[active]:v};commit();picker.value=v;if(!preserveHex)hex.value=v;hex.removeAttribute('aria-invalid');if(!sliders)toHsl(v).forEach((n,i)=>ranges[i].value=n)}
  function updateStyle(id,value){const current=appearance(s.style);if(current[id]===value)return;if(!styleEditing){beforeChange();styleEditing=true}s.style=appearance({...current,[id]:value});commit();syncStyle()}
  fontSelect.onchange=()=>{finish();beforeChange();s.style=appearance({...s.style,font:fontSelect.value});commit();syncStyle()};
  layoutInputs.forEach(({input},id)=>{input.oninput=()=>updateStyle(id,+input.value);input.onchange=finish;input.onblur=finish});
  selectPart.onclick=()=>{finish();part.blur?.();pickElement(palette(s.custom),active,id=>{if(!s.custom[id]){beforeChange();s.custom[id]=valueFor(s.custom,id)}active=id;commit();sync()},s.style)};
  part.onchange=()=>{finish();active=part.value;preview.replaceChildren(sample(s.custom,specific(active)?.target.mode||0,false,s.style));sync();if(hooks.selection)hooks.selection(active,Object.hasOwn(s.custom,active)&&!!specific(active))};
  picker.oninput=()=>update(picker.value);picker.onchange=finish;picker.onblur=finish;
  hex.oninput=()=>{const v=color(hex.value);if(v){update(v,false,true);hint.textContent='Preview updated.'}else{hex.setAttribute('aria-invalid','true');hint.textContent='Enter a hex color, such as #D8C5E8.'}};
  hex.onchange=()=>{const v=color(hex.value);if(v)hex.value=v;finish()};hex.onblur=finish;
  ranges.forEach(r=>{r.oninput=()=>update(fromHsl(...ranges.map(x=>+x.value)),true);r.onchange=finish;r.onblur=finish});
  commit();sync();
  return {get active(){return active},refresh(){finish();commit();sync()},showPane(kind){colorPane.hidden=kind!=='color';layoutPane.hidden=kind!=='layout'}};
 }
 function manager(host,s,onChange,services={}){
  const el=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
  const wrap=el('div');wrap.className='theme-manager';const grid=el('div');grid.className='sws theme-library';
  let activeId=s.skin==='custom'?s.customThemeId:s.skin;
  const themes=[
   ...builtins.filter(id=>!(s.deletedBuiltins||[]).includes(id)).map(id=>({id,name:s.builtinOverrides?.[id]?.name||builtinNames[id],colors:s.builtinOverrides?.[id]?.colors||builtinPalettes[id],style:s.builtinOverrides?.[id]?.style||styleDefaults,builtin:true})),
   ...s.customThemes.map(t=>({...t,style:appearance(t.style),builtin:false}))
  ];
  const colorGrid=colors=>{
   const p=palette(colors),areas={};
   const add=(specificId,base,weight)=>{const shade=color(p[specificId])||color(p[base]);if(shade)areas[shade]=(areas[shade]||0)+weight};
   add('part_canvas_fill','bg',8);add('part_panel_fill','panel',12);add('part_display_fill','screen',25);
   add('part_answer_text','ink',2);add('part_history_text','dim',1);add('part_expression_text','dim',1);
   add('part_gear_fill','ib',1);add('part_gear_text','ibtx',.3);add('part_gear_shadow','fnd',.5);
   add('part_bar_fill','fn',1.5);add('part_bar_text','fntx',.4);add('part_bar_shadow','fnd',.6);
   const groups=basicKeys.map((_,i)=>i%4===3?'op':i<3||i===16?'fn':'key'),counts={key:0,fn:0,op:0};groups.forEach(group=>counts[group]++);
   const fillWeight={key:18,fn:7,op:10},textWeight={key:1.5,fn:.75,op:.75},shadowWeight={key:3,fn:1.5,op:1.5};
   groups.forEach((group,index)=>{add('part_b'+index+'_fill',group,fillWeight[group]/counts[group]);add('part_b'+index+'_text',group==='key'?'keytx':group==='fn'?'fntx':'optx',textWeight[group]/counts[group]);add('part_b'+index+'_shadow',group==='key'?'keyd':group==='fn'?'fnd':'opd',shadowWeight[group]/counts[group])});
   const list=Object.entries(areas).sort((a,b)=>b[1]-a[1]).slice(0,10);if(!list.length)return '#888888';if(list.length===1)return list[0][0];
   const total=list.reduce((sum,[,area])=>sum+area,0),stops=[];let position=0;
   list.forEach(([shade,area],index)=>{const end=position+area/total*100,next=list[(index+1)%list.length][0],blend=Math.min(1.35,(end-position)*.16);stops.push(shade+' '+position.toFixed(2)+'%',shade+' '+Math.max(position,end-blend).toFixed(2)+'%',next+' '+end.toFixed(2)+'%');position=end});
   return 'conic-gradient(from -24deg,'+stops.join(',')+')';
  };
  const syncSelection=()=>grid.querySelectorAll('[data-theme-id]').forEach(button=>{const selected=button.dataset.themeId===activeId;button.classList.toggle('on',selected);button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',(selected?'Edit ':'Use ')+button.dataset.themeName)});
  const selectTheme=t=>{if(t.builtin){s.skin=t.id;delete s.customThemeId;delete s.custom;delete s.customStyle}else{s.skin='custom';s.customThemeId=t.id;s.custom={...t.colors};s.customStyle=appearance(t.style)}activeId=t.id;syncSelection();onChange()};
  themes.forEach(t=>{
   const item=el('div');item.className='theme-option';const selected=activeId===t.id;
   const swatch=el('button');swatch.type='button';swatch.className='sw theme-square'+(selected?' on':'');swatch.dataset.themeId=t.id;swatch.dataset.themeName=t.name;swatch.style.background=colorGrid(t.colors);swatch.setAttribute('aria-label',(selected?'Edit ':'Use ')+t.name);swatch.setAttribute('aria-pressed',String(selected));swatch.onclick=()=>activeId===t.id?open(t):selectTheme(t);
   item.append(swatch,el('span',t.name));grid.append(item);
  });
  const addItem=el('div');addItem.className='theme-option';const add=el('button','+');add.type='button';add.className='sw theme-square theme-add';add.setAttribute('aria-label','Create a theme');add.onclick=chooseCreation;addItem.append(add,el('span','New'));grid.append(addItem);wrap.append(grid);host.append(wrap);

  function chooseCreation(){
   const focused=document.activeElement,modal=el('div');modal.className='sheet on theme-popup theme-choice-popup';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Create a theme');
   const panel=el('div');panel.className='panel';const header=el('div');header.className='ph';const closeButton=el('button','Close');closeButton.type='button';closeButton.className='pill';header.append(el('b','Create a theme'),closeButton);
   const body=el('div');body.className='theme-choice-body';body.append(el('p','How would you like to make it?'));
   const actions=el('div');actions.className='theme-choice-actions';const manual=el('button','Manual'),ai=el('button','Ask AI');for(const b of [manual,ai]){b.type='button';b.className='pill'}actions.append(manual,ai);body.append(actions);panel.append(header,body);modal.append(panel);document.body.append(modal);
   const close=()=>{modal.remove();if(focused?.isConnected)focused.focus()};closeButton.onclick=close;manual.onclick=()=>{close();open()};ai.onclick=()=>{close();services.ai?.()};modal.onclick=e=>{if(e.target===modal)close()};closeButton.focus();
  }

  function open(existing){
   const focused=document.activeElement,base=existing?existing.colors:builtinPalettes.cream,draft={custom:palette(base),style:appearance(existing?.style)};
   const modal=el('div');modal.className='sheet on theme-popup';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',existing?'Edit theme':'Create theme');
   const panel=el('form');panel.className='panel';const header=el('div');header.className='ph theme-edit-header';
   const cancel=el('button','Cancel'),undo=el('button'),save=el('button','Save'),tabs=el('div'),colorTab=el('button','Color'),layoutTab=el('button','Layout'),headerActions=el('div');
   cancel.type=undo.type=colorTab.type=layoutTab.type='button';save.type='submit';cancel.className=undo.className=save.className=colorTab.className=layoutTab.className='pill';tabs.className='edit-tabs';headerActions.className='theme-header-actions';undo.classList.add('undo-button');undo.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4 3 10l6 6M3 10h11a7 7 0 0 1 0 14" transform="translate(0 -2)"/></svg>';undo.setAttribute('aria-label','Undo last edit');undo.title='Undo last edit';undo.disabled=true;tabs.append(colorTab,layoutTab);headerActions.append(undo,save);header.append(cancel,tabs,headerActions);
   const body=el('div');body.className='theme-body';const nameLabel=el('label','Theme name'),name=el('input');name.type='text';name.maxLength=40;name.autocomplete='off';name.value=existing?existing.name:'';name.placeholder='e.g. Soft sage';name.className='hex-input';name.setAttribute('aria-label','Theme name');nameLabel.append(name);body.append(nameLabel);
   let previousName=name.value,editing;
   const history=timeline(()=>({name:previousName,colors:palette(draft.custom),style:appearance(draft.style)}),state=>{name.value=previousName=state.name;draft.custom=state.colors;draft.style=appearance(state.style);editing.refresh()});
   const checkpoint=()=>{history.push();undo.disabled=!history.length};
   name.oninput=()=>{checkpoint();previousName=name.value};undo.onclick=()=>{history.undo();undo.disabled=!history.length};
   const error=el('p');error.className='theme-error';error.setAttribute('role','alert');body.append(error);
   const footer=el('div');footer.className='theme-delete-row';const removeTheme=el('button','Delete Theme'),removePart=el('button','Delete Element');
   for(const b of [removeTheme,removePart]){b.type='button';b.className='delete-outline'}
   removeTheme.hidden=!existing;removePart.hidden=true;footer.append(removeTheme,removePart);
   editing=editor(body,draft,()=>{},checkpoint,{selection:(id,custom)=>{removePart.hidden=!custom}});
   const showTab=kind=>{colorTab.setAttribute('aria-pressed',String(kind==='color'));layoutTab.setAttribute('aria-pressed',String(kind==='layout'));editing.showPane(kind);body.scrollTop=0};colorTab.onclick=()=>showTab('color');layoutTab.onclick=()=>showTab('layout');showTab('color');
   body.querySelector('.custom-editor').append(footer);panel.append(header,body);modal.append(panel);document.body.append(modal);
   removeTheme.onclick=()=>{if(!existing||!confirm('Permanently delete “'+existing.name+'”? This cannot be undone.'))return;try{const next=deleteTheme(s,existing.id);CalcData.write('settings',next);for(const k of Object.keys(s))delete s[k];Object.assign(s,next);history.clear();close();onChange()}catch(err){error.textContent=err.message}};
   removePart.onclick=()=>{
    const id=editing.active;if(!specific(id)||!Object.hasOwn(draft.custom,id)||!confirm('Delete the custom styling for '+specific(id).name+'? Its normal theme color will return. This cannot be undone.'))return;
    try{
     const colors=deleteElement(draft.custom,id);
     if(existing){
      let next={...s};
      if(existing.builtin){const current=s.builtinOverrides?.[existing.id]||{name:existing.name,colors:existing.colors};next.builtinOverrides={...(s.builtinOverrides||{}),[existing.id]:{...current,colors:Object.hasOwn(current.colors,id)?deleteElement(current.colors,id):current.colors}}}
      else{next.customThemes=s.customThemes.map(t=>t.id===existing.id?{...t,colors:Object.hasOwn(t.colors,id)?deleteElement(t.colors,id):t.colors}:t);if(s.customThemeId===existing.id&&s.custom&&Object.hasOwn(s.custom,id))next.custom=deleteElement(s.custom,id)}
      CalcData.write('settings',next);Object.assign(s,next);onChange();
     }
     draft.custom=colors;history.clear();undo.disabled=true;editing.refresh();error.textContent='Custom element styling deleted.';
    }catch(err){error.textContent=err.message}
   };
   const close=()=>{modal.remove();if(focused&&focused.isConnected)focused.focus()};cancel.onclick=close;
   panel.onsubmit=e=>{e.preventDefault();try{
    const clean=name.value.trim();if(!clean)throw Error('Give your theme a name.');const used=[...builtins.map(id=>s.builtinOverrides?.[id]?.name||builtinNames[id]),...s.customThemes.map(t=>t.name)].some(n=>n.toLowerCase()===clean.toLowerCase()&&n.toLowerCase()!==existing?.name.toLowerCase());if(used)throw Error('That name is already used. Choose another name.');
    let next;if(existing?.builtin){next={...s,skin:existing.id,builtinOverrides:{...(s.builtinOverrides||{}),[existing.id]:{name:clean.slice(0,40),colors:palette(draft.custom),style:appearance(draft.style)}},deletedBuiltins:(s.deletedBuiltins||[]).filter(id=>id!==existing.id)};delete next.customThemeId;delete next.custom;delete next.customStyle}else next=savedSettings(s,existing&&existing.id,clean,draft.custom,draft.style);
    CalcData.write('settings',next);Object.assign(s,next);close();onChange()
   }catch(err){error.textContent=err.message||'Could not save this theme on your device.';name.focus()}};
   modal.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const items=[...panel.querySelectorAll('button,input,select')].filter(x=>!x.disabled&&!x.hidden),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
   cancel.focus();
  }
 }
 return {builtins,builtinNames,builtinPalettes,properties,styleFields,styleDefaults,fontChoices,record,safeTree,only,validatePalette,validateStyle,appearance,themeBlock,parseTheme,deleteTheme,deleteElement,sample,fields,specifics,palette,valueFor,nearest,timeline,apply,snapshot,color,toHsl,fromHsl,presets,editor,restore,savedSettings,manager};
})();
