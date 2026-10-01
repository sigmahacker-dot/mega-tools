(function () {
  'use strict';
  var P = 'logarithm-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function fmt(n) { if (!isFinite(n)) return '–'; return String(Number(n.toFixed(10))); }
  function baseName(b) {
    if (Math.abs(b - 10) < 1e-12) return 'log₁₀(x)';
    if (Math.abs(b - Math.E) < 1e-12) return 'ln(x)';
    if (Math.abs(b - 2) < 1e-12) return 'log₂(x)';
    return 'log(' + fmt(b) + ', x)';
  }
  function blank() {
    set('main', '–'); set('ln', '–'); set('log2', '–');
    set('steps', 'Enter a positive number to compute its logarithm.');
  }
  function calc() {
    if (!g('x')) return;
    TN.clearErr(ERR);
    var sel = g('base').value;
    var wrap = g('customwrap');
    if (wrap) wrap.style.display = sel === 'custom' ? '' : 'none';
    var b = sel === 'custom' ? parseFloat(g('custom').value) : (sel === 'e' ? Math.E : parseFloat(sel));
    var xv = g('x').value;
    if (xv === '') { blank(); return; }
    var x = parseFloat(xv);
    if (isNaN(x) || x <= 0) { TN.setErr(ERR, 'x must be a positive number.'); blank(); return; }
    if (sel === 'custom' && (isNaN(b) || b <= 0 || b === 1)) {
      TN.setErr(ERR, 'The logarithm base must be positive and not equal to 1.');
      blank(); return;
    }
    var main = Math.log(x) / Math.log(b);
    set('main', fmt(main));
    set('mainlabel', baseName(b));
    set('ln', fmt(Math.log(x)));
    set('log2', fmt(Math.log2(x)));
    set('steps', 'Change-of-base: log(' + fmt(b) + ', ' + fmt(x) + ') = ln(' + fmt(x) + ') ÷ ln(' + fmt(b) + ') = ' +
      fmt(Math.log(x)) + ' ÷ ' + fmt(Math.log(b)) + ' = ' + fmt(main) + '. Check: ' + fmt(b) + '^' + fmt(main) + ' ≈ ' + fmt(Math.pow(b, main)) + '.');
  }
  try {
    TN.on(P + 'x', 'input', calc);
    TN.on(P + 'custom', 'input', calc);
    TN.on(P + 'base', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
