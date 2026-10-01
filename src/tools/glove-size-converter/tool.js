(function () {
  'use strict';
  var S = 'glove-size-converter';
  var TABLES = {
    men: [
      ['XS', 7, 17.8], ['S', 8, 20.3], ['M', 9, 22.9],
      ['L', 10, 25.4], ['XL', 11, 27.9], ['XXL', 12, 30.5]
    ],
    women: [
      ['XS', 6.5, 16.5], ['S', 7, 17.8], ['M', 7.5, 19.1],
      ['L', 8, 20.3], ['XL', 8.5, 21.6], ['XXL', 9, 22.9]
    ]
  };
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var lEl = TN.el(S + '-letter'), nEl = TN.el(S + '-numeric');
      var raw = TN.el(S + '-circ').value;
      if (raw === '' || raw === null) {
        if (lEl) lEl.textContent = '–';
        if (nEl) nEl.textContent = '–';
        return;
      }
      var v = parseFloat(raw);
      if (!isFinite(v) || v <= 0) { TN.setErr(S + '-error', 'Enter a positive hand circumference.'); return; }
      var inches = TN.el(S + '-units').value === 'cm' ? v / 2.54 : v;
      if (inches < 5 || inches > 14) { TN.setErr(S + '-error', 'That seems outside the normal hand range (5–14 in) — check your value.'); }
      var table = TABLES[TN.el(S + '-fit').value] || TABLES.men;
      var best = table[0], bd = 1e9;
      for (var i = 0; i < table.length; i++) {
        var d = Math.abs(inches - table[i][1]);
        if (d < bd) { bd = d; best = table[i]; }
      }
      if (lEl) lEl.textContent = best[0];
      if (nEl) nEl.textContent = String(best[1]);
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    var tb = TN.el(S + '-table');
    if (tb) {
      var html = '';
      ['men', 'women'].forEach(function (fit) {
        var t = TABLES[fit];
        for (var i = 0; i < t.length; i++) {
          html += '<tr><td>' + t[i][0] + '</td><td>' + t[i][1] + '</td><td>' + t[i][2] + '</td><td>' + (fit === 'men' ? "Men's" : "Women's") + '</td></tr>';
        }
      });
      tb.innerHTML = html;
    }
    ['circ', 'units', 'fit'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', convert);
      TN.on(S + '-' + k, 'change', convert);
    });
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
