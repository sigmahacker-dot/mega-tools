(function(){
'use strict';
var S='roth-vs-traditional-calculator', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:0}); }
function calc(){
  if(!TN.el(S+'-contrib')) return;
  TN.clearErr(ERR);
  var c=parseFloat(TN.el(S+'-contrib').value);
  var n=parseFloat(TN.el(S+'-years').value);
  var r=parseFloat(TN.el(S+'-return').value)/100;
  var ct=parseFloat(TN.el(S+'-curtax').value);
  var rt=parseFloat(TN.el(S+'-rettax').value);
  if(!(c>0)){ TN.setErr(ERR,'Enter an annual contribution greater than 0.'); return; }
  if(!(n>=1)){ TN.setErr(ERR,'Enter years of 1 or more.'); return; }
  if(isNaN(r)||r<0){ TN.setErr(ERR,'Enter a valid expected return.'); return; }
  if([ct,rt].some(function(v){ return isNaN(v)||v<0||v>100; })){ TN.setErr(ERR,'Tax rates must be between 0 and 100.'); return; }
  var factor=r===0?n:(Math.pow(1+r,n)-1)/r;
  var roth=c*(1-ct/100)*factor;
  var trad=c*factor*(1-rt/100);
  var diff=roth-trad;
  TN.el(S+'-roth').textContent=money(roth);
  TN.el(S+'-trad').textContent=money(trad);
  TN.el(S+'-diff').textContent=(diff>=0?'+':'-')+money(Math.abs(diff)).slice(0);
  var v=TN.el(S+'-verdict');
  if(Math.abs(diff)<1){ v.textContent='Verdict: effectively a tie at these tax rates.'; }
  else if(diff>0){ v.textContent='Verdict: Roth wins by '+money(diff)+' after tax, because your retirement tax rate is higher than today\u2019s.'; }
  else { v.textContent='Verdict: Traditional wins by '+money(-diff)+' after tax, because your retirement tax rate is lower than today\u2019s.'; }
}
try{
  ['contrib','years','return','curtax','rettax'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
