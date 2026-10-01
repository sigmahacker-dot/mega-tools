(function(){
'use strict';
var S='customs-duty-estimator', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function calc(){
  if(!TN.el(S+'-value')) return;
  TN.clearErr(ERR);
  var value=parseFloat(TN.el(S+'-value').value);
  var rate=parseFloat(TN.el(S+'-rate').value);
  var ship=parseFloat(TN.el(S+'-shipping').value)||0;
  var ins=parseFloat(TN.el(S+'-insurance').value)||0;
  var fees=parseFloat(TN.el(S+'-fees').value)||0;
  if(!(value>0)){ TN.setErr(ERR,'Enter an item value greater than 0.'); return; }
  if(isNaN(rate)||rate<0||rate>100){ TN.setErr(ERR,'Enter a duty rate between 0 and 100.'); return; }
  if([ship,ins,fees].some(function(v){ return v<0; })){ TN.setErr(ERR,'Fees cannot be negative.'); return; }
  var duty=value*rate/100;
  TN.el(S+'-duty').textContent=money(duty);
  TN.el(S+'-total').textContent=money(value+duty+ship+ins+fees);
  TN.el(S+'-eff').textContent=(Math.round(duty/value*10000)/100)+'%';
}
try{
  ['value','rate','shipping','insurance','fees'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
