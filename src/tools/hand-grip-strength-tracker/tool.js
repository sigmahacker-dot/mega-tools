(function(){
'use strict';
var S='hand-grip-strength-tracker', ERR=S+'-error', LS='tn-hand-grip-strength-tracker';
var NORMS={
  male:[[20,40,55],[30,40,54],[40,37,52],[50,34,48],[60,29,42],[70,24,36],[80,19,30]],
  female:[[20,24,36],[30,24,35],[40,22,33],[50,20,30],[60,17,27],[70,14,23],[80,12,20]]
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
  TN.el(S+'-range').textContent=n?(n.lo+'–'+n.hi+' kg (age '+n.band+')'):'–';
  var log=read().slice().sort(function(a,b){ return a.ts<b.ts?-1:1; });
  var html='';
  if(log.length){
    html='<table class="data"><thead><tr><th>Date</th><th>Reading</th><th>Hand</th><th>vs range</th><th></th></tr></thead><tbody>';
    log.forEach(function(e){
      var nn=normFor(e.gender,e.age);
      var v=e.kg<nn.lo?'Below':e.kg>nn.hi?'Above':'Within';
      html+='<tr><td>'+TN.esc(e.date)+'</td><td>'+e.kg+' kg</td><td>'+TN.esc(e.hand)+'</td><td>'+v+'</td>'+
        '<td><button class="btn btn-sm btn-outline" data-del="'+e.ts+'" type="button">X</button></td></tr>';
    });
    html+='</tbody></table>';
    var last=log[log.length-1];
    var nl=normFor(last.gender,last.age);
    var lv=last.kg<nl.lo?'Below range':last.kg>nl.hi?'Above range':'Within range';
    var vel=TN.el(S+'-verdict');
    vel.textContent=lv;
    vel.style.color=lv==='Within range'?'#84cc16':'#eab308';
  } else {
    html='<p class="muted">No readings logged yet.</p>';
    TN.el(S+'-verdict').textContent='–';
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
    var kg=parseFloat(TN.el(S+'-reading').value);
    if(!(age>=10)){ TN.setErr(ERR,'Enter a valid age.'); return; }
    if(!(kg>0)){ TN.setErr(ERR,'Enter a reading greater than 0.'); return; }
    var d=new Date();
    var log=read();
    log.push({ts:Date.now(),date:d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2),
      gender:TN.el(S+'-gender').value,age:age,kg:kg,hand:TN.el(S+'-hand').value});
    write(log);
    TN.el(S+'-reading').value='';
    render();
  });
  render();
}catch(e){}
})();
