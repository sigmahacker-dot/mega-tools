/* Cost of goods calculator — COGS, gross profit, gross margin. */
(function () {
  'use strict';
  var SLUG = 'cost-of-goods-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var beg = num(SLUG + '-begin'), pur = num(SLUG + '-purchases');
    var end = num(SLUG + '-end'), rev = num(SLUG + '-revenue');
    if (isNaN(beg) || isNaN(pur) || isNaN(end) || isNaN(rev) || beg < 0 || pur < 0 || end < 0 || rev < 0) {
      TN.setErr(SLUG + '-error', 'Enter valid inventory, purchase and revenue figures.');
      return;
    }
    var goods = beg + pur;
    var cogs = goods - end;
    var gross = rev - cogs;
    $(SLUG + '-cogs').textContent = money(cogs);
    $(SLUG + '-gross').textContent = money(gross);
    $(SLUG + '-margin').textContent = rev > 0 ? (gross / rev * 100).toFixed(2) + '%' : '—';
    $(SLUG + '-goods').textContent = money(goods);
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();