/* Tap Code Translator — prison knock code; K taps as C. */
(function () {
  'use strict';
  var SLUG = 'tap-code-translator';
  var GRID = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['L', 'M', 'N', 'O', 'P'],
    ['Q', 'R', 'S', 'T', 'U'],
    ['V', 'W', 'X', 'Y', 'Z']
  ];
  var TOTAP = {};
  function dots(n) { var s = ''; for (var i = 0; i < n; i++) s += '.'; return s; }
  for (var r = 0; r < 5; r++) {
    for (var c = 0; c < 5; c++) {
      TOTAP[GRID[r][c]] = dots(r + 1) + ' ' + dots(c + 1);
    }
  }
  TOTAP.K = TOTAP.C; // K is tapped as C

  function encode(text) {
    return text.toUpperCase().split(/\s+/).map(function (word) {
      return word.split('').map(function (ch) { return TOTAP[ch] || '?'; }).join(' / ');
    }).join(' // ');
  }

  function decode(code) {
    return code.split(/\/\/+/).map(function (word) {
      return word.split('/').map(function (letter) {
        var parts = letter.trim().split(/\s+/);
        if (parts.length !== 2) return '?';
        var r = parts[0].length - 1, c = parts[1].length - 1;
        if (r < 0 || r > 4 || c < 0 || c > 4) return '?';
        var ch = GRID[r][c];
        return ch === 'C' ? 'C/K' : ch;
      }).join('');
    }).join(' ');
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some input first.'); return; }
    var mode = TN.el(SLUG + '-mode').value;
    TN.el(SLUG + '-output').textContent = mode === 'encode' ? encode(input) : decode(input);
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
