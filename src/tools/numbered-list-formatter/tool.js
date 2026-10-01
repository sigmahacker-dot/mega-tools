/* Numbered List Formatter — 1. 1) a. A. i. I. styles with custom start. */
(function () {
  'use strict';
  var SLUG = 'numbered-list-formatter';

  function roman(n) {
    var table = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'],
                 [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'],
                 [5, 'V'], [4, 'IV'], [1, 'I']];
    var s = '';
    table.forEach(function (pair) {
      while (n >= pair[0]) { s += pair[1]; n -= pair[0]; }
    });
    return s;
  }
  function alpha(n, upper) {
    var s = '';
    while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode((upper ? 65 : 97) + r) + s; n = Math.floor((n - 1) / 26); }
    return s;
  }

  function marker(style, n) {
    if (style === '1.') return n + '.';
    if (style === '1)') return n + ')';
    if (style === 'a.') return alpha(n, false) + '.';
    if (style === 'A.') return alpha(n, true) + '.';
    if (style === 'i.') return roman(n).toLowerCase() + '.';
    if (style === 'I.') return roman(n) + '.';
    return n + '.';
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some items first.'); return; }
    var style = TN.el(SLUG + '-style').value;
    var start = parseInt(TN.el(SLUG + '-start').value, 10);
    if (isNaN(start) || start < 1) start = 1;
    var lines = input.split('\n')
      .map(function (l) { return l.trim(); })
      .filter(function (l) { return l.length > 0; });
    if (!lines.length) { TN.setErr(SLUG + '-error', 'No non-empty lines found.'); return; }
    TN.el(SLUG + '-output').textContent = lines.map(function (l, i) {
      return marker(style, start + i) + ' ' + l;
    }).join('\n');
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
