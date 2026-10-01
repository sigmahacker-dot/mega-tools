/* Isogram Checker — no repeating letters (case/space ignored). */
(function () {
  'use strict';
  var SLUG = 'isogram-checker';

  function update() {
    TN.clearErr(SLUG + '-error');
    var text = TN.el(SLUG + '-input').value.toLowerCase();
    var counts = {};
    text.replace(/[^a-z]/g, '').split('').forEach(function (ch) {
      counts[ch] = (counts[ch] || 0) + 1;
    });
    var letters = Object.keys(counts);
    var dups = letters.filter(function (ch) { return counts[ch] > 1; }).sort();
    var isIso = letters.length > 0 && dups.length === 0;
    TN.el(SLUG + '-verdict').textContent = letters.length === 0 ? '–' : (isIso ? '✓ Yes' : '✗ No');
    TN.el(SLUG + '-letters').textContent = letters.length;
    TN.el(SLUG + '-dups').textContent = letters.length === 0 ? '—' :
      (dups.length === 0 ? 'None — no letter repeats.' :
        dups.map(function (ch) { return ch + ' ×' + counts[ch]; }).join(', '));
  }

  try {
    TN.on(SLUG + '-input', 'input', update);
    update();
  } catch (e) { /* never throw on load */ }
})();
