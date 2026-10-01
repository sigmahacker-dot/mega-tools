(function () {
  'use strict';
  var S = 'heat-index-calculator';
  function rothfusz(T, R) {
    var hi = -42.379 + 2.04901523 * T + 10.14333127 * R - 0.22475541 * T * R
      - 0.00683783 * T * T - 0.05481717 * R * R + 0.00122874 * T * T * R
      + 0.00085282 * T * R * R - 0.00000199 * T * T * R * R;
    if (hi < 80) {
      var simple = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (R * 0.094));
      if ((simple + T) / 2 < 80) hi = simple;
    } else {
      if (R <= 13 && T >= 80 && T <= 112) {
        hi -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      } else if (R > 85 && T >= 80 && T <= 87) {
        hi += ((R - 85) / 10) * ((87 - T) / 5);
      }
    }
    return hi;
  }
  function band(hi) {
    if (hi < 80) return 'No caution';
    if (hi <= 90) return 'Caution';
    if (hi <= 103) return 'Extreme caution';
    if (hi <= 124) return 'Danger';
    return 'Extreme danger';
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var hiEl = TN.el(S + '-hi'), bEl = TN.el(S + '-band'), noteEl = TN.el(S + '-note');
      var tRaw = TN.el(S + '-temp').value, rRaw = TN.el(S + '-rh').value;
      if ((tRaw === '' || tRaw === null) && (rRaw === '' || rRaw === null)) {
        if (hiEl) hiEl.textContent = '–';
        if (bEl) bEl.textContent = '–';
        return;
      }
      var t = parseFloat(tRaw), R = parseFloat(rRaw);
      if (!isFinite(t)) { TN.setErr(S + '-error', 'Enter a valid temperature.'); return; }
      if (!isFinite(R) || R < 0 || R > 100) { TN.setErr(S + '-error', 'Enter humidity between 0 and 100%.'); return; }
      var T = TN.el(S + '-tunit').value === 'C' ? t * 9 / 5 + 32 : t;
      if (T < 80 || R < 40) {
        if (noteEl) noteEl.textContent = 'Note: the heat index is designed for temperatures ≥ 80°F (27°C) and humidity ≥ 40% — outside that range it is close to the actual temperature.';
      }
      var hi = rothfusz(T, R);
      var hiC = (hi - 32) * 5 / 9;
      if (hiEl) hiEl.textContent = Math.round(hi) + ' °F (' + Math.round(hiC) + ' °C)';
      if (bEl) bEl.textContent = band(hi);
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    ['temp', 'rh'].forEach(function (k) { TN.on(S + '-' + k, 'input', convert); });
    TN.on(S + '-tunit', 'change', convert);
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
