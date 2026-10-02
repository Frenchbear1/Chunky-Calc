/* Shared by the first-paint theme restore and the Settings editor. */
const CalcThemes=(()=>{
 const fields=[['bg','Background'],['panel','Keypad panel'],['screen','Display background'],['ink','Answer text'],['dim','History text'],['key','Number keys'],['keytx','Number text'],['fn','Function keys'],['fntx','Function text'],['op','Operator keys'],['optx','Operator text'],['ib','Settings button'],['ibtx','Settings icon'],['keyd','Number key shadows'],['fnd','Function key shadows'],['opd','Operator key shadows']];
 const defaults={bg:'#efe6d4',panel:'#e2d7c0',screen:'#1c1b19',ink:'#f4ecd8',dim:'#8d8672',key:'#faf4e6',keytx:'#2a2822',fn:'#d9ccb0',fntx:'#2a2822',op:'#ff7a3d',optx:'#ffffff',ib:'#3c3b38',ibtx:'#f4ecd8',keyd:'#cfc3a8',fnd:'#b3a583',opd:'#c4501c'};
 function color(value){
  if(typeof value!=='string')return null;
  let v=value.trim();if(/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(v))v='#'+v;
  if(/^#[0-9a-f]{3}$/i.test(v))v='#'+[...v.slice(1)].map(x=>x+x).join('');
  return /^#[0-9a-f]{6}$/i.test(v)?v.toLowerCase():null;
 }
 const palette=p=>Object.fromEntries(fields.map(([k])=>[k,color(p&&p[k])||defaults[k]]));
 function apply(s){
  const root=document.documentElement;root.dataset.skin=s.skin;
  const p=palette(s.custom);fields.forEach(([k])=>{if(s.skin==='custom')root.style.setProperty('--'+k,p[k]);else root.style.removeProperty('--'+k)});
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
 function editor(host,s,onChange){
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e};
  const box=el('section','custom-editor');box.setAttribute('aria-label','Custom theme editor');
  const preview=el('div','mini-calc');preview.setAttribute('role','img');preview.setAttribute('aria-label','Live calculator color preview');
  const display=el('div','mini-screen');display.append(el('span','mini-gear','⚙'),el('div','mini-history','24 × 5 = 120'),el('div','mini-answer','120'));
  const pad=el('div','mini-pad');pad.append(el('span','mini-key fn fx-sample','ƒ(x)  hold & slide'));
  ['AC','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','±','0','.','='].forEach((k,i)=>pad.append(el('span','mini-key'+(i%4===3?' op':i<3||i===16?' fn':''),k)));
  preview.append(display,pad);box.append(preview,el('p','','Changes preview instantly and save automatically. Pick a soft palette, then adjust any part.'));
  const presetsRow=el('div','custom-presets');
  presets.forEach(([name,p])=>{const b=el('button','',name);b.type='button';b.onclick=()=>{s.custom={...p};commit();sync()};presetsRow.append(b)});box.append(presetsRow);
  const controls=el('div','color-controls'),part=el('select');part.setAttribute('aria-label','Calculator element');
  fields.forEach(([key,name])=>{const o=el('option','',name);o.value=key;part.append(o)});
  const label=(name,input)=>{const l=el('label','',name);l.append(input);return l};
  controls.append(label('Choose a part',part));
  const row=el('div','color-entry'),picker=el('input'),hex=el('input','hex-input');picker.type='color';picker.setAttribute('aria-label','Color picker');hex.type='text';hex.maxLength=7;hex.spellcheck=false;hex.autocomplete='off';hex.setAttribute('aria-label','Hex color');
  row.append(picker,label('Hex color',hex));controls.append(row);
  const ranges=['Hue','Saturation','Lightness'].map((name,i)=>{const input=el('input');input.type='range';input.min=0;input.max=i?100:360;input.step=1;input.setAttribute('aria-label',name);const l=label(name,input);controls.append(l);return input});
  const hint=el('p','','Lower saturation for muted tones. Raise lightness for pastels.');hint.setAttribute('aria-live','polite');controls.append(hint);box.append(controls);host.append(box);
  function commit(){s.custom=palette(s.custom);onChange();fields.forEach(([k])=>preview.style.setProperty('--'+k,s.custom[k]))}
  function sync(){const v=palette(s.custom)[part.value];picker.value=v;hex.value=v;hex.removeAttribute('aria-invalid');toHsl(v).forEach((n,i)=>ranges[i].value=n);ranges[0].style.background='linear-gradient(to right,red,yellow,lime,cyan,blue,magenta,red)'}
  function update(v,sliders=false,preserveHex=false){s.custom={...palette(s.custom),[part.value]:v};commit();picker.value=v;if(!preserveHex)hex.value=v;hex.removeAttribute('aria-invalid');if(!sliders)toHsl(v).forEach((n,i)=>ranges[i].value=n)}
  part.onchange=sync;picker.oninput=()=>update(picker.value);
  hex.oninput=()=>{const v=color(hex.value);if(v){update(v,false,true);hint.textContent='Color saved.'}else{hex.setAttribute('aria-invalid','true');hint.textContent='Enter a hex color, such as #D8C5E8.'}};
  hex.onchange=()=>{const v=color(hex.value);if(v)hex.value=v};
  ranges.forEach(r=>r.oninput=()=>update(fromHsl(...ranges.map(x=>+x.value)),true));
  commit();sync();
 }
 return {fields,palette,apply,snapshot,color,toHsl,fromHsl,presets,editor};
})();
