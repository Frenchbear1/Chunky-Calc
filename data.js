/* All persistent user data is registered here. Shell caches are disposable. */
const CalcData=(()=>{
 'use strict';
 const APP_VERSION='22',BACKUP_VERSION=1,JOURNAL='cc_restore_journal_v1';
 const clone=v=>JSON.parse(JSON.stringify(v));
 function text(v,label,max=100000){if(typeof v!=='string'||v.length>max)throw Error(label+' must be text under '+max+' characters.');return v}
 function number(v,label,min,max){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error(label+' must be between '+min+' and '+max+'.');return v}
 function settings(v){
  CalcThemes.record(v,'Settings');CalcThemes.safeTree(v);
  const allowed=['skin','sound','silent','pack','dynamic','vol','custom','customStyle','customThemes','customThemeId','builtinOverrides','deletedBuiltins','haptics','themeColors','recentColors'];
  CalcThemes.only(v,allowed,'Settings');
  if(v.skin!==undefined&&![...CalcThemes.builtins,'custom'].includes(v.skin))throw Error('Unknown selected theme.');
  for(const k of ['sound','silent','dynamic','haptics'])if(v[k]!==undefined&&typeof v[k]!=='boolean')throw Error(k+' must be true or false.');
  if(v.vol!==undefined)number(v.vol,'Volume',0,1);
  if(v.pack!==undefined&&!['arcade','soft','marimba','bubble','clicky','typewriter'].includes(v.pack))throw Error('Unknown sound pack.');
  if(v.custom)CalcThemes.validatePalette(v.custom,false);
  if(v.customStyle!==undefined)CalcThemes.validateStyle(v.customStyle);
  if(v.customThemeId!==undefined)text(v.customThemeId,'Selected theme ID',100);
  if(v.builtinOverrides!==undefined){CalcThemes.record(v.builtinOverrides,'Built-in theme edits');for(const [id,t] of Object.entries(v.builtinOverrides)){if(!CalcThemes.builtins.includes(id))throw Error('Unknown built-in theme edit.');CalcThemes.only(t,['name','colors','style'],'Built-in theme edit');text(t.name,'Theme name',40);CalcThemes.validatePalette(t.colors,false);if(t.style!==undefined)CalcThemes.validateStyle(t.style)}}
  if(v.deletedBuiltins!==undefined){if(!Array.isArray(v.deletedBuiltins)||v.deletedBuiltins.some(id=>!CalcThemes.builtins.includes(id)))throw Error('Invalid deleted built-in themes.');v.deletedBuiltins=[...new Set(v.deletedBuiltins)]}
  if(v.customThemes!==undefined){
   if(!Array.isArray(v.customThemes)||v.customThemes.length>1000)throw Error('Custom themes must be a list of at most 1,000 themes.');
   const ids=new Set();for(const t of v.customThemes){CalcThemes.only(t,['id','name','colors','style'],'Saved theme');text(t.id,'Theme ID',100);text(t.name,'Theme name',40);
    if(!t.id||!t.name.trim()||ids.has(t.id)||CalcThemes.builtins.includes(t.id))throw Error('Invalid or duplicate custom theme ID/name.');ids.add(t.id);CalcThemes.validatePalette(t.colors,false);if(t.style!==undefined)CalcThemes.validateStyle(t.style)}
   if(v.skin==='custom'&&v.customThemeId&&!ids.has(v.customThemeId))throw Error('The selected custom theme is missing.');
  }
  for(const k of ['themeColors','recentColors'])if(v[k]!==undefined){if(!Array.isArray(v[k])||v[k].length>1000||v[k].some(c=>!CalcThemes.color(c)))throw Error('Invalid legacy color list: '+k)}
  return v;
 }
 function history(v){
  if(!Array.isArray(v)||v.length>100000)throw Error('History must be a list of at most 100,000 calculations.');
  for(const h of v){CalcThemes.only(h,['e','r','t'],'History entry');text(h.e,'Expression',4096);if(typeof h.r==='number')number(h.r,'Result',-Number.MAX_VALUE,Number.MAX_VALUE);else text(h.r,'Result',10000);number(h.t,'History timestamp',0,8640000000000000)}return v;
 }
 // Adding a new store here automatically includes it in Export Everything.
 const stores={settings:{key:'cc_set',validate:settings},history:{key:'cc_hist',validate:history}};
 const retired=new Set(['cc_icon','cc_ai']);try{retired.forEach(key=>localStorage.removeItem(key))}catch(_){}
 const keys=()=>Object.values(stores).map(x=>x.key);
 function validateRaw(key,raw){if(retired.has(key))return;const def=Object.values(stores).find(x=>x.key===key);if(!def)throw Error('Unsupported app data: '+key+'. Update the app before importing this backup.');if(raw===null)return;text(raw,key,8000000);let v;try{v=JSON.parse(raw)}catch(_){throw Error('Invalid stored JSON in '+key)}CalcThemes.safeTree(v);def.validate(v)}
 function guard(){if(localStorage.getItem(JOURNAL)!==null)throw Error('An interrupted import needs recovery. Reload before changing saved data.')}
 function write(store,value){guard();const def=stores[store];def.validate(value);localStorage.setItem(def.key,JSON.stringify(value))}
 function read(store,fallback=null){try{const raw=localStorage.getItem(stores[store].key);if(raw===null)return fallback;validateRaw(stores[store].key,raw);return JSON.parse(raw)}catch(_){return fallback}}
 function collect(){
  guard();const out={};for(const key of keys()){const raw=localStorage.getItem(key);validateRaw(key,raw);out[key]=raw}
  for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith('cc_')&&key!==JOURNAL&&!keys().includes(key))throw Error('Found unrecognized Chunky data ('+key+'). Update the app before backing up; it has not been omitted.');}
  return out;
 }
 function validateBackup(v){
  CalcThemes.safeTree(v);CalcThemes.only(v,['format','version','appVersion','timestamp','data'],'Backup');
  if(v.format!=='chunky-calculator-backup')throw Error('Choose a Chunky Calculator backup file.');
  if(v.version!==BACKUP_VERSION)throw Error('Backup version '+v.version+' is not supported. This app supports version '+BACKUP_VERSION+'.');
  text(v.appVersion,'App version',40);if(typeof v.timestamp!=='string'||!Number.isFinite(Date.parse(v.timestamp)))throw Error('The backup timestamp is invalid.');
  CalcThemes.only(v.data,['localStorage'],'Backup data');CalcThemes.record(v.data.localStorage,'Backup storage');
  for(const [key,raw] of Object.entries(v.data.localStorage))validateRaw(key,raw===null?null:JSON.stringify(raw));
  for(const key of keys())if(!Object.hasOwn(v.data.localStorage,key))throw Error('Backup is incomplete: missing '+key+'.');
  if(v.data.localStorage.cc_set===null)throw Error('Backup has no calculator settings.');return v;
 }
 function backup(){return validateBackup({format:'chunky-calculator-backup',version:BACKUP_VERSION,appVersion:APP_VERSION,timestamp:new Date().toISOString(),data:{localStorage:Object.fromEntries(Object.entries(collect()).map(([k,v])=>[k,v===null?null:JSON.parse(v)]))}})}
 function parseBackup(raw){if(typeof raw!=='string'||raw.length>12000000)throw Error('Choose a JSON backup under 12 MB.');let v;try{v=JSON.parse(raw)}catch(_){throw Error('The backup is not valid JSON.')}return validateBackup(v)}
 function applyRaw(values){for(const key of keys()){const v=values[key];if(v===null)localStorage.removeItem(key);else localStorage.setItem(key,v)}for(const key of keys())if(localStorage.getItem(key)!==values[key])throw Error('Could not verify restored data.')}
 function recover(){
  const raw=localStorage.getItem(JOURNAL);if(!raw)return;
  const old=JSON.parse(raw);CalcThemes.only(old,keys(),'Recovery data');for(const k of keys()){if(!Object.hasOwn(old,k))throw Error('Incomplete recovery data');validateRaw(k,old[k])}applyRaw(old);localStorage.removeItem(JOURNAL);
 }
 function restore(value){
  validateBackup(value);const before=collect();
  // Write-ahead journal preserves the old values if quota errors or a reload interrupt restore.
  localStorage.setItem(JOURNAL,JSON.stringify(before));
  try{applyRaw(Object.fromEntries(Object.entries(value.data.localStorage).map(([k,v])=>[k,v===null?null:JSON.stringify(v)])));localStorage.removeItem(JOURNAL)}catch(err){try{applyRaw(before);localStorage.removeItem(JOURNAL)}catch(_){throw Error('Restore was interrupted. Keep this tab open and free some device storage, then reload to recover your previous data.')}throw Error('Import could not be saved. Your previous data was restored. '+err.message)}
 }
 return {APP_VERSION,BACKUP_VERSION,stores,write,read,collect,backup,parseBackup,validateBackup,restore,recover,validateSettings:settings};
})();
try{CalcData.recover()}catch(error){addEventListener('DOMContentLoaded',()=>alert('Chunky could not finish recovering an interrupted restore. '+error.message))}
