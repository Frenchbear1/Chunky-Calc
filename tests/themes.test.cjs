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
