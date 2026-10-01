(function(){
'use strict';
var S='benefits-value-calculator', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function calc(){
  if(!TN.el(S+'-salary')) return;
  TN.clearErr(ERR);
  var salary=parseFloat(TN.el(S+'-salary').value);
  var health=parseFloat(TN.el(S+'-health').value)||0;
  var contrib=parseFloat(TN.el(S+'-contrib').value)||0;
  var rate=parseFloat(TN.el(S+'-matchrate').value)||0;
  var cap=parseFloat(TN.el(S+'-matchcap').value)||0;
  var pto=parseFloat(TN.el(S+'-pto').value)||0;
  var perks=parseFloat(TN.el(S+'-perks').value)||0;
  if(!(salary>0)){ TN.setErr(ERR,'Enter a salary greater than 0.'); return; }
  if([health,contrib,rate,cap,pto,perks].some(function(v){ return v<0; })){ TN.setErr(ERR,'Values cannot be negative.'); return; }
  var match=salary*Math.min(contrib,cap)/100*rate/100;
  var ptoVal=salary/260*pto;
  var total=salary+health+match+ptoVal+perks;
  TN.el(S+'-v-salary').textContent=money(salary);
  TN.el(S+'-v-health').textContent=money(health);
  TN.el(S+'-v-match').textContent=money(match);
  TN.el(S+'-v-pto').textContent=money(ptoVal);
  TN.el(S+'-v-perks').textContent=money(perks);
  TN.el(S+'-v-total').textContent=money(total);
}
try{
  ['salary','health','contrib','matchrate','matchcap','pto','perks'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
