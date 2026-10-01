/* Retirement withdrawal calculator — year-by-year simulation until depletion. */
(function () {
  'use strict';
  var SLUG = 'retirement-withdrawal-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var bal = num(SLUG + '-balance'), wd = num(SLUG + '-withdraw');
    var ret = num(SLUG + '-return') / 100, inf = num(SLUG + '-inflation') / 100;
    if (isNaN(bal) || isNaN(wd) || isNaN(ret) || isNaN(inf) || bal <= 0 || wd < 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid starting balance and withdrawal amount.');
      return;
    }
    var b = bal, w = wd, total = 0, years = 0;
    var rows = '<tr><th>Year</th><th>Start balance</th><th>Withdrawal</th><th>End balance</th></tr>';
    while (b > 0 && years < 60) {
      years++;
      var grown = b * (1 + ret);
      var take = Math.min(w, grown);
      var end = grown - take;
      total += take;
      rows += '<tr><td>' + years + '</td><td>' + money(b) + '</td><td>' + money(take) + '</td><td>' + money(end) + '</td></tr>';
      b = end; w *= (1 + inf);
    }
    $(SLUG + '-table').innerHTML = rows;
    $(SLUG + '-years').textContent = years + (b > 0 ? '+' : '');
    $(SLUG + '-total').textContent = money(total);
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();