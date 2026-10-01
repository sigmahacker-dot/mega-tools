(function(){
'use strict';
var S='vacation-budget-planner', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function num(id){ return parseFloat(TN.el(id).value)||0; }
function calc(){
  if(!TN.el(S+'-travelers')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var t=parseFloat(TN.el(S+'-travelers').value);
  var d=parseFloat(TN.el(S+'-days').value);
  if(!(t>=1)){ TN.setErr(ERR,'Enter at least 1 traveler.'); return; }
  if(!(d>=1)){ TN.setErr(ERR,'Enter at least 1 trip day.'); return; }
  var flights=num(S+'-flights'), hotel=num(S+'-hotel'), food=num(S+'-food');
  var act=num(S+'-activities'), trans=num(S+'-transport'), other=num(S+'-other');
  if([flights,hotel,food,act,trans,other].some(function(v){ return v<0; })){ TN.setErr(ERR,'Costs cannot be negative.'); return; }
  var hotelTot=hotel*d, foodTot=food*t*d, actTot=act*t*d, transTot=trans*t*d;
  var total=flights+hotelTot+foodTot+actTot+transTot+other;
  TN.el(S+'-total').textContent=money(total);
  TN.el(S+'-perperson').textContent=money(total/t);
  TN.el(S+'-perday').textContent=money(total/t/d);
  var html='<table class="data"><thead><tr><th>Category</th><th>Amount</th></tr></thead><tbody>'+
    '<tr><td>Flights</td><td>'+money(flights)+'</td></tr>'+
    '<tr><td>Hotel ('+d+' nights)</td><td>'+money(hotelTot)+'</td></tr>'+
    '<tr><td>Food ('+t+' people x '+d+' days)</td><td>'+money(foodTot)+'</td></tr>'+
    '<tr><td>Activities ('+t+' people x '+d+' days)</td><td>'+money(actTot)+'</td></tr>'+
    '<tr><td>Local transport ('+t+' people x '+d+' days)</td><td>'+money(transTot)+'</td></tr>'+
    '<tr><td>Other</td><td>'+money(other)+'</td></tr></tbody></table>';
  out.innerHTML=html;
}
try{
  ['travelers','days','flights','hotel','food','activities','transport','other'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
