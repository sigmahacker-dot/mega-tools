/* Geometric sequence: nth term + partial sum. */
(function () {
  'use strict';
  var SLUG = 'geometric-sequence-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) {
    if (!isFinite(x)) return String(x);
    return (Math.round(x * 1e8) / 1e8).toString();
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var a1 = parseFloat($(SLUG + '-a1').value), r = parseFloat($(SLUG + '-r').value);
    var n = parseInt($(SLUG + '-n').value, 10);
    if (isNaN(a1) || isNaN(r)) { err('Enter numbers for a\u2081 and r.'); return; }
    if (isNaN(n) || n < 1) { err('n must be a positive whole number.'); return; }
    if (n > 1000) { err('n is too large (max 1000) — powers explode quickly.'); return; }
    var an = a1 * Math.pow(r, n - 1);
    var sn, snNote;
    if (Math.abs(r - 1) < 1e-12) { sn = a1 * n; snNote = 'r = 1 \u2192 every term is ' + f(a1) + ', so S\u2099 = n \u00D7 a\u2081 = ' + f(sn); }
    else { sn = a1 * (Math.pow(r, n) - 1) / (r - 1); snNote = 'S\u2099 = a\u2081(r\u207F \u2212 1)/(r \u2212 1) = ' + f(a1) + '\u00D7(' + f(Math.pow(r, n)) + ' \u2212 1)/' + f(r - 1) + ' = ' + f(sn); }
    var terms = [];
    for (var i = 0; i < Math.min(n, 10); i++) terms.push(f(a1 * Math.pow(r, i)));
    var lines = [
      'Sequence: ' + terms.join(', ') + (n > 10 ? ', \u2026' : ''),
      'nth term: a\u2099 = a\u2081\u00D7r^(n\u22121) = ' + f(a1) + ' \u00D7 ' + f(r) + '^' + (n - 1) + ' = ' + f(an),
      'Sum: ' + snNote
    ];
    if (Math.abs(r) < 1) lines.push('Infinite sum (|r| < 1): S\u221E = a\u2081/(1\u2212r) = ' + f(a1 / (1 - r)));
    $(SLUG + '-an').textContent = f(an);
    $(SLUG + '-sn').textContent = f(sn);
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    ['a1', 'r', 'n'].forEach(function (id) { TN.on(SLUG + '-' + id, 'input', TN.debounce(calc, 400)); });
    calc();
  } catch (e) {}
})();