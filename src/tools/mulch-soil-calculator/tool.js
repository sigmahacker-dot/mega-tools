(function () {
  'use strict';
  var ERR = 'mulch-soil-calculator-error';
  function calc() {
    if (!TN.el('mulch-length')) return;
    TN.clearErr(ERR);
    var L = parseFloat(TN.el('mulch-length').value);
    var W = parseFloat(TN.el('mulch-width').value);
    var D = parseFloat(TN.el('mulch-depth').value);
    if (!(L > 0)) { TN.setErr(ERR, 'Enter a length greater than 0 ft.'); return; }
    if (!(W > 0)) { TN.setErr(ERR, 'Enter a width greater than 0 ft.'); return; }
    if (!(D > 0)) { TN.setErr(ERR, 'Enter a depth greater than 0 inches.'); return; }
    var ft3 = L * W * (D / 12);
    var yd3 = ft3 / 27;
    TN.el('mulch-yards').textContent = yd3.toFixed(2) + ' yd³';
    TN.el('mulch-bags').textContent = Math.ceil(ft3 / 2);
    TN.el('mulch-feet').textContent = ft3.toFixed(1) + ' ft³';
  }
  try {
    TN.on('mulch-length', 'input', calc);
    TN.on('mulch-width', 'input', calc);
    TN.on('mulch-depth', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();