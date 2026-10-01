/* Modular inverse via extended Euclidean algorithm. */
(function () {
  'use strict';
  var SLUG = 'modular-inverse-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var a = parseInt($(SLUG + '-a').value, 10), m = parseInt($(SLUG + '-m').value, 10);
    if (isNaN(a) || isNaN(m)) { err('Enter integers for a and m.'); return; }
    if (m <= 0) { err('Modulus m must be positive.'); return; }
    var a0 = ((a % m) + m) % m;
    var lines = ['Find x with ' + a + ' \u00D7 x \u2261 1 (mod ' + m + ')  \u2014 i.e. inverse of ' + a0 + ' mod ' + m + '.'];
    // extended Euclid
    var oldR = m, r = a0, oldT = 0, t = 1; // t = coefficient of a0; at end g = s*m + t*a0 so t is the inverse
    lines.push('\nExtended Euclidean algorithm:');
    lines.push('  r\u2080=' + m + ', r\u2081=' + a0 + '   (tracking the coefficient of ' + a0 + ')');
    while (r !== 0) {
      var q = Math.floor(oldR / r);
      lines.push('  ' + oldR + ' = ' + q + ' \u00D7 ' + r + ' + ' + (oldR - q * r) + '    (t: ' + oldT + ', ' + t + ' \u2192 ' + (oldT - q * t) + ')');
      var tR = oldR - q * r; oldR = r; r = tR;
      var tT = oldT - q * t; oldT = t; t = tT;
    }
    var g = oldR;
    lines.push('\ngcd(' + a0 + ', ' + m + ') = ' + g);
    $(SLUG + '-gcd').textContent = g;
    if (g !== 1) {
      lines.push('\n\u2717 No inverse exists: a and m must be coprime (gcd = 1).');
      $(SLUG + '-inv').textContent = 'none';
    } else {
      var inv = ((oldT % m) + m) % m;
      lines.push('\n\u2713 Inverse x = ' + oldT + ' \u2261 ' + inv + ' (mod ' + m + ')');
      lines.push('Check: ' + a0 + ' \u00D7 ' + inv + ' = ' + (a0 * inv) + ' \u2261 ' + ((a0 * inv) % m) + ' (mod ' + m + ')');
      $(SLUG + '-inv').textContent = inv;
    }
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-a', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-m', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();