(function () {
  'use strict';
  var ERR = 'roman-numeral-converter-error';
  var TABLE = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  var VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

  function toRoman(n) {
    var s = '';
    for (var i = 0; i < TABLE.length; i++) {
      while (n >= TABLE[i][0]) { s += TABLE[i][1]; n -= TABLE[i][0]; }
    }
    return s;
  }

  function fromRoman(s) {
    s = s.trim().toUpperCase();
    if (!s || !/^[IVXLCDM]+$/.test(s)) throw new Error('Use only the letters I, V, X, L, C, D, M.');
    var total = 0;
    for (var i = 0; i < s.length; i++) {
      var v = VALUES[s[i]];
      var next = i + 1 < s.length ? VALUES[s[i + 1]] : 0;
      total += (v < next) ? -v : v;
    }
    if (total < 1 || total > 3999) throw new Error('Roman numerals here cover 1 to 3999.');
    // Canonical round-trip validation rejects IIII, VV, IL, etc.
    if (toRoman(total) !== s) throw new Error('"' + s + '" is not valid canonical Roman form (try ' + toRoman(total) + ').');
    return total;
  }

  function convert() {
    TN.clearErr(ERR);
    try {
      var modeEl = TN.el('roman-numeral-converter-mode');
      var mode = modeEl ? modeEl.value : 'to-roman';
      var el = TN.el('roman-numeral-converter-input');
      var s = el ? el.value.trim() : '';
      if (!s) throw new Error('Enter a value to convert.');
      var out;
      if (mode === 'to-roman') {
        if (!/^\d+$/.test(s)) throw new Error('Enter a whole number from 1 to 3999.');
        var n = parseInt(s, 10);
        if (n < 1 || n > 3999) throw new Error('Number must be between 1 and 3999.');
        out = toRoman(n);
      } else {
        out = String(fromRoman(s));
      }
      TN.el('roman-numeral-converter-out').textContent = out;
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  try {
    TN.on('roman-numeral-converter-go', 'click', convert);
    TN.on('roman-numeral-converter-input', 'keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); convert(); }
    });
  } catch (e) { /* never throw on load */ }
})();
