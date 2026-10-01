(function(){
'use strict';
var S='wedding-budget-calculator', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function rows(){ return Array.prototype.slice.call(TN.el(S+'-cats').querySelectorAll('[data-row]')); }
function addCat(name,pct){
  var wrap=TN.el(S+'-cats');
  var div=document.createElement('div');
  div.setAttribute('data-row','1');
  div.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:flex-end';
  div.innerHTML=
    '<div class="field" style="flex:2;min-width:0"><label>Category</label><input class="input" data-name placeholder="Venue" value="'+TN.esc(name||'')+'"></div>'+
    '<div class="field" style="flex:1;min-width:0"><label>% of budget</label><input type="number" class="input" data-pct min="0" max="100" step="any" placeholder="10" value="'+(pct==null?'':pct)+'"></div>'+
    '<button class="btn btn-sm btn-outline" data-remove type="button" aria-label="Remove category">X</button>';
  wrap.appendChild(div);
  div.querySelector('[data-remove]').addEventListener('click',function(){ div.remove(); calc(); });
  Array.prototype.forEach.call(div.querySelectorAll('input'),function(inp){ inp.addEventListener('input',calc); });
}
function calc(){
  if(!TN.el(S+'-budget')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var budget=parseFloat(TN.el(S+'-budget').value);
  if(!(budget>0)) return;
  var cats=rows().map(function(r,i){
    return { name:(r.querySelector('[data-name]').value||'').trim()||('Category '+(i+1)),
             pct:parseFloat(r.querySelector('[data-pct]').value)||0 };
  });
  if(!cats.length){ TN.setErr(ERR,'Add at least one category.'); return; }
  if(cats.some(function(c){ return c.pct<0; })){ TN.setErr(ERR,'Percentages cannot be negative.'); return; }
  var totPct=cats.reduce(function(a,c){ return a+c.pct; },0);
  var alloc=cats.reduce(function(a,c){ return a+budget*c.pct/100; },0);
  TN.el(S+'-pct').textContent=(Math.round(totPct*100)/100)+'%';
  TN.el(S+'-alloc').textContent=money(alloc);
  TN.el(S+'-rem').textContent=money(budget-alloc);
  var html='<table class="data"><thead><tr><th>Category</th><th>%</th><th>Amount</th></tr></thead><tbody>';
  cats.forEach(function(c){ html+='<tr><td>'+TN.esc(c.name)+'</td><td>'+c.pct+'%</td><td>'+money(budget*c.pct/100)+'</td></tr>'; });
  out.innerHTML=html+'</tbody></table>';
  if(Math.abs(totPct-100)>0.001){
    var w=document.createElement('p');
    w.className='note';
    w.textContent='Note: categories sum to '+(Math.round(totPct*100)/100)+'% — '+(totPct>100?'over budget by ':'under budget by ')+money(Math.abs(budget-alloc))+'.';
    out.appendChild(w);
  }
}
try{
  addCat('Venue & catering',45); addCat('Photography & video',10); addCat('Attire & beauty',8);
  addCat('Decor & flowers',8); addCat('Music & DJ',5); addCat('Rings',4);
  addCat('Stationery',2); addCat('Cake',3); addCat('Transport',2); addCat('Contingency',13);
  TN.on(S+'-budget','input',calc);
  TN.on(S+'-add','click',function(){ addCat('',5); });
  calc();
}catch(e){}
})();
