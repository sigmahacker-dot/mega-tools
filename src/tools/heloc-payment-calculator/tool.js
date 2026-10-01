/* HELOC payment calculator — interest-only draw phase, amortized repayment phase. */
(function () {
  'use strict';
  var SLUG = 'heloc-payment-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var line = num(SLUG + '-line'), drawn = num(SLUG + '-drawn'), rate = num(SLUG + '-rate');
    var drawY = num(SLUG + '-drawyrs'), repayY = num(SLUG + '-repayyrs');
    if (isNaN(line) || isNaN(drawn) || isNaN(rate) || isNaN(drawY) || isNaN(repayY) || line <= 0 || drawn < 0 || rate < 0 || drawY <= 0 || repayY <= 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid credit line, drawn amount, rate and period lengths.');
      return;
    }
    if (drawn > line) {
      TN.setErr(SLUG + '-error', 'Drawn amount cannot exceed the credit line limit.');
      return;
    }
    var r = rate / 1200;
    var drawPmt = drawn * r;
    var drawInt = drawPmt * Math.round(drawY * 12);
    var n = Math.round(repayY * 12);
    var repayPmt = r > 0 ? drawn * r / (1 - Math.pow(1 + r, -n)) : drawn / n;
    var repayInt = repayPmt * n - drawn;
    $(SLUG + '-drawpmt').textContent = money(drawPmt);
    $(SLUG + '-repaypmt').textContent = money(repayPmt);
    $(SLUG + '-drawtot').textContent = money(drawInt);
    $(SLUG + '-repaytot').textContent = money(repayInt);
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();