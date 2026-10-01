(function(){
'use strict';
var S='baby-feeding-log', ERR=S+'-error', LS='tn-baby-feeding-log';
function today(){ var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function nowLocal(){ var d=new Date(); function p(n){ return ('0'+n).slice(-2); } return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes()); }
function read(){ try{ return JSON.parse(localStorage.getItem(LS)||'[]'); }catch(e){ return []; } }
function write(a){ try{ localStorage.setItem(LS,JSON.stringify(a)); }catch(e){} }
function fmtWhen(w){ return w.slice(0,10)+' '+w.slice(11,16); }
function render(){
  if(!TN.el(S+'-type')) return;
  TN.clearErr(ERR);
  var date=TN.el(S+'-date').value||today();
  var all=read().filter(function(e){ return e.when.slice(0,10)===date; })
    .sort(function(a,b){ return a.when<b.when?-1:1; });
  var nMin=0,bMl=0;
  all.forEach(function(e){ if(e.type==='nursing') nMin+=e.minutes; else bMl+=e.ml; });
  TN.el(S+'-sessions').textContent=all.length;
  TN.el(S+'-nursemin').textContent=Math.round(nMin*10)/10;
  TN.el(S+'-bottleml').textContent=Math.round(bMl*10)/10;
  var html='';
  if(all.length){
    html='<table class="data"><thead><tr><th>Time</th><th>Type</th><th>Detail</th><th></th></tr></thead><tbody>';
    all.forEach(function(e){
      var det=e.type==='nursing'?(e.side+' · '+e.minutes+' min'):(e.ml+' ml');
      html+='<tr><td>'+TN.esc(fmtWhen(e.when))+'</td><td>'+(e.type==='nursing'?'Nursing':'Bottle')+'</td><td>'+TN.esc(det)+'</td>'+
        '<td><button class="btn btn-sm btn-outline" data-del="'+e.id+'" type="button">X</button></td></tr>';
    });
    html+='</tbody></table>';
  } else {
    html='<p class="muted">No sessions logged for this date.</p>';
  }
  TN.el(S+'-out').innerHTML=html;
  Array.prototype.forEach.call(TN.el(S+'-out').querySelectorAll('[data-del]'),function(btn){
    btn.addEventListener('click',function(){
      var id=btn.getAttribute('data-del');
      write(read().filter(function(e){ return String(e.id)!==id; }));
      render();
    });
  });
}
try{
  TN.el(S+'-when').value=nowLocal();
  TN.el(S+'-date').value=today();
  TN.on(S+'-type','change',function(){
    var nursing=TN.el(S+'-type').value==='nursing';
    TN.el(S+'-nursingwrap').style.display=nursing?'':'none';
    TN.el(S+'-durationwrap').style.display=nursing?'':'none';
    TN.el(S+'-bottlwrap').style.display=nursing?'none':'';
  });
  TN.on(S+'-add','click',function(){
    TN.clearErr(ERR);
    var type=TN.el(S+'-type').value;
    var when=TN.el(S+'-when').value||nowLocal();
    var entry={id:Date.now(),type:type,when:when};
    if(type==='nursing'){
      var mins=parseFloat(TN.el(S+'-duration').value);
      if(!(mins>0)){ TN.setErr(ERR,'Enter nursing duration in minutes.'); return; }
      entry.side=TN.el(S+'-side').value; entry.minutes=mins;
      TN.el(S+'-duration').value='';
    } else {
      var ml=parseFloat(TN.el(S+'-ml').value);
      if(!(ml>0)){ TN.setErr(ERR,'Enter the bottle amount in ml.'); return; }
      entry.ml=ml;
      TN.el(S+'-ml').value='';
    }
    var all=read(); all.push(entry); write(all);
    TN.el(S+'-when').value=nowLocal();
    TN.el(S+'-date').value=when.slice(0,10);
    render();
  });
  TN.on(S+'-date','change',render);
  render();
}catch(e){}
})();
