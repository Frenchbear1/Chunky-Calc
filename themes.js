/* Shared by the first-paint theme restore and the Settings editor. */
const CalcThemes=(()=>{
 const fields=[['bg','Background'],['panel','Keypad panel'],['screen','Display background'],['ink','Answer text'],['dim','History text'],['key','Number keys'],['keytx','Number text'],['fn','Function keys'],['fntx','Function text'],['op','Operator keys'],['optx','Operator text'],['ib','Settings button'],['ibtx','Settings icon'],['keyd','Number key shadows'],['fnd','Function key shadows'],['opd','Operator key shadows']];
 const defaults={bg:'#efe6d4',panel:'#e2d7c0',screen:'#1c1b19',ink:'#f4ecd8',dim:'#8d8672',key:'#faf4e6',keytx:'#2a2822',fn:'#d9ccb0',fntx:'#2a2822',op:'#ff7a3d',optx:'#ffffff',ib:'#3c3b38',ibtx:'#f4ecd8',keyd:'#cfc3a8',fnd:'#b3a583',opd:'#c4501c'};
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
 function timeline(read,write){const steps=[];return {get length(){return steps.length},push(){const snapshot=JSON.stringify(read());if(steps.at(-1)!==snapshot)steps.push(snapshot)},undo(){if(steps.length)write(JSON.parse(steps.pop()))}}}
 function restore(s){
  delete s.themeColors;
  s.customThemes=(Array.isArray(s.customThemes)?s.customThemes:[]).filter(t=>t&&typeof t.id==='string'&&typeof t.name==='string').map(t=>({id:t.id,name:t.name.slice(0,40),colors:palette(t.colors)}));
  if(!s.customThemes.length&&s.custom){const t={id:'legacy-custom',name:'My theme',colors:palette(s.custom)};s.customThemes.push(t);if(s.skin==='custom')s.customThemeId=t.id}
  const active=s.customThemes.find(t=>t.id===s.customThemeId);
  if(s.skin==='custom'&&active)s.custom={...active.colors};
  return s;
 }
 function savedSettings(s,id,name,colors){
  name=name.trim();if(!name)throw Error('Give your theme a name.');
  if(s.customThemes.some(t=>t.id!==id&&t.name.toLowerCase()===name.toLowerCase()))throw Error('That name is already used. Choose another name.');
  const t={id:id||('theme-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)),name:name.slice(0,40),colors:palette(colors)};
  return {...s,skin:'custom',customThemeId:t.id,custom:{...t.colors},customThemes:[...s.customThemes.filter(x=>x.id!==t.id),t]};
 }
 function apply(s){
  const root=document.documentElement;root.dataset.skin=s.skin;
  const p=palette(s.custom);fields.forEach(([k])=>{if(s.skin==='custom')root.style.setProperty('--'+k,p[k]);else root.style.removeProperty('--'+k)});
  if(document.getElementById){let style=document.getElementById('specific-theme-colors');if(!style){style=document.createElement('style');style.id='specific-theme-colors';document.head.append(style)}style.textContent=s.skin==='custom'?specifics.filter(x=>p[x.id]).map(x=>':root[data-skin="custom"] '+x.target.selector+':not(.hot){'+x.property+':'+p[x.id]+'}').join('\n'):''}
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
 function sample(p,mode=0,interactive=false){
  const el=element,root=el('div','mini-calc'+(interactive?' pick-calc':''));root.dataset.target='canvas';
  fields.forEach(([k])=>root.style.setProperty('--'+k,p[k]));
  const node=(tag,cls,text,id)=>{const n=el(tag,cls,text);n.dataset.target=id;return n};
  const screen=node('div','mini-screen','','display'),history=node('div','mini-history','24 × 5 = 120','history'),expression=node('div','mini-expression','24 × 5 =','expression'),answer=node('div','mini-answer','120','answer');screen.append(history,expression,answer);
  const pad=node('div','mini-pad','','panel');pad.append(node('span','mini-gear','⚙︎','gear'),node('span','mini-key fn fx-sample','ƒ(x) hold & slide','bar'));
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
 function pickElement(p,current,onConfirm,onClose){
  const el=element,focused=document.activeElement,modal=el('div','sheet on theme-popup element-popup'),panel=el('div','panel'),header=el('div','ph'),cancel=el('button','pill','Cancel'),confirm=el('button','pill','Confirm');
  modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Pick a calculator part');cancel.type=confirm.type='button';header.append(cancel,el('b','','Pick a part'),confirm);
  const modeRow=el('div','pick-modes'),body=el('div','pick-body'),footer=el('div','pick-footer'),name=el('div','pick-name'),parts=el('div','pick-parts'),arrows=el('div','pick-arrows');name.setAttribute('aria-live','polite');
  footer.append(name,parts,arrows);panel.append(header,el('p','pick-hint','Tap a part. Use the arrows to reach nearby parts.'),modeRow,body,footer);modal.append(panel);document.body.append(modal);
  let chosen=specific(current),target=chosen?chosen.target:targets.find(t=>t.id==='b4'),part=chosen?chosen.part:'fill',mode=target.mode||0,calc;
  const close=()=>{modal.remove();if(focused&&focused.isConnected)focused.focus();if(onClose)onClose()};
  const modeButtons=[0,1].map(m=>{const b=el('button','pill',m?'Advanced keys':'Basic keys');b.type='button';b.onclick=()=>{mode=m;if(target.mode!==undefined&&target.mode!==mode){target=targets.find(t=>t.id===(m?'a0':'b0'));part='fill'}draw()};modeRow.append(b);return b});
  function select(t){target=t;if(!target.parts[part])part=Object.keys(target.parts)[0];highlight()}
  function highlight(){
   for(const n of [calc,...calc.querySelectorAll('[data-target]')])n.classList.toggle('pick-selected',n.dataset.target===target.id);
   name.textContent=target.name;parts.replaceChildren();Object.keys(target.parts).forEach(p=>{const b=el('button','pill',p==='fill'?'Fill':p==='text'?'Text / icon':'Shadow');b.type='button';b.setAttribute('aria-pressed',String(part===p));b.onclick=()=>{part=p;highlight()};parts.append(b)})
  }
  function draw(){calc=sample(p,mode,true);body.replaceChildren(calc);calc.onclick=e=>{const n=e.target.closest('[data-target]');if(n)select(targets.find(t=>t.id===n.dataset.target))};modeButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(mode===i)));highlight()}
  function move(direction){const items=[calc,...calc.querySelectorAll('[data-target]')].map(n=>{const r=n.getBoundingClientRect();return {id:n.dataset.target,x:r.left+r.width/2,y:r.top+r.height/2,node:n}}),next=nearest(items,target.id,direction);if(next){select(targets.find(t=>t.id===next.id));next.node.scrollIntoView({block:'nearest',inline:'nearest'})}}
  [['left','←'],['up','↑'],['down','↓'],['right','→']].forEach(([direction,symbol])=>{const b=el('button','pill',symbol);b.type='button';b.setAttribute('aria-label','Select nearest part '+direction);b.onclick=()=>move(direction);arrows.append(b)});
  cancel.onclick=close;confirm.onclick=()=>{onConfirm('part_'+target.id+'_'+part);close()};
  modal.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close()}const d={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[e.key];if(d){e.preventDefault();move(d)}if(e.key==='Tab'){const buttons=[...panel.querySelectorAll('button')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus()}}});
  draw();cancel.focus();
 }
 function editor(host,s,onChange,beforeChange=()=>{}){
  const el=element,box=el('section','custom-editor');box.setAttribute('aria-label','Custom theme editor');
  const preview=el('div','mini-preview');box.append(preview,el('p','','Pick a soft palette, adjust a group, or choose one specific part. Save when you’re happy with it.'));
  const presetsRow=el('div','custom-presets');
  presets.forEach(([name,p])=>{const b=el('button','',name);b.type='button';b.onclick=()=>{finish();beforeChange();s.custom={...p};commit();sync()};presetsRow.append(b)});box.append(presetsRow);
  const controls=el('div','color-controls'),part=el('select');part.setAttribute('aria-label','Calculator element');
  const label=(name,input)=>{const l=el('label','',name);l.append(input);return l};
  controls.append(label('Choose a part',part));
  const reuse=el('div','reuse-colors'),individual=el('div','reuse-colors individual-colors'),individualLabel=el('p','','Individual parts');reuse.setAttribute('aria-label','Reusable element colors');individual.setAttribute('aria-label','Reusable individual colors');controls.append(el('p','','Reuse a color · one per element'),reuse,individualLabel,individual);
  const swatches=[];
  function swatch(key,name,host){const b=el('button','color-swatch');b.type='button';b.dataset.element=key;b.onclick=()=>{finish();update(valueFor(palette(s.custom),key));finish()};host.append(b);swatches.push({key,name,b})}
  fields.forEach(([key,name])=>swatch(key,name,reuse));
  const row=el('div','color-entry'),picker=el('input'),hex=el('input','hex-input');picker.type='color';picker.setAttribute('aria-label','Color picker');hex.type='text';hex.maxLength=7;hex.spellcheck=false;hex.autocomplete='off';hex.setAttribute('aria-label','Hex color');
  row.append(picker,label('Hex color',hex));controls.append(row);
  const ranges=['Hue','Saturation','Lightness'].map((name,i)=>{const input=el('input');input.type='range';input.min=0;input.max=i?100:360;input.step=1;input.setAttribute('aria-label',name);controls.append(label(name,input));return input});
  const hint=el('p','','Lower saturation for muted tones. Raise lightness for pastels.');hint.setAttribute('aria-live','polite');controls.append(hint);box.append(controls);host.append(box);
  let active='bg',editing=false;
  function finish(){editing=false}
  function options(){
   const extras=specifics.filter(x=>s.custom[x.id]);part.replaceChildren();
   const option=(value,name)=>{const o=el('option','',name);o.value=value;part.append(o)};
   option('__pick','⌖ Pick a specific part…');fields.forEach(([key,name])=>option(key,name));extras.forEach(x=>option(x.id,x.name));
   if(specific(active)&&!s.custom[active])active=specific(active).base;part.value=active;
   individual.replaceChildren();swatches.splice(fields.length);extras.forEach(x=>swatch(x.id,x.name,individual));individual.hidden=individualLabel.hidden=!extras.length;
  }
  function paintSwatches(){swatches.forEach(({key,name,b})=>{const v=valueFor(s.custom,key);b.style.background=v;b.title=name+': '+v;b.setAttribute('aria-label','Use '+name+' color '+v);b.setAttribute('aria-current',String(key===active))})}
  function commit(){s.custom=palette(s.custom);options();preview.replaceChildren(sample(s.custom,specific(active)?.target.mode||0));paintSwatches();onChange()}
  function sync(){const v=valueFor(palette(s.custom),active);part.value=active;picker.value=v;hex.value=v;hex.removeAttribute('aria-invalid');paintSwatches();toHsl(v).forEach((n,i)=>ranges[i].value=n)}
  function update(v,sliders=false,preserveHex=false){if(valueFor(s.custom,active)===v)return;if(!editing){beforeChange();editing=true}s.custom={...palette(s.custom),[active]:v};commit();picker.value=v;if(!preserveHex)hex.value=v;hex.removeAttribute('aria-invalid');if(!sliders)toHsl(v).forEach((n,i)=>ranges[i].value=n)}
  part.onchange=()=>{finish();if(part.value==='__pick'){part.value=active;pickElement(palette(s.custom),active,id=>{if(!s.custom[id]){beforeChange();s.custom[id]=valueFor(s.custom,id)}active=id;commit();sync()});return}active=part.value;preview.replaceChildren(sample(s.custom,specific(active)?.target.mode||0));sync()};
  picker.oninput=()=>update(picker.value);picker.onchange=finish;picker.onblur=finish;
  hex.oninput=()=>{const v=color(hex.value);if(v){update(v,false,true);hint.textContent='Preview updated.'}else{hex.setAttribute('aria-invalid','true');hint.textContent='Enter a hex color, such as #D8C5E8.'}};
  hex.onchange=()=>{const v=color(hex.value);if(v)hex.value=v;finish()};hex.onblur=finish;
  ranges.forEach(r=>{r.oninput=()=>update(fromHsl(...ranges.map(x=>+x.value)),true);r.onchange=finish;r.onblur=finish});
  commit();sync();
  return {refresh(){finish();commit();sync()}};
 }
 function manager(host,s,onChange){
  const el=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e};
  const wrap=el('div');wrap.className='theme-manager';const label=el('label','Custom themes'),select=el('select');select.setAttribute('aria-label','Custom themes');
  const option=(value,name)=>{const o=el('option',name);o.value=value;select.append(o)};
  option('','Choose a saved theme…');s.customThemes.forEach(t=>option(t.id,t.name));option('__new','＋ Create new theme');select.value=s.skin==='custom'?s.customThemeId||'':'';
  label.append(select);wrap.append(label);
  const active=s.customThemes.find(t=>t.id===s.customThemeId);
  if(s.skin==='custom'&&active){const edit=el('button','Edit theme');edit.className='chip';edit.onclick=()=>open(active);wrap.append(edit)}
  select.onchange=()=>{if(select.value==='__new'){open();select.value=s.skin==='custom'?s.customThemeId||'':'';return}const t=s.customThemes.find(x=>x.id===select.value);if(t){s.skin='custom';s.customThemeId=t.id;s.custom={...t.colors};onChange()}};
  host.append(wrap);
  function open(existing){
   const focused=document.activeElement,draft={custom:palette(existing?existing.colors:s.skin==='custom'?s.custom:snapshot())};
   const modal=el('div');modal.className='sheet on theme-popup';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',existing?'Edit theme':'Create theme');
   const panel=el('form');panel.className='panel';const header=el('div');header.className='ph';
   const cancel=el('button','Cancel'),undo=el('button','↶'),save=el('button','Save');cancel.type=undo.type='button';save.type='submit';cancel.className=undo.className=save.className='pill';undo.setAttribute('aria-label','Undo last edit');undo.title='Undo last edit';undo.disabled=true;header.append(cancel,el('b',existing?'Edit theme':'Create theme'),undo,save);
   const body=el('div');body.className='theme-body';const nameLabel=el('label','Theme name'),name=el('input');name.type='text';name.maxLength=40;name.autocomplete='off';name.value=existing?existing.name:'';name.placeholder='e.g. Soft sage';name.className='hex-input';name.setAttribute('aria-label','Theme name');nameLabel.append(name);body.append(nameLabel);
   let previousName=name.value,editing;
   const history=timeline(()=>({name:previousName,colors:palette(draft.custom)}),state=>{name.value=previousName=state.name;draft.custom=state.colors;editing.refresh()});
   const checkpoint=()=>{history.push();undo.disabled=!history.length};
   name.oninput=()=>{checkpoint();previousName=name.value};undo.onclick=()=>{history.undo();undo.disabled=!history.length};
   const error=el('p');error.className='theme-error';error.setAttribute('role','alert');body.append(error);editing=editor(body,draft,()=>{},checkpoint);panel.append(header,body);modal.append(panel);document.body.append(modal);
   const close=()=>{modal.remove();if(focused&&focused.isConnected)focused.focus()};cancel.onclick=close;
   panel.onsubmit=e=>{e.preventDefault();try{const next=savedSettings(s,existing&&existing.id,name.value,draft.custom);localStorage.setItem('cc_set',JSON.stringify(next));Object.assign(s,next);close();onChange()}catch(err){error.textContent=err.message||'Could not save this theme on your device.';name.focus()}};
   modal.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const items=[...panel.querySelectorAll('button,input,select')].filter(x=>!x.disabled),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
   cancel.focus();
  }
 }
 return {fields,specifics,palette,valueFor,nearest,timeline,apply,snapshot,color,toHsl,fromHsl,presets,editor,restore,savedSettings,manager};
})();
