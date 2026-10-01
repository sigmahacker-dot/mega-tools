/* Car lease vs buy calculator — total out-of-pocket over the same horizon. */
(function () {
  'use strict';
  var SLUG = 'car-lease-vs-buy-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var ldown = num(SLUG + '-ldown'), lmo = num(SLUG + '-lmonthly'), lmo_n = Math.round(num(SLUG + '-lmonths')), ldisp = num(SLUG + '-ldisp');
    var bprice = num(SLUG + '-bprice'), bdown = num(SLUG + '-bdown'), brate = num(SLUG + '-brate');
    var bterm = Math.round(num(SLUG + '-bterm')), bresale = num(SLUG + '-bresale');
    var bad = [ldown, lmo, lmo_n, ldisp, bprice, bdown, brate, bterm, bresale].some(function (v) { return isNaN(v); }) ||
      ldown < 0 || lmo < 0 || lmo_n <= 0 || ldisp < 0 || bprice <= 0 || bdown < 0 || brate < 0 || bterm <= 0 || bresale < 0;
    if (bad || bdown >= bprice) {
      TN.setErr(SLUG + '-error', 'Enter valid lease and buy figures (buy down payment must be below price).');
      return;
    }
    var leaseTotal = ldown + lmo * lmo_n + ldisp;
    var fin = bprice - bdown, r = brate / 1200;
    var pmt = r > 0 ? fin * r / (1 - Math.pow(1 + r, -bterm)) : fin / bterm;
    var buyTotal = bdown + pmt * bterm - bresale;
    var diff = leaseTotal - buyTotal;
    $(SLUG + '-lease').textContent = money(leaseTotal);
    $(SLUG + '-buy').textContent = money(buyTotal);
    $(SLUG + '-diff').textContent = money(Math.abs(diff));
    var v = $(SLUG + '-verdict');
    if (diff < 0) v.textContent = 'Verdict: Leasing costs ' + money(-diff) + ' LESS out of pocket than buying over this term.';
    else if (diff > 0) v.textContent = 'Verdict: Buying costs ' + money(diff) + ' LESS out of pocket than leasing over this term.';
    else v.textContent = 'Verdict: Dead even — both options cost the same out of pocket.';
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();