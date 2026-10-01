/* Date to Roman Numerals — DD · MM · YYYY with proper subtractive notation. */
(function () {
  'use strict';
  var SLUG = 'date-to-roman-numerals';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  var TABLE = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];

  function toRoman(n) {
    var out = '';
    for (var i = 0; i < TABLE.length; i++) {
      while (n >= TABLE[i][0]) { out += TABLE[i][1]; n -= TABLE[i][0]; }
    }
    return out;
  }

  function parseDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return { y: +m[1], m: +m[2], d: +m[3] };
  }

  function convert() {
    TN.clearErr(SLUG + '-error');
    var p = parseDate($('date').value);
    if (!p) { TN.setErr(SLUG + '-error', 'Please pick a valid calendar date.'); return; }
    if (p.y > 3999) { TN.setErr(SLUG + '-error', 'Roman numerals have no standard form above 3999 — pick an earlier year.'); return; }
    var r = toRoman(p.d) + ' · ' + toRoman(p.m) + ' · ' + toRoman(p.y);
    $('out').textContent = r;
    $('sub').textContent = p.d + ' → ' + toRoman(p.d) + '    ' + p.m + ' → ' + toRoman(p.m) + '    ' + p.y + ' → ' + toRoman(p.y);
  }

  try {
    TN.on(SLUG + '-convert', 'click', convert);
    TN.on(SLUG + '-date', 'change', convert);
  } catch (e) { /* never throw on load */ }
})();
