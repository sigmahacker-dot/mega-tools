(function () {
  'use strict';
  var S = 'tv-viewing-distance-calculator';
  var SQRT337 = Math.sqrt(337);
  function fmtDist(inches) {
    if (!isFinite(inches) || inches <= 0) return '–';
    var ft = inches / 12;
    var m = inches * 0.0254;
    return (Math.round(ft * 10) / 10) + ' ft (' + (Math.round(m * 100) / 100) + ' m)';
  }
  /* seating distance for a 16:9 screen width given horizontal viewing angle */
  function distForAngle(widthIn, deg) {
    return (widthIn / 2) / Math.tan((deg * Math.PI / 180) / 2);
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var raw = TN.el(S + '-diag').value;
      var idealEl = TN.el(S + '-ideal'), closeEl = TN.el(S + '-close'), farEl = TN.el(S + '-far');
      var tb = TN.el(S + '-table');
      if (raw === '' || raw === null) {
        [idealEl, closeEl, farEl].forEach(function (el) { if (el) el.textContent = '–'; });
        if (tb) tb.innerHTML = '';
        return;
      }
      var d = parseFloat(raw);
      if (!isFinite(d) || d <= 0) { TN.setErr(S + '-error', 'Enter a positive screen diagonal.'); return; }
      var diagIn = TN.el(S + '-units').value === 'cm' ? d / 2.54 : d;
      var wIn = diagIn * 16 / SQRT337;   /* 16:9 width */
      var hIn = diagIn * 9 / SQRT337;    /* 16:9 height */
      var ideal = distForAngle(wIn, 36);   /* THX */
      var close = distForAngle(wIn, 40);   /* immersive limit */
      var far = distForAngle(wIn, 30);     /* SMPTE */
      if (idealEl) idealEl.textContent = fmtDist(ideal);
      if (closeEl) closeEl.textContent = fmtDist(close);
      if (farEl) farEl.textContent = fmtDist(far);
      if (tb) {
        tb.innerHTML =
          '<tr><td>Screen width</td><td>' + (Math.round(wIn * 10) / 10) + ' in (' + (Math.round(wIn * 2.54 * 10) / 10) + ' cm)</td></tr>' +
          '<tr><td>Screen height</td><td>' + (Math.round(hIn * 10) / 10) + ' in (' + (Math.round(hIn * 2.54 * 10) / 10) + ' cm)</td></tr>' +
          '<tr><td>4K full-detail range (≤ 1.5× diagonal)</td><td>' + fmtDist(diagIn * 1.5) + ' or closer</td></tr>';
      }
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    ['diag', 'units'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', convert);
      TN.on(S + '-' + k, 'change', convert);
    });
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
