(function(){
'use strict';
var S='paycheck-comparison', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function num(id){ return parseFloat(TN.el(id).value)||0; }
function offer(p){
  var salary=num(S+'-'+p+'-salary'), bonus=num(S+'-'+p+'-bonus');
  var health=num(S+'-'+p+'-health'), match=num(S+'-'+p+'-match'), pto=num(S+'-'+p+'-pto');
  var taxRate=parseFloat(TN.el(S+'-'+p+'-tax').value);
  if(isNaN(taxRate)||taxRate<0||taxRate>100) return {err:'Offer '+p.toUpperCase()+': tax rate must be 0-100.'};
  if(salary<0||bonus<0||health<0||match<0||pto<0) return {err:'Offer '+p.toUpperCase()+': values cannot be negative.'};
  var cash=salary+bonus;
  var ptoVal=salary/260*pto;
  var benefits=health+match+ptoVal;
  var tax=cash*taxRate/100;
  var netCash=cash-tax;
  return { cash:cash, ptoVal:ptoVal, benefits:benefits, tax:tax, netCash:netCash,
           total:netCash+benefits, salary:salary, bonus:bonus, health:health, match:match, pto:pto };
}
function calc(){
  if(!TN.el(S+'-a-salary')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var a=offer('a'), b=offer('b');
  if(a.err){ TN.setErr(ERR,a.err); return; }
  if(b.err){ TN.setErr(ERR,b.err); return; }
  if(a.salary<=0&&b.salary<=0){ TN.setErr(ERR,'Enter a salary for at least one offer.'); return; }
  var rows=[
    ['Base salary',a.salary,b.salary],['Annual bonus',a.bonus,b.bonus],
    ['Cash compensation',a.cash,b.cash],['Est. tax',a.tax,b.tax],
    ['Net cash (after est. tax)',a.netCash,b.netCash],['Health benefits',a.health,b.health],
    ['Retirement match',a.match,b.match],['PTO value ('+a.pto+' / '+b.pto+' days)',a.ptoVal,b.ptoVal],
    ['Total benefits value',a.benefits,b.benefits]
  ];
  var html='<table class="data"><thead><tr><th></th><th>Offer A</th><th>Offer B</th></tr></thead><tbody>';
  rows.forEach(function(r){ html+='<tr><td>'+r[0]+'</td><td>'+money(r[1])+'</td><td>'+money(r[2])+'</td></tr>'; });
  html+='<tr><td><strong>Estimated total value</strong></td><td><strong>'+money(a.total)+'</strong></td><td><strong>'+money(b.total)+'</strong></td></tr></tbody></table>';
  var diff=Math.abs(a.total-b.total);
  var verdict=a.total===b.total?'Both offers have equal estimated total value.':
    'Offer '+(a.total>b.total?'A':'B')+' leads by '+money(diff)+' in estimated total value.';
  html+='<p class="note" style="margin-top:12px"><strong>Verdict:</strong> '+TN.esc(verdict)+'</p>';
  out.innerHTML=html;
}
try{
  var ids=['a-salary','a-bonus','a-health','a-match','a-pto','a-tax','b-salary','b-bonus','b-health','b-match','b-pto','b-tax'];
  ids.forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
