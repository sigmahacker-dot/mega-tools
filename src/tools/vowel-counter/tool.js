/* Vowel Counter — per-vowel counts + total + ratio, live on input. */
(function () {
  'use strict';
  var SLUG = 'vowel-counter';

  function analyze() {
    try {
      var text = TN.el(SLUG + '-input').value.toLowerCase();
      var counts = { a: 0, e: 0, i: 0, o: 0, u: 0 };
      var letters = 0;
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch >= 'a' && ch <= 'z') {
          letters++;
          if (counts.hasOwnProperty(ch)) counts[ch]++;
        }
      }
      var total = counts.a + counts.e + counts.i + counts.o + counts.u;
      TN.el(SLUG + '-a').textContent = counts.a;
      TN.el(SLUG + '-e').textContent = counts.e;
      TN.el(SLUG + '-i').textContent = counts.i;
      TN.el(SLUG + '-o').textContent = counts.o;
      TN.el(SLUG + '-u').textContent = counts.u;
      TN.el(SLUG + '-total').textContent = total;
      TN.el(SLUG + '-letters').textContent = letters;
      TN.el(SLUG + '-ratio').textContent = letters ? Math.round(total / letters * 100) + '%' : '0%';
    } catch (e) { /* never throw on typing */ }
  }

  function init() {
    if (!TN.el(SLUG + '-input')) return;
    TN.el(SLUG + '-input').addEventListener('input', TN.debounce(analyze, 80));
    analyze();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
