(function(){
'use strict';
var S='tip-pooling-calculator', ERR=S+'-error', LS='tn-tip-pooling-calculator';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function staffRows(){ return Array.prototype.slice.call(TN.el(S+'-staff').querySelectorAll('[data-row]')); }
function readStaff(){
  return staffRows().map(function(r,i){
    return {
      name:(r.querySelector('[data-name]').value||'').trim()||('Staff '+(i+1)),
      hours:parseFloat(r.querySelector('[data-hours]').value)||0,
      weight:parseFloat(r.querySelector('[data-weight]').value)
    };
  });
}
function applyMethod(){
  var w=TN.el(S+'-method').value==='weighted';
  staffRows().forEach(function(r){ r.querySelector('[data-weightwrap]').style.display=w?'':'none'; });
}
function addRow(name,hours,weight){
  var wrap=TN.el(S+'-staff');
  var div=document.createElement('div');
  div.setAttribute('data-row','1');
  div.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:flex-end';
  div.innerHTML=
    '<div class="field" style="flex:2;min-width:0"><label>Name</label><input class="input" data-name placeholder="Sam" value="'+TN.esc(name||'')+'"></div>'+
    '<div class="field" style="flex:1;min-width:0"><label>Hours</label><input type="number" class="input" data-hours min="0" step="any" placeholder="8" value="'+(hours==null||hours===''?'':hours)+'"></div>'+
    '<div class="field" style="flex:1;min-width:0" data-weightwrap><label>Weight</label><input type="number" class="input" data-weight min="0" step="any" value="'+(weight==null||isNaN(weight)?1:weight)+'"></div>'+
    '<button class="btn btn-sm btn-outline" data-remove type="button" aria-label="Remove staff member">X</button>';
  wrap.appendChild(div);
  var rerun=function(){ calc(); save(); };
  div.querySelector('[data-remove]').addEventListener('click',function(){ div.remove(); rerun(); });
  Array.prototype.forEach.call(div.querySelectorAll('input'),function(inp){ inp.addEventListener('input',rerun); });
  applyMethod();
}
function save(){
  try{
    localStorage.setItem(LS,JSON.stringify({
      total:TN.el(S+'-total').value, method:TN.el(S+'-method').value,
      staff:readStaff().map(function(s){ return {n:s.name,h:s.hours,w:s.weight}; })
    }));
  }catch(e){}
}
function load(){
  try{
    var d=JSON.parse(localStorage.getItem(LS)||'null');
    if(!d) return false;
    TN.el(S+'-total').value=d.total||'';
    TN.el(S+'-method').value=d.method||'hours';
    (d.staff||[]).forEach(function(s){ addRow(s.n,s.h,s.w); });
    return (d.staff||[]).length>0;
  }catch(e){ return false; }
}
function calc(){
  if(!TN.el(S+'-total')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var total=parseFloat(TN.el(S+'-total').value);
  if(!(total>0)) return;
  var method=TN.el(S+'-method').value;
  var staff=readStaff();
  if(!staff.length){ TN.setErr(ERR,'Add at least one staff member.'); return; }
  var pts=staff.map(function(s){
    var w=method==='weighted'?(isNaN(s.weight)?0:Math.max(0,s.weight)):1;
    return Math.max(0,s.hours)*w;
  });
  var sum=pts.reduce(function(a,b){ return a+b; },0);
  if(!(sum>0)){ TN.setErr(ERR,'Enter hours above 0 for at least one staff member.'); return; }
  var exact=pts.map(function(p){ return total*p/sum; });
  var floored=exact.map(function(e){ return Math.floor(e*100+1e-6)/100; });
  var paid=floored.reduce(function(a,b){ return a+b; },0);
  var pennies=Math.round((total-paid)*100);
  var order=exact.map(function(e,i){ return {i:i,frac:e-floored[i]}; })
    .sort(function(a,b){ return b.frac-a.frac; });
  var share=floored.slice();
  for(var k=0;k<pennies&&k<order.length;k++){ share[order[k].i]=Math.round((share[order[k].i]+0.01)*100)/100; }
  var html='<div class="stat-cards">';
  html+='<div class="stat-card"><div class="v">'+money(total)+'</div><div class="l">Total tips</div></div>';
  html+='<div class="stat-card"><div class="v">'+staff.length+'</div><div class="l">Staff sharing</div></div>';
  html+='<div class="stat-card"><div class="v">'+money(total/staff.length)+'</div><div class="l">Equal-split reference</div></div></div>';
  html+='<table class="data"><thead><tr><th>Name</th><th>Hours</th>'+(method==='weighted'?'<th>Weight</th>':'')+'<th>Points</th><th>Share</th></tr></thead><tbody>';
  staff.forEach(function(s,i){
    html+='<tr><td>'+TN.esc(s.name)+'</td><td>'+s.hours+'</td>'+(method==='weighted'?'<td>'+(isNaN(s.weight)?0:s.weight)+'</td>':'')+'<td>'+(Math.round(pts[i]*100)/100)+'</td><td><strong>'+money(share[i])+'</strong></td></tr>';
  });
  html+='</tbody></table>';
  out.innerHTML=html;
}
try{
  if(!load()){ addRow('',8,1); addRow('',6,1); addRow('',4,1); }
  TN.on(S+'-total','input',function(){ calc(); save(); });
  TN.on(S+'-method','change',function(){ applyMethod(); calc(); save(); });
  TN.on(S+'-add','click',function(){ addRow('','',1); save(); });
  applyMethod(); calc();
}catch(e){}
})();
