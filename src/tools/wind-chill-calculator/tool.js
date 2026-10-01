(function () {
  'use strict';
  var S = 'wind-chill-calculator';
  function r1(n) { return Math.round(n * 10) / 10; }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var wcEl = TN.el(S + '-wc'), diffEl = TN.el(S + '-diff'), noteEl = TN.el(S + '-note');
      var tRaw = TN.el(S + '-temp').value, wRaw = TN.el(S + '-wind').value;
      if ((tRaw === '' || tRaw === null) && (wRaw === '' || wRaw === null)) {
        if (wcEl) wcEl.textContent = '–';
        if (diffEl) diffEl.textContent = '–';
        if (noteEl) noteEl.textContent = 'NWS formula. Valid only at or below 50°F (10°C) with wind ≥ 3 mph (4.8 km/h).';
        return;
      }
      var t = parseFloat(tRaw), w = parseFloat(wRaw);
      if (!isFinite(t)) { TN.setErr(S + '-error', 'Enter a valid temperature.'); return; }
      if (!isFinite(w) || w < 0) { TN.setErr(S + '-error', 'Enter a non-negative wind speed.'); return; }
      var T = TN.el(S + '-tunit').value === 'C' ? t * 9 / 5 + 32 : t;
      var V = TN.el(S + '-wunit').value === 'kmh' ? w / 1.609344 : w;
      if (T > 50) { TN.setErr(S + '-error', 'Wind chill is only defined at or below 50°F (10°C).'); }
      if (V < 3) { TN.setErr(S + '-error', 'Wind chill needs wind of at least 3 mph (4.8 km/h).'); }
      var v16 = Math.pow(V, 0.16);
      var wc = 35.74 + 0.6215 * T - 35.75 * v16 + 0.4275 * T * v16;
      var wcC = (wc - 32) * 5 / 9;
      if (wcEl) wcEl.textContent = Math.round(wc) + ' °F (' + Math.round(wcC) + ' °C)';
      var diff = T - wc;
      if (diffEl) diffEl.textContent = (diff > 0 ? r1(diff) + ' °F' : '≈ none') + ' ';
      var note = 'Formula: 35.74 + 0.6215T − 35.75V^0.16 + 0.4275TV^0.16 (T in °F, V in mph).';
      if (wc <= -18) note += ' DANGER: exposed skin can freeze in 30 minutes or less at this wind chill.';
      else if (wc <= 0) note += ' Bitter cold — cover all exposed skin.';
      if (noteEl) noteEl.textContent = note;
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    ['temp', 'wind'].forEach(function (k) { TN.on(S + '-' + k, 'input', convert); });
    ['tunit', 'wunit'].forEach(function (k) { TN.on(S + '-' + k, 'change', convert); });
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
