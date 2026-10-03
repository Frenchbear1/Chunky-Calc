/* Fast everyday and aviation unit conversion. */
const CalcConversions=(()=>{
 'use strict';
 const unit=(id,name,symbol,factor)=>({id,name,symbol,toBase:value=>value*factor,fromBase:value=>value/factor});
 const custom=(id,name,symbol,toBase,fromBase)=>({id,name,symbol,toBase,fromBase});
 const linearCategory=(id,name,group,defaults,units,note='')=>({id,name,group,defaults,units,note});
 const categories=[
  linearCategory('length','Length & distance','Everyday',['m','ft'],[
   unit('mm','Millimeters','mm',.001),unit('cm','Centimeters','cm',.01),unit('m','Meters','m',1),unit('km','Kilometers','km',1000),
   unit('in','Inches','in',.0254),unit('ft','Feet','ft',.3048),unit('yd','Yards','yd',.9144),unit('mi','Miles','mi',1609.344),unit('nmi','Nautical miles','NM',1852)
  ]),
  linearCategory('area','Area','Everyday',['sqm','sqft'],[
   unit('sqcm','Square centimeters','cm²',.0001),unit('sqm','Square meters','m²',1),unit('sqkm','Square kilometers','km²',1e6),
   unit('sqin','Square inches','in²',.00064516),unit('sqft','Square feet','ft²',.09290304),unit('sqyd','Square yards','yd²',.83612736),
   unit('acre','Acres','ac',4046.8564224),unit('hectare','Hectares','ha',10000)
  ]),
  linearCategory('volume','Volume & cooking','Everyday',['l','usgal'],[
   unit('ml','Milliliters','mL',.001),unit('l','Liters','L',1),unit('tsp','Teaspoons (US)','tsp',.00492892159375),
   unit('tbsp','Tablespoons (US)','tbsp',.01478676478125),unit('floz','Fluid ounces (US)','fl oz',.0295735295625),
   unit('cup','Cups (US)','cup',.2365882365),unit('pint','Pints (US)','pt',.473176473),unit('quart','Quarts (US)','qt',.946352946),
   unit('usgal','Gallons (US)','US gal',3.785411784),unit('impgal','Gallons (Imperial)','Imp gal',4.54609)
  ]),
  linearCategory('mass','Weight & mass','Everyday',['kg','lb'],[
   unit('mg','Milligrams','mg',.000001),unit('g','Grams','g',.001),unit('kg','Kilograms','kg',1),
   unit('oz','Ounces','oz',.028349523125),unit('lb','Pounds','lb',.45359237),unit('stone','Stone','st',6.35029318),unit('ton','Short tons','US ton',907.18474)
  ]),
  {id:'temperature',name:'Temperature',group:'Everyday',defaults:['c','f'],note:'',units:[
   custom('c','Celsius','°C',v=>v,v=>v),custom('f','Fahrenheit','°F',v=>(v-32)*5/9,v=>v*9/5+32),custom('k','Kelvin','K',v=>v-273.15,v=>v+273.15)
  ]},
  linearCategory('speed','Speed','Everyday',['mph','kmh'],[
   unit('ms','Meters per second','m/s',1),unit('kmh','Kilometers per hour','km/h',1/3.6),unit('mph','Miles per hour','mph',.44704),
   unit('kt','Knots','kt',.5144444444444445),unit('fts','Feet per second','ft/s',.3048)
  ]),
  linearCategory('time','Time','Everyday',['hr','min'],[
   unit('ms','Milliseconds','ms',.001),unit('sec','Seconds','sec',1),unit('min','Minutes','min',60),unit('hr','Hours','hr',3600),
   unit('day','Days','day',86400),unit('week','Weeks','week',604800)
  ]),
  linearCategory('pressure','Pressure','Everyday',['psi','bar'],[
   unit('pa','Pascals','Pa',1),unit('hpa','Hectopascals','hPa',100),unit('kpa','Kilopascals','kPa',1000),
   unit('bar','Bar','bar',100000),unit('psi','Pounds per square inch','psi',6894.757293168),unit('inhg','Inches of mercury','inHg',3386.389),
   unit('mmhg','Millimeters of mercury','mmHg',133.322387415)
  ]),
  linearCategory('energy','Energy','Everyday',['kcal','kj'],[
   unit('j','Joules','J',1),unit('kj','Kilojoules','kJ',1000),unit('cal','Calories','cal',4.184),
   unit('kcal','Kilocalories','kcal',4184),unit('wh','Watt-hours','Wh',3600),unit('kwh','Kilowatt-hours','kWh',3600000),unit('btu','BTU','BTU',1055.05585262)
  ]),
  linearCategory('data','Digital storage','Everyday',['gb','mb'],[
   unit('b','Bytes','B',1),unit('kb','Kilobytes','KB',1000),unit('mb','Megabytes','MB',1e6),unit('gb','Gigabytes','GB',1e9),unit('tb','Terabytes','TB',1e12),
   unit('kib','Kibibytes','KiB',1024),unit('mib','Mebibytes','MiB',1048576),unit('gib','Gibibytes','GiB',1073741824)
  ]),
  linearCategory('avdistance','Aviation · Distance','Aviation',['nmi','mi'],[
   unit('nmi','Nautical miles','NM',1852),unit('mi','Statute miles','SM',1609.344),unit('km','Kilometers','km',1000),
   unit('m','Meters','m',1),unit('ft','Feet','ft',.3048)
  ]),
  linearCategory('altitude','Aviation · Altitude','Aviation',['ft','m'],[
   unit('ft','Feet','ft',.3048),unit('m','Meters','m',1),unit('km','Kilometers','km',1000)
  ]),
  linearCategory('airspeed','Aviation · Airspeed','Aviation',['kt','mph'],[
   unit('kt','Knots','kt',.5144444444444445),unit('mph','Miles per hour','mph',.44704),unit('kmh','Kilometers per hour','km/h',1/3.6),unit('ms','Meters per second','m/s',1)
  ]),
  linearCategory('vertical','Aviation · Vertical speed','Aviation',['fpm','ms'],[
   unit('fpm','Feet per minute','ft/min',.00508),unit('fps','Feet per second','ft/s',.3048),unit('mmin','Meters per minute','m/min',1/60),unit('ms','Meters per second','m/s',1)
  ]),
  linearCategory('altimeter','Aviation · Altimeter pressure','Aviation',['inhg','hpa'],[
   unit('inhg','Inches of mercury','inHg',3386.389),unit('hpa','Hectopascals','hPa',100),unit('mb','Millibars','mb',100),unit('kpa','Kilopascals','kPa',1000)
  ]),
  linearCategory('avfuelvolume','Aviation · Fuel volume','Aviation',['usgal','l'],[
   unit('usgal','Gallons (US)','US gal',3.785411784),unit('l','Liters','L',1),unit('impgal','Gallons (Imperial)','Imp gal',4.54609),unit('quart','Quarts (US)','qt',.946352946)
  ]),
  linearCategory('avgas','Aviation · Avgas weight','Aviation',['usgal','lb'],[
   unit('usgal','Gallons (US)','US gal',2.72155422),unit('l','Liters','L',.7189538),unit('lb','Pounds','lb',.45359237),unit('kg','Kilograms','kg',1)
  ],'Approximate planning value using 6.0 lb per US gallon. Actual density varies with temperature and fuel grade.'),
  linearCategory('jeta','Aviation · Jet A weight','Aviation',['usgal','lb'],[
   unit('usgal','Gallons (US)','US gal',3.039068879),unit('l','Liters','L',.8028278),unit('lb','Pounds','lb',.45359237),unit('kg','Kilograms','kg',1)
  ],'Approximate planning value using 6.7 lb per US gallon. Actual density varies with temperature and fuel specification.')
 ];
 const byId=id=>categories.find(category=>category.id===id);
 const element=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node};
 let opened=null,lastCategory='length',sound=()=>{};
 const savedPairs=new Map();
 const numeric=value=>{const number=Number(value);return Number.isFinite(number)?number:null};
 const editNumber=value=>{
  if(!Number.isFinite(value))return '0';
  if(Object.is(value,-0))return '0';
  const abs=Math.abs(value);
  if(abs!==0&&(abs>=1e12||abs<1e-9))return value.toExponential(10).replace(/\.0+e/,'e').replace(/(\.\d*?)0+e/,'$1e');
  return Number(value.toPrecision(12)).toString();
 };
 const displayNumber=value=>{
  if(!Number.isFinite(value))return '—';
  const abs=Math.abs(value);
  if(abs!==0&&(abs>=1e12||abs<1e-8))return value.toExponential(8).replace(/\.0+e/,'e').replace(/(\.\d*?)0+e/,'$1e');
  return new Intl.NumberFormat(undefined,{maximumSignificantDigits:10,useGrouping:true}).format(value);
 };
 function open(){
  if(opened){opened.querySelector('.conversion-close')?.focus();return}
  const modal=element('div','sheet on conversion-sheet'),panel=element('section','panel conversion-panel'),header=element('div','ph conversion-header');
  modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Unit converter');
  const title=element('b','', 'Convert'),close=element('button','pill conversion-close','Close');close.type='button';header.append(title,close);
  const body=element('div','conversion-body'),categoryLabel=element('label','conversion-category'),categoryTitle=element('span','','Conversion type'),categorySelect=element('select');
  const groups={};categories.forEach(category=>{if(!groups[category.group]){groups[category.group]=document.createElement('optgroup');groups[category.group].label=category.group;categorySelect.append(groups[category.group])}const option=element('option','',category.name.replace(/^Aviation · /,''));option.value=category.id;groups[category.group].append(option)});
  categoryLabel.append(categoryTitle,categorySelect);
  const card=element('div','conversion-card'),rowA=element('div','conversion-row active'),rowB=element('div','conversion-row'),swap=element('button','conversion-swap','⇅');
  swap.type='button';swap.setAttribute('aria-label','Swap units');
  const makeRow=(row,side,labelText)=>{
   row.dataset.side=side;row.tabIndex=0;row.setAttribute('role','group');
   const top=element('div','conversion-row-top'),label=element('span','conversion-row-label',labelText),select=element('select','conversion-unit'),value=element('div','conversion-value','0');
   select.setAttribute('aria-label',labelText+' unit');top.append(label,select);row.append(top,value);return {row,select,value};
  };
  const a=makeRow(rowA,'a','From'),b=makeRow(rowB,'b','To');card.append(rowA,swap,rowB);
  const note=element('p','conversion-note');
  const keypad=element('div','conversion-keypad');
  const keys=[['7','digit'],['8','digit'],['9','digit'],['AC','action'],['4','digit'],['5','digit'],['6','digit'],['±','action'],['1','digit'],['2','digit'],['3','digit'],['⌫','action'],['00','digit'],['0','digit'],['.','digit'],['⇅','swap']];
  keys.forEach(([text,kind])=>{const button=element('button','conversion-key '+(kind==='digit'?'number':'conversion-key-action'),text);button.type='button';button.dataset.key=text;button.setAttribute('aria-label',text==='⌫'?'Backspace':text==='⇅'?'Swap units':text);keypad.append(button)});
  body.append(categoryLabel,card,note,keypad);panel.append(header,body);modal.append(panel);document.body.append(modal);opened=modal;
  let category=byId(lastCategory)||categories[0],active='a',raw='1',leftId,rightId;
  const getUnit=id=>category.units.find(item=>item.id===id);
  const sourceUnit=()=>getUnit(active==='a'?leftId:rightId),targetUnit=()=>getUnit(active==='a'?rightId:leftId);
  const converted=()=>{const value=numeric(raw);if(value===null)return null;return targetUnit().fromBase(sourceUnit().toBase(value))};
  const remember=()=>savedPairs.set(category.id,[leftId,rightId]);
  const fillSelect=(select,selected)=>{select.replaceChildren();category.units.forEach(item=>{const option=element('option','',item.name+' ('+item.symbol+')');option.value=item.id;select.append(option)});select.value=selected};
  const render=()=>{
   rowA.classList.toggle('active',active==='a');rowB.classList.toggle('active',active==='b');
   const output=converted(),activeValue=raw===''||raw==='-'?'0':raw,inactiveValue=output===null?'—':displayNumber(output);
   a.value.textContent=active==='a'?activeValue:inactiveValue;b.value.textContent=active==='b'?activeValue:inactiveValue;
   a.value.title=a.value.textContent;b.value.title=b.value.textContent;
   note.textContent=category.note||'Tap either value to enter from that side.';
  };
  const chooseCategory=id=>{
   category=byId(id)||categories[0];lastCategory=category.id;categorySelect.value=category.id;
   const pair=savedPairs.get(category.id)||category.defaults;leftId=pair[0];rightId=pair[1];fillSelect(a.select,leftId);fillSelect(b.select,rightId);raw='1';active='a';render();
  };
  const activate=side=>{
   if(side===active)return;
   const value=converted();raw=value===null?'0':editNumber(value);active=side;render();
  };
  const swapUnits=()=>{
   const value=converted(),oldLeft=leftId;leftId=rightId;rightId=oldLeft;
   if(value!==null)raw=editNumber(value);fillSelect(a.select,leftId);fillSelect(b.select,rightId);remember();render();sound('morph');
  };
  const input=key=>{
   sound(/^\d|\.$/.test(key)?key:key==='⌫'?'back':key==='AC'?'clear':'morph');
   if(key==='AC')raw='0';
   else if(key==='±')raw=raw.startsWith('-')?raw.slice(1):(raw==='0'?'0':'-'+raw);
   else if(key==='⌫'){raw=raw.length>1?raw.slice(0,-1):'0';if(raw==='-'||raw==='')raw='0'}
   else if(key==='.') {if(!raw.includes('.'))raw+=(raw===''||raw==='-'?'0.':'.')}
   else if(/^\d+$/.test(key)){if(raw.replace('-','').replace('.','').length>=16)return;raw=raw==='0'?key:raw==='-0'?'-'+key:raw+key}
   render();
  };
  const closeModal=()=>{if(!opened)return;opened.remove();opened=null};
  close.onclick=closeModal;modal.onclick=event=>{if(event.target===modal)closeModal()};
  rowA.onclick=event=>{if(!event.target.closest('select'))activate('a')};rowB.onclick=event=>{if(!event.target.closest('select'))activate('b')};
  rowA.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate('a')}};
  rowB.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate('b')}};
  a.select.onchange=()=>{leftId=a.select.value;remember();render()};b.select.onchange=()=>{rightId=b.select.value;remember();render()};
  categorySelect.onchange=()=>chooseCategory(categorySelect.value);swap.onclick=swapUnits;
  keypad.onclick=event=>{const button=event.target.closest('[data-key]');if(!button)return;button.dataset.key==='⇅'?swapUnits():input(button.dataset.key)};
  modal.addEventListener('keydown',event=>{
   event.stopPropagation();
   if(event.key==='Escape'){event.preventDefault();closeModal();return}
   if(/^\d$/.test(event.key)||event.key==='.'){event.preventDefault();input(event.key)}
   else if(event.key==='Backspace'){event.preventDefault();input('⌫')}
   else if(event.key==='-'||event.key==='_'){event.preventDefault();input('±')}
   else if(event.key==='Delete'){event.preventDefault();input('AC')}
   if(event.key==='Tab'){const items=[...panel.querySelectorAll('button,select,[tabindex="0"]')].filter(node=>!node.disabled),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
  });
  chooseCategory(category.id);close.focus();
 }
 const close=()=>{if(opened){opened.remove();opened=null}};
 const setSound=fn=>{sound=typeof fn==='function'?fn:()=>{}};
 return {open,close,setSound,categories};
})();
