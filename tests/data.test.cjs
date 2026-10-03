const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function setup(){const data=new Map(),storage={get length(){return data.size},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};const c=vm.createContext({localStorage:storage,addEventListener(){}});for(const f of ['themes.js','data.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),c);vm.runInContext('globalThis.T=CalcThemes;globalThis.D=CalcData',c);return {T:c.T,D:c.D,storage,data}}
const plain=v=>JSON.parse(JSON.stringify(v));
test('backup round trip includes manual/AI themes, exact overrides, history, icon, AI drafts and unrelated data is untouched',()=>{
 const {T,D,storage}=setup();let s=T.restore({skin:'cream',vol:.4,sound:false,pack:'soft',silent:true,dynamic:false});s=T.savedSettings(s,null,'Manual',{bg:'#123456',part_b4_fill:'#aabbcc'});s=T.savedSettings(s,null,'AI',T.parseTheme(JSON.stringify({format:'chunky-theme',version:1,name:'AI',theme:T.palette({op:'#556677'})})).theme);
 D.write('settings',s);D.write('history',[{e:'2+2',r:'4',t:Date.now()}]);D.write('ai',{service:'claude',preferences:'Blue cockpit',importText:'draft'});D.write('icon',{version:1,seed:56,variant:3,themeName:'AI',colors:s.custom});storage.setItem('another-app','untouched');
 const original=plain(D.collect()),b=D.parseBackup(JSON.stringify(D.backup()));assert.equal(b.data.localStorage.cc_set.customThemes.length,2);assert.equal(typeof b.data.localStorage.cc_set,'object');
 D.write('settings',{skin:'white'});storage.removeItem('cc_hist');D.restore(b);assert.deepEqual(plain(D.collect()),original);assert.equal(storage.getItem('another-app'),'untouched');assert.equal(storage.getItem('cc_restore_journal_v1'),null);
});
test('backup schema fails closed for future versions, foreign stores, malformed types, ranges and missing stores',()=>{
 const {D}=setup();D.write('settings',{skin:'cream'});const base=plain(D.backup());
 for(const mutate of [b=>b.version=2,b=>b.data.localStorage.unrelated='x',b=>delete b.data.localStorage.cc_hist,b=>b.data.localStorage.cc_set.vol=8,b=>b.data.localStorage.cc_set.sound='yes',b=>b.data.localStorage.cc_hist=[{e:'1',r:{},t:3}],b=>b.data.localStorage.cc_set.custom={bg:'url(https://evil.test)'}]){const b=structuredClone(base);mutate(b);assert.throws(()=>D.validateBackup(b))}
 assert.throws(()=>D.parseBackup('{bad'));assert.throws(()=>D.parseBackup('{"__proto__":{}}'));
});
test('quota failure rolls back all app stores, leaving unrelated origin data alone',()=>{
 const {D,storage}=setup();D.write('settings',{skin:'cream'});D.write('history',[{e:'1',r:'1',t:1}]);const old=plain(D.collect()),next=plain(D.backup());next.data.localStorage.cc_set.skin='night';next.data.localStorage.cc_hist=[];
 const set=storage.setItem;let fail=true;storage.setItem=(k,v)=>{if(k==='cc_hist'&&v==='[]'&&fail){fail=false;throw Error('QuotaExceededError')}set(k,v)};
 assert.throws(()=>D.restore(next),/previous data was restored/);assert.deepEqual(plain(D.collect()),old);
});
test('interrupted restore recovers the journal before reading app settings',()=>{
 const {D,storage}=setup();D.write('settings',{skin:'cream'});const old=plain(D.collect());storage.setItem('cc_restore_journal_v1',JSON.stringify(old));storage.setItem('cc_set',JSON.stringify({skin:'night'}));assert.throws(()=>D.write('settings',{skin:'white'}),/recovery/);D.recover();assert.equal(D.read('settings').skin,'cream');assert.equal(storage.getItem('cc_restore_journal_v1'),null);
});
test('unknown app store is never silently left out of a backup',()=>{const {D,storage}=setup();D.write('settings',{skin:'cream'});storage.setItem('cc_future','{}');assert.throws(()=>D.backup(),/unrecognized Chunky data/)});
test('AI JSON rejects unsafe keys, unsupported values and properties without executing strings',()=>{
 const {T}=setup(),valid={format:'chunky-theme',version:1,name:'Cockpit',theme:T.palette({part_a1_text:'#ff9900'})};assert.equal(T.parseTheme('```json\n'+JSON.stringify(valid)+'\n```').theme.part_a1_text,'#ff9900');
 for(const change of [v=>v.version=2,v=>v.theme.radius=5,v=>v.theme.bg='red',v=>v.theme.bg='#12345678',v=>v.theme.bg='url(x)',v=>v.theme.bg='<script>alert(1)</script>',v=>delete v.theme.bg,v=>v.name='<img>',v=>v.name='',v=>v.theme=[]]){const v=structuredClone(valid);change(v);assert.throws(()=>T.themeBlock(v))}
 assert.throws(()=>T.parseTheme(JSON.stringify(valid).replace('"theme":{','"theme":{"__proto__":{},')));assert.throws(()=>T.parseTheme('alert(1)'));
});
test('permanent deletions cannot remove built-ins and do not resurrect legacy custom themes',()=>{
 const {T}=setup();let s=T.savedSettings(T.restore({skin:'cream'}),null,'Test',T.palette({part_b4_fill:'#ff0000',part_b4_text:'#ffffff'}));const id=s.customThemeId;
 assert.throws(()=>T.deleteTheme({...s,customThemes:[...s.customThemes,{id:'cream'}]},'cream'));assert.throws(()=>T.deleteElement(s.custom,'key'));
 const p=T.deleteElement(s.custom,'part_b4_fill');assert.equal(T.valueFor(p,'part_b4_fill'),s.custom.key);assert.equal(p.part_b4_text,'#ffffff');
 s=T.deleteTheme(s,id);T.restore(s);assert.equal(s.skin,'cream');assert.equal(s.customThemes.length,0);assert.equal(s.custom,undefined);
 let value={x:1};const h=T.timeline(()=>value,v=>value=v);h.push();value.x=2;h.clear();h.undo();assert.equal(value.x,2);
});

test('legacy numeric history survives export and restoration without migration loss',()=>{const {D}=setup();D.write('settings',{skin:'cream'});D.write('history',[{e:'1+1',r:2,t:Date.now()}]);D.restore(D.backup());assert.equal(D.read('history')[0].r,2)});
