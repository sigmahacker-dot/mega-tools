(function(){
'use strict';
var S='kettlebell-workout-generator', ERR=S+'-error';
var STRENGTH={
  beginner:[['Goblet squat','3','10','90 s'],['Kettlebell deadlift','3','12','90 s'],
    ['One-arm row','3','8 / side','90 s'],['Overhead press','3','8 / side','90 s'],
    ['Glute bridge','3','12','60 s']],
  intermediate:[['Double front squat','4','8','120 s'],['Kettlebell swing','4','15','90 s'],
    ['Clean and press','4','6 / side','120 s'],['Bent-over row','4','10','90 s'],
    ['Turkish get-up','3','3 / side','120 s']],
  advanced:[['Snatch','5','5 / side','120 s'],['Double front squat','5','5','150 s'],
    ['Clean and jerk','5','5 / side','150 s'],['Windmill','3','5 / side','90 s'],
    ['Heavy swing','5','20','120 s']]
};
var COND={
  beginner:{rounds:3,restBetween:'90 s',ex:[
    ['Kettlebell swing','30 s','30 s'],['Goblet squat','30 s','30 s'],
    ['Halo','30 s','30 s'],['Kettlebell deadlift','30 s','30 s']]},
  intermediate:{rounds:4,restBetween:'60 s',ex:[
    ['Kettlebell swing','40 s','20 s'],['Clean and press','40 s','20 s'],
    ['Goblet squat','40 s','20 s'],['High pull','40 s','20 s']]},
  advanced:{rounds:5,restBetween:'60 s',ex:[
    ['Snatch','45 s','15 s'],['Kettlebell swing','45 s','15 s'],
    ['Thruster','45 s','15 s'],['Goblet squat','45 s','15 s']]}
};
var lastText='';
function gen(){
  if(!TN.el(S+'-goal')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out');
  var goal=TN.el(S+'-goal').value, level=TN.el(S+'-level').value;
  var capL=level.charAt(0).toUpperCase()+level.slice(1);
  var html='',text='';
  if(goal==='strength'){
    var rows=STRENGTH[level];
    html='<h3 style="margin-top:0">Strength — '+capL+'</h3><p class="muted">Rest as listed between sets. Warm up 5 minutes first.</p>'+
      '<table class="data"><thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Rest</th></tr></thead><tbody>';
    text='Kettlebell strength workout ('+level+')\n';
    rows.forEach(function(r){
      html+='<tr><td>'+TN.esc(r[0])+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td></tr>';
      text+='- '+r[0]+': '+r[1]+' x '+r[2]+' (rest '+r[3]+')\n';
    });
    html+='</tbody></table>';
  } else {
    var c=COND[level];
    html='<h3 style="margin-top:0">Conditioning circuit — '+capL+'</h3><p class="muted">'+c.rounds+' rounds. Rest '+c.restBetween+' between rounds.</p>'+
      '<table class="data"><thead><tr><th>Exercise</th><th>Work</th><th>Rest</th></tr></thead><tbody>';
    text='Kettlebell conditioning circuit ('+level+', '+c.rounds+' rounds)\n';
    c.ex.forEach(function(r){
      html+='<tr><td>'+TN.esc(r[0])+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>';
      text+='- '+r[0]+': '+r[1]+' work / '+r[2]+' rest\n';
    });
    html+='</tbody></table><p class="muted">Rest '+c.restBetween+' between rounds.</p>';
    text+='Rest '+c.restBetween+' between rounds.\n';
  }
  lastText=text;
  out.innerHTML=html;
}
try{
  TN.on(S+'-go','click',gen);
  TN.on(S+'-goal','change',gen);
  TN.on(S+'-level','change',gen);
  TN.on(S+'-copy','click',function(){
    TN.clearErr(ERR);
    if(!lastText){ TN.setErr(ERR,'Generate a workout first.'); return; }
    TN.copy(lastText).then(function(){ TN.setErr(ERR,''); },function(){ TN.setErr(ERR,'Copy failed in this browser.'); });
  });
  gen();
}catch(e){}
})();
