/* Invoice late fee calculator — days late, pro-rated monthly penalty, total due. */
(function () {
  'use strict';
  var SLUG = 'invoice-late-fee-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var amt = num(SLUG + '-amount'), rate = num(SLUG + '-rate');
    var dueS = $(SLUG + '-due').value, asofS = $(SLUG + '-asof').value;
    if (isNaN(amt) || isNaN(rate) || amt < 0 || rate < 0 || !dueS || !asofS) {
      TN.setErr(SLUG + '-error', 'Enter a valid amount, rate, due date and as-of date.');
      return;
    }
    var due = new Date(dueS + 'T00:00:00'), asof = new Date(asofS + 'T00:00:00');
    if (isNaN(due.getTime()) || isNaN(asof.getTime())) {
      TN.setErr(SLUG + '-error', 'Enter valid dates.');
      return;
    }
    var days = Math.max(0, Math.round((asof - due) / 86400000));
    var fee = amt * (rate / 100) * days / 30;
    $(SLUG + '-days').textContent = days.toLocaleString();
    $(SLUG + '-fee').textContent = money(fee);
    $(SLUG + '-total').textContent = money(amt + fee);
    $(SLUG + '-months').textContent = (days / 30).toFixed(2);
  }
  try {
    var asofEl = $(SLUG + '-asof');
    if (!asofEl.value) {
      var t = new Date();
      asofEl.value = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    }
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) {
      els[i].addEventListener('input', calc);
      els[i].addEventListener('change', calc);
    }
    calc();
  } catch (e) { /* never throw on load */ }
})();