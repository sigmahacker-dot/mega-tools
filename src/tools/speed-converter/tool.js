(function () {
  'use strict';
  var S = 'speed-converter';
  var FACTORS = {
    'ms': 1,                    // meters per second
    'kmh': 1 / 3.6,             // kilometers per hour
    'mph': 0.44704,             // miles per hour
    'fts': 0.3048,              // feet per second
    'knot': 0.5144444444444444  // knots
  };
  var IDS = [S + '-ms', S + '-kmh', S + '-mph', S + '-fts', S + '-knot'];
  var KEYS = ['ms', 'kmh', 'mph', 'fts', 'knot'];
  function fmt(n) {
    if (!isFinite(n)) return '';
    return String(Math.round(n * 10000) / 10000);
  }
  function sync(src) {
    try {
      TN.clearErr(S + '-error');
      var raw = TN.el(src).value;
      if (raw === '' || raw === null) {
        IDS.forEach(function (id) { if (id !== src) TN.el(id).value = ''; });
        return;
      }
      var v = parseFloat(raw);
      if (!isFinite(v)) { TN.setErr(S + '-error', 'Please enter a valid number.'); return; }
      var key = src.slice(S.length + 1);
      var ms = v * FACTORS[key];
      IDS.forEach(function (id, i) {
        if (id !== src) TN.el(id).value = fmt(ms / FACTORS[KEYS[i]]);
      });
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    IDS.forEach(function (id) {
      TN.on(id, 'input', function () { sync(id); });
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
