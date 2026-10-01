/* Sphere: radius <-> volume / surface area. */
(function () {
  'use strict';
  var SLUG = 'sphere-calculator';
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
    else if (known === 'v') { r = Math.cbrt(3 * v / (4 * Math.PI)); lines.push('V = (4/3)\u03C0r\u00B3  \u2192  r = \u221B(3V / 4\u03C0) = ' + f(r)); }
    else { r = Math.sqrt(v / (4 * Math.PI)); lines.push('SA = 4\u03C0r\u00B2  \u2192  r = \u221A(SA / 4\u03C0) = ' + f(r)); }
    var vol = 4 / 3 * Math.PI * Math.pow(r, 3), sa = 4 * Math.PI * r * r;
    lines.push('V = (4/3)\u03C0r\u00B3 = ' + f(vol));
    lines.push('SA = 4\u03C0r\u00B2 = ' + f(sa));
    $(SLUG + '-r').textContent = f(r);
    $(SLUG + '-v').textContent = f(vol);
    $(SLUG + '-sa').textContent = f(sa);
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-val', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-known', 'change', calc);
    calc();
  } catch (e) {}
})();