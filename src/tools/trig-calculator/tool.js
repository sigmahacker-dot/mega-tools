/* Trig calculator: six functions + inverses. */
(function () {
  'use strict';
  var SLUG = 'trig-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function fmt(v) {
    if (!isFinite(v)) return 'undefined';
    var r = Math.abs(v) < 1e-12 ? 0 : v;
    return r.toFixed(6);
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var a = parseFloat($(SLUG + '-ang').value);
    if (isNaN(a)) { err('Enter an angle.'); return; }
    var rad = $(SLUG + '-unit').value === 'deg' ? a * Math.PI / 180 : a;
    var s = Math.sin(rad), c = Math.cos(rad), t = Math.tan(rad);
    var rows = [
      ['sin', s], ['cos', c], ['tan', t],
      ['csc (1/sin)', Math.abs(s) < 1e-12 ? NaN : 1 / s],
      ['sec (1/cos)', Math.abs(c) < 1e-12 ? NaN : 1 / c],
      ['cot (1/tan)', Math.abs(t) < 1e-12 ? NaN : 1 / t]
    ];
    var html = '<table style="width:100%;border-collapse:collapse"><tbody>';
    rows.forEach(function (r) {
      html += '<tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">' + TN.esc(r[0]) + '</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right;font-family:monospace">' + TN.esc(fmt(r[1])) + '</td></tr>';
    });
    html += '</tbody></table>';
    var note = '<p class="hint">Angle used: ' + TN.esc(String(a)) + ($(SLUG + '-unit').value === 'deg' ? '\u00B0 = ' + rad.toFixed(6) + ' rad' : ' rad = ' + (a * 180 / Math.PI).toFixed(4) + '\u00B0') + '</p>';
    $(SLUG + '-table').innerHTML = html + note;
  }
  function calcInv() {
    TN.clearErr(SLUG + '-error');
    var v = parseFloat($(SLUG + '-val').value);
    var fn = $(SLUG + '-ifn').value;
    if (isNaN(v)) { err('Enter a value for the inverse function.'); return; }
    if ((fn === 'asin' || fn === 'acos') && (v < -1 || v > 1)) { err('arcsin/arccos need a value between \u22121 and 1.'); return; }
    var r = fn === 'asin' ? Math.asin(v) : fn === 'acos' ? Math.acos(v) : Math.atan(v);
    var deg = r * 180 / Math.PI;
    $(SLUG + '-invout').textContent = fn + '(' + v + ') = ' + r.toFixed(6) + ' rad = ' + deg.toFixed(4) + '\u00B0\n(principal value)';
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-goinv', 'click', calcInv);
    TN.on(SLUG + '-ang', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-unit', 'change', calc);
    calc();
  } catch (e) {}
})();