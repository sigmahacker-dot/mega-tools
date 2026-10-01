(function () {
  'use strict';
  var S = 'altitude-pressure-calculator';
  /* ISA troposphere barometric formula */
  var L = 0.0065, T0 = 288.15, EXP = 5.25588;
  function r1(n) { return Math.round(n * 10) / 10; }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var hEl = TN.el(S + '-hpa'), iEl = TN.el(S + '-inhg'), pEl = TN.el(S + '-pct');
      var p0 = parseFloat(TN.el(S + '-p0').value);
      var aRaw = TN.el(S + '-alt').value;
      if (aRaw === '' || aRaw === null) {
        if (hEl) hEl.textContent = '–';
        if (iEl) iEl.textContent = '–';
        if (pEl) pEl.textContent = '–';
        return;
      }
      var a = parseFloat(aRaw);
      if (!isFinite(p0) || p0 <= 0) { TN.setErr(S + '-error', 'Enter a positive sea-level pressure.'); return; }
      if (!isFinite(a)) { TN.setErr(S + '-error', 'Enter a valid altitude.'); return; }
      var h = TN.el(S + '-aunit').value === 'ft' ? a * 0.3048 : a;
      if (h < 0) { TN.setErr(S + '-error', 'Altitude cannot be negative.'); return; }
      if (h > 11000) { TN.setErr(S + '-error', 'The troposphere formula is only valid below 11,000 m.'); }
      var p = p0 * Math.pow(1 - L * h / T0, EXP);
      if (hEl) hEl.textContent = r1(p) + ' hPa';
      if (iEl) iEl.textContent = r1(p * 0.0295299830714) + ' inHg';
      if (pEl) pEl.textContent = r1(100 * p / p0) + '%';
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    ['p0', 'alt'].forEach(function (k) { TN.on(S + '-' + k, 'input', convert); });
    TN.on(S + '-aunit', 'change', convert);
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
