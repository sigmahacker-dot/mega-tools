(function(){
'use strict';
var S='body-surface-area-calculator', ERR=S+'-error';
function calc(){
  if(!TN.el(S+'-weight')) return;
  TN.clearErr(ERR);
  var metric=TN.el(S+'-units').value==='metric';
  var w=parseFloat(TN.el(S+'-weight').value);
  var h=parseFloat(TN.el(S+'-height').value);
  if(!(w>0)||!(h>0)){ TN.setErr(ERR,'Enter weight and height greater than 0.'); return; }
  var wkg=metric?w:w*0.45359237;
  var hcm=metric?h:h*2.54;
  var dubois=0.007184*Math.pow(wkg,0.425)*Math.pow(hcm,0.725);
  var mosteller=Math.sqrt(wkg*hcm/3600);
  TN.el(S+'-dubois').textContent=(Math.round(dubois*100)/100)+' m²';
  TN.el(S+'-mosteller').textContent=(Math.round(mosteller*100)/100)+' m²';
}
try{
  ['weight','height'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  TN.on(S+'-units','change',function(){
    TN.el(S+'-weight').placeholder=TN.el(S+'-units').value==='metric'?'70':'154';
    TN.el(S+'-height').placeholder=TN.el(S+'-units').value==='metric'?'175':'69';
    calc();
  });
  calc();
}catch(e){}
})();
