(function(){
'use strict';
var S='triathlon-pace-calculator', ERR=S+'-error';
function parseTime(str){
  var m=String(str).trim().match(/^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/);
  if(!m) return NaN;
  if(m[3]!==undefined) return parseInt(m[1],10)*3600+parseInt(m[2],10)*60+parseInt(m[3],10);
  return parseInt(m[1],10)*60+parseInt(m[2],10);
}
function fmt(sec){
  sec=Math.round(sec);
  var h=Math.floor(sec/3600), m=Math.floor(sec%3600/60), s=sec%60;
  return (h>0?h+':':'')+(h>0&&m<10?'0':'')+m+':'+(s<10?'0':'')+s;
}
function fmtPace(sec){
  var m=Math.floor(sec/60), s=Math.round(sec%60);
  if(s===60){ m++; s=0; }
  return m+':'+(s<10?'0':'')+s;
}
function calc(){
  if(!TN.el(S+'-swimdist')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var sd=parseFloat(TN.el(S+'-swimdist').value), st=parseTime(TN.el(S+'-swimtime').value);
  var t1=parseTime(TN.el(S+'-t1').value);
  var bd=parseFloat(TN.el(S+'-bikedist').value), bt=parseTime(TN.el(S+'-biketime').value);
  var t2=parseTime(TN.el(S+'-t2').value);
  var rd=parseFloat(TN.el(S+'-rundist').value), rt=parseTime(TN.el(S+'-runtime').value);
  if(!(sd>0)||isNaN(st)||!(st>0)){ TN.setErr(ERR,'Enter a valid swim distance and time.'); return; }
  if(isNaN(t1)||t1<0){ TN.setErr(ERR,'Enter T1 as mm:ss.'); return; }
  if(!(bd>0)||isNaN(bt)||!(bt>0)){ TN.setErr(ERR,'Enter a valid bike distance and time.'); return; }
  if(isNaN(t2)||t2<0){ TN.setErr(ERR,'Enter T2 as mm:ss.'); return; }
  if(!(rd>0)||isNaN(rt)||!(rt>0)){ TN.setErr(ERR,'Enter a valid run distance and time.'); return; }
  var total=st+t1+bt+t2+rt;
  TN.el(S+'-total').textContent=fmt(total);
  TN.el(S+'-swimpace').textContent=fmtPace(st/(sd/100));
  TN.el(S+'-bikespeed').textContent=(Math.round(bd/(bt/3600)*10)/10)+' km/h';
  TN.el(S+'-runpace').textContent=fmtPace(rt/rd);
  var parts=[['Swim',st],['T1',t1],['Bike',bt],['T2',t2],['Run',rt]];
  var html='<table class="data"><thead><tr><th>Split</th><th>Time</th><th>% of total</th></tr></thead><tbody>';
  parts.forEach(function(p){
    html+='<tr><td>'+p[0]+'</td><td>'+fmt(p[1])+'</td><td>'+Math.round(p[1]/total*1000)/10+'%</td></tr>';
  });
  out.innerHTML=html+'</tbody></table>';
}
try{
  ['swimdist','swimtime','t1','bikedist','biketime','t2','rundist','runtime'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
