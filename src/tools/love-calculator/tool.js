(function () {
  'use strict';
  var P = 'love-calculator-';
  function g(id) { return document.getElementById(P + id); }

  var name1 = g('name1'), name2 = g('name2');
  if (!name1 || !name2) return;

  var btn = g('calc'), clearBtn = g('clear');

  function hashStr(s) {
    var h = 5381, i;
    for (i = 0; i < s.length; i++) {
      h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    }
    return h >>> 0;
  }

  function messageFor(score) {
    if (score >= 90) return '\u2764\uFE0F Soulmates! The stars are clearly aligned for you two.';
    if (score >= 75) return '\uD83D\uDE0D A fantastic match \u2014 sparks are definitely flying.';
    if (score >= 60) return '\uD83D\uDE0A Strong chemistry with real potential. Go for it!';
    if (score >= 40) return '\uD83D\uDE42 A decent match \u2014 friendship could blossom into more.';
    if (score >= 25) return '\uD83E\uDD14 It might take some work, but opposites attract.';
    return '\uD83D\uDE05 Well\u2026 the universe loves a challenge. Good luck!';
  }

  function calculate() {
    TN.clearErr(P + 'error');
    var a = (name1.value || '').trim();
    var b = (name2.value || '').trim();
    if (!a || !b) {
      TN.setErr(P + 'error', 'Please enter both names first.');
      return;
    }
    if (a.length > 60 || b.length > 60) {
      TN.setErr(P + 'error', 'Please keep each name under 60 characters.');
      return;
    }
    var key = a.toLowerCase() + '|' + b.toLowerCase();
    var score = hashStr(key) % 101;
    var res = g('result'), sc = g('score'), msg = g('message'), pair = g('pair');
    if (sc) sc.textContent = score + '%';
    if (msg) msg.textContent = messageFor(score);
    if (pair) pair.textContent = a + ' + ' + b;
    if (res) TN.show(P + 'result');
  }

  TN.on(btn, 'click', calculate);
  TN.on(name2, 'keydown', function (e) { if (e.key === 'Enter') calculate(); });
  TN.on(name1, 'keydown', function (e) { if (e.key === 'Enter') calculate(); });
  TN.on(clearBtn, 'click', function () {
    name1.value = '';
    name2.value = '';
    TN.clearErr(P + 'error');
    TN.hide(P + 'result');
    try { name1.focus(); } catch (e) { /* ignore */ }
  });
})();
