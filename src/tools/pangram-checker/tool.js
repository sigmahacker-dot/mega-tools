/* Pangram Checker — all 26 letters present, missing listed. */
(function () {
  'use strict';
  var SLUG = 'pangram-checker';
  var ALPHA = 'abcdefghijklmnopqrstuvwxyz';

  function update() {
    TN.clearErr(SLUG + '-error');
    var text = TN.el(SLUG + '-input').value.toLowerCase();
    var present = {}, missing = [];
    text.split('').forEach(function (ch) { if (ALPHA.indexOf(ch) !== -1) present[ch] = true; });
    for (var i = 0; i < 26; i++) {
      if (!present[ALPHA[i]]) missing.push(ALPHA[i]);
    }
    var found = 26 - missing.length;
    TN.el(SLUG + '-verdict').textContent = text.replace(/[^a-z]/g, '').length === 0 ? '–' : (missing.length === 0 ? '✓ Yes' : '✗ No');
    TN.el(SLUG + '-found').textContent = found + '/26';
    TN.el(SLUG + '-missing').textContent = missing.length === 0 ?
      (found ? 'None — every letter is present! 🎉' : '—') :
      'Missing: ' + missing.join(' ').toUpperCase();
  }

  try {
    TN.on(SLUG + '-input', 'input', update);
    update();
  } catch (e) { /* never throw on load */ }
})();
