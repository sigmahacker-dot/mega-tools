(function () {
  'use strict';
  var P = 'synthetic-division-calculator-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function fmt(x) {
    if (!isFinite(x)) return String(x);
    return String(parseFloat(x.toPrecision(10)));
  }
  function divide() {
    try {
      TN.clearErr(ERR);
      var raw = g('coeffs').value.trim();
      if (!raw) { TN.setErr(ERR, 'Type the dividend coefficients first.'); return; }
      var parts = raw.split(/[\s,;]+/).filter(Boolean), coeffs = [];
      for (var i = 0; i < parts.length; i++) {
        var v = parseFloat(parts[i]);
        if (isNaN(v)) { TN.setErr(ERR, '"' + parts[i] + '" is not a number.'); return; }
        coeffs.push(v);
      }
      if (coeffs.length < 2) { TN.setErr(ERR, 'Need at least 2 coefficients.'); return; }
      var c = parseFloat(g('c').value);
      if (isNaN(c)) { TN.setErr(ERR, 'Enter a numeric value for c.'); return; }
      var n = coeffs.length;
      var bottom = [], prods = [], steps = [];
      bottom.push(coeffs[0]);
      steps.push('<li>Bring down the leading coefficient <b>' + fmt(coeffs[0]) + '</b>.</li>');
      for (var k = 0; k < n - 1; k++) {
        var prod = bottom[k] * c;
        prods.push(prod);
        var sum = coeffs[k + 1] + prod;
        steps.push('<li>Multiply ' + fmt(bottom[k]) + ' × ' + fmt(c) + ' = ' + fmt(prod) + ', add to ' + fmt(coeffs[k + 1]) + ': ' + fmt(coeffs[k + 1]) + ' + ' + fmt(prod) + ' = <b>' + fmt(sum) + '</b>.</li>');
        bottom.push(sum);
      }
      var rem = bottom[n - 1];
      var quot = bottom.slice(0, n - 1);
      var deg = n - 2;
      function polyStr(cs, d) {
        var parts2 = [];
        for (var i2 = 0; i2 < cs.length; i2++) {
          var cc = cs[i2], p = d - i2;
          if (Math.abs(cc) < 1e-12) continue;
          var mag = Math.abs(cc), term = (mag === 1 && p > 0) ? '' : fmt(mag);
          if (p > 1) term += 'x^' + p; else if (p === 1) term += 'x';
          parts2.push((!parts2.length ? (cc < 0 ? '−' : '') : (cc < 0 ? ' − ' : ' + ')) + term);
        }
        return parts2.length ? parts2.join('') : '0';
      }
      // tableau
      var h = '<table class="data" style="border-collapse:collapse;text-align:center"><tbody><tr><td style="border-right:2px solid"><b>' + fmt(c) + '</b></td>';
      for (i = 0; i < n; i++) h += '<td style="min-width:56px"><b>' + fmt(coeffs[i]) + '</b></td>';
      h += '</tr><tr><td style="border-right:2px solid"></td>';
      for (i = 0; i < n - 1; i++) h += '<td>' + fmt(prods[i]) + '</td>';
      h += '<td></td></tr><tr><td style="border-right:2px solid;border-top:2px solid"></td>';
      for (i = 0; i < n; i++) h += '<td style="border-top:2px solid"><b>' + fmt(bottom[i]) + '</b></td>';
      h += '</tr></tbody></table>';
      TN.show(P + 'out');
      g('quot').textContent = quot.map(fmt).join(', ');
      g('rem').textContent = fmt(rem);
      g('table').innerHTML = h;
      steps.push('<li>The bottom row is <b>' + quot.map(fmt).join(', ') + '</b> (quotient) and <b>' + fmt(rem) + '</b> (remainder).</li>');
      steps.push('<li>Result: (' + polyStr(coeffs, n - 1) + ') ÷ (x − ' + fmt(c) + ') = <b>' + polyStr(quot, deg) + '</b>, remainder <b>' + fmt(rem) + '</b>.</li>');
      if (Math.abs(rem) < 1e-9) steps.push('<li>Remainder is 0, so <b>(x − ' + fmt(c) + ') is a factor</b> of the dividend ✓.</li>');
      else steps.push('<li>Remainder Theorem check: P(' + fmt(c) + ') = ' + fmt(rem) + '.</li>');
      g('steps').innerHTML = '<ol>' + steps.join('') + '</ol>';
      g('copy').setAttribute('data-r', 'Quotient: ' + polyStr(quot, deg) + '  Remainder: ' + fmt(rem));
    } catch (e) { TN.setErr(ERR, e.message || 'Could not divide.'); }
  }
  try {
    if (!TN.el(P + 'divide')) return;
    TN.on(P + 'divide', 'click', divide);
    TN.on(P + 'copy', 'click', function () {
      var r = g('copy').getAttribute('data-r');
      if (r) TN.copy(r);
    });
  } catch (e) { /* never throw on load */ }
})();
