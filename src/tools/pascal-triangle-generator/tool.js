/* Pascal's triangle with clickable cells. */
(function () {
  'use strict';
  var SLUG = 'pascal-triangle-generator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var N = parseInt($(SLUG + '-n').value, 10);
    if (isNaN(N) || N < 1 || N > 20) { err('Rows must be between 1 and 20.'); return; }
    var tri = [[1]];
    for (var r = 1; r < N; r++) {
      var row = [1];
      for (var c = 1; c < r; c++) row.push(tri[r - 1][c - 1] + tri[r - 1][c]);
      row.push(1);
      tri.push(row);
    }
    var host = $(SLUG + '-tri');
    host.innerHTML = '';
    tri.forEach(function (row, r) {
      var div = document.createElement('div');
      div.style.margin = '2px 0';
      row.forEach(function (val, c) {
        var b = document.createElement('button');
        b.textContent = val;
        b.title = 'Row ' + r + ', position ' + c;
        b.style.cssText = 'min-width:34px;margin:1px;padding:4px 6px;border:1px solid #c8e6c9;background:#e8f5e9;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px';
        b.addEventListener('click', function () {
          $(SLUG + '-info').textContent = 'C(' + r + ', ' + c + ') = ' + val + '   \u00B7 row sum = 2^' + r + ' = ' + Math.pow(2, r) + (c > 0 && c < r ? '   \u00B7 ' + tri[r - 1][c - 1] + ' + ' + tri[r - 1][c] + ' above' : '   \u00B7 edge of triangle');
        });
        div.appendChild(b);
      });
      host.appendChild(div);
    });
    $(SLUG + '-info').textContent = 'Click any cell to inspect it.';
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-n', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();