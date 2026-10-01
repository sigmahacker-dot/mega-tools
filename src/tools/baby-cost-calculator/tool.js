(function(){
'use strict';
var S='baby-cost-calculator', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function rows(){ return Array.prototype.slice.call(TN.el(S+'-items').querySelectorAll('[data-row]')); }
function addItem(name,monthly,onetime){
  var wrap=TN.el(S+'-items');
  var div=document.createElement('div');
  div.setAttribute('data-row','1');
  div.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:flex-end';
  div.innerHTML=
    '<div class="field" style="flex:2;min-width:0"><label>Item</label><input class="input" data-name placeholder="Diapers" value="'+TN.esc(name||'')+'"></div>'+
    '<div class="field" style="flex:1;min-width:0"><label>$/month</label><input type="number" class="input" data-monthly min="0" step="any" placeholder="0" value="'+(monthly==null?'':monthly)+'"></div>'+
    '<div class="field" style="flex:1;min-width:0"><label>One-time $</label><input type="number" class="input" data-onetime min="0" step="any" placeholder="0" value="'+(onetime==null?'':onetime)+'"></div>'+
    '<button class="btn btn-sm btn-outline" data-remove type="button" aria-label="Remove item">X</button>';
  wrap.appendChild(div);
  div.querySelector('[data-remove]').addEventListener('click',function(){ div.remove(); calc(); });
  Array.prototype.forEach.call(div.querySelectorAll('input'),function(inp){ inp.addEventListener('input',calc); });
}
function calc(){
  if(!TN.el(S+'-items')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var items=rows().map(function(r,i){
    return { name:(r.querySelector('[data-name]').value||'').trim()||('Item '+(i+1)),
             m:parseFloat(r.querySelector('[data-monthly]').value)||0,
             o:parseFloat(r.querySelector('[data-onetime]').value)||0 };
  });
  if(!items.length){ TN.setErr(ERR,'Add at least one item.'); return; }
  if(items.some(function(x){ return x.m<0||x.o<0; })){ TN.setErr(ERR,'Costs cannot be negative.'); return; }
  var mTot=items.reduce(function(a,x){ return a+x.m; },0);
  var oTot=items.reduce(function(a,x){ return a+x.o; },0);
  var total=mTot*12+oTot;
  TN.el(S+'-monthly').textContent=money(mTot);
  TN.el(S+'-onetime').textContent=money(oTot);
  TN.el(S+'-total').textContent=money(total);
  var html='<table class="data"><thead><tr><th>Item</th><th>Monthly</th><th>One-time</th><th>First-year</th></tr></thead><tbody>';
  items.forEach(function(x){
    html+='<tr><td>'+TN.esc(x.name)+'</td><td>'+money(x.m)+'</td><td>'+money(x.o)+'</td><td>'+money(x.m*12+x.o)+'</td></tr>';
  });
  out.innerHTML=html+'</tbody></table>';
}
try{
  addItem('Diapers',70,0); addItem('Formula & feeding',120,0); addItem('Clothing',40,0);
  addItem('Childcare',800,0); addItem('Health & medical',60,0); addItem('Gear & furniture',0,1500);
  TN.on(S+'-add','click',function(){ addItem('',0,0); });
  calc();
}catch(e){}
})();
