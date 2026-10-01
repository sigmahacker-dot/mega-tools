(function () {
  'use strict';
  var S = 'dew-point-calculator';
  var B = 17.625, C = 243.04;
  function dewPoint(tc, rh) {
    var gamma = Math.log(rh / 100) + (B * tc) / (C + tc);
    return (C * gamma) / (B - gamma);
  }
  function comfort(dpC) {
    if (dpC < 10) return 'Dry air';
    if (dpC < 16) return 'Comfortable';
    if (dpC < 18) return 'Slightly humid';
    if (dpC < 21) return 'Muggy';
    return 'Oppressive';
  }
  function r1(n) { return Math.round(n * 10) / 10; }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var dpEl = TN.el(S + '-dp'), spEl = TN.el(S + '-spread'), coEl = TN.el(S + '-comfort');
      var noteEl = TN.el(S + '-note');
      var tRaw = TN.el(S + '-temp').value, rRaw = TN.el(S + '-rh').value;
      if ((tRaw === '' || tRaw === null) && (rRaw === '' || rRaw === null)) {
        [dpEl, spEl, coEl].forEach(function (el) { if (el) el.textContent = '–'; });
        return;
      }
      var t = parseFloat(tRaw), R = parseFloat(rRaw);
      if (!isFinite(t)) { TN.setErr(S + '-error', 'Enter a valid temperature.'); return; }
      if (!isFinite(R) || R <= 0 || R > 100) { TN.setErr(S + '-error', 'Enter humidity between 0 and 100%.'); return; }
      var tc = TN.el(S + '-tunit').value === 'F' ? (t - 32) * 5 / 9 : t;
      var dpC = dewPoint(tc, R);
      var dpF = dpC * 9 / 5 + 32;
      if (dpEl) dpEl.textContent = r1(dpC) + ' °C (' + r1(dpF) + ' °F)';
      var spread = tc - dpC;
      if (spEl) spEl.textContent = r1(spread) + ' °C';
      if (coEl) coEl.textContent = comfort(dpC);
      if (noteEl) {
        var extra = spread < 2.5 ? ' Spread under 2.5 °C — fog or dew likely.' : ' Larger spread means drier-feeling air.';
        noteEl.textContent = 'Magnus formula with Alduchov–Eskridge constants (b = 17.625, c = 243.04 °C).' + extra;
      }
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    ['temp', 'rh'].forEach(function (k) { TN.on(S + '-' + k, 'input', convert); });
    TN.on(S + '-tunit', 'change', convert);
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
