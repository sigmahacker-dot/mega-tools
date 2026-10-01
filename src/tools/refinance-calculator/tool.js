/* Refinance calculator — amortized payment comparison + break-even on closing costs. */
(function () {
  'use strict';
  var SLUG = 'refinance-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pay(P, r, n) { if (r <= 0) return P / n; return P * r / (1 - Math.pow(1 + r, -n)); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var bal = num(SLUG + '-balance'), r1 = num(SLUG + '-rate'), y1 = num(SLUG + '-left');
    var r2 = num(SLUG + '-newrate'), y2 = num(SLUG + '-newterm'), costs = num(SLUG + '-costs');
    if (isNaN(bal) || isNaN(r1) || isNaN(y1) || isNaN(r2) || isNaN(y2) || isNaN(costs) || bal <= 0 || y1 <= 0 || y2 <= 0 || r1 < 0 || r2 < 0 || costs < 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid balance, rates, terms and closing costs.');
      return;
    }
    var n1 = Math.round(y1 * 12), n2 = Math.round(y2 * 12);
    var m1 = pay(bal, r1 / 1200, n1), m2 = pay(bal, r2 / 1200, n2);
    var int1 = m1 * n1 - bal, int2 = m2 * n2 - bal;
    var save = m1 - m2;
    var be = save > 0 ? costs / save : Infinity;
    $('refinance-calculator-cur').textContent = money(m1);
    $('refinance-calculator-new').textContent = money(m2);
    $('refinance-calculator-save').textContent = money(save);
    $('refinance-calculator-breakeven').textContent = isFinite(be) ? (be < 0.1 ? '< 1' : Math.ceil(be).toString()) : 'Never';
    $('refinance-calculator-table').innerHTML =
      '<tr><th></th><th>Current loan</th><th>Refinanced loan</th></tr>' +
      '<tr><td>Monthly payment</td><td>' + money(m1) + '</td><td>' + money(m2) + '</td></tr>' +
      '<tr><td>Total interest</td><td>' + money(int1) + '</td><td>' + money(int2) + '</td></tr>' +
      '<tr><td>Total of payments</td><td>' + money(m1 * n1) + '</td><td>' + money(m2 * n2) + '</td></tr>' +
      '<tr><td>Total interest saved (minus closing costs)</td><td colspan="2">' + money(int1 - int2 - costs) + '</td></tr>';
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();