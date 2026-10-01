/* Circle properties from any one known value. */
(function () {
  'use strict';
  var SLUG = 'circle-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) { return (Math.round(x * 1e6) / 1e6).toString(); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var known = $(SLUG + '-known').value;
    var v = parseFloat($(SLUG + '-val').value);
    if (isNaN(v) || v < 0) { err('Enter a non-negative value.'); return; }
    var r, lines = [];
    if (known === 'r') { r = v; lines.push('Given radius r = ' + f(v)); }
    else if (known === 'd') { r = v / 2; lines.push('r = d / 2 = ' + f(v) + ' / 2 = ' + f(r)); }
    else if (known === 'c') { r = v / (2 * Math.PI); lines.push('r = C / (2\u03C0) = ' + f(v) + ' / ' + f(2 * Math.PI) + ' = ' + f(r)); }
    else { r = Math.sqrt(v / Math.PI); lines.push('r = \u221A(A / \u03C0) = \u221A(' + f(v) + ' / \u03C0) = ' + f(r)); }
    var d = 2 * r, c = 2 * Math.PI * r, a = Math.PI * r * r;
    lines.push('d = 2r = ' + f(d));
    lines.push('C = 2\u03C0r = ' + f(c));
    lines.push('A = \u03C0r\u00B2 = ' + f(a));
    $(SLUG + '-r').textContent = f(r);
    $(SLUG + '-d').textContent = f(d);
    $(SLUG + '-c').textContent = f(c);
    $(SLUG + '-a').textContent = f(a);
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-val', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-known', 'change', calc);
    calc();
  } catch (e) {}
})();