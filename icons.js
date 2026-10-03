/* Local, deterministic icon artwork. No theme data or generated pixels leave the device. */
const CalcIcons=(()=>{
 const CACHE='chunky-calc-user-icons-v1';let manifestURL;
 function draw(recipe,size=512){
  CalcData.validateIcon(recipe);const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');x.scale(size/512,size/512);
  let state=recipe.seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
  const p=recipe.colors,v=recipe.variant,extras=Object.keys(p).filter(k=>k.startsWith('part_')).map(k=>p[k]);
  const accents=[p.op,p.fn,...extras],accent=accents[Math.floor(random()*accents.length)],bg=[p.bg,p.screen,p.panel,p.key,p.op][v];
  const round=(a,b,w,h,r,fill,shadow=false)=>{x.save();if(shadow){x.shadowColor='#00000040';x.shadowBlur=18;x.shadowOffsetY=12}x.fillStyle=fill;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();x.restore()};
  const label=(text,a,b,color,font=50)=>{x.fillStyle=color;x.font='700 '+font+'px system-ui, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(text,a,b)};
  x.fillStyle=bg;x.fillRect(0,0,512,512);
  const glow=x.createLinearGradient(0,0,512,512);glow.addColorStop(0,'#ffffff1f');glow.addColorStop(1,'#00000014');x.fillStyle=glow;x.fillRect(0,0,512,512);
  const r=18+Math.floor(random()*14);
  if(v===2){
   round(72,72,368,368,64,p.screen,true);const colors=[p.key,p.fn,accent,p.op],texts=['+','−','×','='];
   colors.forEach((col,i)=>{const a=100+i%2*166,b=100+Math.floor(i/2)*166;round(a,b,146,146,r,col);label(texts[i],a+73,b+73,i===3?p.optx:i===0?p.keytx:p.fntx,78)});
  }else{
   let left=v===1?100:92,top=v===3?88:60,width=328,height=392;
   if(v===4){left=88;width=336;top=68;height=376;round(54,34,404,444,72,p.opd);}
   round(left,top,width,height,48,v===1?p.bg:p.panel,true);
   round(left+25,top+26,width-50,86,22,p.screen);
   // Three simple display strokes read clearly at Home Screen size.
   x.fillStyle=p.ink;for(let i=0;i<3;i++)round(left+width-112+i*24,top+51,12,34,5,p.ink);
   const gap=13,kw=(width-50-gap*2)/3,kh=58;
   for(let row=0;row<3;row++)for(let col=0;col<3;col++){
    const a=left+25+col*(kw+gap),b=top+134+row*(kh+17),op=col===2;
    round(a,b+5,kw,kh,r,op?p.opd:row===0?p.fnd:p.keyd);
    round(a,b,kw,kh,r,op?(v===1?accent:p.op):row===0?p.fn:p.key);
    if(op)label(['+','−','='][row],a+kw/2,b+kh/2,p.optx,40);else if(v===3)label(String(7-row*3+col),a+kw/2,b+kh/2,row===0?p.fntx:p.keytx,29);
    else round(a+kw/2-5,b+kh/2-5,10,10,5,row===0?p.fntx:p.keytx);
   }
   if(v===1){x.fillStyle=accent;x.fillRect(0,0,30,512)}
  }
  return c;
 }
 const recipe=(colors,themeName,variant,seed)=>({version:1,seed,variant,colors:CalcThemes.palette(colors),themeName:themeName.slice(0,40)});
 function generate(colors,themeName){const seeds=crypto.getRandomValues(new Uint32Array(5));return [...seeds].map((seed,i)=>recipe(colors,themeName,i,seed))}
 function dataURL(r,size){return draw(r,size).toDataURL('image/png')}
 async function install(r){
  CalcData.validateIcon(r);const base=new URL('./',location.href),images={};
  for(const size of [32,180,192,512])images[size]=dataURL(r,size);
  let urls={...images},cached=false;
  if('serviceWorker' in navigator&&navigator.serviceWorker.controller&&'caches' in globalThis){
   try{
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(r))),id=[...new Uint8Array(digest)].slice(0,12).map(v=>v.toString(16).padStart(2,'0')).join('');
    const cache=await caches.open(CACHE);
    for(const size of [32,180,192,512]){const url=new URL('./local-icon/'+id+'-'+size+'.png',base).href;const blob=await new Promise(resolve=>draw(r,size).toBlob(resolve,'image/png'));if(!blob)throw Error('Could not render icon.');await cache.put(url,new Response(blob,{headers:{'Content-Type':'image/png','Cache-Control':'no-store'}}));urls[size]=url}
    cached=true;
   }catch(_){urls={...images}}
  }
  // Replace every competing declaration, including Apple's higher-priority icon.
  document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]').forEach(n=>n.remove());
  for(const [rel,size] of [['apple-touch-icon',180],['icon',32]]){const link=document.createElement('link');link.rel=rel;link.type='image/png';link.sizes=size+'x'+size;link.href=urls[size];document.head.append(link)}
  const manifest={name:'Chunky Calc',short_name:'Chunky Calc',id:base.href,start_url:base.href,scope:base.href,display:'standalone',orientation:'portrait-primary',background_color:r.colors.bg,theme_color:r.colors.bg,icons:[192,512].map(size=>({src:urls[size],sizes:size+'x'+size,type:'image/png',purpose:'any'}))};
  const link=document.querySelector('link[rel="manifest"]');if(manifestURL)URL.revokeObjectURL(manifestURL);manifestURL=URL.createObjectURL(new Blob([JSON.stringify(manifest)],{type:'application/manifest+json'}));link.href=manifestURL;
  return {cached,images};
 }
 return {draw,generate,dataURL,install,CACHE};
})();
