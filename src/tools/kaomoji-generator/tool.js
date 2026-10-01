/* Kaomoji Generator — categorized face bank, click to copy. */
(function () {
  'use strict';
  var SLUG = 'kaomoji-generator';
  var BANK = {
    happy: ['(＾▽＾)', '(^_^)', '(≧◡≦)', '＼(＾▽＾)／', '(◕‿◕)', '(✿◠‿◠)', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '(●´ω｀●)', '(*^▽^*)', '(⌒‿⌒)', 'ヽ(´▽`)/', '(o^▽^o)', '(๑˃̵ᴗ˂̵)و', '٩(◕‿◕｡)۶', '(◕‿◕✿)', '(≧∀≦)', '＼(^o^)／', '(´▽`ʃ♡ƪ)'],
    sad: ['(T_T)', '(；_；)', '(´；ω；`)', '(╥_╥)', '(｡•́︿•̀｡)', '(ಥ_ಥ)', '(；ω；)', '(´-ω-`)', '(´･_･`)', '(｡ŏ﹏ŏ)', '(；一_一)', '(つ﹏<)', '(。_。)', '(´･ω･`)', '(－‸ლ)', '( p_q)', '(×_×)', '(っ˘̩╭╮˘̩)っ'],
    love: ['(♥ω♥*)', '(♡ω♡ ) ~♪', '(´ε｀ )♡', '(◕‿◕)♡', '(｡♥‿♥｡)', '(✿ ♥‿♥)', '(●♡◡♡●)', '(´∀｀)♡', '(´▽`ʃ♡ƪ)', '(⁄ ⁄•⁄ω⁄•⁄ ⁄)', '(♡´౪`♡)', '(･´з`･)', '( ˘ ³˘)♥', '(っ´▽｀)っ♥', '(≧◡≦) ♡', 'ლ(́◉◞౪◟◉‵ლ)', '(♥_♥)', '(❀◕‿◕)♡'],
    angry: ['(╬ Ò﹏Ó)', '(¬_¬)', '(╯°□°）╯', '(ಠ_ಠ)', '(¬‿¬)', '(≧Д≦)', '(ง •̀_•́)ง', '(⋋▂⋌)', '(¬▂¬)', '(╬⁽⁽ ⁰ ⁾⁾ Д ⁽⁽ ⁰ ⁾⁾)', '(＃`Д´)', '(¬､¬)', '(ʘ言ʘ╬)', '(ꐦ°᷄д°᷅)', '(¬_¬")', '(╯ರ ~ ರ）╯', '(¬_¬ )', '(º言º)'],
    surprised: ['(°o°)', '(⊙_⊙)', '(ʘᗩʘ’)', '(°□°)', '(＠_＠)', '(°◇°)', '(⊙﹏⊙)', '(º □ º)', '(っ °Д °;)っ', '(；☉_☉)', '(ʘᗩʘ)', '(o_O)', '(・o・)', '(°ロ°)', '(꒪⌓꒪)', '(O_O)', '(⚆_⚆)', '(๑•́o•̀๑)']
  };
  var current = 'happy';

  function renderCat(cat) {
    current = cat;
    var grid = TN.el(SLUG + '-grid');
    grid.innerHTML = '';
    var tabs = TN.qsa('#' + SLUG + '-tabs button');
    tabs.forEach(function (t) {
      if (t.getAttribute('data-kaomoji-cat') === cat) t.classList.add('btn-primary');
      else t.classList.remove('btn-primary');
    });
    BANK[cat].forEach(function (face) {
      var b = document.createElement('button');
      b.className = 'btn btn-outline';
      b.textContent = face;
      b.style.fontSize = '1.05em';
      b.title = 'Click to copy';
      b.addEventListener('click', function () { TN.copy(face); });
      grid.appendChild(b);
    });
  }

  try {
    var tabs = TN.qsa('#' + SLUG + '-tabs button');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { renderCat(t.getAttribute('data-kaomoji-cat')); });
    });
    renderCat('happy');
  } catch (e) { /* never throw on load */ }
})();
