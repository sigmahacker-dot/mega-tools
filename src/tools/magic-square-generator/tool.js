(function () {
  'use strict';
  var P = 'magic-square-generator-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function siamese(n) {
    var sq = [], i, j;
    for (i = 0; i < n; i++) { sq.push([]); for (j = 0; j < n; j++) sq[i].push(0); }
    var r = 0, c = Math.floor(n / 2);
    for (var k = 1; k <= n * n; k++) {
      sq[r][c] = k;
      var nr = (r - 1 + n) % n, nc = (c + 1) % n;
      if (sq[nr][nc] !== 0) r = (r + 1) % n;
      else { r = nr; c = nc; }
    }
    return sq;
  }
  function doublyEven(n) {
    var sq = [], i, j;
    for (i = 0; i < n; i++) { sq.push([]); for (j = 0; j < n; j++) sq[i].push(i * n + j + 1); }
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
      if ((i % 4 === j % 4) || ((i % 4) + (j % 4) === 3)) sq[i][j] = n * n + 1 - sq[i][j];
    }
    return sq;
  }
  function gen() {
    try {
      TN.clearErr(ERR);
      var n = parseInt(g('n').value, 10);
      var sq, method;
      if (n % 2 === 1) {
        sq = siamese(n);
        method = '<ol><li>Place <b>1</b> in the middle cell of the top row.</li><li>For each next number, move one step <b>up and right</b>, wrapping around the edges.</li><li>If that cell is already filled, place the number <b>directly below</b> the current cell instead.</li><li>Repeat until ' + (n * n) + ' is placed — the Siamese (de la Loubère) method, published 1693.</li></ol>';
      } else {
        sq = doublyEven(n);
        method = '<ol><li>Fill the grid with 1..' + (n * n) + ' in natural order.</li><li>Mark every cell where (row mod 4) = (col mod 4) or (row mod 4) + (col mod 4) = 3 — an X pattern in each 4×4 block.</li><li>Replace each marked cell x with ' + (n * n + 1) + ' − x (complement). Unmarked cells stay.</li><li>The result is magic — the classic doubly-even construction.</li></ol>';
      }
      var M = n * (n * n + 1) / 2;
      var ok = true, detail = [];
      var i, j, s;
      for (i = 0; i < n; i++) {
        s = 0; for (j = 0; j < n; j++) s += sq[i][j];
        if (s !== M) ok = false;
        detail.push('Row ' + (i + 1) + ' = ' + s);
      }
      for (j = 0; j < n; j++) {
        s = 0; for (i = 0; i < n; i++) s += sq[i][j];
        if (s !== M) ok = false;
      }
      var d1 = 0, d2 = 0;
      for (i = 0; i < n; i++) { d1 += sq[i][i]; d2 += sq[i][n - 1 - i]; }
      if (d1 !== M || d2 !== M) ok = false;
      var h = '<table class="data" style="border-collapse:collapse;margin:0 auto"><tbody>';
      for (i = 0; i < n; i++) {
        h += '<tr>';
        for (j = 0; j < n; j++) h += '<td style="min-width:44px;text-align:center;font-size:1.15em"><b>' + sq[i][j] + '</b></td>';
        h += '</tr>';
      }
      h += '</tbody></table>';
      TN.show(P + 'out');
      g('const').textContent = String(M);
      g('verdict').textContent = ok ? '✓ all ' + (2 * n + 2) + ' lines sum to ' + M : '✗ FAILED';
      g('grid').innerHTML = h;
      g('steps').innerHTML = method + '<p class="muted">Checked: ' + (2 * n) + ' rows/columns + 2 diagonals. Sample: ' + TN.esc(detail.slice(0, 3).join('; ')) + (n > 3 ? '; …' : '') + '.</p>';
    } catch (e) { TN.setErr(ERR, e.message || 'Could not generate.'); }
  }
  try {
    if (!TN.el(P + 'gen')) return;
    TN.on(P + 'gen', 'click', gen);
  } catch (e) { /* never throw on load */ }
})();
