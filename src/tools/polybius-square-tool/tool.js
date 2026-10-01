/* Polybius Square Tool — 5x5 grid, I/J merged, row-first coordinates. */
(function () {
  'use strict';
  var SLUG = 'polybius-square-tool';
  var GRID = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'K'],
    ['L', 'M', 'N', 'O', 'P'],
    ['Q', 'R', 'S', 'T', 'U'],
    ['V', 'W', 'X', 'Y', 'Z']
  ];
  var TOCOORD = {};
  for (var r = 0; r < 5; r++) {
    for (var c = 0; c < 5; c++) {
      TOCOORD[GRID[r][c]] = '' + (r + 1) + (c + 1);
    }
  }
  TOCOORD.J = TOCOORD.I; // I/J share a cell

  function encode(text) {
    var out = [];
    text.toUpperCase().split('').forEach(function (ch) {
      if (ch === ' ') out.push('  ');
      else if (TOCOORD[ch]) out.push(TOCOORD[ch] + ' ');
      // ignore anything else
    });
    return out.join('').replace(/\s+$/, '');
  }

  function decode(code) {
    var digits = code.replace(/[^1-5]/g, '');
    if (digits.length % 2 !== 0) return null;
    var out = '';
    for (var i = 0; i < digits.length; i += 2) {
      var r = parseInt(digits[i], 10) - 1, c = parseInt(digits[i + 1], 10) - 1;
      var ch = GRID[r][c];
      out += (ch === 'I') ? 'I/J' : ch;
    }
    return out;
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some input first.'); return; }
    var mode = TN.el(SLUG + '-mode').value;
    if (mode === 'encode') {
      TN.el(SLUG + '-output').textContent = encode(input);
    } else {
      var res = decode(input);
      if (res === null) { TN.setErr(SLUG + '-error', 'Coordinates must contain an even number of digits (1–5).'); return; }
      TN.el(SLUG + '-output').textContent = res;
    }
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
