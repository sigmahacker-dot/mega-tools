(function(){
'use strict';
var S='allergy-tracker', ERR=S+'-error', LS='tn-allergy-tracker';
function today(){ var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function read(){ try{ return JSON.parse(localStorage.getItem(LS)||'[]'); }catch(e){ return []; } }
function write(a){ try{ localStorage.setItem(LS,JSON.stringify(a)); }catch(e){} }
function render(){
  if(!TN.el(S+'-date')) return;
  var log=read().slice().sort(function(a,b){ return a.date<b.date?-1:1; });
  TN.el(S+'-count').textContent=log.length;
  if(log.length){
    var avg=log.reduce(function(a,e){ return a+e.sev; },0)/log.length;
    TN.el(S+'-avg').textContent=(Math.round(avg*10)/10)+' / 5';
    var counts={};
    log.forEach(function(e){ counts[e.allergen]=(counts[e.allergen]||0)+1; });
    var top=Object.keys(counts).sort(function(a,b){ return counts[b]-counts[a]; })[0];
    TN.el(S+'-top').textContent=top+' ('+counts[top]+')';
    var html='<table class="data"><thead><tr><th>Date</th><th>Allergen</th><th>Symptoms</th><th>Sev</th><th></th></tr></thead><tbody>';
    log.forEach(function(e){
      html+='<tr><td>'+TN.esc(e.date)+'</td><td>'+TN.esc(e.allergen)+'</td><td>'+TN.esc(e.symptoms.join(', '))+(e.notes?' <span class="muted">('+TN.esc(e.notes)+')</span>':'')+'</td><td>'+e.sev+'</td>'+
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
    TN.el(S+'-avg').textContent='–';
    TN.el(S+'-top').textContent='–';
    TN.el(S+'-out').innerHTML='<p class="muted">No episodes logged yet.</p>';
  }
}
try{
  TN.el(S+'-date').value=today();
  TN.on(S+'-add','click',function(){
    TN.clearErr(ERR);
    var allergen=TN.el(S+'-allergen').value.trim();
    if(!allergen){ TN.setErr(ERR,'Enter the suspected allergen.'); return; }
    var sym=Array.prototype.map.call(TN.el(S+'-symptoms').querySelectorAll('input:checked'),function(c){ return c.value; });
    if(!sym.length){ TN.setErr(ERR,'Tick at least one symptom.'); return; }
    var log=read();
    log.push({ts:Date.now(),date:TN.el(S+'-date').value||today(),allergen:allergen,
      symptoms:sym,sev:parseInt(TN.el(S+'-severity').value,10),notes:TN.el(S+'-notes').value.trim()});
    write(log);
    TN.el(S+'-allergen').value=''; TN.el(S+'-notes').value='';
    Array.prototype.forEach.call(TN.el(S+'-symptoms').querySelectorAll('input:checked'),function(c){ c.checked=false; });
    render();
  });
  render();
}catch(e){}
})();
