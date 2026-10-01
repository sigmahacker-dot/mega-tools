(function(){
'use strict';
var S='stress-level-checker', ERR=S+'-error';
var ITEMS=[
 ['been upset because of something that happened unexpectedly?',false],
 ['felt that you were unable to control the important things in your life?',false],
 ['felt nervous and "stressed"?',false],
 ['felt confident about your ability to handle your personal problems?',true],
 ['felt that things were going your way?',true],
 ['found that you could not cope with all the things that you had to do?',false],
 ['been able to control irritations in your life?',true],
 ['felt that you were on top of things?',true],
 ['been angered because of things that were outside of your control?',false],
 ['felt difficulties were piling up so high that you could not overcome them?',false]
];
var SCALE=['Never','Almost never','Sometimes','Fairly often','Very often'];
function build(){
  var wrap=TN.el(S+'-qs');
  var html='';
  ITEMS.forEach(function(it,i){
    html+='<div class="field" style="margin-bottom:14px"><label>'+(i+1)+'. '+TN.esc(it[0])+'</label><div class="btn-row" style="flex-wrap:wrap">';
    SCALE.forEach(function(label,v){
      html+='<label class="checkline" style="margin-right:10px"><input type="radio" name="'+S+'-q'+i+'" value="'+v+'"> '+label+'</label>';
    });
    html+='</div></div>';
  });
  wrap.innerHTML=html;
}
function calc(){
  if(!TN.el(S+'-qs')) return;
  TN.clearErr(ERR);
  var total=0;
  for(var i=0;i<ITEMS.length;i++){
    var sel=document.querySelector('input[name="'+S+'-q'+i+'"]:checked');
    if(!sel){ TN.setErr(ERR,'Please answer all 10 questions.'); return; }
    var v=parseInt(sel.value,10);
    total+=ITEMS[i][1]?(4-v):v;
  }
  TN.el(S+'-score').textContent=total;
  var band=total<=13?'Low':total<=26?'Moderate':'High';
  var bel=TN.el(S+'-band');
  bel.textContent=band;
  bel.style.color=band==='Low'?'#84cc16':band==='Moderate'?'#eab308':'#ef4444';
}
try{
  build();
  TN.on(S+'-go','click',calc);
}catch(e){}
})();
