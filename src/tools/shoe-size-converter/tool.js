(function () {
  'use strict';
  var ERR = 'shoe-size-converter-error';
  var T = [[6, 38.5, 24], [6.5, 39, 24.5], [7, 40, 25], [7.5, 40.5, 25.5], [8, 41, 26], [8.5, 42, 26.5], [9, 42.5, 27], [9.5, 43, 27.5], [10, 44, 28], [10.5, 44.5, 28.5], [11, 45, 29], [11.5, 45.5, 29.5], [12, 46, 30], [13, 47.5, 31], [14, 48.5, 32], [15, 49.5, 33], [16, 50.5, 34]];
  function calc() {
    if (!TN.el('shoe-us')) return;
    TN.clearErr(ERR);
    var us = parseFloat(TN.el('shoe-us').value);
    var g = TN.el('shoe-gender').value;
    if (!(us >= 4 && us <= 18)) { TN.setErr(ERR, 'Enter a US size between 4 and 18.'); return; }
    var menEquiv = g === 'women' ? us - 1.5 : us;
    menEquiv = Math.round(menEquiv * 2) / 2;
    var row = null;
    for (var i = 0; i < T.length; i++) { if (Math.abs(T[i][0] - menEquiv) < 0.01) { row = T[i]; break; } }
    if (!row) {
      var best = T[0];
      for (var j = 0; j < T.length; j++) { if (Math.abs(T[j][0] - menEquiv) < Math.abs(best[0] - menEquiv)) best = T[j]; }
      row = best;
    }
    TN.el('shoe-uk').textContent = (Math.round((menEquiv - 0.5) * 2) / 2);
    TN.el('shoe-eu').textContent = row[1];
    TN.el('shoe-cm').textContent = row[2] + ' cm';
  }
  try {
    TN.on('shoe-us', 'input', calc);
    TN.on('shoe-gender', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();