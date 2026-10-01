(function () {
  'use strict';
  var S = 'flow-rate-converter';
  var GALLON_L = 3.785411784;           /* US liquid gallon, exact */
  var CUFT_M3 = 0.028316846592;         /* 0.3048^3, exact */
  /* factors: cubic metres per second per unit */
  var UNITS = [
    ['lmin', 'Litres/minute', 1e-3 / 60],
    ['ls', 'Litres/second', 1e-3],
    ['m3h', 'Cubic metres/hour', 1 / 3600],
    ['gpm', 'Gallons/minute (US)', GALLON_L * 1e-3 / 60],
    ['cfm', 'Cubic feet/minute', CUFT_M3 / 60],
    ['ft3s', 'Cubic feet/second', CUFT_M3]
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
    return String(Math.round(n * 10000) / 10000);
  }
  function render(m3s) {
    var tb = TN.el(S + '-table');
    if (!tb) return;
    var html = '';
    for (var i = 0; i < UNITS.length; i++) {
      html += '<tr><td>' + UNITS[i][1] + '</td><td>' + (isFinite(m3s) ? fmt(m3s / UNITS[i][2]) : '–') + '</td></tr>';
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
      if (v < 0) { TN.setErr(S + '-error', 'Flow rate cannot be negative.'); render(NaN); return; }
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
