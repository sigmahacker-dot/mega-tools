(function(){
'use strict';
var S='flexibility-test-tracker', ERR=S+'-error', LS='tn-flexibility-test-tracker';
var NORMS={
  male:[[20,27,36],[30,25,34],[40,23,32],[50,20,30],[60,17,27]],
  female:[[20,30,39],[30,28,37],[40,26,35],[50,24,33],[60,21,30]]
};
function read(){ try{ return JSON.parse(localStorage.getItem(LS)||'[]'); }catch(e){ return []; } }
function write(a){ try{ localStorage.setItem(LS,JSON.stringify(a)); }catch(e){} }
function normFor(gender,age){
  var rows=NORMS[gender]||NORMS.male;
  var pick=rows[0];
  rows.forEach(function(r){ if(age>=r[0]) pick=r; });
  return {lo:pick[1],hi:pick[2],band:pick[0]+'s'};
}
function render(){
  if(!TN.el(S+'-gender')) return;
  var gender=TN.el(S+'-gender').value;
  var age=parseFloat(TN.el(S+'-age').value);
  var n=age>=10?normFor(gender,age):null;
  TN.el(S+'-range').textContent=n?(n.lo+'–'+n.hi+' cm (age '+n.band+')'):'–';
  var log=read().slice().sort(function(a,b){ return a.ts<b.ts?-1:1; });
  var html='';
  if(log.length){
    html='<table class="data"><thead><tr><th>Date</th><th>Result</th><th>vs range</th><th></th></tr></thead><tbody>';
    log.forEach(function(e){
      var nn=normFor(e.gender,e.age);
      var v=e.cm<nn.lo?'Below':e.cm>nn.hi?'Above':'Within';
      html+='<tr><td>'+TN.esc(e.date)+'</td><td>'+e.cm+' cm</td><td>'+v+'</td>'+
        '<td><button class="btn btn-sm btn-outline" data-del="'+e.ts+'" type="button">X</button></td></tr>';
    });
    html+='</tbody></table>';
    var best=Math.max.apply(null,log.map(function(e){ return e.cm; }));
    TN.el(S+'-best').textContent=best+' cm';
    var last=log[log.length-1];
    var nl=normFor(last.gender,last.age);
    var lv=last.cm<nl.lo?'Below range':last.cm>nl.hi?'Above range':'Within range';
    var vel=TN.el(S+'-verdict');
    vel.textContent=lv;
    vel.style.color=lv==='Within range'?'#84cc16':'#eab308';
  } else {
    html='<p class="muted">No results logged yet.</p>';
    TN.el(S+'-verdict').textContent='–';
    TN.el(S+'-best').textContent='–';
  }
  TN.el(S+'-out').innerHTML=html;
  Array.prototype.forEach.call(TN.el(S+'-out').querySelectorAll('[data-del]'),function(btn){
    btn.addEventListener('click',function(){
      var ts=btn.getAttribute('data-del');
      write(read().filter(function(e){ return String(e.ts)!==ts; }));
      render();
    });
  });
}
try{
  TN.on(S+'-gender','change',render);
  TN.on(S+'-age','input',render);
  TN.on(S+'-add','click',function(){
    TN.clearErr(ERR);
    var age=parseFloat(TN.el(S+'-age').value);
    var cm=parseFloat(TN.el(S+'-result-input').value);
    if(!(age>=10)){ TN.setErr(ERR,'Enter a valid age.'); return; }
    if(isNaN(cm)){ TN.setErr(ERR,'Enter your sit-and-reach result in cm.'); return; }
    var d=new Date();
    var log=read();
    log.push({ts:Date.now(),date:d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2),
      gender:TN.el(S+'-gender').value,age:age,cm:cm});
    write(log);
    TN.el(S+'-result-input').value='';
    render();
  });
  render();
}catch(e){}
})();
