/* Rental yield calculator — gross and net yield. */
(function () {
  'use strict';
  var SLUG = 'rental-yield-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var price = num(SLUG + '-price'), rent = num(SLUG + '-rent'), exp = num(SLUG + '-expenses');
    if (isNaN(price) || isNaN(rent) || isNaN(exp) || price <= 0 || rent < 0 || exp < 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid purchase price, monthly rent and annual expenses.');
      return;
    }
    var annualRent = rent * 12, netIncome = annualRent - exp;
    $(SLUG + '-gross').textContent = (annualRent / price * 100).toFixed(2) + '%';
    $(SLUG + '-net').textContent = (netIncome / price * 100).toFixed(2) + '%';
    $(SLUG + '-income').textContent = money(netIncome);
    $(SLUG + '-monthly').textContent = money(netIncome / 12);
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();