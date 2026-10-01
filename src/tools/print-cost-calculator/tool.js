(function(){
'use strict';
var S='print-cost-calculator', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:4,maximumFractionDigits:4}); }
function money2(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function calc(){
  if(!TN.el(S+'-blackprice')) return;
  TN.clearErr(ERR);
  var bp=parseFloat(TN.el(S+'-blackprice').value);
  var by=parseFloat(TN.el(S+'-blackyield').value);
  var cp=parseFloat(TN.el(S+'-colorprice').value)||0;
  var cy=parseFloat(TN.el(S+'-coloryield').value)||0;
  var ream=parseFloat(TN.el(S+'-ream').value)||0;
  var sheets=parseFloat(TN.el(S+'-sheets').value);
  var mp=parseFloat(TN.el(S+'-monopages').value)||0;
  var cpgs=parseFloat(TN.el(S+'-colorpages').value)||0;
  if(!(bp>=0)||!(by>0)){ TN.setErr(ERR,'Enter a valid black cartridge price and yield.'); return; }
  if(!(sheets>0)){ TN.setErr(ERR,'Enter sheets per ream greater than 0.'); return; }
  if(cp>0&&!(cy>0)){ TN.setErr(ERR,'Enter a color cartridge yield greater than 0.'); return; }
  var paper=ream/sheets;
  var monoCost=bp/by+paper;
  var colorCost=cp>0?(cp/cy+paper):0;
  TN.el(S+'-mono').textContent=money(monoCost);
  TN.el(S+'-color').textContent=cp>0?money(colorCost):'n/a';
  TN.el(S+'-total').textContent=money2(mp*monoCost+cpgs*colorCost);
}
try{
  ['blackprice','blackyield','colorprice','coloryield','ream','sheets','monopages','colorpages'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
