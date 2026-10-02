const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const styles=new Map(),root={dataset:{},style:{setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)}};
const c=vm.createContext({document:{documentElement:root}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../themes.js'),'utf8')+';globalThis.theme=CalcThemes;',c);
const T=c.theme;
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
 const nodes=[];
 c.document.createElement=tag=>{
  const n={tag,children:[],dataset:{},attributes:{},style:{setProperty(){}},value:'',setAttribute(k,v){this.attributes[k]=v},removeAttribute(k){delete this.attributes[k]},append(...items){this.children.push(...items);if(tag==='select'&&!this.value)this.value=items[0].value}};
  nodes.push(n);return n;
 };
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
