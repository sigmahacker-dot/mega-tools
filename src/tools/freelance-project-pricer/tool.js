(function(){
'use strict';
var S='freelance-project-pricer', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function calc(){
  if(!TN.el(S+'-hours')) return;
  TN.clearErr(ERR);
  var hours=parseFloat(TN.el(S+'-hours').value);
  var rate=parseFloat(TN.el(S+'-rate').value);
  var exp=parseFloat(TN.el(S+'-expenses').value)||0;
  var margin=parseFloat(TN.el(S+'-margin').value);
  if(!(hours>0)){ TN.setErr(ERR,'Enter estimated hours greater than 0.'); return; }
  if(!(rate>=0)){ TN.setErr(ERR,'Enter a valid hourly rate.'); return; }
  if(isNaN(margin)||margin<0){ TN.setErr(ERR,'Enter a profit margin of 0 or more.'); return; }
  var labor=hours*rate;
  var cost=labor+exp;
  var profit=cost*margin/100;
  var quote=cost+profit;
  TN.el(S+'-labor').textContent=money(labor);
  TN.el(S+'-cost').textContent=money(cost);
  TN.el(S+'-profit').textContent=money(profit);
  TN.el(S+'-quote').textContent=money(quote);
  TN.el(S+'-effrate').textContent=money(quote/hours);
}
try{
  ['hours','rate','expenses','margin'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
