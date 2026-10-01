(function(){
'use strict';
var S='ftp-estimator', ERR=S+'-error';
var ZONES=[
  ['1','Active Recovery','< 55%',0,0.55],
  ['2','Endurance','55–74%',0.55,0.75],
  ['3','Tempo','75–89%',0.75,0.90],
  ['4','Lactate Threshold','90–104%',0.90,1.05],
  ['5','VO2 Max','105–120%',1.05,1.21],
  ['6','Anaerobic Capacity','121–150%',1.21,1.51],
  ['7','Neuromuscular Power','max efforts',null,null]
];
function calc(){
  if(!TN.el(S+'-power')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  TN.el(S+'-ftp').textContent='–'; TN.el(S+'-wkg').textContent='–';
  var p=parseFloat(TN.el(S+'-power').value);
  if(!(p>0)){ TN.setErr(ERR,'Enter your 20-minute average power in watts.'); return; }
  var ftp=p*0.95;
  TN.el(S+'-ftp').textContent=Math.round(ftp)+' W';
  var w=parseFloat(TN.el(S+'-weight').value);
  if(w>0) TN.el(S+'-wkg').textContent=(Math.round(ftp/w*100)/100)+' W/kg';
  var html='<table class="data"><thead><tr><th>Zone</th><th>Name</th><th>% of FTP</th><th>Watts</th></tr></thead><tbody>';
  ZONES.forEach(function(z){
    var watts=z[3]==null?'—':Math.round(ftp*z[3])+' – '+Math.round(ftp*z[4]-1)+' W';
    html+='<tr><td>'+z[0]+'</td><td>'+z[1]+'</td><td>'+z[2]+'</td><td><strong>'+watts+'</strong></td></tr>';
  });
  out.innerHTML=html+'</tbody></table>';
}
try{
  ['power','weight'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
