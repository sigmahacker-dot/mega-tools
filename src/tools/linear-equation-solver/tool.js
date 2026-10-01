/* Step-by-step solver for ax + b = c. */
(function () {
  'use strict';
  var SLUG = 'linear-equation-solver';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) { return (Math.round(x * 1e10) / 1e10).toString(); }
  function t(n) { return n < 0 ? '(' + f(n) + ')' : f(n); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var a = parseFloat($(SLUG + '-a').value), b = parseFloat($(SLUG + '-b').value), c = parseFloat($(SLUG + '-c').value);
    if ([a, b, c].some(isNaN)) { err('Enter numbers for a, b and c.'); return; }
    var lines = [];
    lines.push('Solve: ' + f(a) + 'x ' + (b >= 0 ? '+ ' + f(b) : '\u2212 ' + f(-b)) + ' = ' + f(c));
    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b - c) < 1e-12) {
        lines.push('a = 0 and b = c \u2192 every x is a solution (infinitely many).');
        $(SLUG + '-x').textContent = 'any x';
      } else {
        lines.push('a = 0 but b \u2260 c \u2192 contradiction: no solution.');
        $(SLUG + '-x').textContent = 'none';
      }
    } else {
      lines.push('Step 1: subtract ' + t(b) + ' from both sides:');
      lines.push('   ' + f(a) + 'x = ' + f(c) + ' \u2212 ' + t(b) + ' = ' + f(c - b));
      lines.push('Step 2: divide both sides by ' + t(a) + ':');
      var x = (c - b) / a;
      lines.push('   x = ' + f(c - b) + ' / ' + t(a) + ' = ' + f(x));
      lines.push('Check: ' + f(a) + ' \u00D7 ' + t(x) + ' + ' + t(b) + ' = ' + f(a * x + b) + ' ' + (Math.abs(a * x + b - c) < 1e-9 ? '\u2713' : '\u2717'));
      $(SLUG + '-x').textContent = f(x);
    }
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    ['a', 'b', 'c'].forEach(function (id) { TN.on(SLUG + '-' + id, 'input', TN.debounce(calc, 400)); });
    calc();
  } catch (e) {}
})();