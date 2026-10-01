(function () {
  'use strict';
  var ERR = 'protein-intake-calculator-error';
  function calc() {
    if (!TN.el('protein-weight')) return;
    TN.clearErr(ERR);
    var w = parseFloat(TN.el('protein-weight').value);
    var unit = TN.el('protein-unit').value;
    var g = parseFloat(TN.el('protein-goal').value);
    if (!(w > 0)) { TN.setErr(ERR, 'Enter a body weight greater than 0.'); return; }
    if (w > 1500) { TN.setErr(ERR, 'That weight looks unrealistic — check your entry.'); return; }
    var kg = unit === 'lb' ? w / 2.20462 : w;
    var daily = kg * g;
    TN.el('protein-daily').textContent = Math.round(daily) + ' g';
    TN.el('protein-meal3').textContent = Math.round(daily / 3) + ' g';
    TN.el('protein-meal4').textContent = Math.round(daily / 4) + ' g';
  }
  try {
    TN.on('protein-weight', 'input', calc);
    TN.on('protein-unit', 'change', calc);
    TN.on('protein-goal', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();