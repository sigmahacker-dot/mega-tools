(function(){
'use strict';
var S='burnout-assessment', ERR=S+'-error';
var DIMS=[
 {name:'Exhaustion',items:[
   'I feel emotionally drained by my work.',
   'I feel used up at the end of the workday.',
   'I feel tired when I get up and have to face another workday.',
   'Working all day is a real strain for me.',
   'I feel burned out from my work.']},
 {name:'Cynicism',items:[
   'I have become less enthusiastic about my work.',
   'I doubt the significance of my work.',
   'I have become more cynical about whether my work contributes anything.',
   'I feel I have grown distant from my work.',
   'I question the value of what I do for a living.']},
 {name:'Professional efficacy (reverse scored)',items:[
   'I can effectively solve the problems that arise in my work.',
   'I feel I am making an effective contribution at work.',
   'In my opinion, I am good at my job.',
   'I feel exhilarated when I accomplish something at work.',
   'I have accomplished many worthwhile things in my work.']}
];
var SCALE=['0 Never','1 Rarely','2 Monthly','3 A few times a month','4 Weekly','5 A few times a week','6 Every day'];
function build(){
  var html='',idx=0;
  DIMS.forEach(function(d,di){
    html+='<h3 style="margin:14px 0 6px">'+TN.esc(d.name)+'</h3>';
    d.items.forEach(function(text){
      html+='<div class="field" style="margin-bottom:12px"><label>'+TN.esc(text)+'</label><div class="btn-row" style="flex-wrap:wrap">';
      SCALE.forEach(function(label,v){
        html+='<label class="checkline" style="margin-right:8px"><input type="radio" name="'+S+'-q'+idx+'" value="'+v+'"> '+label+'</label>';
      });
      html+='</div></div>';
      idx++;
    });
  });
  TN.el(S+'-qs').innerHTML=html;
}
function level(avg){ return avg<2?'Low':avg<4?'Moderate':'High'; }
function color(l){ return l==='Low'?'#84cc16':l==='Moderate'?'#eab308':'#ef4444'; }
function calc(){
  if(!TN.el(S+'-qs')) return;
  TN.clearErr(ERR);
  var avgs=[];
  for(var d=0;d<3;d++){
    var sum=0;
    for(var i=0;i<5;i++){
      var sel=document.querySelector('input[name="'+S+'-q'+(d*5+i)+'"]:checked');
      if(!sel){ TN.setErr(ERR,'Please answer all 15 statements.'); return; }
      sum+=parseInt(sel.value,10);
    }
    var avg=sum/5;
    avgs.push(d===2?6-avg:avg);
  }
  var names=['Exhaustion','Cynicism','Reduced efficacy'];
  var highs=0,html='<table class="data"><thead><tr><th>Dimension</th><th>Score / 6</th><th>Level</th></tr></thead><tbody>';
  avgs.forEach(function(a,i){
    var l=level(a);
    if(l==='High') highs++;
    html+='<tr><td>'+names[i]+'</td><td>'+(Math.round(a*100)/100)+'</td><td style="color:'+color(l)+';font-weight:bold">'+l+'</td></tr>';
  });
  html+='</tbody></table>';
  var overall=highs===0?'Low':highs===1?'Moderate':'High';
  html+='<p class="note" style="margin-top:10px"><strong>Overall burnout risk: <span style="color:'+color(overall)+'">'+overall+'</span></strong> '+
    (overall==='Low'?'No strong burnout signals in these dimensions.':
     overall==='Moderate'?'Some warning signs. Consider rest, boundaries, and workload review.':
     'Multiple high dimensions. Consider talking to someone you trust or a professional.')+'</p>';
  TN.el(S+'-out').innerHTML=html;
}
try{
  build();
  TN.on(S+'-go','click',calc);
}catch(e){}
})();
