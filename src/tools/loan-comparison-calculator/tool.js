/* Loan comparison calculator — 3 loans side by side, cheapest highlighted. */
(function () {
  'use strict';
  var SLUG = 'loan-comparison-calculator';
  var NAMES = ['A', 'B', 'C'];
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var rows = [];
    for (var i = 0; i < 3; i++) {
      var P = num(SLUG + '-amount' + i), rate = num(SLUG + '-rate' + i), yrs = num(SLUG + '-term' + i);
      if (isNaN(P) || isNaN(rate) || isNaN(yrs) || P <= 0 || rate < 0 || yrs <= 0) {
        TN.setErr(SLUG + '-error', 'Enter a valid amount, rate and term for Loan ' + NAMES[i] + '.');
        $(SLUG + '-table').innerHTML = '';
        $(SLUG + '-verdict').textContent = '';
        return;
      }
      var r = rate / 1200, n = Math.round(yrs * 12);
      var pmt = r > 0 ? P * r / (1 - Math.pow(1 + r, -n)) : P / n;
      rows.push({ pmt: pmt, interest: pmt * n - P, total: pmt * n });
    }
    var best = 0;
    for (var j = 1; j < 3; j++) { if (rows[j].total < rows[best].total) best = j; }
    function cell(i, val, isBest) { return '<td' + (i === best && isBest ? ' style="background:#e8f5e9;font-weight:bold"' : '') + '>' + val + '</td>'; }
    var h = '<tr><th></th><th>Loan A</th><th>Loan B</th><th>Loan C</th></tr>';
    h += '<tr><td>Monthly payment</td>' + cell(0, money(rows[0].pmt)) + cell(1, money(rows[1].pmt)) + cell(2, money(rows[2].pmt)) + '</tr>';
    h += '<tr><td>Total interest</td>' + cell(0, money(rows[0].interest)) + cell(1, money(rows[1].interest)) + cell(2, money(rows[2].interest)) + '</tr>';
    h += '<tr><td>Total cost</td>' + cell(0, money(rows[0].total), true) + cell(1, money(rows[1].total), true) + cell(2, money(rows[2].total), true) + '</tr>';
    $(SLUG + '-table').innerHTML = h;
    $(SLUG + '-verdict').textContent = 'Cheapest overall: Loan ' + NAMES[best] + ' at ' + money(rows[best].total) + ' total cost.';
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();