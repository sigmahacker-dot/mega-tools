(function(){
'use strict';
var S='blood-donation-eligibility-checker', ERR=S+'-error';
function check(){
  if(!TN.el(S+'-age')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var age=parseFloat(TN.el(S+'-age').value);
  var wt=parseFloat(TN.el(S+'-weight').value);
  var hb=parseFloat(TN.el(S+'-hb').value);
  var female=TN.el(S+'-sex').value==='female';
  if(!(age>=1)||!(wt>=1)||!(hb>=1)){ TN.setErr(ERR,'Enter your age, weight, and hemoglobin.'); return; }
  var rules=[
    {ok:age>=17, t:'Age 17 or older (16 with parental consent in some regions)', v:'age '+age},
    {ok:wt>=50, t:'Weight at least 50 kg (110 lb)', v:wt+' kg'},
    {ok:hb>=(female?12.5:13.0), t:'Hemoglobin at least '+(female?'12.5':'13.0')+' g/dL', v:hb+' g/dL'},
    {ok:TN.el(S+'-well').checked, t:'Feeling healthy and well today', v:TN.el(S+'-well').checked?'yes':'no'},
    {ok:TN.el(S+'-abx').checked, t:'No antibiotics or active infection in the last 7 days', v:TN.el(S+'-abx').checked?'yes':'no'},
    {ok:TN.el(S+'-tat').checked, t:'No new tattoo, piercing, or transfusion in the last 3 months', v:TN.el(S+'-tat').checked?'yes':'no'},
    {ok:TN.el(S+'-preg').checked, t:'Not pregnant / no birth in the last 6 weeks', v:TN.el(S+'-preg').checked?'yes':'no'}
  ];
  var lastVal=TN.el(S+'-last').value;
  var nextDate=null;
  if(lastVal){
    var last=new Date(lastVal+'T12:00:00');
    var next=new Date(last.getTime()+56*86400000);
    nextDate=next;
    var daysLeft=Math.ceil((next-new Date())/86400000);
    rules.push({ok:daysLeft<=0, t:'At least 56 days since last whole-blood donation', v:daysLeft<=0?'satisfied':daysLeft+' day(s) to wait'});
  }
  var failed=rules.filter(function(r){ return !r.ok; });
  var html='<table class="data"><thead><tr><th>Rule</th><th>Your answer</th><th>Status</th></tr></thead><tbody>';
  rules.forEach(function(r){
    html+='<tr><td>'+TN.esc(r.t)+'</td><td>'+TN.esc(String(r.v))+'</td><td style="color:'+(r.ok?'#84cc16':'#ef4444')+';font-weight:bold">'+(r.ok?'Pass':'Fail')+'</td></tr>';
  });
  html+='</tbody></table>';
  if(nextDate){
    html+='<p class="note">Earliest next donation date: <strong>'+nextDate.toISOString().slice(0,10)+'</strong></p>';
  }
  html+='<p class="note" style="margin-top:10px"><strong>'+(failed.length?'You do not appear eligible right now ('+failed.length+' rule(s) not met).':'You appear to meet the common eligibility rules.')+'</strong> Final eligibility is decided at the donation center.</p>';
  out.innerHTML=html;
}
try{
  TN.on(S+'-go','click',check);
}catch(e){}
})();
