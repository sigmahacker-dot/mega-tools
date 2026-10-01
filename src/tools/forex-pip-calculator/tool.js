/* Forex pip calculator — pips, pip value in USD, P/L for major USD pairs. */
(function () {
  'use strict';
  var SLUG = 'forex-pip-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var pair = $(SLUG + '-pair').value;
    var lots = num(SLUG + '-lots'), entry = num(SLUG + '-entry'), exit = num(SLUG + '-exit');
    var dir = $(SLUG + '-direction').value === 'short' ? -1 : 1;
    if (isNaN(lots) || isNaN(entry) || isNaN(exit) || lots <= 0 || entry <= 0 || exit <= 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid lot size, entry and exit price.');
      return;
    }
    var isJPY = pair === 'USDJPY';
    var pipSize = isJPY ? 0.01 : 0.0001;
    var pipsMoved = Math.abs(exit - entry) / pipSize;
    var usdBase = pair.indexOf('USD') === 0; /* USD is the base currency */
    var pipVal = usdBase ? pipSize * 100000 * lots / exit : pipSize * 100000 * lots;
    var sign = (exit - entry) * dir >= 0 ? 1 : -1;
    var pl = sign * pipsMoved * pipVal;
    $(SLUG + '-pips').textContent = pipsMoved.toFixed(1);
    $(SLUG + '-pipval').textContent = money(pipVal);
    $(SLUG + '-pl').textContent = money(pl);
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