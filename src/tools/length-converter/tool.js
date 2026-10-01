(function () {
  'use strict';
  var S = 'length-converter';
  var UNITS = [
    ['mm', 'Millimeters (mm)', 0.001],
    ['cm', 'Centimeters (cm)', 0.01],
    ['m', 'Meters (m)', 1],
    ['km', 'Kilometers (km)', 1000],
    ['in', 'Inches (in)', 0.0254],
    ['ft', 'Feet (ft)', 0.3048],
    ['yd', 'Yards (yd)', 0.9144],
    ['mi', 'Miles (mi)', 1609.344]
  ];
  function factorOf(code) {
    for (var i = 0; i < UNITS.length; i++) if (UNITS[i][0] === code) return UNITS[i][2];
    return 1;
  }
  function fmtNum(n) {
    if (!isFinite(n)) return '–';
    if (n === 0) return '0';
    var a = Math.abs(n);
    if (a >= 1e15 || a < 1e-6) return n.toExponential(4);
    return String(Math.round(n * 1e6) / 1e6);
  }
  function renderTable(base) {
    var tb = TN.el(S + '-table');
    if (!tb) return;
    var html = '';
    for (var i = 0; i < UNITS.length; i++) {
      html += '<tr><td>' + UNITS[i][1] + '</td><td>' +
        (base === null ? '–' : fmtNum(base / UNITS[i][2])) + '</td></tr>';
    }
    tb.innerHTML = html;
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var raw = TN.el(S + '-value').value;
      if (raw === '' || raw === null) {
        TN.el(S + '-result-value').textContent = '–';
        renderTable(null);
        return;
      }
      var v = parseFloat(raw);
      if (!isFinite(v)) { TN.setErr(S + '-error', 'Please enter a valid number.'); return; }
      var base = v * factorOf(TN.el(S + '-from').value);
      var to = TN.el(S + '-to').value;
      TN.el(S + '-result-value').textContent = fmtNum(base / factorOf(to)) + ' ' + to;
      renderTable(base);
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    renderTable(null);
    ['value', 'from', 'to'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', convert);
      TN.on(S + '-' + k, 'change', convert);
    });
    TN.on(S + '-swap', 'click', function () {
      try {
        var f = TN.el(S + '-from'), t = TN.el(S + '-to');
        var tmp = f.value; f.value = t.value; t.value = tmp;
        convert();
      } catch (e) {}
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
