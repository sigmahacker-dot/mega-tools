(function(){
'use strict';
var S='stock-option-calculator', ERR=S+'-error';
function money(n){
  var neg=n<0;
  return (neg?'-$':'$')+Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function calc(){
  if(!TN.el(S+'-shares')) return;
  TN.clearErr(ERR);
  var shares=parseFloat(TN.el(S+'-shares').value);
  var strike=parseFloat(TN.el(S+'-strike').value);
  var fmv=parseFloat(TN.el(S+'-fmv').value);
  var type=TN.el(S+'-type').value;
  if(!(shares>0)){ TN.setErr(ERR,'Enter vested shares greater than 0.'); return; }
  if(!(strike>=0)||!(fmv>=0)){ TN.setErr(ERR,'Enter valid strike price and FMV.'); return; }
  var cost=shares*strike;
  var perShare=fmv-strike;
  var spread=perShare*shares;
  TN.el(S+'-cost').textContent=money(cost);
  TN.el(S+'-spread').textContent=money(spread);
  TN.el(S+'-pershare').textContent=money(perShare);
  TN.el(S+'-breakeven').textContent=money(strike);
  var note=spread<0?'Warning: these options are underwater (FMV below strike). Exercising now would lock in a loss. ':
    'These options are in the money. ';
  note+=type==='iso'?
    'ISOs may qualify for capital-gains treatment if you meet the holding periods, but the spread can trigger AMT.':
    'NSOs are generally taxed as ordinary income on the spread in the year you exercise.';
  TN.el(S+'-taxnote').textContent=note;
}
try{
  ['shares','strike','fmv','type'].forEach(function(f){ TN.on(S+'-'+f,f==='type'?'change':'input',calc); });
  calc();
}catch(e){}
})();
