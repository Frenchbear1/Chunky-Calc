const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const Decimal=require('../vendor/decimal.js');
const c=vm.createContext({Decimal});vm.runInContext(fs.readFileSync(path.join(__dirname,'../math.js'),'utf8')+';globalThis.math=CalcMath;',c);const M=c.math;
test('daily arithmetic, decimals, grouping and powers retain their meaning',()=>{
 for(const [e,result] of [['2+3×4','14'],['(2+3)×4','20'],['0.1+0.2','0.3'],['2^3^2','512'],['−2^2','-4'],['(−2)^2','4'],['50%','0.5'],['5!','120'],['√(144)','12']])assert.equal(M.calculate(e),result,e);
});
test('scientific results beyond native Number range remain usable',()=>{
 const first=M.calculate('10^1000');assert.equal(first,'1e+1000');
 assert.equal(M.calculate(first+'×10^1000'),'1e+2000');assert.equal(M.calculate(first+'÷10^999'),'10');
 assert.equal(M.calculate('√('+first+')'),'1e+500');assert.equal(M.calculate('10^−1000'),'1e-1000');
 assert.equal(M.calculate('1e−1000×1e+1000'),'1');assert.equal(M.format(first),'1 × 10¹⁰⁰⁰');assert.equal(M.format('1e-1000'),'1 × 10⁻¹⁰⁰⁰');
 assert.equal(M.calculate(JSON.parse(JSON.stringify({r:first})).r+'+1e+1000'),'2e+1000');
});
test('scientific functions and small nonzero values remain supported',()=>{
 assert.equal(M.calculate('sin(180)'),'0');assert.equal(M.calculate('cos(0)'),'1');assert.equal(M.calculate('log(1e+1000)'),'1000');
 assert.equal(M.calculate('0.000000000000001'),'1e-15');assert.equal(M.calculate('asin(1)'),'90');
});
test('invalid expressions and nonfinite results remain errors',()=>{
 for(const s of ['1÷0','√(−1)','2hello','()','3+)','10^1000000001'])assert.throws(()=>M.calculate(s),undefined,s);
});
test('sign toggle treats scientific exponents as part of the operand',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');vm.runInContext(html.slice(html.indexOf('function toggleSign('),html.indexOf('function press(')),c);
 assert.equal(c.toggleSign('1e+1000'),'−1e+1000');assert.equal(c.toggleSign('−1e−1000'),'1e−1000');assert.equal(c.toggleSign('2+1e−1000'),'2+−1e−1000');
});
