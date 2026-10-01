/* Freelance tax estimator — taxable income, estimated tax, quarterly payments. */
(function () {
  'use strict';
  var SLUG = 'freelance-tax-estimator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var income = num(SLUG + '-income'), exp = num(SLUG + '-expenses'), rate = num(SLUG + '-rate');
    if (isNaN(income) || isNaN(exp) || isNaN(rate) || income < 0 || exp < 0 || rate < 0 || rate > 100) {
      TN.setErr(SLUG + '-error', 'Enter a valid income, expenses and a tax rate between 0 and 100.');
      return;
    }
    var taxable = Math.max(0, income - exp);
    var tax = taxable * rate / 100;
    $(SLUG + '-taxable').textContent = money(taxable);
    $(SLUG + '-tax').textContent = money(tax);
    $(SLUG + '-quarterly').textContent = money(tax / 4);
    $(SLUG + '-monthly').textContent = money(tax / 12);
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();