/* Prime factorization as a factor-tree walk. */
(function () {
  'use strict';
  var SLUG = 'prime-factorization-visualizer';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function sup(n) {
    var map = { '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3', '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079' };
    return String(n).split('').map(function (c) { return map[c]; }).join('');
  }
  function smallestFactor(n) {
    if (n % 2 === 0) return 2;
    for (var p = 3; p * p <= n; p += 2) if (n % p === 0) return p;
    return n;
  }
  function isPrime(n) { return n >= 2 && smallestFactor(n) === n; }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var n = parseInt($(SLUG + '-n').value, 10);
    if (isNaN(n) || n < 2) { err('Enter an integer of 2 or more.'); return; }
    if (n > 1e12) { err('Numbers up to 10\u00B9\u00B2 keep trial division fast.'); return; }
    var lines = [], rest = n, depth = 0;
    var counts = {};
    lines.push('Factor tree for ' + n + ':');
    while (!isPrime(rest)) {
      var p = smallestFactor(rest);
      var q = rest / p;
      counts[p] = (counts[p] || 0) + 1;
      lines.push('  ' + '  '.repeat(depth) + rest + ' = ' + p + ' \u00D7 ' + q + (isPrime(q) ? '   \u2713 ' + q + ' is prime' : ''));
      rest = q; depth++;
      if (depth > 200) break;
    }
    counts[rest] = (counts[rest] || 0) + 1;
    if (depth === 0) lines.push('  ' + n + ' is already prime \u2713');
    var fac = Object.keys(counts).sort(function (a, b) { return a - b; })
      .map(function (p) { return counts[p] > 1 ? p + sup(counts[p]) : p; }).join(' \u00D7 ');
    lines.push('');
    lines.push(n + ' = ' + fac);
    $(SLUG + '-fac').textContent = fac;
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-n', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();