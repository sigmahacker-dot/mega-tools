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
var S='recipe-nutrition-estimator', ERR=S+'-error';
var UNITS={g:1,kg:1000,oz:28.3495,lb:453.592,lbs:453.592};
function matchFood(text){
  var t=text.toLowerCase();
  var best=null;
  FOODS.forEach(function(f){
    var n=f[0].toLowerCase();
    var variants=[n];
    if(n.slice(-1)==='s') variants.push(n.slice(0,-1));
    for(var i=0;i<variants.length;i++){
      if(t.indexOf(variants[i])>=0&&(!best||variants[i].length>best.n.length)){
        best={f:f,n:variants[i]};
      }
    }
  });
  return best?best.f:null;
}
function calc(){
  if(!TN.el(S+'-ingredients')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var lines=TN.el(S+'-ingredients').value.split('\n');
  var servings=parseFloat(TN.el(S+'-servings').value);
  if(!(servings>=1)){ TN.setErr(ERR,'Enter servings of 1 or more.'); return; }
  var matched=[], unmatched=[], assumed=[];
  var P=0,C=0,F=0;
  lines.forEach(function(raw){
    var line=raw.trim();
    if(!line) return;
    var m=line.match(/^\s*([\d.]+)\s*(kg|g|oz|lbs|lb)?\s+(.+)$/i);
    var grams, name, flag='';
    if(m){
      var amt=parseFloat(m[1]);
      var unit=(m[2]||'g').toLowerCase();
      grams=amt*(UNITS[unit]||1);
      name=m[3];
    } else {
      grams=100; name=line; flag='assumed 100 g';
      assumed.push(line);
    }
    var food=matchFood(name);
    if(!food){ unmatched.push(line); return; }
    var p=food[1]*grams/100, c=food[2]*grams/100, fa=food[3]*grams/100;
    P+=p; C+=c; F+=fa;
    matched.push({line:line,food:food[0],grams:Math.round(grams),p:p,c:c,f:fa,flag:flag});
  });
  if(!matched.length&&!unmatched.length){ TN.setErr(ERR,'Paste at least one ingredient line.'); return; }
  var kcal=P*4+C*4+F*9;
  var html='<div class="stat-cards">'+
    '<div class="stat-card"><div class="v">'+Math.round(kcal)+'</div><div class="l">Total kcal</div></div>'+
    '<div class="stat-card"><div class="v">'+Math.round(P*10)/10+'g</div><div class="l">Protein</div></div>'+
    '<div class="stat-card"><div class="v">'+Math.round(C*10)/10+'g</div><div class="l">Carbs</div></div>'+
    '<div class="stat-card"><div class="v">'+Math.round(F*10)/10+'g</div><div class="l">Fat</div></div>'+
    '<div class="stat-card"><div class="v">'+Math.round(kcal/servings)+'</div><div class="l">Kcal / serving</div></div>'+
    '<div class="stat-card"><div class="v">'+Math.round(P/servings*10)/10+'g / '+Math.round(C/servings*10)/10+'g / '+Math.round(F/servings*10)/10+'g</div><div class="l">P / C / F per serving</div></div></div>';
  html+='<table class="data"><thead><tr><th>Ingredient</th><th>Matched food</th><th>Grams</th><th>Kcal</th></tr></thead><tbody>';
  matched.forEach(function(x){
    html+='<tr><td>'+TN.esc(x.line)+(x.flag?' <span class="muted">('+x.flag+')</span>':'')+'</td><td>'+TN.esc(x.food)+'</td><td>'+x.grams+'</td><td>'+Math.round(x.p*4+x.c*4+x.f*9)+'</td></tr>';
  });
  html+='</tbody></table>';
  if(unmatched.length){
    html+='<p class="note" style="margin-top:10px"><strong>Unmatched (not counted):</strong> '+TN.esc(unmatched.join('; '))+'</p>';
  }
  out.innerHTML=html;
}
try{
  TN.on(S+'-go','click',calc);
  calc();
}catch(e){}
})();
