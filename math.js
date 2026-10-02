/* Decimal arithmetic keeps large results usable in subsequent calculations. */
const CalcMath=(()=>{
 const D=Decimal.clone({precision:32,toExpPos:15,toExpNeg:-9,maxE:1000000000,minE:-1000000000});
 const pi=new D('3.1415926535897932384626433832795029');
 const number='(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?';
 function calculate(source,degrees=true){
  let s=source.replace(/−/g,'-').replace(/\s/g,'');if(!s||s.length>4096)throw Error('Invalid expression');
  let missing=(s.match(/\(/g)||[]).length-(s.match(/\)/g)||[]).length;while(missing-->0)s+=')';
  const t=s.match(new RegExp(number+'|asin|acos|atan|abs|sin|cos|tan|ln|log|√|π|e|[-+×÷^%()!]','g'))||[];if(t.join('')!==s)throw Error('Invalid expression');let i=0;
  const rad=x=>degrees?x.mod(360).times(pi).div(180):x,angle=x=>degrees?x.times(180).div(pi):x;
  const trig=(x,fn)=>{const y=rad(x)[fn]();return y.abs().lt('1e-30')?new D(0):y};
  const F={sin:x=>trig(x,'sin'),cos:x=>trig(x,'cos'),tan:x=>trig(x,'tan'),asin:x=>angle(x.asin()),acos:x=>angle(x.acos()),atan:x=>angle(x.atan()),abs:x=>x.abs(),ln:x=>x.ln(),log:x=>x.log(10),'√':x=>x.sqrt()};
  const prim=()=>{const a=t[i++];if(a==='('){const v=ex();if(t[i++]!==')')throw Error('Missing parenthesis');return v}
   if(a==='π')return pi;if(a==='e')return new D(1).exp();
   if(F[a]){if(t[i++]!=='(')throw Error('Missing parenthesis');const v=ex();if(t[i++]!==')')throw Error('Missing parenthesis');return F[a](v)}
   if(!a||!new RegExp('^'+number+'$').test(a))throw Error('Missing number');return new D(a)};
  const post=()=>{let v=prim();while(t[i]==='%'||t[i]==='!'){if(t[i++]==='%')v=v.div(100);else{if(v.isNegative()||!v.isInteger()||v.gt(10000))throw Error('Factorial limit');let f=new D(1);for(let k=2,n=v.toNumber();k<=n;k++)f=f.times(k);v=f}}return v};
  const pw=()=>{const b=post();if(t[i]==='^'){i++;return b.pow(un())}return b};
  const un=()=>{if(t[i]==='-'){i++;return un().neg()}return pw()};
  const term=()=>{let v=un();while(t[i]==='×'||t[i]==='÷'){const o=t[i++],n=un();v=o==='×'?v.times(n):v.div(n)}return v};
  const ex=()=>{let v=term();while(t[i]==='+'||t[i]==='-'){const o=t[i++],n=term();v=o==='+'?v.plus(n):v.minus(n)}return v};
  const v=ex();if(i<t.length||!v.isFinite())throw Error('Result outside supported range');return v.toSignificantDigits(24).toString();
 }
 const superscript=s=>String(s).replace(/\+/g,'').replace(/[-\d]/g,c=>'⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(c)]);
 function format(value){
  const raw=String(value).replace(/−/g,'-');
  try{const n=new D(raw);if(n.isFinite()&&!n.isZero()&&(n.abs().gte('1e12')||n.abs().lt('1e-6'))){const [m,e]=n.toSignificantDigits(12).toExponential().split('e');return m.replace('-','−')+' × 10'+superscript(e)}}catch(_){}
  const m=raw.match(/^(-?)(\d*)(\.\d*)?$/);return m?m[1].replace('-','−')+m[2].replace(/\B(?=(\d{3})+(?!\d))/g,',')+(m[3]||''):raw;
 }
 function formatExpression(s){return s.replace(new RegExp(number.replace('[+-]','[+−-]'),'g'),m=>format(m)).replace(/([+−×÷^])/g,' $1 ')}
 return {calculate,format,formatExpression};
})();
