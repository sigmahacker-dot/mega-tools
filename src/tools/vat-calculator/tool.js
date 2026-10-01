(function(){
'use strict';
var S='vat-calculator', ERR=S+'-error';
function money(n){ return Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function calc(){
  if(!TN.el(S+'-amount')) return;
  TN.clearErr(ERR);
  var amt=parseFloat(TN.el(S+'-amount').value);
  var rate=parseFloat(TN.el(S+'-rate').value);
  var mode=TN.el(S+'-mode').value;
  if(!(amt>=0)){ TN.setErr(ERR,'Enter a valid amount.'); return; }
  if(isNaN(rate)||rate<0||rate>100){ TN.setErr(ERR,'Enter a VAT rate between 0 and 100.'); return; }
  var net,vat,gross;
  if(mode==='add'){ net=amt; vat=net*rate/100; gross=net+vat; }
  else { gross=amt; net=gross/(1+rate/100); vat=gross-net; }
  TN.el(S+'-net').textContent=money(net);
  TN.el(S+'-vat').textContent=money(vat);
  TN.el(S+'-gross').textContent=money(gross);
}
try{
  ['amount','rate'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  TN.on(S+'-mode','change',calc);
  calc();
}catch(e){}
})();
