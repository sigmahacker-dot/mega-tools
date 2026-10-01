(function () {
  'use strict';
  var P = 'proportion-solver-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function fmt(n) { if (!isFinite(n)) return '–'; return String(Number(n.toFixed(6))); }
  function num(id) { var v = g(id).value; return v === '' ? NaN : parseFloat(v); }
  function calc() {
    if (!g('a')) return;
    TN.clearErr(ERR);
    var u = g('unknown').value;
    var a = num('a'), b = num('b'), c = num('c'), d = num('d');
    var vals = { a: a, b: b, c: c, d: d };
    var need = ['a', 'b', 'c', 'd'].filter(function (k) { return k !== u; });
    for (var i = 0; i < need.length; i++) {
      if (isNaN(vals[need[i]])) {
        set('x', '–'); set('check', '–'); set('check2', '–');
        set('steps', 'Enter the three known values to solve for ' + u + '.');
        return;
      }
    }
    if (u === 'b' || u === 'd') { /* unknown is a denominator; known denominators must be nonzero too */ }
    var kb = (u === 'b') ? NaN : b, kd = (u === 'd') ? NaN : d;
    if ((u !== 'b' && b === 0) || (u !== 'd' && d === 0)) {
      TN.setErr(ERR, 'Denominators b and d cannot be zero in a proportion.');
      set('x', '–'); set('check', '–'); set('check2', '–'); return;
    }
    var x, formula;
    if (u === 'a') { if (d === 0) { TN.setErr(ERR, 'd cannot be zero.'); return; } x = (b * c) / d; formula = 'a = (b × c) ÷ d = (' + fmt(b) + ' × ' + fmt(c) + ') ÷ ' + fmt(d); }
    else if (u === 'b') { if (c === 0) { TN.setErr(ERR, 'c cannot be zero when solving for b.'); return; } x = (a * d) / c; formula = 'b = (a × d) ÷ c = (' + fmt(a) + ' × ' + fmt(d) + ') ÷ ' + fmt(c); }
    else if (u === 'c') { if (b === 0) { TN.setErr(ERR, 'b cannot be zero.'); return; } x = (a * d) / b; formula = 'c = (a × d) ÷ b = (' + fmt(a) + ' × ' + fmt(d) + ') ÷ ' + fmt(b); }
    else { if (a === 0) { TN.setErr(ERR, 'a cannot be zero when solving for d.'); return; } x = (b * c) / a; formula = 'd = (b × c) ÷ a = (' + fmt(b) + ' × ' + fmt(c) + ') ÷ ' + fmt(a); }
    vals[u] = x;
    set('x', fmt(x));
    set('check', fmt(vals.a / vals.b));
    set('check2', fmt(vals.c / vals.d));
    set('steps', 'Cross-multiplication: a × d = b × c, so ' + formula + ' = ' + fmt(x) + '. Check: ' + fmt(vals.a) + '/' + fmt(vals.b) + ' = ' + fmt(vals.c) + '/' + fmt(vals.d) + '.');
    void kb; void kd;
  }
  try {
    ['a', 'b', 'c', 'd'].forEach(function (k) { TN.on(P + k, 'input', calc); });
    TN.on(P + 'unknown', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
