(function(){
'use strict';
var S='jump-rope-workout-generator', ERR=S+'-error';
var PLANS={
  beginner:{work:30,rest:30,warm:2,cool:2,
    ex:['Basic bounce','Alternate-foot step','Boxer step'],
    warmEx:'March in place + arm circles',coolEx:'Walk + full-body stretch'},
  intermediate:{work:40,rest:20,warm:3,cool:2,
    ex:['Basic bounce','High knees','Side swing','Alternate-foot step','Boxer step'],
    warmEx:'Light bounce + dynamic leg swings',coolEx:'Walk + stretch'},
  advanced:{work:50,rest:10,warm:3,cool:3,
    ex:['Double unders','Criss-cross','High knees','Boxer step','Side swing','Alternate-foot step'],
    warmEx:'Easy bounce + mobility drills',coolEx:'Walk + deep stretch'}
};
function fmtS(s){
  var m=Math.floor(s/60), r=Math.round(s%60);
  return (m>0?m+'m ':'')+r+'s';
}
function gen(){
  if(!TN.el(S+'-level')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var level=TN.el(S+'-level').value;
  var mins=parseFloat(TN.el(S+'-duration').value);
  if(!(mins>=5&&mins<=60)){ TN.setErr(ERR,'Enter a duration between 5 and 60 minutes.'); return; }
  var p=PLANS[level];
  var totalS=Math.round(mins*60);
  var warmS=Math.min(p.warm*60,Math.floor(totalS*0.2));
  var coolS=Math.min(p.cool*60,Math.floor(totalS*0.2));
  var roundS=p.work+p.rest;
  var rounds=Math.max(1,Math.floor((totalS-warmS-coolS)/roundS));
  var workTot=rounds*p.work;
  var elapsed=warmS;
  var html='<table class="data"><thead><tr><th>#</th><th>Exercise</th><th>Work</th><th>Rest</th><th>Elapsed</th></tr></thead><tbody>';
  html+='<tr><td>–</td><td>Warm-up: '+TN.esc(p.warmEx)+'</td><td>'+fmtS(warmS)+'</td><td>–</td><td>'+fmtS(elapsed)+'</td></tr>';
  for(var i=0;i<rounds;i++){
    var ex=p.ex[i%p.ex.length];
    elapsed+=p.work;
    var elWork=fmtS(elapsed);
    elapsed+=p.rest;
    html+='<tr><td>'+(i+1)+'</td><td>'+TN.esc(ex)+'</td><td>'+p.work+'s</td><td>'+p.rest+'s</td><td>'+fmtS(elapsed)+'</td></tr>';
  }
  elapsed+=coolS;
  html+='<tr><td>–</td><td>Cool-down: '+TN.esc(p.coolEx)+'</td><td>'+fmtS(coolS)+'</td><td>–</td><td>'+fmtS(elapsed)+'</td></tr>';
  html+='</tbody></table>';
  if(elapsed<totalS){
    html+='<p class="note">Finishing '+fmtS(totalS-elapsed)+' early — add easy bounce rounds if you want the full '+mins+' minutes.</p>';
  }
  TN.el(S+'-rounds').textContent=rounds;
  TN.el(S+'-work').textContent=fmtS(workTot);
  TN.el(S+'-total').textContent=fmtS(elapsed);
  out.innerHTML=html;
}
try{
  TN.on(S+'-go','click',gen);
  TN.on(S+'-level','change',gen);
  TN.on(S+'-duration','input',gen);
  gen();
}catch(e){}
})();
