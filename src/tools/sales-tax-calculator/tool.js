(function () {
  'use strict';
  var ERR = 'sales-tax-calculator-error';
  function money(n) { try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return '$' + (Math.round(n * 100) / 100); } }
  function calc() {
    if (!TN.el('salestax-amount')) return;
    TN.clearErr(ERR);
    var mode = TN.el('salestax-mode').value;
    var amt = parseFloat(TN.el('salestax-amount').value);
    var rate = parseFloat(TN.el('salestax-rate').value);
    if (!(amt >= 0)) { TN.setErr(ERR, 'Enter a valid amount (0 or more).'); return; }
    if (isNaN(rate) || rate < 0 || rate > 100) { TN.setErr(ERR, 'Enter a tax rate between 0 and 100%.'); return; }
    var tax, base, total;
    if (mode === 'add') {
      base = amt; tax = amt * rate / 100; total = amt + tax;
      TN.el('salestax-main-label').textContent = 'Total with tax';
      TN.el('salestax-base-label').textContent = 'Price before tax';
    } else {
      total = amt; base = amt / (1 + rate / 100); tax = amt - base;
      TN.el('salestax-main-label').textContent = 'Total (tax included)';
      TN.el('salestax-base-label').textContent = 'Price before tax';
    }
    TN.el('salestax-tax').textContent = money(tax);
    TN.el('salestax-main').textContent = money(total);
    TN.el('salestax-base').textContent = money(base);
  }
  try {
    TN.on('salestax-mode', 'change', calc);
    TN.on('salestax-amount', 'input', calc);
    TN.on('salestax-rate', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();