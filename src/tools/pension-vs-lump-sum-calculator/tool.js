/* Pension vs lump sum calculator — lifetime totals and break-even age. */
(function () {
  'use strict';
  var SLUG = 'pension-vs-lump-sum-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var pen = num(SLUG + '-pension'), start = num(SLUG + '-startage'), life = num(SLUG + '-lifeexp');
    var lump = num(SLUG + '-lump'), ret = num(SLUG + '-return') / 100;
    if (isNaN(pen) || isNaN(start) || isNaN(life) || isNaN(lump) || isNaN(ret) || pen < 0 || start < 0 || lump < 0) {
      TN.setErr(SLUG + '-error', 'Enter valid pension, ages, lump sum and return.');
      return;
    }
    if (life <= start) {
      TN.setErr(SLUG + '-error', 'Life expectancy must be greater than the pension start age.');
      return;
    }
    var yrs = life - start;
    var penTotal = pen * 12 * yrs;
    var lumpFV = lump * Math.pow(1 + ret, yrs);
    /* break-even age: smallest t where lump*(1+r)^t >= pen*12*t (search in years) */
    var be = null;
    for (var t = 1; t <= 120; t++) {
      if (lump * Math.pow(1 + ret, t) >= pen * 12 * t) { be = start + t; break; }
    }
    $(SLUG + '-pentotal').textContent = money(penTotal);
    $(SLUG + '-lumpfv').textContent = money(lumpFV);
    $(SLUG + '-breakeven').textContent = be === null ? '—' : be.toFixed(1);
    $(SLUG + '-diff').textContent = money(Math.abs(lumpFV - penTotal));
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();