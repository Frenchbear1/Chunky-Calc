const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');

function setup(){
 const listeners={},windowListeners={},documentListeners={},timers=new Map();let time=0,id=0,saved=null,renders=0;
 const b={textContent:'AC',setAttribute(){},addEventListener(t,fn){listeners[t]=fn},getBoundingClientRect(){return {left:0,right:80,top:0,bottom:80}}};
 const status={textContent:''},sheet={classList:{contains:()=>false}};
 const context=vm.createContext({
  hist:[{e:'2+2',r:4}],expr:'123',settings:{skin:'mint'},Math,
  save(){saved=Array.from(context.hist)},render(){renders++},showHist(){},blip(){},
  $:id=>id==='status'?status:sheet,
  setTimeout(fn,delay){const key=++id;timers.set(key,{fn,at:time+delay});return key},
  clearTimeout(key){timers.delete(key)},
  addEventListener(t,fn){windowListeners[t]=fn},
  document:{hidden:false,addEventListener(t,fn){documentListeners[t]=fn}}
 });
 vm.runInContext(html.slice(html.indexOf('function bindHistoryHold('),html.indexOf('function mk(')),context);
 const consume=context.bindHistoryHold(b);
 const fire=(type,patch={})=>listeners[type]({button:0,isPrimary:true,pointerId:1,clientX:40,clientY:40,...patch});
 const advance=ms=>{const end=time+ms;while(true){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;time=next[1].at;timers.delete(next[0]);next[1].fn()}time=end};
 return {b,status,context,consume,fire,advance,windowListeners,documentListeners,get saved(){return saved},get renders(){return renders}};
}

test('clears only history at 2000 ms and consumes the release click',()=>{
 const t=setup();t.fire('pointerdown');t.advance(1999);assert.equal(t.context.hist.length,1);
 t.advance(1);assert.equal(t.context.hist.length,0);assert.deepEqual(t.saved,[]);assert.equal(t.renders,1);
 assert.equal(t.context.expr,'123');assert.equal(t.context.settings.skin,'mint');assert.equal(t.b.textContent,'✓');
 t.fire('pointerup');assert.equal(t.consume(),true);assert.equal(t.consume(),false);t.advance(850);assert.equal(t.b.textContent,'AC');
});
test('short taps do not clear history and retain the normal AC click',()=>{
 const t=setup();t.fire('pointerdown');t.advance(900);t.fire('pointerup');t.advance(2100);
 assert.equal(t.context.hist.length,1);assert.equal(t.saved,null);assert.equal(t.consume(),false);
});
for(const type of ['pointercancel','pointerleave','lostpointercapture'])test(type+' cancels the destructive hold',()=>{
 const t=setup();t.fire('pointerdown');t.advance(1500);t.fire(type);t.advance(1000);assert.equal(t.context.hist.length,1);
});
test('moving a finger away, hiding the app, and losing focus cancel the hold',()=>{
 for(const action of [t=>t.fire('pointermove',{clientX:65}),t=>t.windowListeners.blur(),t=>{t.context.document.hidden=true;t.documentListeners.visibilitychange()}]){
  const t=setup();t.fire('pointerdown');action(t);t.advance(2500);assert.equal(t.context.hist.length,1);
 }
});
test('secondary mouse buttons and extra fingers do not start a hold',()=>{
 for(const patch of [{button:2},{isPrimary:false}]){const t=setup();t.fire('pointerdown',patch);t.advance(2500);assert.equal(t.saved,null)}
});
test('syntax, right-handed key order, and lower canvas color',()=>{
 for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new Function(m[1]);
 const keys=vm.runInNewContext(html.match(/const sk=(.*);/)[1]);assert.deepEqual(Array.from(keys.slice(0,4)),['^','√','(',')']);
 assert(!html.includes('canvas=document.documentElement.classList.contains'));
 assert(html.includes('document.documentElement.style.backgroundColor=bg'));
 assert(html.includes('.screen::before'));
 assert(!html.includes('fullResetApp'));
});
