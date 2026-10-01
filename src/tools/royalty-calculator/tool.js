(function(){
'use strict';
var S='royalty-calculator', ERR=S+'-error';
function money(n){ return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function calc(){
  if(!TN.el(S+'-units')) return;
  TN.clearErr(ERR);
  var units=parseFloat(TN.el(S+'-units').value)||0;
  var price=parseFloat(TN.el(S+'-price').value)||0;
  var rate=parseFloat(TN.el(S+'-rate').value);
  var advance=parseFloat(TN.el(S+'-advance').value)||0;
  if(isNaN(rate)||rate<0||rate>100){ TN.setErr(ERR,'Enter a royalty rate between 0 and 100.'); return; }
  if(!(units>0)||!(price>0)){ TN.setErr(ERR,'Enter units sold and price per unit greater than 0.'); return; }
  if(advance<0){ TN.setErr(ERR,'Advance cannot be negative.'); return; }
  var gross=units*price;
  var earned=gross*rate/100;
  var recouped=Math.min(advance,earned);
  var payable=earned-recouped;
  var unrecouped=advance-recouped;
  TN.el(S+'-gross').textContent=money(gross);
  TN.el(S+'-earned').textContent=money(earned);
  TN.el(S+'-recouped').textContent=money(recouped);
  TN.el(S+'-payable').textContent=money(payable);
  TN.el(S+'-unrecouped').textContent=money(unrecouped);
}
try{
  ['units','price','rate','advance'].forEach(function(f){ TN.on(S+'-'+f,'input',calc); });
  calc();
}catch(e){}
})();
