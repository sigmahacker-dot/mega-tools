/* Capital gains calculator — gain, tax owed, net proceeds. Educational only. */
(function () {
  'use strict';
  var SLUG = 'capital-gains-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var buy = num(SLUG + '-buy'), sell = num(SLUG + '-sell'), qty = num(SLUG + '-qty');
    var t = num(SLUG + '-taxrate');
    if (isNaN(buy) || isNaN(sell) || isNaN(qty) || isNaN(t) || buy < 0 || sell < 0 || qty < 0 || t < 0 || t > 100) {
      TN.setErr(SLUG + '-error', 'Enter valid prices, quantity and a tax rate between 0 and 100.');
      return;
    }
    var gain = (sell - buy) * qty;
    var tax = gain > 0 ? gain * t / 100 : 0;
    var proceeds = sell * qty - tax;
    var cost = buy * qty;
    $(SLUG + '-gain').textContent = money(gain);
    $(SLUG + '-tax').textContent = money(tax);
    $(SLUG + '-net').textContent = money(proceeds);
    $(SLUG + '-gainpct').textContent = cost > 0 ? (gain / cost * 100).toFixed(2) + '%' : '—';
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"], select[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) {
      els[i].addEventListener('input', calc);
      els[i].addEventListener('change', calc);
    }
    calc();
  } catch (e) { /* never throw on load */ }
})();