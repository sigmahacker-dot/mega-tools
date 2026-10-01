(function () {
  'use strict';
  var ERR = 'paint-calculator-error';
  function calc() {
    if (!TN.el('paint-area')) return;
    TN.clearErr(ERR);
    var area = parseFloat(TN.el('paint-area').value);
    var coats = parseInt(TN.el('paint-coats').value, 10);
    var cov = parseFloat(TN.el('paint-coverage').value);
    var primer = TN.el('paint-primer').value;
    if (!(area > 0)) { TN.setErr(ERR, 'Enter a paintable area greater than 0 sq ft.'); return; }
    if (!(cov > 0)) { TN.setErr(ERR, 'Enter coverage greater than 0 sq ft per gallon.'); return; }
    var exact = area * coats / cov;
    var buy = Math.ceil(exact - 1e-9);
    var primerGal = primer === 'yes' ? Math.ceil(area / cov - 1e-9) : 0;
    TN.el('paint-gallons').textContent = buy + ' gal';
    TN.el('paint-primerout').textContent = primerGal + ' gal';
    TN.el('paint-liters').textContent = (buy * 3.78541).toFixed(1) + ' L';
  }
  try {
    TN.on('paint-area', 'input', calc);
    TN.on('paint-coats', 'change', calc);
    TN.on('paint-coverage', 'input', calc);
    TN.on('paint-primer', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();