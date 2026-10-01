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
var S='food-diary-lite', ERR=S+'-error', LS='tn-food-diary-lite';
function today(){ var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function readAll(){ try{ return JSON.parse(localStorage.getItem(LS)||'{}'); }catch(e){ return {}; } }
function writeAll(d){ try{ localStorage.setItem(LS,JSON.stringify(d)); }catch(e){} }
function fillFoods(){
  var f=(TN.el(S+'-filter').value||'').toLowerCase();
  var sel=TN.el(S+'-food'), keep=sel.value, html='';
  FOODS.forEach(function(fd,i){
    if(f&&fd[0].toLowerCase().indexOf(f)<0) return;
    var kcal=Math.round(fd[1]*4+fd[2]*4+fd[3]*9);
    html+='<option value="'+i+'">'+TN.esc(fd[0])+' ('+kcal+' kcal/100g)</option>';
  });
  sel.innerHTML=html||'<option value="">No match</option>';
  if(keep){ for(var i=0;i<sel.options.length;i++){ if(sel.options[i].value===keep){ sel.selectedIndex=i; break; } } }
}
function render(){
  if(!TN.el(S+'-date')) return;
  TN.clearErr(ERR);
  var date=TN.el(S+'-date').value||today();
  var all=readAll();
  var entries=all[date]||[];
  var k=0,p=0,c=0,f=0;
  var html='';
  if(entries.length){
    html='<table class="data"><thead><tr><th>Meal</th><th>Food</th><th>g</th><th>Kcal</th><th></th></tr></thead><tbody>';
    entries.forEach(function(e,idx){
      k+=e.kcal; p+=e.p; c+=e.c; f+=e.f;
      html+='<tr><td>'+TN.esc(e.meal)+'</td><td>'+TN.esc(e.food)+'</td><td>'+e.g+'</td><td>'+Math.round(e.kcal)+'</td>'+
        '<td><button class="btn btn-sm btn-outline" data-del="'+idx+'" type="button">X</button></td></tr>';
    });
    html+='</tbody></table>';
  } else {
    html='<p class="muted">No entries for this date yet.</p>';
  }
  TN.el(S+'-out').innerHTML=html;
  TN.el(S+'-kcal').textContent=Math.round(k);
  TN.el(S+'-p').textContent=Math.round(p*10)/10+'g';
  TN.el(S+'-c').textContent=Math.round(c*10)/10+'g';
  TN.el(S+'-f').textContent=Math.round(f*10)/10+'g';
  Array.prototype.forEach.call(TN.el(S+'-out').querySelectorAll('[data-del]'),function(btn){
    btn.addEventListener('click',function(){
      var all2=readAll(), arr=all2[date]||[];
      arr.splice(parseInt(btn.getAttribute('data-del'),10),1);
      all2[date]=arr; writeAll(all2); render();
    });
  });
}
function add(){
  TN.clearErr(ERR);
  var fi=parseInt(TN.el(S+'-food').value,10);
  var g=parseFloat(TN.el(S+'-grams').value);
  if(isNaN(fi)){ TN.setErr(ERR,'Choose a food.'); return; }
  if(!(g>0)){ TN.setErr(ERR,'Enter grams greater than 0.'); return; }
  var fd=FOODS[fi];
  var date=TN.el(S+'-date').value||today();
  var all=readAll(), arr=all[date]||[];
  arr.push({ meal:TN.el(S+'-meal').value, food:fd[0], g:g,
    kcal:(fd[1]*4+fd[2]*4+fd[3]*9)*g/100, p:fd[1]*g/100, c:fd[2]*g/100, f:fd[3]*g/100 });
  all[date]=arr; writeAll(all);
  TN.el(S+'-grams').value='';
  render();
}
try{
  TN.el(S+'-date').value=today();
  fillFoods();
  TN.on(S+'-filter','input',TN.debounce(fillFoods,150));
  TN.on(S+'-add','click',add);
  TN.on(S+'-date','change',render);
  TN.on(S+'-clear','click',function(){
    var all=readAll(); delete all[TN.el(S+'-date').value||today()]; writeAll(all); render();
  });
  render();
}catch(e){}
})();
