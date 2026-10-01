(function(){
'use strict';
var S='hiking-grade-calculator', ERR=S+'-error';
function fmtH(h){
  var hh=Math.floor(h), mm=Math.round((h-hh)*60);
  if(mm===60){ hh++; mm=0; }
  return hh+'h '+('0'+mm).slice(-2)+'m';
}
function calc(){
  if(!TN.el(S+'-gain')) return;
  TN.clearErr(ERR);
  var gain=parseFloat(TN.el(S+'-gain').value);
  var dist=parseFloat(TN.el(S+'-dist').value);
  if(!(gain>=0)){ TN.setErr(ERR,'Enter elevation gain of 0 or more.'); return; }
  if(!(dist>0)){ TN.setErr(ERR,'Enter a trail distance greater than 0.'); return; }
  var gainM=TN.el(S+'-gainunit').value==='m'?gain:gain*0.3048;
  var distKm=TN.el(S+'-distunit').value==='km'?dist:dist*1.60934;
  var grade=gainM/(distKm*1000)*100;
  TN.el(S+'-grade').textContent=(Math.round(grade*10)/10)+'%';
  var rating=grade<5?'Easy':grade<10?'Moderate':grade<15?'Hard':'Very hard';
  TN.el(S+'-rating').textContent=rating;
  TN.el(S+'-time').textContent=fmtH(distKm/5+gainM/600);
}
try{
  ['gain','dist'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  ['gainunit','distunit'].forEach(function(f){ TN.on(S+'-'+f,'change',calc); });
  calc();
}catch(e){}
})();
