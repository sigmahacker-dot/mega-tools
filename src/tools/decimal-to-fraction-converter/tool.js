/* Decimal to simplified fraction with GCD steps. */
(function () {
  'use strict';
  var SLUG = 'decimal-to-fraction-converter';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var raw = $(SLUG + '-dec').value.trim();
    var maxDen = parseInt($(SLUG + '-max').value, 10);
    if (!/^-?\d+(\.\d+)?$/.test(raw)) { err('Enter a valid decimal number, e.g. 0.75 or 2.5.'); return; }
    var neg = raw.charAt(0) === '-';
    var parts = raw.replace('-', '').split('.');
    var intPart = parseInt(parts[0], 10) || 0;
    var fracPart = parts[1] || '';
    var lines = [];
    var num, den;
    if (fracPart.length === 0) {
      num = intPart; den = 1;
      lines.push(raw + ' is already a whole number \u2192 ' + intPart + '/1');
    } else {
      den = Math.pow(10, fracPart.length);
      num = intPart * den + parseInt(fracPart, 10);
      lines.push('Step 1: ' + raw + ' has ' + fracPart.length + ' decimal place' + (fracPart.length > 1 ? 's' : '') + ' \u2192 write over 10^' + fracPart.length + ' = ' + den);
      lines.push('        ' + raw + ' = ' + num + '/' + den);
      var g = gcd(num, den);
      lines.push('Step 2: GCD(' + num + ', ' + den + ') = ' + g);
      num = num / g; den = den / g;
      lines.push('Step 3: divide top and bottom by ' + g + ' \u2192 ' + num + '/' + den);
    }
    if (maxDen > 0 && den > maxDen) {
      // continued-fraction best approximation within maxDen
      var x = (intPart + (fracPart ? parseInt(fracPart, 10) / Math.pow(10, fracPart.length) : 0));
      var h1 = 1, h2 = 0, k1 = 0, k2 = 1, xx = x, bn, an;
      var bestN = 0, bestD = 1;
      for (var it = 0; it < 64; it++) {
        an = Math.floor(xx); bn = an * h1 + h2; var kd = an * k1 + k2;
        if (kd > maxDen) break;
        bestN = bn; bestD = kd;
        h2 = h1; h1 = bn; k2 = k1; k1 = kd;
        var f = xx - an; if (f < 1e-12) break; xx = 1 / f;
      }
      num = bestN; den = bestD;
      lines.push('Step 4: denominator cap ' + maxDen + ' \u2192 closest fraction by continued fractions: ' + num + '/' + den);
    }
    var sign = neg && num ? '-' : '';
    var mixed;
    if (den === 1) mixed = sign + num;
    else if (num < den) mixed = sign + num + '/' + den;
    else mixed = sign + Math.floor(num / den) + ' ' + (num % den) + '/' + den;
    $(SLUG + '-frac').textContent = sign + num + '/' + den;
    $(SLUG + '-mixed').textContent = mixed;
    lines.push('');
    lines.push('Result: ' + sign + num + '/' + den + '  (check: ' + (num / den).toPrecision(10) + ')');
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-dec', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-max', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();