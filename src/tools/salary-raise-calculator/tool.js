/* Salary raise calculator — new salary, monthly/annual increase. */
(function () {
  'use strict';
  var SLUG = 'salary-raise-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var sal = num(SLUG + '-salary'), r = num(SLUG + '-raise');
    if (isNaN(sal) || isNaN(r) || sal < 0 || r < 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid current salary and raise percentage.');
      return;
    }
    var inc = sal * r / 100, nw = sal + inc;
    $(SLUG + '-new').textContent = money(nw);
    $(SLUG + '-annual').textContent = money(inc);
    $(SLUG + '-monthly').textContent = money(inc / 12);
    $(SLUG + '-newmonthly').textContent = money(nw / 12);
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();