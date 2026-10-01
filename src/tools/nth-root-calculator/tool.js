(function () {
  'use strict';
  var P = 'nth-root-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function fmt(n) {
    if (!isFinite(n)) return '–';
    if (n !== 0 && (Math.abs(n) >= 1e15 || Math.abs(n) < 1e-9)) return n.toExponential(6);
    return String(Number(n.toFixed(10)));
  }
  function blank() {
    set('res', '–'); set('lab', 'ⁿ√x'); set('check', '–'); set('pow', '–');
    set('steps', 'Enter x and the root degree n.');
  }
  function calc() {
    if (!g('x')) return;
    TN.clearErr(ERR);
    var xv = g('x').value, nv = g('n').value;
    if (xv === '' || nv === '') { blank(); return; }
    var x = parseFloat(xv), n = parseFloat(nv);
    if (isNaN(x)) { TN.setErr(ERR, 'Enter a valid number for x.'); blank(); return; }
    if (isNaN(n) || Math.floor(n) !== n || n < 1 || n > 1000) {
      TN.setErr(ERR, 'n must be a whole number between 1 and 1000.'); blank(); return;
    }
    if (x < 0 && n % 2 === 0) {
      TN.setErr(ERR, 'No real ' + n + '-th root of a negative number exists (even root of a negative).');
      blank(); return;
    }
    var r = x < 0 ? -Math.pow(-x, 1 / n) : Math.pow(x, 1 / n);
    set('res', fmt(r));
    set('lab', n === 2 ? '√x' : (n === 3 ? '∛x' : n + '-th root'));
    set('check', fmt(Math.pow(r, n)));
    set('pow', fmt(x) + '^(1/' + n + ')');
    set('steps', 'r = ' + fmt(x) + '^(1/' + n + ') = ' + fmt(r) + '. Verification: ' + fmt(r) + '^' + n + ' = ' + fmt(Math.pow(r, n)) + ' ≈ ' + fmt(x) + '.');
  }
  try {
    TN.on(P + 'x', 'input', calc);
    TN.on(P + 'n', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
