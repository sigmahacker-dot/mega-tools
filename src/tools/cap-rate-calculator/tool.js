/* Cap rate calculator — two directions: rate from value, value from rate. */
(function () {
  'use strict';
  var SLUG = 'cap-rate-calculator';
  var mode = 1;
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function setMode(m) {
    mode = m;
    TN.hide(SLUG + '-mode1'); TN.hide(SLUG + '-mode2');
    TN.show(SLUG + '-mode' + m);
    $(SLUG + '-tab1').classList.toggle('active', m === 1);
    $(SLUG + '-tab2').classList.toggle('active', m === 2);
    calc();
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    if (mode === 1) {
      var noi = num(SLUG + '-noi1'), val = num(SLUG + '-value1');
      if (isNaN(noi) || isNaN(val) || noi < 0 || val <= 0) {
        TN.setErr(SLUG + '-error', 'Enter a valid NOI and property value.');
        $(SLUG + '-result').textContent = '—';
        return;
      }
      $(SLUG + '-result').innerHTML = 'Cap rate = <b>' + (noi / val * 100).toFixed(2) + '%</b>';
    } else {
      var noi2 = num(SLUG + '-noi2'), cap = num(SLUG + '-cap2');
      if (isNaN(noi2) || isNaN(cap) || noi2 < 0 || cap <= 0) {
        TN.setErr(SLUG + '-error', 'Enter a valid NOI and cap rate.');
        $(SLUG + '-result').textContent = '—';
        return;
      }
      $(SLUG + '-result').innerHTML = 'Estimated value = <b>' + money(noi2 / (cap / 100)) + '</b>';
    }
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    TN.on(SLUG + '-tab1', 'click', function () { setMode(1); });
    TN.on(SLUG + '-tab2', 'click', function () { setMode(2); });
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    setMode(1);
  } catch (e) { /* never throw on load */ }
})();