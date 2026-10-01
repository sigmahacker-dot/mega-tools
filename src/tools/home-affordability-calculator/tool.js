/* Home affordability calculator — 28/36 DTI rule → max loan → max price. */
(function () {
  'use strict';
  var SLUG = 'home-affordability-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var income = num(SLUG + '-income'), debts = num(SLUG + '-debts'), down = num(SLUG + '-down');
    var rate = num(SLUG + '-rate'), term = num(SLUG + '-term');
    if (isNaN(income) || isNaN(debts) || isNaN(down) || isNaN(rate) || isNaN(term) || income <= 0 || debts < 0 || down < 0 || rate < 0 || term <= 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid income, debts, down payment, rate and term.');
      return;
    }
    var grossMo = income / 12;
    var front = grossMo * 0.28;
    var back = grossMo * 0.36 - debts;
    var maxPmt = Math.min(front, back);
    var binding = front <= back ? '28% front-end' : '36% back-end';
    if (maxPmt <= 0) {
      TN.setErr(SLUG + '-error', 'Your monthly debts exceed the 36% back-end limit — no payment is affordable under these rules.');
      $(SLUG + '-price').textContent = '—'; $(SLUG + '-loan').textContent = '—';
      $(SLUG + '-pmt').textContent = '—'; $(SLUG + '-rule').textContent = '36% back-end';
      return;
    }
    var r = rate / 1200, n = Math.round(term * 12);
    var maxLoan = r > 0 ? maxPmt * (1 - Math.pow(1 + r, -n)) / r : maxPmt * n;
    var price = maxLoan + down;
    $(SLUG + '-price').textContent = money(price);
    $(SLUG + '-loan').textContent = money(maxLoan);
    $(SLUG + '-pmt').textContent = money(maxPmt);
    $(SLUG + '-rule').textContent = binding;
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();