(function(){
'use strict';
var S='glycemic-load-lookup', ERR=S+'-error';
var FOODS=[
["White bread",75,"1 slice (30 g)",11],["Whole-wheat bread",74,"1 slice (30 g)",10],
["White bagel",72,"1 bagel (70 g)",25],["Croissant",67,"1 medium (57 g)",17],
["White rice",73,"1 cup cooked (150 g)",20],["Brown rice",68,"1 cup cooked (150 g)",16],
["Basmati rice",58,"1 cup cooked (150 g)",16],["Spaghetti",49,"1 cup cooked (180 g)",16],
["Lasagna",60,"1 cup (200 g)",18],["Pizza (cheese)",60,"2 slices (150 g)",20],
["Hamburger bun",61,"1 bun (40 g)",13],["Pancakes",67,"2 medium (80 g)",15],
["Instant oatmeal",79,"1 cup cooked (250 g)",21],["Rolled oats",55,"1 cup cooked (250 g)",13],
["Cornflakes",81,"1 cup (30 g)",21],["Bran flakes",74,"3/4 cup (30 g)",12],
["Muesli",57,"2/3 cup (55 g)",16],["Popcorn",65,"3 cups popped (24 g)",9],
["Rice cakes",78,"1 cake (9 g)",5],["Pretzels",83,"1 oz (28 g)",19],
["Potato chips",56,"1 oz (28 g)",8],["French fries",63,"medium serving (117 g)",15],
["Baked potato",85,"1 medium (150 g)",26],["Mashed potato",87,"1 cup (210 g)",30],
["Sweet potato",63,"1 medium (150 g)",17],["Carrots (boiled)",39,"1/2 cup (80 g)",3],
["Peas",48,"1/2 cup (80 g)",4],["Sweet corn",52,"1/2 cup (80 g)",7],
["Lentils",32,"1 cup cooked (200 g)",6],["Chickpeas",28,"1 cup cooked (200 g)",8],
["Kidney beans",24,"1 cup cooked (180 g)",6],["Baked beans",48,"1 cup (250 g)",18],
["Banana",51,"1 medium (120 g)",13],["Apple",36,"1 medium (120 g)",6],
["Orange",43,"1 medium (130 g)",5],["Grapes",53,"1 cup (120 g)",10],
["Watermelon",76,"1 cup diced (150 g)",8],["Pineapple",66,"2 slices (120 g)",9],
["Mango",51,"1 cup (165 g)",13],["Strawberries",40,"1 cup (150 g)",5],
["Blueberries",53,"1 cup (150 g)",10],["Raisins",64,"1 small box (43 g)",22],
["Dates",70,"5 dates (40 g)",18],["Honey",58,"1 tbsp (21 g)",10],
["Table sugar",65,"1 tbsp (12 g)",8],["Milk chocolate",43,"1 bar (45 g)",11],
["Ice cream",57,"1/2 cup (70 g)",9],["Doughnut",76,"1 medium (50 g)",18],
["Blueberry muffin",59,"1 medium (60 g)",17],["Sponge cake",66,"1 slice (60 g)",20],
["Cola",63,"1 can (355 ml)",25],["Orange juice",50,"1 cup (250 ml)",13],
["Apple juice",44,"1 cup (250 ml)",12],["Skim milk",37,"1 cup (250 ml)",4],
["Whole milk",39,"1 cup (250 ml)",5],["Plain yogurt",36,"1 cup (245 g)",4],
["Sweetened yogurt",52,"1 cup (245 g)",14],["Peanuts",14,"1 oz (28 g)",1],
["Cashews",22,"1 oz (28 g)",3]
];
function band(gl){ return gl<=10?'Low':(gl<=19?'Medium':'High'); }
function bandColor(gl){ return gl<=10?'#84cc16':(gl<=19?'#eab308':'#ef4444'); }
function render(){
  if(!TN.el(S+'-search')) return;
  var q=TN.el(S+'-search').value.toLowerCase().trim();
  var list=FOODS.filter(function(f){ return !q||f[0].toLowerCase().indexOf(q)>=0; });
  TN.el(S+'-count').textContent=list.length+' of '+FOODS.length+' foods';
  var html='<table class="data"><thead><tr><th>Food</th><th>GI</th><th>Typical serving</th><th>GL</th><th>Band</th></tr></thead><tbody>';
  list.forEach(function(f){
    html+='<tr><td>'+TN.esc(f[0])+'</td><td>'+f[1]+'</td><td>'+TN.esc(f[2])+'</td><td><strong>'+f[3]+'</strong></td>'+
      '<td><span style="color:'+bandColor(f[3])+';font-weight:bold">'+band(f[3])+'</span></td></tr>';
  });
  TN.el(S+'-out').innerHTML=html+'</tbody></table>';
}
try{
  TN.on(S+'-search','input',TN.debounce(render,150));
  render();
}catch(e){}
})();
