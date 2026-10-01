(function(){
'use strict';
var S='pet-cost-calculator', ERR=S+'-error';
var PRESETS={
  dog:[['Food',600],['Vet care',300],['Grooming',360],['Toys & treats',180],['Insurance',420]],
  cat:[['Food',360],['Vet care',250],['Litter',180],['Toys & treats',90],['Insurance',300]],
  bird:[['Food',240],['Vet care',120],['Cage & supplies',150],['Toys',80]],
  fish:[['Food',120],['Equipment',200],['Maintenance',180]],
  rabbit:[['Food & hay',420],['Vet care',150],['Bedding',180]],
  reptile:[['Food',240],['Heating & lighting',180],['Vet care',100],['Substrate',90]]
};
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function rows(){ return Array.prototype.slice.call(TN.el(S+'-items').querySelectorAll('[data-row]')); }
function addItem(name,amt){
  var wrap=TN.el(S+'-items');
  var div=document.createElement('div');
  div.setAttribute('data-row','1');
  div.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:flex-end';
  div.innerHTML=
    '<div class="field" style="flex:2;min-width:0"><label>Item</label><input class="input" data-name placeholder="Food" value="'+TN.esc(name||'')+'"></div>'+
    '<div class="field" style="flex:1;min-width:0"><label>$/year</label><input type="number" class="input" data-amt min="0" step="any" placeholder="0" value="'+(amt==null?'':amt)+'"></div>'+
    '<button class="btn btn-sm btn-outline" data-remove type="button" aria-label="Remove item">X</button>';
  wrap.appendChild(div);
  div.querySelector('[data-remove]').addEventListener('click',function(){ div.remove(); calc(); });
  Array.prototype.forEach.call(div.querySelectorAll('input'),function(inp){ inp.addEventListener('input',calc); });
}
function loadPreset(){
  TN.el(S+'-items').innerHTML='';
  (PRESETS[TN.el(S+'-pet').value]||[]).forEach(function(p){ addItem(p[0],p[1]); });
  calc();
}
function calc(){
  if(!TN.el(S+'-pet')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var items=rows().map(function(r,i){
    return { name:(r.querySelector('[data-name]').value||'').trim()||('Item '+(i+1)),
             amt:parseFloat(r.querySelector('[data-amt]').value)||0 };
  });
  if(!items.length){ TN.setErr(ERR,'Add at least one item.'); return; }
  if(items.some(function(x){ return x.amt<0; })){ TN.setErr(ERR,'Costs cannot be negative.'); return; }
  var total=items.reduce(function(a,x){ return a+x.amt; },0);
  TN.el(S+'-annual').textContent=money(total);
  TN.el(S+'-monthly').textContent=money(total/12);
  var html='<table class="data"><thead><tr><th>Item</th><th>Annual cost</th><th>Share</th></tr></thead><tbody>';
  items.forEach(function(x){
    var share=total>0?Math.round(x.amt/total*1000)/10+'%':'–';
    html+='<tr><td>'+TN.esc(x.name)+'</td><td>'+money(x.amt)+'</td><td>'+share+'</td></tr>';
  });
  out.innerHTML=html+'</tbody></table>';
}
try{
  TN.on(S+'-pet','change',loadPreset);
  TN.on(S+'-add','click',function(){ addItem('',0); });
  loadPreset();
}catch(e){}
})();
