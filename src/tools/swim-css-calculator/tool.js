(function(){
'use strict';
var S='swim-css-calculator', ERR=S+'-error';
function parseTime(str){
  var m=String(str).trim().match(/^(\d+):([0-5]?\d)$/);
  return m?parseInt(m[1],10)*60+parseInt(m[2],10):NaN;
}
function fmtPace(sec){
  sec=Math.round(sec);
  var m=Math.floor(sec/60), s=sec%60;
  return m+':'+(s<10?'0':'')+s;
}
function calc(){
  if(!TN.el(S+'-t400')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  TN.el(S+'-css').textContent='–';
  var t400=parseTime(TN.el(S+'-t400').value);
  var t200=parseTime(TN.el(S+'-t200').value);
  if(isNaN(t400)||!(t400>0)){ TN.setErr(ERR,'Enter the 400 m time as mm:ss.'); return; }
  if(isNaN(t200)||!(t200>0)){ TN.setErr(ERR,'Enter the 200 m time as mm:ss.'); return; }
  if(t400<=t200){ TN.setErr(ERR,'The 400 m time must be slower than the 200 m time for a valid CSS.'); return; }
  var css=(t400-t200)/2;
  TN.el(S+'-css').textContent=fmtPace(css);
  var zones=[
    ['Recovery','CSS + 12 s',css+12],['Aerobic endurance','CSS + 6 s',css+6],
    ['Tempo','CSS + 3 s',css+3],['Threshold (CSS)','CSS',css],
    ['VO2 max','CSS − 3 s',css-3],['Sprint','CSS − 6 s',css-6]
  ];
  var html='<table class="data"><thead><tr><th>Zone</th><th>Pace basis</th><th>Pace / 100 m</th></tr></thead><tbody>';
  zones.forEach(function(z){
    html+='<tr><td>'+z[0]+'</td><td>'+z[1]+'</td><td><strong>'+fmtPace(z[2])+'</strong></td></tr>';
  });
  out.innerHTML=html+'</tbody></table>';
}
try{
  ['t400','t200'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
