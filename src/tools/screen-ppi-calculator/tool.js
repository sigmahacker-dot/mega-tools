(function () {
  'use strict';
  var ERR = 'screen-ppi-calculator-error';
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function calc() {
    if (!TN.el('ppi-diag')) return;
    TN.clearErr(ERR);
    var d = parseFloat(TN.el('ppi-diag').value);
    var w = parseInt(TN.el('ppi-w').value, 10);
    var h = parseInt(TN.el('ppi-h').value, 10);
    if (!(d > 0)) { TN.setErr(ERR, 'Enter a diagonal size greater than 0 inches.'); return; }
    if (!(w >= 1)) { TN.setErr(ERR, 'Enter a resolution width of at least 1 px.'); return; }
    if (!(h >= 1)) { TN.setErr(ERR, 'Enter a resolution height of at least 1 px.'); return; }
    var diagPx = Math.sqrt(w * w + h * h);
    var ppi = diagPx / d;
    var g = gcd(w, h);
    TN.el('ppi-value').textContent = ppi.toFixed(1) + ' PPI';
    TN.el('ppi-mp').textContent = (w * h / 1e6).toFixed(2) + ' MP';
    TN.el('ppi-ratio').textContent = (w / g) + ':' + (h / g);
  }
  try {
    TN.on('ppi-diag', 'input', calc);
    TN.on('ppi-w', 'input', calc);
    TN.on('ppi-h', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();