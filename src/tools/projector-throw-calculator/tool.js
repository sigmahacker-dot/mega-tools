(function () {
  'use strict';
  var S = 'projector-throw-calculator';
  function fmtDist(inches) {
    if (!isFinite(inches) || inches <= 0) return '–';
    var ft = inches / 12, m = inches * 0.0254;
    return (Math.round(ft * 10) / 10) + ' ft (' + (Math.round(m * 100) / 100) + ' m)';
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var size = parseFloat(TN.el(S + '-size').value);
      var trMin = parseFloat(TN.el(S + '-trmin').value);
      var trMaxRaw = TN.el(S + '-trmax').value;
      var trMax = trMaxRaw === '' || trMaxRaw === null ? NaN : parseFloat(trMaxRaw);
      var minEl = TN.el(S + '-mind'), maxEl = TN.el(S + '-maxd'), wEl = TN.el(S + '-width');
      if (TN.el(S + '-size').value === '' || TN.el(S + '-size').value === null) {
        if (minEl) minEl.textContent = '–';
        if (maxEl) maxEl.textContent = '–';
        if (wEl) wEl.textContent = '–';
        return;
      }
      if (!isFinite(size) || size <= 0) { TN.setErr(S + '-error', 'Enter a positive screen size.'); return; }
      if (!isFinite(trMin) || trMin <= 0) { TN.setErr(S + '-error', 'Enter a positive throw ratio.'); return; }
      var widthIn = TN.el(S + '-mode').value === 'diag' ? size * 16 / Math.sqrt(337) : size;
      if (wEl) wEl.textContent = (Math.round(widthIn * 10) / 10) + ' in (' + (Math.round(widthIn * 2.54 * 10) / 10) + ' cm)';
      var dMin = trMin * widthIn;
      if (minEl) minEl.textContent = fmtDist(dMin);
      var hasMax = isFinite(trMax) && trMax > 0;
      if (hasMax && trMax < trMin) { TN.setErr(S + '-error', 'Max throw ratio should be ≥ min.'); }
      if (maxEl) maxEl.textContent = hasMax ? fmtDist(trMax * widthIn) : '–';
      var note = TN.el(S + '-note');
      if (note) {
        note.textContent = hasMax
          ? 'Mount the lens between ' + fmtDist(dMin) + ' and ' + fmtDist(trMax * widthIn) + ' from the screen, then use the zoom to fill the screen exactly.'
          : 'With a fixed ' + trMin + ':1 lens, mount the lens ' + fmtDist(dMin) + ' from the screen.';
      }
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    ['size', 'trmin', 'trmax'].forEach(function (k) { TN.on(S + '-' + k, 'input', convert); });
    TN.on(S + '-mode', 'change', convert);
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
