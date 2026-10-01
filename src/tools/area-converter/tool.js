(function () {
  'use strict';
  var S = 'area-converter';
  var UNITS = [
    ['mm2', 'Square millimeters (mm²)', 0.000001],
    ['cm2', 'Square centimeters (cm²)', 0.0001],
    ['m2', 'Square meters (m²)', 1],
    ['ha', 'Hectares (ha)', 10000],
    ['km2', 'Square kilometers (km²)', 1000000],
    ['in2', 'Square inches (in²)', 0.00064516],
    ['ft2', 'Square feet (ft²)', 0.09290304],
    ['yd2', 'Square yards (yd²)', 0.83612736],
    ['acre', 'Acres (ac)', 4046.8564224],
    ['mi2', 'Square miles (mi²)', 2589988.110336]
  ];
  function factorOf(code) {
    for (var i = 0; i < UNITS.length; i++) if (UNITS[i][0] === code) return UNITS[i][2];
    return 1;
  }
  function fmtNum(n) {
    if (!isFinite(n)) return '–';
    if (n === 0) return '0';
    var a = Math.abs(n);
    if (a >= 1e15 || a < 1e-9) return n.toExponential(4);
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
