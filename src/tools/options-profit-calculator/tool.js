/* Options profit calculator — long call/put P/L at expiry with slider. */
(function () {
  'use strict';
  var SLUG = 'options-profit-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function syncSlider() {
    var s = num(SLUG + '-strike'), prem = num(SLUG + '-premium');
    var sl = $(SLUG + '-slider');
    if (!isNaN(s)) { sl.max = Math.max(50, (s + (isNaN(prem) ? 0 : prem)) * 2.5); sl.value = $(SLUG + '-price').value; }
  }
  function calc(fromSlider) {
    TN.clearErr(SLUG + '-error');
    var type = $(SLUG + '-type').value;
    var K = num(SLUG + '-strike'), prem = num(SLUG + '-premium'), c = Math.round(num(SLUG + '-contracts'));
    var S = fromSlider === true ? parseFloat($(SLUG + '-slider').value) : num(SLUG + '-price');
    if (isNaN(K) || isNaN(prem) || isNaN(c) || isNaN(S) || K < 0 || prem < 0 || c <= 0 || S < 0) {
      TN.setErr(SLUG + '-error', 'Enter a valid strike, premium, contract count and expiry price.');
      return;
    }
    if (fromSlider === true) { $(SLUG + '-price').value = S; }
    var intrinsic = type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0);
    var perShare = intrinsic - prem;
    var total = perShare * 100 * c;
    var be = type === 'call' ? K + prem : K - prem;
    var maxLoss = prem * 100 * c;
    $(SLUG + '-pl').textContent = money(total);
    $(SLUG + '-plshare').textContent = money(perShare);
    $(SLUG + '-be').textContent = money(Math.max(0, be));
    $(SLUG + '-maxp').textContent = type === 'call' ? 'Unlimited' : money((K - prem) * 100 * c);
    $(SLUG + '-maxl').textContent = money(maxLoss);
  }
  try {
    TN.on(SLUG + '-calc', 'click', function () { syncSlider(); calc(false); });
    TN.on(SLUG + '-slider', 'input', function () { calc(true); });
    TN.on(SLUG + '-type', 'change', function () { calc(false); });
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].id !== SLUG + '-slider') els[i].addEventListener('input', function () { syncSlider(); calc(false); });
    }
    syncSlider(); calc(false);
  } catch (e) { /* never throw on load */ }
})();