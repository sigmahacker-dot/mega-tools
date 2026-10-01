(function(){
'use strict';
var S='commission-calculator', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function rows(){ return Array.prototype.slice.call(TN.el(S+'-tiers').querySelectorAll('[data-row]')); }
function addTier(cap,rate){
  var wrap=TN.el(S+'-tiers');
  var div=document.createElement('div');
  div.setAttribute('data-row','1');
  div.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:flex-end';
  div.innerHTML=
    '<div class="field" style="flex:1;min-width:0"><label>Up to ($)</label><input type="number" class="input" data-cap min="0" step="any" placeholder="No cap" value="'+(cap==null||cap===''?'':cap)+'"></div>'+
    '<div class="field" style="flex:1;min-width:0"><label>Rate (%)</label><input type="number" class="input" data-rate min="0" max="100" step="any" placeholder="10" value="'+(rate==null?'':rate)+'"></div>'+
    '<button class="btn btn-sm btn-outline" data-remove type="button" aria-label="Remove tier">X</button>';
  wrap.appendChild(div);
  div.querySelector('[data-remove]').addEventListener('click',function(){ div.remove(); calc(); });
  Array.prototype.forEach.call(div.querySelectorAll('input'),function(inp){ inp.addEventListener('input',calc); });
}
function calc(){
  if(!TN.el(S+'-sales')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var sales=parseFloat(TN.el(S+'-sales').value);
  if(!(sales>0)) return;
  var tiers=rows().map(function(r){
    var capRaw=r.querySelector('[data-cap]').value.trim();
    return { cap:capRaw===''?Infinity:parseFloat(capRaw), rate:parseFloat(r.querySelector('[data-rate]').value) };
  });
  if(!tiers.length){ TN.setErr(ERR,'Add at least one tier.'); return; }
  for(var i=0;i<tiers.length;i++){
    if(isNaN(tiers[i].rate)||tiers[i].rate<0||tiers[i].rate>100){ TN.setErr(ERR,'Tier '+(i+1)+': rate must be between 0 and 100.'); return; }
    if(tiers[i].cap!==Infinity&&!(tiers[i].cap>0)){ TN.setErr(ERR,'Tier '+(i+1)+': cap must be positive or empty.'); return; }
  }
  tiers.sort(function(a,b){ return a.cap-b.cap; });
  for(var j=1;j<tiers.length;j++){
    if(tiers[j].cap<=tiers[j-1].cap&&tiers[j-1].cap!==Infinity){ TN.setErr(ERR,'Tier caps must be strictly increasing.'); return; }
  }
  var prev=0, total=0, html='<table class="data"><thead><tr><th>Bracket</th><th>Rate</th><th>Sales in bracket</th><th>Commission</th></tr></thead><tbody>';
  tiers.forEach(function(t){
    var inBracket=Math.max(0,Math.min(sales,t.cap)-prev);
    var comm=inBracket*t.rate/100;
    total+=comm;
    var label=t.cap===Infinity?('Over '+money(prev)):('Up to '+money(t.cap));
    html+='<tr><td>'+label+'</td><td>'+t.rate+'%</td><td>'+money(inBracket)+'</td><td>'+money(comm)+'</td></tr>';
    prev=t.cap===Infinity?sales:t.cap;
    if(t.cap!==Infinity&&sales<=t.cap) prev=sales;
  });
  html+='</tbody></table>';
  html='<div class="stat-cards"><div class="stat-card"><div class="v">'+money(total)+'</div><div class="l">Total commission</div></div>'+
    '<div class="stat-card"><div class="v">'+(Math.round(total/sales*10000)/100)+'%</div><div class="l">Effective rate</div></div></div>'+html;
  out.innerHTML=html;
}
try{
  addTier(10000,5); addTier(50000,7); addTier('',10);
  TN.on(S+'-sales','input',calc);
  TN.on(S+'-add','click',function(){ addTier('',5); });
  calc();
}catch(e){}
})();
