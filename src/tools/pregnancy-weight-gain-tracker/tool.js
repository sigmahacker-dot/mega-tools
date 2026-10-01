(function(){
'use strict';
var S='pregnancy-weight-gain-tracker', ERR=S+'-error', LS='tn-pregnancy-weight-gain-tracker';
function today(){ var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function read(){ try{ return JSON.parse(localStorage.getItem(LS)||'{"log":[]}'); }catch(e){ return {log:[]}; } }
function write(d){ try{ localStorage.setItem(LS,JSON.stringify(d)); }catch(e){} }
function iomRange(bmi){
  if(bmi<18.5) return {cat:'Underweight',lo:12.5,hi:18};
  if(bmi<25) return {cat:'Normal weight',lo:11.5,hi:16};
  if(bmi<30) return {cat:'Overweight',lo:7,hi:11.5};
  return {cat:'Obese',lo:5,hi:9};
}
function base(){
  var h=parseFloat(TN.el(S+'-height').value), pre=parseFloat(TN.el(S+'-prew').value);
  if(!(h>0)||!(pre>0)) return null;
  var bmi=pre/Math.pow(h/100,2);
  return {h:h,pre:pre,bmi:bmi,range:iomRange(bmi)};
}
function render(){
  if(!TN.el(S+'-height')) return;
  TN.clearErr(ERR);
  var out=TN.el(S+'-out'); out.innerHTML='';
  var b=base();
  var d=read();
  ['bmi','range','current','status'].forEach(function(f){ TN.el(S+'-'+f).textContent='–'; });
  drawChart(null,null,[]);
  if(!b){ return; }
  TN.el(S+'-bmi').textContent=(Math.round(b.bmi*10)/10)+' ('+b.range.cat+')';
  TN.el(S+'-range').textContent=b.range.lo+'–'+b.range.hi+' kg';
  var log=d.log.slice().sort(function(a,c){ return a.d<c.d?-1:1; });
  if(log.length){
    var last=log[log.length-1];
    var gain=last.w-b.pre;
    TN.el(S+'-current').textContent=(gain>=0?'+':'')+(Math.round(gain*10)/10)+' kg';
    TN.el(S+'-status').textContent=gain<b.range.lo?'Below range':gain>b.range.hi?'Above range':'In range';
    TN.el(S+'-status').style.color=gain<b.range.lo||gain>b.range.hi?'#eab308':'#84cc16';
    var html='<table class="data"><thead><tr><th>Date</th><th>Weight</th><th>Gain</th><th></th></tr></thead><tbody>';
    log.forEach(function(e,i){
      var g=e.w-b.pre;
      html+='<tr><td>'+TN.esc(e.d)+'</td><td>'+e.w+' kg</td><td>'+(g>=0?'+':'')+(Math.round(g*10)/10)+' kg</td>'+
        '<td><button class="btn btn-sm btn-outline" data-del="'+i+'" type="button">X</button></td></tr>';
    });
    out.innerHTML=html+'</tbody></table>';
    Array.prototype.forEach.call(out.querySelectorAll('[data-del]'),function(btn){
      btn.addEventListener('click',function(){
        var dd=read();
        var sorted=dd.log.slice().sort(function(a,c){ return a.d<c.d?-1:1; });
        var target=sorted[parseInt(btn.getAttribute('data-del'),10)];
        dd.log=dd.log.filter(function(e){ return e!==target; });
        write(dd); render();
      });
    });
    drawChart(b,log.map(function(e){ return e.w-b.pre; }),log.map(function(e){ return e.d.slice(5); }));
  } else {
    out.innerHTML='<p class="muted">No weigh-ins logged yet.</p>';
  }
}
function drawChart(b,gains,labels){
  var cv=TN.el(S+'-chart');
  if(!cv||!cv.getContext) return;
  var ctx=cv.getContext('2d');
  var W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,.5)';
  ctx.font='11px sans-serif';
  if(!b||!gains.length){
    ctx.fillText('Log weigh-ins to see your chart.',20,30);
    return;
  }
  var lo=b.range.lo,hi=b.range.hi;
  var min=Math.min(0,lo,Math.min.apply(null,gains))-1;
  var max=Math.max(hi,Math.max.apply(null,gains))+1;
  function y(v){ return H-30-((v-min)/(max-min))*(H-60); }
  function x(i){ return 40+(i/(Math.max(1,gains.length-1)))*(W-60); }
  ctx.fillStyle='rgba(132,204,22,.15)';
  ctx.fillRect(40,y(hi),W-60,y(lo)-y(hi));
  ctx.fillStyle='rgba(255,255,255,.5)';
  ctx.fillText(hi+' kg',4,y(hi)+4); ctx.fillText(lo+' kg',4,y(lo)+4);
  ctx.strokeStyle='#84cc16'; ctx.lineWidth=2; ctx.beginPath();
  gains.forEach(function(g,i){ if(i===0)ctx.moveTo(x(i),y(g)); else ctx.lineTo(x(i),y(g)); });
  ctx.stroke();
  ctx.fillStyle='#fff';
  gains.forEach(function(g,i){ ctx.beginPath(); ctx.arc(x(i),y(g),3,0,7); ctx.fill(); });
  ctx.fillStyle='rgba(255,255,255,.5)';
  labels.forEach(function(l,i){ if(i%Math.ceil(labels.length/8)===0) ctx.fillText(l,x(i)-10,H-12); });
}
try{
  TN.el(S+'-date').value=today();
  var saved=read();
  if(saved.h) TN.el(S+'-height').value=saved.h;
  if(saved.pre) TN.el(S+'-prew').value=saved.pre;
  ['height','prew'].forEach(function(f){
    TN.on(S+'-'+f,'input',function(){
      var dd=read(); dd.h=TN.el(S+'-height').value; dd.pre=TN.el(S+'-prew').value; write(dd); render();
    });
  });
  TN.on(S+'-add','click',function(){
    TN.clearErr(ERR);
    var b=base();
    if(!b){ TN.setErr(ERR,'Enter your height and pre-pregnancy weight first.'); return; }
    var w=parseFloat(TN.el(S+'-weight').value);
    var dt=TN.el(S+'-date').value||today();
    if(!(w>0)){ TN.setErr(ERR,'Enter a weight greater than 0.'); return; }
    var dd=read(); dd.log.push({d:dt,w:w}); write(dd);
    TN.el(S+'-weight').value='';
    render();
  });
  render();
}catch(e){}
})();
