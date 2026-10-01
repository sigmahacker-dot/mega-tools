/* Home equity calculator — equity $, equity %, max credit line at 80% CLTV. */
(function () {
  'use strict';
  var SLUG = 'home-equity-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var val = num(SLUG + '-value'), bal = num(SLUG + '-balance');
    if (isNaN(val) || isNaN(bal) || val <= 0 || bal < 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid home value and mortgage balance.');
      return;
    }
    var equity = val - bal;
    var line = Math.max(0, 0.8 * val - bal);
    $(SLUG + '-equity').textContent = money(equity);
    $(SLUG + '-pct').textContent = (equity / val * 100).toFixed(2) + '%';
    $(SLUG + '-line').textContent = money(line);
    $(SLUG + '-ltv').textContent = (bal / val * 100).toFixed(2) + '%';
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();