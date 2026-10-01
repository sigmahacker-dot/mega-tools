(function () {
  'use strict';
  var ERR = 'aspect-ratio-calculator-error';
  function gcd(a, b) { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function calc() {
    if (!TN.el('ar-w')) return;
    TN.clearErr(ERR);
    var w = parseFloat(TN.el('ar-w').value);
    var h = parseFloat(TN.el('ar-h').value);
    var rw = parseFloat(TN.el('ar-rw').value);
    var rh = parseFloat(TN.el('ar-rh').value);
    var side = TN.el('ar-side').value;
    var val = parseFloat(TN.el('ar-val').value);
    if (isNaN(w) && isNaN(h) && isNaN(rw) && isNaN(rh) && isNaN(val)) { TN.el('ar-ratio').textContent = '–'; TN.el('ar-missing').textContent = '–'; TN.el('ar-dec').textContent = '–'; return; }
    if (!isNaN(w) && !(w > 0)) { TN.setErr(ERR, 'Width must be greater than 0.'); return; }
    if (!isNaN(h) && !(h > 0)) { TN.setErr(ERR, 'Height must be greater than 0.'); return; }
    if (!isNaN(rw) && !(rw > 0)) { TN.setErr(ERR, 'Ratio width must be greater than 0.'); return; }
    if (!isNaN(rh) && !(rh > 0)) { TN.setErr(ERR, 'Ratio height must be greater than 0.'); return; }
    if (!isNaN(val) && !(val > 0)) { TN.setErr(ERR, 'Known side value must be greater than 0.'); return; }
    if (w > 0 && h > 0) {
      var g = gcd(w, h);
      TN.el('ar-ratio').textContent = (w / g) + ':' + (h / g);
      TN.el('ar-dec').textContent = (w / h).toFixed(4);
    } else { TN.el('ar-ratio').textContent = '–'; TN.el('ar-dec').textContent = '–'; }
    if (rw > 0 && rh > 0 && val > 0) {
      var missing = side === 'w' ? val * rh / rw : val * rw / rh;
      TN.el('ar-missing').textContent = (side === 'w' ? 'Height = ' : 'Width = ') + (Math.round(missing * 100) / 100);
    } else { TN.el('ar-missing').textContent = '–'; }
  }
  try {
    ['ar-w', 'ar-h', 'ar-rw', 'ar-rh', 'ar-val'].forEach(function (id) { TN.on(id, 'input', calc); });
    TN.on('ar-side', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();