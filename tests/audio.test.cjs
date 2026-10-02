const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');

function setup({state='suspended',sound=true,vol=.7,reject=false}={}){
 const starts=[],contexts=[],listeners={};let finish;
 class AudioContext{
  constructor(){this.state=state;this.currentTime=5;this.destination={};this.calls=0;contexts.push(this)}
  resume(){this.calls++;return reject?Promise.reject(new Error('blocked')):new Promise(resolve=>{finish=()=>{this.state='running';resolve()}})}
  createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect:node=>node,start:t=>starts.push(t),stop(){}}}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}
 }
 const c=vm.createContext({window:{AudioContext},navigator:{audioSession:{}},document:{hidden:false,addEventListener(t,f){listeners[t]=f}},addEventListener(){},Date,Math});
 vm.runInContext(`let ac;const S=${JSON.stringify({sound,vol,silent:true,pack:'soft',dynamic:true})};`+html.slice(html.indexOf('const hasAudioSession='),html.indexOf('function calc('))+';globalThis.settings=S;',c);
 return {c,starts,contexts,listeners,finish:()=>finish()};
}
test('first key waits for audio resume before scheduling its sound',async()=>{
 const t=setup();const pending=t.c.blip('7');assert.equal(t.starts.length,0);assert.equal(t.contexts.length,1);
 t.finish();await pending;assert.equal(t.starts.length,2);assert.equal(t.c.navigator.audioSession.type,'playback');
});
test('running audio gives one sound per key without resuming again',async()=>{
 const t=setup({state:'running'});await t.c.blip('7');await t.c.blip('8');assert.equal(t.starts.length,4);assert.equal(t.contexts[0].calls,0);
});
test('interrupted audio resumes on the next input',async()=>{
 const t=setup({state:'interrupted'});const pending=t.c.blip('7');assert.equal(t.starts.length,0);t.finish();await pending;assert.equal(t.starts.length,2);
});
test('muted or zero-volume settings never create an audio context',async()=>{
 for(const opts of [{sound:false},{vol:0}]){const t=setup(opts);await t.c.blip('7');assert.equal(t.contexts.length,0)}
});
test('mute or app hiding during resume prevents delayed sound',async()=>{
 for(const hide of [false,true]){const t=setup();const pending=t.c.blip('7');if(hide)t.c.document.hidden=true;else t.c.settings.sound=false;t.finish();await pending;assert.equal(t.starts.length,0)}
});
test('failed audio resume does not reject the input handler',async()=>{
 const t=setup({reject:true});await t.c.blip('7');assert.equal(t.starts.length,0);
});
test('accepted clicks, including edge/accessibility clicks, always pair sound with input',()=>{
 const listeners={},events=[];
 const b={classList:{add(){},remove(){}},dataset:{},getBoundingClientRect:()=>({left:0,right:80,top:0,bottom:80}),setPointerCapture(){},addEventListener(t,f){(listeners[t]??=[]).push(f)}};
 const fire=(type,e={})=>listeners[type].forEach(f=>f(e));
 const c=vm.createContext({document:{createElement:()=>b},blip:k=>events.push('sound:'+k),press:k=>events.push('input:'+k)});
 vm.runInContext(html.slice(html.indexOf('function mk('),html.indexOf('keys.forEach(')),c);
 c.mk({appendChild(){}},'7','');fire('click');assert.deepEqual(events,['sound:7','input:7']);
 events.length=0;fire('pointerdown',{pointerId:1});fire('pointerup',{clientX:40,clientY:84});fire('click');assert.deepEqual(events,['sound:7','input:7']);
 events.length=0;fire('pointerdown',{pointerId:2});fire('pointerup',{clientX:100,clientY:100});fire('click',{detail:1,preventDefault(){}});assert.deepEqual(events,[]);
});
