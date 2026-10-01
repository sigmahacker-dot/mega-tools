(function(){
'use strict';
var S='headache-diary', ERR=S+'-error', LS='tn-headache-diary';
function nowLocal(){ var d=new Date(); function p(n){ return ('0'+n).slice(-2); } return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes()); }
function read(){ try{ return JSON.parse(localStorage.getItem(LS)||'[]'); }catch(e){ return []; } }
function write(a){ try{ localStorage.setItem(LS,JSON.stringify(a)); }catch(e){} }
function fmtDur(min){
  if(min<60) return Math.round(min)+' min';
  var h=Math.floor(min/60), m=Math.round(min%60);
  return h+'h '+(m<10?'0':'')+m+'m';
}
function render(){
  if(!TN.el(S+'-when')) return;
  var log=read().slice().sort(function(a,b){ return a.when<b.when?-1:1; });
  TN.el(S+'-count').textContent=log.length;
  if(log.length){
    var ai=log.reduce(function(a,e){ return a+e.intensity; },0)/log.length;
    var ad=log.reduce(function(a,e){ return a+e.duration; },0)/log.length;
    TN.el(S+'-avgint').textContent=(Math.round(ai*10)/10)+' / 10';
    TN.el(S+'-avgdur').textContent=fmtDur(ad);
    var tc={};
    log.forEach(function(e){ e.triggers.forEach(function(t){ tc[t]=(tc[t]||0)+1; }); });
    var top=Object.keys(tc).sort(function(a,b){ return tc[b]-tc[a]; })[0];
    TN.el(S+'-toptrig').textContent=top?top+' ('+tc[top]+')':'–';
    var html='<table class="data"><thead><tr><th>Start</th><th>Type</th><th>Duration</th><th>Intensity</th><th>Triggers</th><th></th></tr></thead><tbody>';
    log.forEach(function(e){
      html+='<tr><td>'+TN.esc(e.when.slice(0,10)+' '+e.when.slice(11,16))+'</td><td>'+TN.esc(e.type)+'</td><td>'+fmtDur(e.duration)+'</td><td>'+e.intensity+'/10</td>'+
        '<td>'+TN.esc(e.triggers.join(', ')||'–')+(e.meds?' <span class="muted">('+TN.esc(e.meds)+')</span>':'')+'</td>'+
        '<td><button class="btn btn-sm btn-outline" data-del="'+e.ts+'" type="button">X</button></td></tr>';
    });
    TN.el(S+'-out').innerHTML=html+'</tbody></table>';
    Array.prototype.forEach.call(TN.el(S+'-out').querySelectorAll('[data-del]'),function(btn){
      btn.addEventListener('click',function(){
        var ts=btn.getAttribute('data-del');
        write(read().filter(function(e){ return String(e.ts)!==ts; }));
        render();
      });
    });
  } else {
    ['avgint','avgdur','toptrig'].forEach(function(f){ TN.el(S+'-'+f).textContent='–'; });
    TN.el(S+'-out').innerHTML='<p class="muted">No episodes logged yet.</p>';
  }
}
try{
  TN.el(S+'-when').value=nowLocal();
  TN.on(S+'-intensity','input',function(){ TN.el(S+'-intensity-val').textContent=TN.el(S+'-intensity').value; });
  TN.on(S+'-add','click',function(){
    TN.clearErr(ERR);
    var dur=parseFloat(TN.el(S+'-duration').value);
    if(!(dur>0)){ TN.setErr(ERR,'Enter a duration greater than 0 minutes.'); return; }
    var trig=Array.prototype.map.call(TN.el(S+'-triggers').querySelectorAll('input:checked'),function(c){ return c.value; });
    var log=read();
    log.push({ts:Date.now(),when:TN.el(S+'-when').value||nowLocal(),duration:dur,
      intensity:parseInt(TN.el(S+'-intensity').value,10),type:TN.el(S+'-type').value,
      triggers:trig,meds:TN.el(S+'-meds').value.trim()});
    write(log);
    TN.el(S+'-duration').value=''; TN.el(S+'-meds').value='';
    Array.prototype.forEach.call(TN.el(S+'-triggers').querySelectorAll('input:checked'),function(c){ c.checked=false; });
    TN.el(S+'-when').value=nowLocal();
    render();
  });
  render();
}catch(e){}
})();
