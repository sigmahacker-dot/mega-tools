(function () {
  'use strict';
  var S = 'cooking-converter';
  var UNITS = [
    ['cup', 'Cups', 236.5882365],
    ['tbsp', 'Tablespoons', 14.7867648],
    ['tsp', 'Teaspoons', 4.92892159],
    ['floz', 'Fluid ounces', 29.5735296],
    ['ml', 'Milliliters', 1],
    ['l', 'Liters', 1000]
  ];
  var DENSITY = {
    water: 1, flour: 0.529, sugar: 0.845, butter: 0.959,
    oil: 0.917, milk: 1.03, honey: 1.42, salt: 1.217
  };
  function factorOf(code) {
    for (var i = 0; i < UNITS.length; i++) if (UNITS[i][0] === code) return UNITS[i][2];
    return 1;
  }
  function fmtNum(n) {
    if (!isFinite(n)) return '–';
    if (n === 0) return '0';
    var a = Math.abs(n);
    if (a >= 1e12 || a < 1e-4) return n.toExponential(3);
    return String(Math.round(n * 1000) / 1000);
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var raw = TN.el(S + '-value').value;
      var tb = TN.el(S + '-table');
      if (raw === '' || raw === null) {
        TN.el(S + '-grams').textContent = '–';
        if (tb) {
          var h0 = '';
          for (var j = 0; j < UNITS.length; j++) h0 += '<tr><td>' + UNITS[j][1] + '</td><td>–</td></tr>';
          tb.innerHTML = h0;
        }
        return;
      }
      var v = parseFloat(raw);
      if (!isFinite(v)) { TN.setErr(S + '-error', 'Please enter a valid number.'); return; }
      if (v < 0) { TN.setErr(S + '-error', 'Amount cannot be negative.'); return; }
      var ml = v * factorOf(TN.el(S + '-from').value);
      var dens = DENSITY[TN.el(S + '-ingredient').value] || 1;
      TN.el(S + '-grams').textContent = fmtNum(ml * dens) + ' g';
      var html = '';
      for (var i = 0; i < UNITS.length; i++) {
        html += '<tr><td>' + UNITS[i][1] + '</td><td>' + fmtNum(ml / UNITS[i][2]) + '</td></tr>';
      }
      if (tb) tb.innerHTML = html;
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    convert();
    ['value', 'from', 'ingredient'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', convert);
      TN.on(S + '-' + k, 'change', convert);
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
