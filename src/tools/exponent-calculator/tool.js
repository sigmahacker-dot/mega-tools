(function () {
  'use strict';
  var P = 'exponent-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function fmt(n) {
    if (!isFinite(n)) return '–';
    if (n !== 0 && (Math.abs(n) >= 1e15 || Math.abs(n) < 1e-6)) return n.toExponential(6);
    return String(Number(n.toFixed(10)));
  }
  function sci(n) { if (!isFinite(n) || n === 0) return '–'; return n.toExponential(4); }
  function blank(msg) {
    set('value', '–'); set('sci', '–'); set('recip', '–');
    set('steps', msg || 'Enter a base and an exponent to see the calculation.');
  }
  function calc() {
    if (!g('base')) return;
    TN.clearErr(ERR);
    var bv = g('base').value, ev = g('exp').value;
    if (bv === '' || ev === '') { blank(); return; }
    var base = parseFloat(bv), exp = parseFloat(ev);
    if (isNaN(base) || isNaN(exp)) { TN.setErr(ERR, 'Enter valid numbers for the base and exponent.'); blank(); return; }
    if (base < 0 && Math.floor(exp) !== exp) { TN.setErr(ERR, 'A negative base with a fractional exponent has no real result.'); blank(); return; }
    if (base === 0 && exp < 0) { TN.setErr(ERR, 'Zero raised to a negative exponent is undefined (division by zero).'); blank(); return; }
    var r = Math.pow(base, exp);
    if (!isFinite(r)) { TN.setErr(ERR, 'The result is too large to represent.'); blank(); return; }
    set('value', fmt(r));
    set('sci', sci(r));
    set('recip', r === 0 ? '–' : fmt(1 / r));
    var steps = '';
    var isInt = Math.floor(exp) === exp && Math.abs(exp) <= 12;
    if (isInt) {
      if (exp === 0) {
        steps = base === 0
          ? '0^0 is indeterminate in strict mathematics; computing convention returns 1.'
          : 'Any non-zero base raised to 0 equals 1.';
      } else {
        var n = Math.abs(exp), parts = [];
        for (var i = 0; i < n; i++) parts.push(String(base));
        var prod = parts.join(' × ');
        steps = exp > 0
          ? base + '^' + exp + ' = ' + prod + ' = ' + fmt(r)
          : base + '^(' + exp + ') = 1 ÷ (' + prod + ') = 1 ÷ ' + fmt(Math.pow(base, n)) + ' = ' + fmt(r);
      }
    } else {
      steps = base + '^' + exp + ' = e^(' + exp + ' × ln(' + base + ')) = ' + fmt(r);
    }
    set('steps', steps);
  }
  try {
    TN.on(P + 'base', 'input', calc);
    TN.on(P + 'exp', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
