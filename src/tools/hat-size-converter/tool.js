(function () {
  'use strict';
  var S = 'hat-size-converter';
  var FRAC = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'];
  function fracStr(eighths) {
    var w = Math.floor(eighths / 8), r = eighths % 8;
    var s = String(w);
    if (r) s += ' ' + FRAC[r];
    return s;
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var usEl = TN.el(S + '-us'), euEl = TN.el(S + '-eu'), jpEl = TN.el(S + '-jp');
      var raw = TN.el(S + '-circ').value;
      if (raw === '' || raw === null) {
        if (usEl) usEl.textContent = '–';
        if (euEl) euEl.textContent = '–';
        if (jpEl) jpEl.textContent = '–';
        return;
      }
      var v = parseFloat(raw);
      if (!isFinite(v) || v <= 0) { TN.setErr(S + '-error', 'Enter a positive head circumference.'); return; }
      var cm = TN.el(S + '-units').value === 'in' ? v * 2.54 : v;
      var inches = cm / 2.54;
      if (cm < 40 || cm > 75) { TN.setErr(S + '-error', 'That seems outside the normal head range (40–75 cm) — check your value.'); }
      /* US/UK size = circumference in inches ÷ π, snapped to nearest 1/8 */
      var eighths = Math.round((inches / Math.PI) * 8);
      if (usEl) usEl.textContent = fracStr(eighths);
      if (euEl) euEl.textContent = String(Math.round(cm));
      if (jpEl) jpEl.textContent = String(Math.round(cm));
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    var tb = TN.el(S + '-table');
    if (tb) {
      /* standard fitted-hat table: US size, inches, cm */
      var sizes = [
        ['6 ¾', 21.25, 54], ['6 ⅞', 21.625, 55], ['7', 22, 56], ['7 ⅛', 22.375, 57],
        ['7 ¼', 22.75, 58], ['7 ⅜', 23.125, 59], ['7 ½', 23.5, 60], ['7 ⅝', 23.875, 61],
        ['7 ¾', 24.25, 62], ['7 ⅞', 24.625, 63]
      ];
      var html = '';
      for (var i = 0; i < sizes.length; i++) {
        html += '<tr><td>' + sizes[i][0] + '</td><td>' + sizes[i][1] + '</td><td>' + sizes[i][2] + '</td></tr>';
      }
      tb.innerHTML = html;
    }
    ['circ', 'units'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', convert);
      TN.on(S + '-' + k, 'change', convert);
    });
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
