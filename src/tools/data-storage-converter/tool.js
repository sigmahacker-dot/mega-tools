(function () {
  'use strict';
  var S = 'data-storage-converter';
  var K = 1024;
  var MODES = {
    decimal: [
      ['bit', 'Bits', 1],
      ['B', 'Bytes (B)', 8],
      ['KB', 'Kilobytes (KB)', 8 * 1000],
      ['MB', 'Megabytes (MB)', 8 * 1e6],
      ['GB', 'Gigabytes (GB)', 8 * 1e9],
      ['TB', 'Terabytes (TB)', 8 * 1e12],
      ['PB', 'Petabytes (PB)', 8 * 1e15]
    ],
    binary: [
      ['bit', 'Bits', 1],
      ['B', 'Bytes (B)', 8],
      ['KiB', 'Kibibytes (KiB)', 8 * K],
      ['MiB', 'Mebibytes (MiB)', 8 * K * K],
      ['GiB', 'Gibibytes (GiB)', 8 * K * K * K],
      ['TiB', 'Tebibytes (TiB)', 8 * K * K * K * K],
      ['PiB', 'Pebibytes (PiB)', 8 * K * K * K * K * K]
    ]
  };
  function mode() {
    return TN.el(S + '-binary') && TN.el(S + '-binary').checked ? 'binary' : 'decimal';
  }
  function units() { return MODES[mode()]; }
  function factorOf(code) {
    var u = units();
    for (var i = 0; i < u.length; i++) if (u[i][0] === code) return u[i][2];
    return 1;
  }
  function fmtNum(n) {
    if (!isFinite(n)) return '–';
    if (n === 0) return '0';
    var a = Math.abs(n);
    if (a >= 1e15 || a < 1e-6) return n.toExponential(4);
    return String(Math.round(n * 1e6) / 1e6);
  }
  function fillSelects() {
    var u = units();
    var f = TN.el(S + '-from'), t = TN.el(S + '-to');
    var fv = f.value, tv = t.value;
    var html = '';
    for (var i = 0; i < u.length; i++) html += '<option value="' + u[i][0] + '">' + u[i][1] + '</option>';
    f.innerHTML = html; t.innerHTML = html;
    f.value = factorOf(fv) === 1 && fv !== u[0][0] ? 'GB' : fv;
    t.value = factorOf(tv) === 1 && tv !== u[0][0] ? 'MB' : tv;
    if (!f.value) f.value = 'GB';
    if (!t.value) t.value = 'MB';
  }
  function renderTable(base) {
    var tb = TN.el(S + '-table');
    if (!tb) return;
    var u = units();
    var html = '';
    for (var i = 0; i < u.length; i++) {
      html += '<tr><td>' + u[i][1] + '</td><td>' +
        (base === null ? '–' : fmtNum(base / u[i][2])) + '</td></tr>';
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
    fillSelects();
    renderTable(null);
    ['value', 'from', 'to'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', convert);
      TN.on(S + '-' + k, 'change', convert);
    });
    TN.on(S + '-decimal', 'change', function () { fillSelects(); convert(); });
    TN.on(S + '-binary', 'change', function () { fillSelects(); convert(); });
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
