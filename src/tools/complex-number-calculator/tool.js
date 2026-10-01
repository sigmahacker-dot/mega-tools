(function () {
  'use strict';
  var P = 'complex-number-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function fmt(n) { if (!isFinite(n)) return '–'; return String(Number(n.toFixed(6))); }
  function cfmt(re, im) {
    var r = fmt(re), i = fmt(Math.abs(im));
    if (im === 0) return r;
    if (re === 0) return (im < 0 ? '−' : '') + i + 'i';
    return r + (im < 0 ? ' − ' : ' + ') + i + 'i';
  }
  function mod(re, im) { return Math.sqrt(re * re + im * im); }
  function blank(msg) {
    set('res', '–'); set('mod', '–'); set('arg', '–');
    g('body').innerHTML = '<tr><td colspan="4" class="muted">' + (msg || 'Enter both complex numbers to calculate.') + '</td></tr>';
  }
  function calc() {
    if (!g('a')) return;
    TN.clearErr(ERR);
    var vals = ['a', 'b', 'c', 'd'].map(function (k) {
      var v = g(k).value; return v === '' ? NaN : parseFloat(v);
    });
    if (vals.some(isNaN)) { blank(); return; }
    var a = vals[0], b = vals[1], c = vals[2], d = vals[3];
    var op = g('op').value, re, im;
    if (op === 'add') { re = a + c; im = b + d; }
    else if (op === 'sub') { re = a - c; im = b - d; }
    else if (op === 'mul') { re = a * c - b * d; im = a * d + b * c; }
    else {
      var den = c * c + d * d;
      if (den === 0) { TN.setErr(ERR, 'Cannot divide by zero (c + di = 0).'); blank('Cannot divide by zero.'); return; }
      re = (a * c + b * d) / den; im = (b * c - a * d) / den;
    }
    set('res', cfmt(re, im));
    set('mod', fmt(mod(re, im)));
    set('arg', fmt(Math.atan2(im, re) * 180 / Math.PI) + '°');
    g('body').innerHTML =
      '<tr><td>z₁</td><td>' + TN.esc(cfmt(a, b)) + '</td><td>' + TN.esc(fmt(mod(a, b))) + '</td><td>' + TN.esc(cfmt(a, -b)) + '</td></tr>' +
      '<tr><td>z₂</td><td>' + TN.esc(cfmt(c, d)) + '</td><td>' + TN.esc(fmt(mod(c, d))) + '</td><td>' + TN.esc(cfmt(c, -d)) + '</td></tr>' +
      '<tr><td><b>Result</b></td><td><b>' + TN.esc(cfmt(re, im)) + '</b></td><td>' + TN.esc(fmt(mod(re, im))) + '</td><td>' + TN.esc(cfmt(re, -im)) + '</td></tr>';
  }
  try {
    ['a', 'b', 'c', 'd'].forEach(function (k) { TN.on(P + k, 'input', calc); });
    TN.on(P + 'op', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
