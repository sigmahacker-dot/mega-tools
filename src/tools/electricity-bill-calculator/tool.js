(function () {
  'use strict';
  var ERR = 'electricity-bill-calculator-error';
  function money(n) { try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return '$' + (Math.round(n * 100) / 100); } }
  function calc() {
    if (!TN.el('elec-kwh')) return;
    TN.clearErr(ERR);
    var kwh = parseFloat(TN.el('elec-kwh').value);
    var rate = parseFloat(TN.el('elec-rate').value);
    var fixed = parseFloat(TN.el('elec-fixed').value);
    var tax = parseFloat(TN.el('elec-tax').value);
    if (!(kwh >= 0)) { TN.setErr(ERR, 'Enter electricity usage of 0 or more kWh.'); return; }
    if (!(rate >= 0)) { TN.setErr(ERR, 'Enter a valid rate per kWh (0 or more).'); return; }
    if (isNaN(fixed) || fixed < 0) { TN.setErr(ERR, 'Enter a valid fixed charge (0 or more).'); return; }
    if (isNaN(tax) || tax < 0 || tax > 100) { TN.setErr(ERR, 'Enter a tax between 0 and 100%.'); return; }
    var energy = kwh * rate;
    var sub = energy + fixed;
    var taxAmt = sub * tax / 100;
    var total = sub + taxAmt;
    TN.el('elec-total').textContent = money(total);
    TN.el('elec-energy').textContent = money(energy);
    TN.el('elec-daily').textContent = money(total / 30);
    TN.el('elec-body').innerHTML =
      '<tr><td>Energy (' + kwh + ' kWh × $' + rate + ')</td><td>' + money(energy) + '</td></tr>' +
      '<tr><td>Fixed charge</td><td>' + money(fixed) + '</td></tr>' +
      '<tr><td>Tax (' + tax + '%)</td><td>' + money(taxAmt) + '</td></tr>' +
      '<tr><td><strong>Total</strong></td><td><strong>' + money(total) + '</strong></td></tr>';
  }
  try {
    TN.on('elec-kwh', 'input', calc);
    TN.on('elec-rate', 'input', calc);
    TN.on('elec-fixed', 'input', calc);
    TN.on('elec-tax', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();