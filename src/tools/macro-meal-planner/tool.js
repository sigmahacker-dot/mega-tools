var FOODS=[
["Chicken breast",31,0,3.6],["Chicken thigh",26,0,11],["Turkey breast",29,0,7],
["Lean beef",26,0,10],["Salmon",20,0,13],["Tuna (canned in water)",23,0,1],
["Cod",18,0,0.7],["Shrimp",24,0,0.3],["Eggs",13,1.1,11],["Egg whites",11,0.7,0.2],
["Greek yogurt",10,3.6,0.4],["Cottage cheese",11,3.4,4.3],["Whole milk",3.2,4.8,3.3],
["Cheddar cheese",25,0.3,33],["Firm tofu",17,2,9],["Tempeh",19,9,11],
["Lentils (cooked)",9,20,0.4],["Chickpeas (cooked)",9,27,2.6],["Black beans (cooked)",9,24,0.5],
["White rice (cooked)",2.7,28,0.3],["Brown rice (cooked)",2.6,23,0.9],["Oats",13,66,7],
["Whole wheat bread",13,41,4.2],["Pasta (cooked)",5.8,31,0.9],["Quinoa (cooked)",4.4,22,1.9],
["Sweet potato",1.6,20,0.1],["Potato",2,17,0.1],["Banana",1.1,23,0.3],
["Apple",0.3,14,0.2],["Orange",0.9,12,0.1],["Blueberries",0.7,14,0.3],
["Almonds",21,22,50],["Peanuts",26,16,49],["Walnuts",15,14,65],
["Peanut butter",25,20,50],["Olive oil",0,0,100],["Broccoli",2.8,6.6,0.4],
["Spinach",2.9,3.6,0.4],["Avocado",2,9,15],["Whey protein powder",80,10,5],["Honey",0.3,82,0]];
(function(){
'use strict';
var S='macro-meal-planner', ERR=S+'-error', LS='tn-macro-meal-planner';
function rows(){ return Array.prototype.slice.call(TN.el(S+'-rows').querySelectorAll('[data-row]')); }
function fillSelect(sel,filter,keep){
  var f=(filter||'').toLowerCase();
  var html='';
  FOODS.forEach(function(fd,i){
    if(f&&fd[0].toLowerCase().indexOf(f)<0) return;
    html+='<option value="'+i+'">'+TN.esc(fd[0])+'</option>';
  });
  sel.innerHTML=html||'<option value="">No match</option>';
  if(keep!=null&&keep!==''){
    for(var i=0;i<sel.options.length;i++){ if(sel.options[i].value===String(keep)){ sel.selectedIndex=i; break; } }
  }
}
function addRow(fi,grams){
  var wrap=TN.el(S+'-rows');
  var div=document.createElement('div');
  div.setAttribute('data-row','1');
  div.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:flex-end;flex-wrap:wrap';
  div.innerHTML=
    '<div class="field" style="flex:3;min-width:140px"><label>Food</label><select class="select" data-food></select></div>'+
    '<div class="field" style="flex:1;min-width:70px"><label>Grams</label><input type="number" class="input" data-grams min="0" step="any" placeholder="100" value="'+(grams==null?'':grams)+'"></div>'+
    '<div class="field" style="flex:2;min-width:120px"><label>Macros</label><div class="muted" data-macros style="padding:8px 0">–</div></div>'+
    '<button class="btn btn-sm btn-outline" data-remove type="button" aria-label="Remove food">X</button>';
  wrap.appendChild(div);
  var sel=div.querySelector('[data-food]');
  fillSelect(sel,TN.el(S+'-filter').value,fi);
  var rerun=function(){ calc(); save(); };
  sel.addEventListener('change',rerun);
  div.querySelector('[data-grams]').addEventListener('input',rerun);
  div.querySelector('[data-remove]').addEventListener('click',function(){ div.remove(); rerun(); });
}
function bar(label,actual,target,unit){
  var pct=target>0?Math.min(100,actual/target*100):0;
  var col=pct>=100?'#84cc16':(pct>=70?'#4D7C0F':'#a16207');
  return '<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:4px"><span>'+label+'</span><span><strong>'+(Math.round(actual*10)/10)+unit+'</strong> / '+target+unit+'</span></div>'+
    '<div style="height:12px;background:rgba(255,255,255,.06);border-radius:6px;overflow:hidden"><div style="height:100%;width:'+Math.round(pct)+'%;background:'+col+';border-radius:6px"></div></div></div>';
}
function calc(){
  if(!TN.el(S+'-protein')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out');
  var tp=parseFloat(TN.el(S+'-protein').value)||0;
  var tc=parseFloat(TN.el(S+'-carbs').value)||0;
  var tf=parseFloat(TN.el(S+'-fat').value)||0;
  var P=0,C=0,F=0;
  rows().forEach(function(r){
    var sel=r.querySelector('[data-food]');
    var fi=parseInt(sel.value,10);
    var g=parseFloat(r.querySelector('[data-grams]').value)||0;
    if(isNaN(fi)||!(g>0)){ r.querySelector('[data-macros]').textContent='–'; return; }
    var f=FOODS[fi];
    var p=f[1]*g/100, c=f[2]*g/100, fa=f[3]*g/100;
    P+=p; C+=c; F+=fa;
    r.querySelector('[data-macros]').textContent='P '+Math.round(p*10)/10+'g · C '+Math.round(c*10)/10+'g · F '+Math.round(fa*10)/10+'g · '+Math.round(p*4+c*4+fa*9)+' kcal';
  });
  var kcal=P*4+C*4+F*9;
  var tKcal=tp*4+tc*4+tf*9;
  var html='<div class="stat-cards"><div class="stat-card"><div class="v">'+Math.round(kcal)+'</div><div class="l">Total kcal</div></div>'+
    '<div class="stat-card"><div class="v">'+Math.round(tKcal)+'</div><div class="l">Target kcal</div></div></div>';
  html+=bar('Protein',P,tp,'g')+bar('Carbs',C,tc,'g')+bar('Fat',F,tf,'g');
  out.innerHTML=html;
}
function save(){
  try{
    localStorage.setItem(LS,JSON.stringify({
      tp:TN.el(S+'-protein').value, tc:TN.el(S+'-carbs').value, tf:TN.el(S+'-fat').value,
      rows:rows().map(function(r){ return {f:r.querySelector('[data-food]').value, g:r.querySelector('[data-grams]').value}; })
    }));
  }catch(e){}
}
function load(){
  try{
    var d=JSON.parse(localStorage.getItem(LS)||'null');
    if(!d) return false;
    TN.el(S+'-protein').value=d.tp||''; TN.el(S+'-carbs').value=d.tc||''; TN.el(S+'-fat').value=d.tf||'';
    (d.rows||[]).forEach(function(r){ addRow(r.f,r.g); });
    return (d.rows||[]).length>0;
  }catch(e){ return false; }
}
try{
  if(!load()){ addRow(0,150); addRow(19,200); }
  TN.on(S+'-filter','input',TN.debounce(function(){
    rows().forEach(function(r){
      var sel=r.querySelector('[data-food]');
      fillSelect(sel,TN.el(S+'-filter').value,sel.value);
    });
  },200));
  TN.on(S+'-add','click',function(){ addRow(null,''); save(); });
  ['protein','carbs','fat'].forEach(function(f){ TN.on(S+'-'+f,'input',function(){ calc(); save(); }); });
  calc();
}catch(e){}
})();
