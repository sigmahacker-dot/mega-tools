/* Mortgage points calculator — break-even and net savings from discount points. */
(function () {
  'use strict';
  var SLUG = 'mortgage-points-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pay(P, r, n) { if (r <= 0) return P / n; return P * r / (1 - Math.pow(1 + r, -n)); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var P = num(SLUG + '-amount'), base = num(SLUG + '-rate'), pts = num(SLUG + '-points');
    var red = num(SLUG + '-reduction'), stay = num(SLUG + '-stay');
    if (isNaN(P) || isNaN(base) || isNaN(pts) || isNaN(red) || isNaN(stay) || P <= 0 || base < 0 || pts < 0 || red < 0 || stay <= 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid loan amount, rate, points, reduction and stay.');
      return;
    }
    var newRate = base - pts * red;
    if (newRate < 0) {
      TN.setErr(SLUG + '-error', 'The rate reduction would push the new rate below 0%.');
      return;
    }
    var n = 360;
    var cost = P * pts / 100;
    var mBase = pay(P, base / 1200, n), mNew = pay(P, newRate / 1200, n);
    var save = mBase - mNew;
    var be = save > 0 ? cost / save : Infinity;
    var net = save * stay * 12 - cost;
    $(SLUG + '-cost').textContent = money(cost);
    $(SLUG + '-newrate').textContent = newRate.toFixed(3) + '%';
    $(SLUG + '-breakeven').textContent = isFinite(be) ? Math.ceil(be).toString() : 'Never';
    $(SLUG + '-net').textContent = money(net);
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();