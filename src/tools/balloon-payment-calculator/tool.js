/* Balloon payment calculator — amortized payment, remaining balance at balloon date. */
(function () {
  'use strict';
  var SLUG = 'balloon-payment-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var P = num(SLUG + '-amount'), rate = num(SLUG + '-rate');
    var amortY = num(SLUG + '-amort'), dueY = num(SLUG + '-due');
    if (isNaN(P) || isNaN(rate) || isNaN(amortY) || isNaN(dueY) || P <= 0 || rate < 0 || amortY <= 0 || dueY <= 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid loan amount, rate, amortization period and balloon due date.');
      return;
    }
    if (dueY > amortY) {
      TN.setErr(SLUG + '-error', 'The balloon due date cannot be later than the amortization period.');
      return;
    }
    var r = rate / 1200, n = Math.round(amortY * 12), k = Math.round(dueY * 12);
    var m = r > 0 ? P * r / (1 - Math.pow(1 + r, -n)) : P / n;
    var grow = Math.pow(1 + r, k);
    var bal = P * grow - m * (grow - 1) / (r > 0 ? r : 1);
    if (r <= 0) bal = P - m * k;
    var paid = m * k;
    $(SLUG + '-pmt').textContent = money(m);
    $(SLUG + '-balloon').textContent = money(Math.max(0, bal));
    $(SLUG + '-paid').textContent = money(paid);
    $(SLUG + '-interest').textContent = money(paid - (P - Math.max(0, bal)));
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();