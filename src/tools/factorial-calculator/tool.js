(function () {
  'use strict';
  var P = 'factorial-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function blank() {
    set('value', '–'); set('sci', '–'); set('zeros', '–');
    set('steps', 'Enter n to compute its factorial.');
  }
  function trailingZeros(n) {
    var t = 0;
    for (var p = 5; p <= n; p *= 5) t += Math.floor(n / p);
    return t;
  }
  function calc() {
    if (!g('n')) return;
    TN.clearErr(ERR);
    var raw = g('n').value;
    if (raw === '') { blank(); return; }
    var n = parseFloat(raw);
    if (isNaN(n) || Math.floor(n) !== n || n < 0 || n > 170) {
      TN.setErr(ERR, 'Enter a whole number between 0 and 170.');
      blank(); return;
    }
    var f = 1;
    for (var i = 2; i <= n; i++) f *= i;
    set('value', n <= 18 ? f.toLocaleString('en-US') : f.toExponential(6));
    set('sci', n === 0 ? '1' : f.toExponential(4));
    set('zeros', String(trailingZeros(n)));
    var steps;
    if (n === 0 || n === 1) {
      steps = n + '! = 1 by definition.';
    } else if (n <= 10) {
      var parts = [];
      for (var j = n; j >= 1; j--) parts.push(String(j));
      steps = n + '! = ' + parts.join(' × ') + ' = ' + f.toLocaleString('en-US');
    } else {
      steps = n + '! computed as the product of all integers from 1 to ' + n + '.';
    }
    set('steps', steps);
  }
  try {
    TN.on(P + 'n', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
