/* Rapper Name Generator — Lil/Young/Big/Yung patterns + hard-hitting word combos. */
(function () {
  'use strict';
  var SLUG = 'rapper-name-generator';

  var WORDS = ['Savage', 'Bandit', 'Rebel', 'Hustle', 'Menace', 'Profit', 'Vandal', 'Trigger', 'Ghost', 'Venom', 'Ace', 'Blaze', 'Cipher', 'Dagger', 'Empire', 'Frost', 'Grim', 'Havoc', 'Ice', 'Jinx', 'Karma', 'Legend', 'Mayhem', 'Nova', 'Onyx', 'Phantom', 'Quake', 'Rogue', 'Storm', 'Titan', 'Uproar', 'Vortex', 'Wildcard', 'Xeno', 'Yolo', 'Zephyr', 'Smoke', 'Cash', 'Stacks', 'Grind', 'Playa', 'Boss', 'Chief', 'Don', 'Kingpin', 'Outlaw', 'Renegade', 'Sinner', 'Saint', 'Wolf', 'Panther', 'Cobra', 'Shark', 'Falcon', 'Dragon', 'Tiger', 'Lion'];
  var STAND = ['MC Thunder', 'Rhyme Animal', 'Flow Master Flex', 'Beat Butcher', 'Lyric Assassin', 'Mic Menace', 'Verse Villain', 'Barbarian Bars', 'Rhyme Reaper', 'Track Terror', 'Word Wizard', 'Flowzilla', 'Rap Raptor', 'Hip Hop Hooligan'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function makeName(pattern) {
    var p = pattern === 'mixed' ? pick(['lil', 'young', 'big', 'yung', 'stand']) : pattern;
    if (p === 'stand') return pick(STAND);
    var pre = { lil: 'Lil', young: 'Young', big: 'Big', yung: 'Yung' }[p] || 'Lil';
    var w = pick(WORDS);
    if (Math.random() < 0.25) return pre + ' ' + w + ' ' + pick(WORDS);
    return pre + ' ' + w;
  }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cssText = 'cursor:pointer;flex:1;font-weight:600';
      res.textContent = t;
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      function doCopy() {
        TN.copy(t).then(function (ok) {
          btn.textContent = ok ? 'Copied ✓' : 'Copy';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
        });
      }
      btn.addEventListener('click', doCopy);
      res.addEventListener('click', doCopy);
      row.appendChild(res);
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var pattern = TN.el(SLUG + '-pattern').value;
        var seen = {}, out = [], guard = 0;
        while (out.length < 8 && guard < 200) {
          guard++;
          var n = makeName(pattern);
          if (!seen[n]) { seen[n] = true; out.push(n); }
        }
        render(out);
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.'); }
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
