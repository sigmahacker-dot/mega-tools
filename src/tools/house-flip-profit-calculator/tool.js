/* House flip profit calculator — profit and ROI from all-in costs vs sale price. */
(function () {
  'use strict';
  var SLUG = 'house-flip-profit-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var pur = num(SLUG + '-purchase'), rehab = num(SLUG + '-rehab'), hold = num(SLUG + '-holding');
    var sale = num(SLUG + '-sale'), spct = num(SLUG + '-sellpct');
    if (isNaN(pur) || isNaN(rehab) || isNaN(hold) || isNaN(sale) || isNaN(spct) || pur < 0 || rehab < 0 || hold < 0 || sale < 0 || spct < 0 || spct > 100) {
      TN.setErr(SLUG + '-error', 'Enter valid prices, costs and a selling-cost percentage (0–100).');
      return;
    }
    var sellCost = sale * spct / 100;
    var totalIn = pur + rehab + hold + sellCost;
    var profit = sale - totalIn;
    $(SLUG + '-profit').textContent = money(profit);
    $(SLUG + '-roi').textContent = totalIn > 0 ? (profit / totalIn * 100).toFixed(2) + '%' : '—';
    $(SLUG + '-totalcost').textContent = money(totalIn);
    $(SLUG + '-sellcost').textContent = money(sellCost);
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();