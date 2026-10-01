(function(){
'use strict';
var S='running-race-predictor', ERR=S+'-error';
function parseTime(str){
  var m=String(str).trim().match(/^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/);
  if(!m) return NaN;
  if(m[3]!==undefined) return parseInt(m[1],10)*3600+parseInt(m[2],10)*60+parseInt(m[3],10);
  return parseInt(m[1],10)*60+parseInt(m[2],10);
}
function fmt(sec){
  sec=Math.round(sec);
  var h=Math.floor(sec/3600), m=Math.floor(sec%3600/60), s=sec%60;
  var mm=(h>0&&m<10?'0':'')+m, ss=(s<10?'0':'')+s;
  return (h>0?h+':':'')+mm+':'+ss;
}
function paceStr(sec,km){
  var p=sec/km, m=Math.floor(p/60), s=Math.round(p%60);
  if(s===60){ m++; s=0; }
  return m+':'+(s<10?'0':'')+s+' /km';
}
function calc(){
  if(!TN.el(S+'-dist')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var dv=TN.el(S+'-dist').value;
  var d1=dv==='custom'?parseFloat(TN.el(S+'-custom').value):parseFloat(dv);
  var t1=parseTime(TN.el(S+'-time').value);
  if(!(d1>0)){ TN.setErr(ERR,'Enter a valid known distance.'); return; }
  if(isNaN(t1)||!(t1>0)){ TN.setErr(ERR,'Enter your time as mm:ss or h:mm:ss.'); return; }
  var targets=[['5K',5],['10K',10],['Half marathon',21.0975],['Marathon',42.195]];
  var tc=parseFloat(TN.el(S+'-target').value);
  if(tc>0) targets.push(['Custom ('+tc+' km)',tc]);
  var html='<table class="data"><thead><tr><th>Distance</th><th>Predicted time</th><th>Pace</th></tr></thead><tbody>';
  targets.forEach(function(t){
    var t2=t1*Math.pow(t[1]/d1,1.06);
    html+='<tr><td>'+t[0]+'</td><td><strong>'+fmt(t2)+'</strong></td><td>'+paceStr(t2,t[1])+'</td></tr>';
  });
  out.innerHTML=html+'</tbody></table>';
  TN.el(S+'-customwrap').style.display=dv==='custom'?'':'none';
}
try{
  TN.on(S+'-dist','change',calc);
  ['custom','time','target'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
