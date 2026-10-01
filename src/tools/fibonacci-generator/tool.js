/* Fibonacci generator with fast-doubling nth term (BigInt). */
(function () {
  'use strict';
  var SLUG = 'fibonacci-generator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function fibPair(n) { // returns [F(n), F(n+1)] as BigInt, F(0)=0
    if (n === 0n) return [0n, 1n];
    var p = fibPair(n >> 1n);
    var a = p[0], b = p[1];
    var c = a * ((b << 1n) - a);
    var d = a * a + b * b;
    return (n & 1n) === 0n ? [c, d] : [d, c + d];
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var N = parseInt($(SLUG + '-n').value, 10);
    var start = parseInt($(SLUG + '-start').value, 10);
    if (isNaN(N) || N < 1 || N > 5000) { err('N must be between 1 and 5000.'); return; }
    var lines = [];
    var a = start === 0 ? 0n : 1n, b = 1n;
    for (var i = 0; i < N; i++) {
      lines.push('F(' + (i + (start === 0 ? 0 : 1)) + ') = ' + a.toString());
      var t = a + b; a = b; b = t;
    }
    var idx = BigInt(N - 1 + (start === 0 ? 0 : 1));
    var nth = fibPair(idx)[0].toString();
    $(SLUG + '-nth').textContent = nth.length > 24 ? nth.slice(0, 21) + '\u2026 (' + nth.length + ' digits)' : nth;
    $(SLUG + '-ratio').textContent = N >= 3 ? 'approaches 1.6180339887' : '\u2014';
    $(SLUG + '-list').textContent = lines.join('\n') + '\n\nNth term computed by fast doubling in O(log N): F(' + idx.toString() + ') = ' + nth;
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-n', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-start', 'change', calc);
    calc();
  } catch (e) {}
})();