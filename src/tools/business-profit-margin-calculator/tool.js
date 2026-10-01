/* Business profit margin calculator — gross, operating, net margins. */
(function () {
  'use strict';
  var SLUG = 'business-profit-margin-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pct(n) { if (!isFinite(n)) return '—'; return n.toFixed(2) + '%'; }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var rev = num(SLUG + '-revenue'), cogs = num(SLUG + '-cogs'), opex = num(SLUG + '-opex');
    if (isNaN(rev) || isNaN(cogs) || isNaN(opex) || rev <= 0 || cogs < 0 || opex < 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid revenue (above 0), COGS and operating expenses.');
      return;
    }
    var gross = rev - cogs, oper = gross - opex;
    $(SLUG + '-gross').textContent = money(gross);
    $(SLUG + '-grossm').textContent = pct(gross / rev * 100);
    $(SLUG + '-oper').textContent = money(oper);
    $(SLUG + '-operm').textContent = pct(oper / rev * 100);
    $(SLUG + '-netm').textContent = pct(oper / rev * 100);
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();