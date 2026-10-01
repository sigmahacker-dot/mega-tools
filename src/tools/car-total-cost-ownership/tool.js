(function(){
'use strict';
var S='car-total-cost-ownership', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function num(id){ return parseFloat(TN.el(id).value)||0; }
function calc(){
  if(!TN.el(S+'-price')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var price=num(S+'-price');
  var years=parseFloat(TN.el(S+'-years').value);
  var miles=num(S+'-miles'), mpg=parseFloat(TN.el(S+'-mpg').value);
  var fuelP=num(S+'-fuelprice'), ins=num(S+'-insurance'), maint=num(S+'-maint'), resale=num(S+'-resale');
  if(!(price>0)){ TN.setErr(ERR,'Enter a purchase price greater than 0.'); return; }
  if(!(years>=1)){ TN.setErr(ERR,'Enter years of ownership of 1 or more.'); return; }
  if(!(mpg>0)){ TN.setErr(ERR,'Enter fuel economy greater than 0.'); return; }
  if([miles,fuelP,ins,maint,resale].some(function(v){ return v<0; })){ TN.setErr(ERR,'Values cannot be negative.'); return; }
  var fuelYr=miles/mpg*fuelP;
  var running=(fuelYr+ins+maint)*years;
  var total=price+running-resale;
  TN.el(S+'-fuel').textContent=money(fuelYr);
  TN.el(S+'-running').textContent=money(running);
  TN.el(S+'-total').textContent=money(total);
  TN.el(S+'-peryear').textContent=money(total/years);
  TN.el(S+'-permile').textContent=miles*years>0?money(total/(miles*years)):'n/a';
  var html='<table class="data"><thead><tr><th>Component</th><th>Amount</th></tr></thead><tbody>'+
    '<tr><td>Purchase price</td><td>'+money(price)+'</td></tr>'+
    '<tr><td>Fuel ('+years+' yrs)</td><td>'+money(fuelYr*years)+'</td></tr>'+
    '<tr><td>Insurance ('+years+' yrs)</td><td>'+money(ins*years)+'</td></tr>'+
    '<tr><td>Maintenance ('+years+' yrs)</td><td>'+money(maint*years)+'</td></tr>'+
    '<tr><td>Less: resale value</td><td>&minus;'+money(resale)+'</td></tr>'+
    '<tr><td><strong>Total ownership cost</strong></td><td><strong>'+money(total)+'</strong></td></tr></tbody></table>';
  out.innerHTML=html;
}
try{
  ['price','years','miles','mpg','fuelprice','insurance','maint','resale'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
