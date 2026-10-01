/* Cash-on-cash return calculator — cash flow ÷ cash invested. */
(function () {
  'use strict';
  var SLUG = 'cash-on-cash-return-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var down = num(SLUG + '-down'), closing = num(SLUG + '-closing'), cf = num(SLUG + '-cashflow');
    if (isNaN(down) || isNaN(closing) || isNaN(cf) || down < 0 || closing < 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid down payment, closing costs and cash flow.');
      return;
    }
    var invested = down + closing;
    if (invested <= 0) {
      TN.setErr(SLUG + '-error', 'Cash invested must be greater than zero.');
      return;
    }
    $(SLUG + '-coc').textContent = (cf / invested * 100).toFixed(2) + '%';
    $(SLUG + '-invested').textContent = money(invested);
    $(SLUG + '-monthly').textContent = money(cf / 12);
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();