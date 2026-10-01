/* Arithmetic sequence: nth term + partial sum. */
(function () {
  'use strict';
  var SLUG = 'arithmetic-sequence-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) { return (Math.round(x * 1e8) / 1e8).toString(); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var a1 = parseFloat($(SLUG + '-a1').value), d = parseFloat($(SLUG + '-d').value);
    var n = parseInt($(SLUG + '-n').value, 10);
    if (isNaN(a1) || isNaN(d)) { err('Enter numbers for a\u2081 and d.'); return; }
    if (isNaN(n) || n < 1) { err('n must be a positive whole number.'); return; }
    if (n > 1000000) { err('n is too large (max 1,000,000).'); return; }
    var an = a1 + (n - 1) * d;
    var sn = n / 2 * (2 * a1 + (n - 1) * d);
    var terms = [];
    for (var i = 0; i < Math.min(n, 12); i++) terms.push(f(a1 + i * d));
    var lines = [
      'Sequence: ' + terms.join(', ') + (n > 12 ? ', \u2026' : ''),
      'nth term: a\u2099 = a\u2081 + (n\u22121)d = ' + f(a1) + ' + ' + (n - 1) + '\u00D7' + f(d) + ' = ' + f(an),
      'Sum: S\u2099 = n/2 \u00D7 (2a\u2081 + (n\u22121)d) = ' + n + '/2 \u00D7 (' + f(2 * a1) + ' + ' + f((n - 1) * d) + ') = ' + f(sn)
    ];
    $(SLUG + '-an').textContent = f(an);
    $(SLUG + '-sn').textContent = f(sn);
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    ['a1', 'd', 'n'].forEach(function (id) { TN.on(SLUG + '-' + id, 'input', TN.debounce(calc, 400)); });
    calc();
  } catch (e) {}
})();