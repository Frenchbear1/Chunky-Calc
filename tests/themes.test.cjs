const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const styles=new Map(),root={dataset:{},style:{setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)}};
const c=vm.createContext({document:{documentElement:root}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../themes.js'),'utf8')+';globalThis.theme=CalcThemes;',c);
const T=c.theme;
function fakeDOM(){
 const nodes=[];c.document.body={append(){}};
 c.document.createElement=tag=>{
  const n={tag,children:[],dataset:{},attributes:{},style:{setProperty(k,v){this[k]=v}},classList:{toggle(){}},value:'',setAttribute(k,v){this.attributes[k]=v},removeAttribute(k){delete this.attributes[k]},append(...items){this.children.push(...items);if(tag==='select'&&!this.value&&items.length)this.value=items[0].value},replaceChildren(...items){this.children=[];this.append(...items)},querySelectorAll(){return this.children.flatMap(x=>[...(x.dataset.target?[x]:[]),...x.querySelectorAll()])},addEventListener(){},focus(){},remove(){this.removed=true}};
  nodes.push(n);return n;
 };return nodes;
}
test('hex entry supports shorthand, pasted values, and rejects invalid CSS',()=>{
 assert.equal(T.color(' #AbC '),'#aabbcc');assert.equal(T.color('D8C5E8'),'#d8c5e8');
 for(const v of ['url(x)','red','#ab',null,{},'#12345678'])assert.equal(T.color(v),null);
});
test('custom colors survive theme switching without leaking into built-in themes',()=>{
 const s={skin:'custom',custom:T.palette({bg:'#123456',op:'#abcdef'})};T.apply(s);
 assert.equal(styles.get('--bg'),'#123456');assert.equal(styles.size,16);
 s.skin='black';T.apply(s);assert.equal(styles.size,0);assert.equal(root.dataset.skin,'black');
 s.skin='custom';T.apply(s);assert.equal(styles.get('--bg'),'#123456');assert.equal(styles.get('--op'),'#abcdef');
 const restored=JSON.parse(JSON.stringify(s));T.apply(restored);assert.equal(styles.get('--op'),'#abcdef');
});
test('color sliders cover black, white, primary hues, and soft colors',()=>{
 assert.equal(T.fromHsl(0,0,0),'#000000');assert.equal(T.fromHsl(0,0,100),'#ffffff');assert.equal(T.fromHsl(0,100,50),'#ff0000');
 assert.equal(T.fromHsl(120,100,50),'#00ff00');assert.equal(T.fromHsl(240,100,50),'#0000ff');
 for(const [,p] of T.presets){assert.equal(Object.keys(p).length,16);for(const v of Object.values(p))assert.equal(T.color(v),v);const hsl=T.toHsl(p.op);assert(hsl[1]<40&&hsl[2]>60)}
});
test('existing custom palette migrates once and retains selection',()=>{
 const s={skin:'custom',custom:{bg:'#abcdef'}};T.restore(s);assert.equal(s.customThemes.length,1);assert.equal(s.customThemes[0].name,'My theme');assert.equal(s.customThemeId,'legacy-custom');
 T.restore(s);assert.equal(s.customThemes.length,1);assert.equal(s.custom.bg,'#abcdef');
});
test('named theme saves are independent and edits preserve the selected id',()=>{
 const initial=T.restore({skin:'cream'}),a=T.savedSettings(initial,null,'Sage',{bg:'#123456'},['#123456']);
 assert.equal(initial.customThemes.length,0);assert.equal(a.customThemes.length,1);
 const b=T.savedSettings(a,null,'Blush',{bg:'#abcdef'},[]);assert.equal(b.customThemes.length,2);
 const edited=T.savedSettings(b,a.customThemeId,'Forest',{bg:'#345678'},[]);assert.equal(edited.customThemes.length,2);assert.equal(edited.customThemeId,a.customThemeId);
 const reopened=T.restore(JSON.parse(JSON.stringify(edited)));assert.equal(reopened.custom.bg,'#345678');assert.equal(reopened.skin,'custom');
 assert.throws(()=>T.savedSettings(reopened,null,'  ',{},[]));assert.throws(()=>T.savedSettings(reopened,null,'blush',{},[]));
});
test('each element keeps one live reusable swatch, including matching colors',()=>{
 const nodes=fakeDOM();
 const draft={custom:T.palette({bg:'#112233',panel:'#112233'}),recentColors:['#ff0000']};T.editor({append(){}},draft,()=>{});
 const swatches=nodes.filter(n=>n.className==='color-swatch'),picker=nodes.find(n=>n.attributes['aria-label']==='Color picker'),part=nodes.find(n=>n.attributes['aria-label']==='Calculator element');
 assert.equal(swatches.length,16);assert.equal(new Set(swatches.map(n=>n.dataset.element)).size,16);
 const bg=swatches.find(n=>n.dataset.element==='bg'),panel=swatches.find(n=>n.dataset.element==='panel');
 assert.equal(bg.attributes['aria-current'],'true');assert.equal(swatches.filter(n=>n.attributes['aria-current']==='true').length,1);
 for(const v of ['#223344','#334455','#445566']){picker.value=v;picker.oninput();assert.equal(bg.style.background,v);assert.equal(panel.style.background,'#112233')}
 assert.equal(nodes.filter(n=>n.className==='color-swatch').length,16);
 part.value='op';part.onchange();bg.onclick();assert.equal(draft.custom.op,'#445566');assert.equal(picker.value,'#445566');assert.equal(swatches.find(n=>n.dataset.element==='op').style.background,'#445566');
 assert.equal(bg.attributes['aria-current'],'false');assert.equal(swatches.find(n=>n.dataset.element==='op').attributes['aria-current'],'true');assert.equal(swatches.filter(n=>n.attributes['aria-current']==='true').length,1);
 const lightness=nodes.find(n=>n.attributes['aria-label']==='Lightness');lightness.value=80;lightness.oninput();assert.equal(swatches.find(n=>n.dataset.element==='op').style.background,draft.custom.op);assert.equal(bg.style.background,'#445566');
});
test('visual selection adds one individual swatch, edits its color and undoes the session',()=>{
 const nodes=fakeDOM(),draft={custom:T.palette({key:'#abcdef'})},snapshots=[];
 const ed=T.editor({append(){}},draft,()=>{},()=>snapshots.push(JSON.stringify(draft.custom)));
 const part=nodes.find(n=>n.attributes['aria-label']==='Calculator element');nodes.find(n=>n.attributes['aria-label']==='Select a specific element').onclick();
 const calc=nodes.find(n=>n.className==='mini-calc pick-calc'),key=calc.querySelectorAll().find(n=>n.dataset.target==='b4');calc.onclick({target:{closest:()=>key}});
 nodes.find(n=>n.textContent==='Confirm').onclick();
 assert.equal(draft.custom.part_b4_fill,'#abcdef');assert.equal(part.value,'part_b4_fill');
 const row=nodes.find(n=>n.className==='reuse-colors individual-colors');assert.equal(row.children.length,1);assert.equal(row.children[0].attributes['aria-current'],'true');
 const picker=nodes.find(n=>n.attributes['aria-label']==='Color picker');picker.value='#ff0000';picker.oninput();picker.value='#ff4455';picker.oninput();picker.onchange();
 assert.equal(snapshots.length,2);assert.equal(draft.custom.key,'#abcdef');assert.equal(draft.custom.part_b4_fill,'#ff4455');assert.equal(row.children.length,1);
 draft.custom=JSON.parse(snapshots.pop());ed.refresh();assert.equal(draft.custom.part_b4_fill,'#abcdef');
 draft.custom=JSON.parse(snapshots.pop());ed.refresh();assert(!('part_b4_fill' in draft.custom));assert.equal(row.children.length,0);assert.equal(part.value,'key');
});
test('individual key colors save, reload and stay isolated from other keys',()=>{
 const original=T.restore({skin:'cream'}),p=T.palette({key:'#abcdef',part_b4_fill:'#ff1122',part_b4_text:'#112233',part_a1_shadow:'#445566',part_unknown_fill:'#ffffff'});
 assert.equal(p.part_b4_fill,'#ff1122');assert(!('part_unknown_fill' in p));assert.equal(T.valueFor(p,'part_b5_fill'),'#abcdef');
 const saved=T.savedSettings(original,null,'Individual keys',p),restored=T.restore(JSON.parse(JSON.stringify(saved)));
 assert.equal(restored.custom.part_b4_fill,'#ff1122');assert.equal(restored.custom.part_b4_text,'#112233');assert.equal(restored.custom.part_a1_shadow,'#445566');assert(!('part_b5_fill' in restored.custom));
});
test('Undo walks back all session steps without mutating saved themes',()=>{
 const saved={name:'Theme',colors:{key:'#abcdef'}},start=JSON.stringify(saved);let draft=JSON.parse(start);
 const history=T.timeline(()=>draft,state=>draft=state);history.push();draft.colors.key='#000000';history.push();draft.colors.part_b4_fill='#ff0000';history.push();draft.name='New name';
 history.undo();assert.equal(draft.name,'Theme');assert.equal(draft.colors.part_b4_fill,'#ff0000');
 history.undo();assert(!('part_b4_fill' in draft.colors));assert.equal(draft.colors.key,'#000000');
 history.undo();assert.equal(JSON.stringify(draft),start);assert.equal(history.length,0);assert.equal(JSON.stringify(saved),start);
});
test('direction arrows choose the nearest part in the requested direction',()=>{
 const points=[{id:'center',x:100,y:100},{id:'left',x:50,y:100},{id:'right',x:150,y:100},{id:'up',x:100,y:50},{id:'down',x:100,y:150},{id:'diagonal',x:120,y:200}];
 for(const direction of ['left','right','up','down'])assert.equal(T.nearest(points,'center',direction).id,direction);
 assert.equal(T.nearest(points,'left','left'),undefined);
});
