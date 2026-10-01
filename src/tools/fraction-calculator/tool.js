(function () {
  'use strict';
  var ERR = 'fraction-calculator-error';

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a;
  }

  function readFrac(prefix) {
    function val(id) {
      var el = TN.el(id);
      var s = el ? el.value.trim() : '';
      if (s === '') return 0;
      var n = Number(s);
      if (!isFinite(n) || Math.floor(n) !== n) throw new Error('Enter whole integers only.');
      return n;
    }
    var w = val(prefix + '-whole');
    var num = val(prefix + '-num');
    var den = val(prefix + '-den');
    if (den === 0) throw new Error('Denominator cannot be zero.');
    var sign = (w < 0 || num < 0) ? -1 : 1;
    var n = sign * (Math.abs(w) * Math.abs(den) + Math.abs(num));
    var d = Math.abs(den);
    return { n: n, d: d };
  }

  function simplify(n, d) {
    if (d === 0) throw new Error('Denominator cannot be zero.');
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d) || 1;
    return { n: n / g, d: d / g };
  }

  function toMixed(f) {
    var n = f.n, d = f.d;
    if (n === 0) return '0';
    var whole = Math.trunc(n / d);
    var rem = Math.abs(n % d);
    if (rem === 0) return String(whole);
    if (whole === 0) return (n < 0 ? '−' : '') + rem + '/' + d;
    return whole + ' ' + rem + '/' + d;
  }

  function toSimple(f) {
    if (f.d === 1) return String(f.n);
    return f.n + '/' + f.d;
  }

  function calc() {
    TN.clearErr(ERR);
    try {
      var a = readFrac('fraction-calculator-a');
      var b = readFrac('fraction-calculator-b');
      var opEl = TN.el('fraction-calculator-op');
      var op = opEl ? opEl.value : '+';
      var n, d;
      if (op === '+') { n = a.n * b.d + b.n * a.d; d = a.d * b.d; }
      else if (op === '-') { n = a.n * b.d - b.n * a.d; d = a.d * b.d; }
      else if (op === '*') { n = a.n * b.n; d = a.d * b.d; }
      else {
        if (b.n === 0) throw new Error('Cannot divide by zero.');
        n = a.n * b.d; d = a.d * b.n;
      }
      var f = simplify(n, d);
      TN.el('fraction-calculator-simple').textContent = toSimple(f);
      TN.el('fraction-calculator-mixed').textContent = toMixed(f);
      TN.el('fraction-calculator-decimal').textContent = parseFloat((f.n / f.d).toFixed(8)).toString();
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  try {
    TN.on('fraction-calculator-go', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
