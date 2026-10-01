(function(){
'use strict';
var S='balance-test-timer', ERR=S+'-error', LS='tn-balance-test-timer';
var running=false, startT=0, elapsed=0, timer=null;
function fmt(ms){ return (Math.round(ms/100)/10)+'s'; }
function draw(){ TN.el(S+'-display').textContent=fmt(elapsed+(running?Date.now()-startT:0)); }
function best(){ try{ return parseFloat(localStorage.getItem(LS+'-best'))||'0'; }catch(e){ return 0; } }
function setBest(v){ try{ localStorage.setItem(LS+'-best',String(v)); }catch(e){} }
function refreshStats(){
  var b=parseFloat(TN.el(S+'-age').value);
  TN.el(S+'-bench').textContent=b+'s';
  var bb=best();
  TN.el(S+'-best').textContent=bb>0?fmt(bb):'–';
}
function stop(){
  if(!running) return;
  running=false;
  clearInterval(timer);
  elapsed+=Date.now()-startT;
  draw();
  var b=parseFloat(TN.el(S+'-age').value);
  TN.el(S+'-last').textContent=fmt(elapsed);
  var msg=TN.el(S+'-msg');
  if(elapsed/1000>=b){ msg.textContent='At or above the benchmark for your age band. Well done!'; msg.style.color='#84cc16'; }
  else { msg.textContent='Below the '+b+'s benchmark. Regular balance practice can help.'; msg.style.color='#eab308'; }
  if(elapsed>best()){ setBest(elapsed); }
  refreshStats();
}
try{
  TN.on(S+'-start','click',function(){
    if(running) return;
    running=true; startT=Date.now();
    timer=setInterval(draw,50);
  });
  TN.on(S+'-stop','click',stop);
  TN.on(S+'-reset','click',function(){
    running=false; clearInterval(timer); elapsed=0; draw();
    TN.el(S+'-last').textContent='–';
  });
  TN.on(S+'-age','change',refreshStats);
  draw(); refreshStats();
}catch(e){}
})();
