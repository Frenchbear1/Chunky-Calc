const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
function setup(){
 const nodes={},windowEvents={},documentEvents={},sounds=[],inputs=[];let hit=null,opened=0;
 const node=id=>{const classes=new Set(),events={};return {id,dataset:{},children:[],events,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},addEventListener:(t,f)=>events[t]=f,setPointerCapture(){},closest(){return this}}};
 for(const id of ['fx','gear','pad','advg'])nodes[id]=node(id);
 const key=node('square');key.dataset.k='x²';nodes.advg.children.push(key);
 const context=vm.createContext({$:id=>nodes[id],pad:nodes.pad,advg:nodes.advg,blip:k=>sounds.push(k),press:k=>inputs.push(k),openSettings:()=>opened++,addEventListener:(t,f)=>windowEvents[t]=f,document:{elementFromPoint:()=>hit,addEventListener:(t,f)=>documentEvents[t]=f}});
 vm.runInContext(html.slice(html.indexOf("const fx=$('fx')"),html.indexOf("document.addEventListener('selectstart'")),context);
 const fire=(type,patch={})=>nodes.fx.events[type]({button:0,isPrimary:true,pointerId:1,preventDefault(){},stopPropagation(){},...patch});
 return {nodes,key,inputs,sounds,fire,windowEvents,documentEvents,context,set hit(v){hit=v},get opened(){return opened}};
}
test('hold and slide left opens Settings on release, then hides the tray',()=>{
 const t=setup();t.fire('pointerdown');assert(t.nodes.pad.classList.contains('adv'));
 t.hit=t.nodes.gear;t.fire('pointermove');assert(t.nodes.gear.classList.contains('hot'));assert.equal(t.opened,0);
 t.fire('pointerup');assert.equal(t.opened,1);assert(!t.nodes.pad.classList.contains('adv'));assert(!t.nodes.gear.classList.contains('hot'));assert.deepEqual(t.inputs,[]);
});
test('advanced keys still enter a function and play its selection sound',()=>{
 const t=setup();t.fire('pointerdown');t.hit=t.key;t.fire('pointermove');t.fire('pointerup');
 assert.deepEqual(t.inputs,['x²']);assert.equal(t.sounds.at(-1),'x²');assert.equal(t.opened,0);
});
test('a tap, cancelled hold, or release away does not open Settings',()=>{
 for(const action of ['tap','pointercancel','lostpointercapture','away','blur']){
  const t=setup();t.fire('pointerdown');t.hit=t.nodes.gear;
  if(action!=='tap')t.fire('pointermove');
  if(action==='away')t.hit=null;
  if(action==='blur')t.windowEvents.blur();else if(['pointercancel','lostpointercapture'].includes(action))t.fire(action);
  t.fire('pointerup');assert.equal(t.opened,0,action);assert.deepEqual(t.inputs,[]);assert(!t.nodes.pad.classList.contains('adv'));
 }
});
test('extra fingers cannot select or release the active hold',()=>{
 const t=setup();t.fire('pointerdown');t.hit=t.nodes.gear;t.fire('pointermove',{pointerId:2});t.fire('pointerup',{pointerId:2});
 assert(t.nodes.pad.classList.contains('adv'));assert.equal(t.opened,0);t.fire('pointerup');assert.equal(t.opened,0);
});
test('keyboard activation opens Settings without a drag',()=>{
 const t=setup();t.fire('click',{detail:0});assert.equal(t.opened,1);
 t.fire('click',{detail:1});assert.equal(t.opened,1);t.fire('keydown',{key:'ArrowLeft'});assert.equal(t.opened,2);
});
