(function () {
  'use strict';
  var S = 'force-converter';
  /* exact factors: newtons per unit */
  var UNITS = [
    ['N', 'Newtons', 1],
    ['kN', 'Kilonewtons', 1000],
    ['lbf', 'Pounds-force', 4.4482216152605],
    ['kgf', 'Kilograms-force', 9.80665],
    ['dyn', 'Dynes', 1e-5],
    ['ozf', 'Ounces-force', 4.4482216152605 / 16]
  ];
  function factorOf(code) {
    for (var i = 0; i < UNITS.length; i++) if (UNITS[i][0] === code) return UNITS[i][2];
    return 1;
  }
  function fmt(n) {
    if (!isFinite(n)) return '–';
    if (n === 0) return '0';
    var a = Math.abs(n);
    if (a >= 1e12 || a < 1e-6) return n.toExponential(4);
    var r = Math.round(n * 10000) / 10000;
    return String(r);
  }
  function render(nt) {
    var tb = TN.el(S + '-table');
    if (!tb) return;
    var html = '';
    if (!isFinite(nt)) {
      for (var j = 0; j < UNITS.length; j++) html += '<tr><td>' + UNITS[j][1] + ' (' + UNITS[j][0] + ')</td><td>–</td></tr>';
    } else {
      for (var i = 0; i < UNITS.length; i++) {
        html += '<tr><td>' + UNITS[i][1] + ' (' + UNITS[i][0] + ')</td><td>' + fmt(nt / UNITS[i][2]) + '</td></tr>';
      }
    }
    tb.innerHTML = html;
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var raw = TN.el(S + '-value').value;
      if (raw === '' || raw === null) { render(NaN); return; }
      var v = parseFloat(raw);
      if (!isFinite(v)) { TN.setErr(S + '-error', 'Please enter a valid number.'); render(NaN); return; }
      render(v * factorOf(TN.el(S + '-from').value));
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    render(NaN);
    ['value', 'from'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', convert);
      TN.on(S + '-' + k, 'change', convert);
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
