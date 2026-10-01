/* Dividend reinvestment calculator — DRIP vs cash payouts, annual compounding. */
(function () {
  'use strict';
  var SLUG = 'dividend-reinvestment-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var init = num(SLUG + '-initial'), y0 = num(SLUG + '-yield') / 100;
    var growth = num(SLUG + '-growth') / 100, yrs = Math.round(num(SLUG + '-years'));
    if (isNaN(init) || isNaN(y0) || isNaN(growth) || isNaN(yrs) || init <= 0 || y0 < 0 || growth < 0 || yrs <= 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid investment, yield, growth rate and years.');
      return;
    }
    /* DRIP path: dividends buy more shares, compounding */
    var y = y0, dripVal = init;
    for (var t = 0; t < yrs; t++) { dripVal += dripVal * y; y *= (1 + growth); }
    /* Cash path: share price flat, dividends paid out */
    y = y0; var cashReceived = 0;
    for (var u = 0; u < yrs; u++) { cashReceived += init * y; y *= (1 + growth); }
    var cashEnd = init + cashReceived;
    $(SLUG + '-drip').textContent = money(dripVal);
    $(SLUG + '-cash').textContent = money(cashEnd);
    $(SLUG + '-divs').textContent = money((dripVal - init) + cashReceived);
    $(SLUG + '-edge').textContent = money(dripVal - cashEnd);
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();