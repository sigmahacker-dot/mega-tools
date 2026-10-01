(function () {
  'use strict';
  var S = 'temperature-converter';
  function fmt(n) {
    if (!isFinite(n)) return '';
    return String(Math.round(n * 100) / 100);
  }
  function sync(src) {
    try {
      TN.clearErr(S + '-error');
      var ids = [S + '-c', S + '-f', S + '-k', S + '-r'];
      var raw = TN.el(src).value;
      if (raw === '' || raw === null) {
        ids.forEach(function (id) { if (id !== src) TN.el(id).value = ''; });
        return;
      }
      var v = parseFloat(raw);
      if (!isFinite(v)) { TN.setErr(S + '-error', 'Please enter a valid number.'); return; }
      var c;
      if (src === S + '-c') c = v;
      else if (src === S + '-f') c = (v - 32) * 5 / 9;
      else if (src === S + '-k') c = v - 273.15;
      else c = (v - 491.67) * 5 / 9;
      var f = c * 9 / 5 + 32;
      var k = c + 273.15;
      var r = k * 9 / 5;
      if (k < 0) {
        TN.setErr(S + '-error', 'That is below absolute zero (−273.15 °C) — not physically possible.');
      }
      var map = {};
      map[S + '-c'] = c; map[S + '-f'] = f; map[S + '-k'] = k; map[S + '-r'] = r;
      ids.forEach(function (id) { if (id !== src) TN.el(id).value = fmt(map[id]); });
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    [S + '-c', S + '-f', S + '-k', S + '-r'].forEach(function (id) {
      TN.on(id, 'input', function () { sync(id); });
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
