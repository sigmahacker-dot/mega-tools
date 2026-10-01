(function(){
'use strict';
var S='tax-bracket-visualizer', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function rows(){ return Array.prototype.slice.call(TN.el(S+'-brackets').querySelectorAll('[data-row]')); }
function addBracket(cap,rate){
  var wrap=TN.el(S+'-brackets');
  var div=document.createElement('div');
  div.setAttribute('data-row','1');
  div.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:flex-end';
  div.innerHTML=
    '<div class="field" style="flex:1;min-width:0"><label>Up to ($)</label><input type="number" class="input" data-cap min="0" step="any" placeholder="No cap" value="'+(cap==null||cap===''?'':cap)+'"></div>'+
    '<div class="field" style="flex:1;min-width:0"><label>Rate (%)</label><input type="number" class="input" data-rate min="0" max="100" step="any" placeholder="22" value="'+(rate==null?'':rate)+'"></div>'+
    '<button class="btn btn-sm btn-outline" data-remove type="button" aria-label="Remove bracket">X</button>';
  wrap.appendChild(div);
  div.querySelector('[data-remove]').addEventListener('click',function(){ div.remove(); calc(); });
  Array.prototype.forEach.call(div.querySelectorAll('input'),function(inp){ inp.addEventListener('input',calc); });
}
function calc(){
  if(!TN.el(S+'-income')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  TN.el(S+'-total').textContent='–'; TN.el(S+'-effective').textContent='–'; TN.el(S+'-marginal').textContent='–';
  var income=parseFloat(TN.el(S+'-income').value);
  if(!(income>0)) return;
  var brackets=rows().map(function(r){
    var raw=r.querySelector('[data-cap]').value.trim();
    return { cap:raw===''?Infinity:parseFloat(raw), rate:parseFloat(r.querySelector('[data-rate]').value) };
  });
  if(!brackets.length){ TN.setErr(ERR,'Add at least one bracket.'); return; }
  for(var i=0;i<brackets.length;i++){
    if(isNaN(brackets[i].rate)||brackets[i].rate<0||brackets[i].rate>100){ TN.setErr(ERR,'Bracket '+(i+1)+': rate must be 0-100.'); return; }
    if(brackets[i].cap!==Infinity&&!(brackets[i].cap>0)){ TN.setErr(ERR,'Bracket '+(i+1)+': cap must be positive or empty.'); return; }
  }
  brackets.sort(function(a,b){ return a.cap-b.cap; });
  for(var j=1;j<brackets.length;j++){
    if(brackets[j].cap<=brackets[j-1].cap&&brackets[j-1].cap!==Infinity){ TN.setErr(ERR,'Bracket caps must be strictly increasing.'); return; }
  }
  var prev=0,total=0,marginal=0,parts=[];
  brackets.forEach(function(b){
    var inB=Math.max(0,Math.min(income,b.cap)-prev);
    var tax=inB*b.rate/100;
    total+=tax;
    if(inB>0) marginal=b.rate;
    parts.push({b:b,inB:inB,tax:tax,from:prev});
    prev=b.cap===Infinity?income:b.cap;
    if(b.cap!==Infinity&&income<=b.cap) prev=income;
  });
  var maxTax=Math.max.apply(null,parts.map(function(p){ return p.tax; }).concat([1]));
  var html='';
  parts.forEach(function(p){
    if(p.inB<=0) return;
    var label=p.b.cap===Infinity?(money(p.from)+' +'):(money(p.from)+' – '+money(p.b.cap));
    var w=Math.max(2,Math.round(p.tax/maxTax*100));
    html+='<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:4px"><span>'+label+' @ '+p.b.rate+'%</span><span><strong>'+money(p.tax)+'</strong></span></div>'+
      '<div style="height:14px;background:rgba(255,255,255,.06);border-radius:7px;overflow:hidden"><div style="height:100%;width:'+w+'%;background:linear-gradient(90deg,#4D7C0F,#84cc16);border-radius:7px"></div></div></div>';
  });
  out.innerHTML=html;
  TN.el(S+'-total').textContent=money(total);
  TN.el(S+'-effective').textContent=(Math.round(total/income*10000)/100)+'%';
  TN.el(S+'-marginal').textContent=marginal+'%';
}
try{
  addBracket(11600,10); addBracket(47150,12); addBracket(100525,22);
  addBracket(191950,24); addBracket(243725,32); addBracket(609350,35); addBracket('',37);
  TN.on(S+'-income','input',calc);
  TN.on(S+'-add','click',function(){ addBracket('',20); });
  calc();
}catch(e){}
})();
