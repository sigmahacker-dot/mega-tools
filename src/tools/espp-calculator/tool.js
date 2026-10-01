(function(){
'use strict';
var S='espp-calculator', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function calc(){
  if(!TN.el(S+'-fmvstart')) return;
  TN.clearErr(ERR);
  var fmvS=parseFloat(TN.el(S+'-fmvstart').value);
  var fmvE=parseFloat(TN.el(S+'-fmvend').value);
  var disc=parseFloat(TN.el(S+'-discount').value);
  var contrib=parseFloat(TN.el(S+'-contrib').value);
  if(!(fmvS>0)||!(fmvE>0)){ TN.setErr(ERR,'Enter FMVs greater than 0.'); return; }
  if(isNaN(disc)||disc<0||disc>=100){ TN.setErr(ERR,'Enter a discount between 0 and 100.'); return; }
  if(!(contrib>0)){ TN.setErr(ERR,'Enter a contribution greater than 0.'); return; }
  var price=Math.min(fmvS,fmvE)*(1-disc/100);
  var shares=contrib/price;
  var value=shares*fmvE;
  var gain=value-contrib;
  TN.el(S+'-price').textContent=money(price);
  TN.el(S+'-shares').textContent=(Math.round(shares*1000)/1000).toLocaleString('en-US');
  TN.el(S+'-value').textContent=money(value);
  TN.el(S+'-gain').textContent=money(gain);
  TN.el(S+'-return').textContent=(Math.round(gain/contrib*10000)/100)+'%';
}
try{
  ['fmvstart','fmvend','discount','contrib'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
