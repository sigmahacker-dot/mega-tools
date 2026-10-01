(function () {
  'use strict';
  var S = 'photo-print-size-calculator';
  function r1(n) { return Math.round(n * 10) / 10; }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var inEl = TN.el(S + '-inches'), cmEl = TN.el(S + '-cm'), qEl = TN.el(S + '-quality');
      var noteEl = TN.el(S + '-note');
      var pw = parseFloat(TN.el(S + '-pw').value);
      var ph = parseFloat(TN.el(S + '-ph').value);
      var dpi = parseFloat(TN.el(S + '-dpi').value);
      var any = TN.el(S + '-pw').value !== '' || TN.el(S + '-ph').value !== '' || TN.el(S + '-dpi').value !== '';
      if (!any) {
        if (inEl) inEl.textContent = '–';
        if (cmEl) cmEl.textContent = '–';
        if (qEl) qEl.textContent = '–';
        if (noteEl) noteEl.textContent = 'Enter pixel dimensions and DPI to see the print size.';
        return;
      }
      if (!isFinite(pw) || pw <= 0 || !isFinite(ph) || ph <= 0) {
        TN.setErr(S + '-error', 'Enter positive pixel width and height.');
        return;
      }
      if (!isFinite(dpi) || dpi <= 0) { TN.setErr(S + '-error', 'Enter a positive DPI.'); return; }
      var wIn = pw / dpi, hIn = ph / dpi;
      if (inEl) inEl.textContent = r1(wIn) + ' × ' + r1(hIn) + ' in';
      if (cmEl) cmEl.textContent = r1(wIn * 2.54) + ' × ' + r1(hIn * 2.54) + ' cm';
      var q, note;
      if (dpi >= 300) { q = 'Excellent'; note = dpi + ' DPI is print-shop quality — sharp at close range.'; }
      else if (dpi >= 200) { q = 'Very good'; note = dpi + ' DPI will look sharp in normal viewing.'; }
      else if (dpi >= 150) { q = 'Good'; note = dpi + ' DPI is the practical minimum for close viewing; fine for most prints.'; }
      else if (dpi >= 100) { q = 'Acceptable'; note = 'Warning: ' + dpi + ' DPI is below the 150 DPI minimum for close viewing — OK for posters viewed at a distance, but soft up close.'; }
      else { q = 'Poor'; note = 'Warning: ' + dpi + ' DPI is far below the 150 DPI minimum — expect visible pixels and softness. Use a higher-resolution image or print smaller.'; }
      if (qEl) qEl.textContent = q;
      if (noteEl) noteEl.textContent = note;
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    ['pw', 'ph', 'dpi'].forEach(function (k) { TN.on(S + '-' + k, 'input', convert); });
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
