/* APR calculator — true APR via bisection on the present-value equation. */
(function () {
  'use strict';
  var SLUG = 'apr-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pv(r, pmt, n) { if (r <= 0) return pmt * n; return pmt * (1 - Math.pow(1 + r, -n)) / r; }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var A = num(SLUG + '-amount'), F = num(SLUG + '-fees');
    var nom = num(SLUG + '-rate'), n = Math.round(num(SLUG + '-term'));
    if (isNaN(A) || isNaN(F) || isNaN(nom) || isNaN(n) || A <= 0 || F < 0 || nom < 0 || n <= 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid loan amount, fees, nominal rate and term.');
      return;
    }
    if (F >= A) {
      TN.setErr(SLUG + '-error', 'Upfront fees must be less than the loan amount.');
      return;
    }
    var rn = nom / 1200;
    var pmt = rn > 0 ? A * rn / (1 - Math.pow(1 + rn, -n)) : A / n;
    var target = A - F; /* net cash received by borrower */
    /* f(r) = PV_r(payments) - target ; f decreases in r, root > rn when F > 0 */
    var lo = rn, hi = rn + 0.25 / 12; /* widen until sign change */
    var glo = pv(lo, pmt, n) - target, ghi = pv(hi, pmt, n) - target, guard = 0;
    while (glo * ghi > 0 && guard < 60) { hi = hi + 0.25 / 12; ghi = pv(hi, pmt, n) - target; guard++; }
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2, fm = pv(mid, pmt, n) - target;
      if (Math.abs(fm) < 1e-9) { lo = hi = mid; break; }
      if (glo * fm <= 0) { hi = mid; ghi = fm; } else { lo = mid; glo = fm; }
    }
    var apr = ((lo + hi) / 2) * 12 * 100;
    $(SLUG + '-apr').textContent = apr.toFixed(3) + '%';
    $(SLUG + '-nominal').textContent = nom.toFixed(3) + '%';
    $(SLUG + '-pmt').textContent = money(pmt);
    $(SLUG + '-extra').textContent = '+' + (apr - nom).toFixed(3) + ' pts';
    $(SLUG + '-note').textContent = 'True APR is the rate at which the present value of your ' + n +
      ' payments equals the ' + money(target) + ' you actually receive. Solved by bisection to 9 decimal places.';
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();