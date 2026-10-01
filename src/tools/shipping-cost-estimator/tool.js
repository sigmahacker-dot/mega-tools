(function(){
'use strict';
var S='shipping-cost-estimator', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function rows(){ return Array.prototype.slice.call(TN.el(S+'-zones').querySelectorAll('[data-row]')); }
function addZone(name,base,perkg){
  var wrap=TN.el(S+'-zones');
  var div=document.createElement('div');
  div.setAttribute('data-row','1');
  div.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:flex-end';
  div.innerHTML=
    '<div class="field" style="flex:2;min-width:0"><label>Zone</label><input class="input" data-name placeholder="Local" value="'+TN.esc(name||'')+'"></div>'+
    '<div class="field" style="flex:1;min-width:0"><label>Base ($)</label><input type="number" class="input" data-base min="0" step="any" placeholder="5" value="'+(base==null?'':base)+'"></div>'+
    '<div class="field" style="flex:1;min-width:0"><label>Per unit ($)</label><input type="number" class="input" data-perkg min="0" step="any" placeholder="2" value="'+(perkg==null?'':perkg)+'"></div>'+
    '<button class="btn btn-sm btn-outline" data-remove type="button" aria-label="Remove zone">X</button>';
  wrap.appendChild(div);
  div.querySelector('[data-remove]').addEventListener('click',function(){ div.remove(); calc(); });
  Array.prototype.forEach.call(div.querySelectorAll('input'),function(inp){ inp.addEventListener('input',calc); });
}
function calc(){
  if(!TN.el(S+'-length')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  TN.el(S+'-dim').textContent='–'; TN.el(S+'-charge').textContent='–';
  var metric=TN.el(S+'-units').value==='metric';
  var wunit=metric?'kg':'lb';
  var div=parseFloat(TN.el(S+'-divisor').value);
  var l=parseFloat(TN.el(S+'-length').value), w=parseFloat(TN.el(S+'-width').value), h=parseFloat(TN.el(S+'-height').value);
  var actual=parseFloat(TN.el(S+'-weight').value);
  if(!(div>0)){ TN.setErr(ERR,'Enter a divisor greater than 0.'); return; }
  if([l,w,h].some(function(v){ return !(v>0); })){ TN.setErr(ERR,'Enter all three dimensions greater than 0.'); return; }
  if(!(actual>=0)){ TN.setErr(ERR,'Enter a valid actual weight.'); return; }
  var dim=l*w*h/div;
  var charge=Math.max(actual,dim);
  TN.el(S+'-dim').textContent=(Math.round(dim*100)/100)+' '+wunit;
  TN.el(S+'-charge').textContent=(Math.round(charge*100)/100)+' '+wunit+(dim>actual?' (dimensional wins)':' (actual wins)');
  var zones=rows().map(function(r,i){
    return { name:(r.querySelector('[data-name]').value||'').trim()||('Zone '+(i+1)),
             base:parseFloat(r.querySelector('[data-base]').value)||0,
             perkg:parseFloat(r.querySelector('[data-perkg]').value)||0 };
  });
  if(!zones.length){ TN.setErr(ERR,'Add at least one zone.'); return; }
  var html='<table class="data"><thead><tr><th>Zone</th><th>Base</th><th>Per '+wunit+'</th><th>Cost</th></tr></thead><tbody>';
  zones.forEach(function(z){
    html+='<tr><td>'+TN.esc(z.name)+'</td><td>'+money(z.base)+'</td><td>'+money(z.perkg)+'</td><td><strong>'+money(z.base+z.perkg*charge)+'</strong></td></tr>';
  });
  out.innerHTML=html+'</tbody></table>';
}
try{
  addZone('Local',4.99,1.5); addZone('National',9.99,3.25); addZone('International',24.99,8.75);
  ['length','width','height','weight','divisor'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  TN.on(S+'-units','change',function(){
    TN.el(S+'-divisor').value=TN.el(S+'-units').value==='metric'?'5000':'139';
    calc();
  });
  TN.on(S+'-add','click',function(){ addZone('',5,2); });
  calc();
}catch(e){}
})();
