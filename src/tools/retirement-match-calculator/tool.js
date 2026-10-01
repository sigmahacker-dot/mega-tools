(function(){
'use strict';
var S='retirement-match-calculator', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function calc(){
  if(!TN.el(S+'-salary')) return;
  TN.clearErr(ERR);
  var salary=parseFloat(TN.el(S+'-salary').value);
  var contrib=parseFloat(TN.el(S+'-contrib').value);
  var rate=parseFloat(TN.el(S+'-rate').value);
  var cap=parseFloat(TN.el(S+'-cap').value);
  if(!(salary>0)){ TN.setErr(ERR,'Enter a salary greater than 0.'); return; }
  if([contrib,rate,cap].some(function(v){ return isNaN(v)||v<0; })){ TN.setErr(ERR,'Enter valid non-negative percentages.'); return; }
  var yours=salary*contrib/100;
  var matchedPct=Math.min(contrib,cap);
  var employer=salary*matchedPct/100*rate/100;
  TN.el(S+'-yours').textContent=money(yours);
  TN.el(S+'-employer').textContent=money(employer);
  TN.el(S+'-total').textContent=money(yours+employer);
  TN.el(S+'-freepct').textContent=(Math.round(employer/salary*10000)/100)+'%';
  var note=TN.el(S+'-note');
  if(contrib<cap){
    var extra=salary*(cap-contrib)/100*rate/100;
    note.textContent='Raising your contribution to '+cap+'% would capture an extra '+money(extra)+'/yr of match.';
  } else {
    note.textContent='You are capturing the full match available under this formula.';
  }
}
try{
  ['salary','contrib','rate','cap'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
