/* College savings calculator — FV of lump sum + FV of monthly annuity, vs target. */
(function () {
  'use strict';
  var SLUG = 'college-savings-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; var neg = n < 0; n = Math.abs(n); return (neg ? '-' : '') + '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var cur = num(SLUG + '-current'), mo = num(SLUG + '-monthly'), yrs = num(SLUG + '-years');
    var ret = num(SLUG + '-return'), target = num(SLUG + '-target');
    if (isNaN(cur) || isNaN(mo) || isNaN(yrs) || isNaN(ret) || isNaN(target) || cur < 0 || mo < 0 || yrs < 0 || ret < 0 || target < 0) {
      TN.setErr(SLUG + '-error', 'Enter valid savings, contributions, years, return and target.');
      return;
    }
    var r = ret / 1200, n = Math.round(yrs * 12);
    var grow = Math.pow(1 + r, n);
    var fvLump = cur * grow;
    var fvAnn = r > 0 ? mo * (grow - 1) / r : mo * n;
    var fv = fvLump + fvAnn;
    var contrib = cur + mo * n;
    $(SLUG + '-fv').textContent = money(fv);
    $(SLUG + '-contrib').textContent = money(contrib);
    $(SLUG + '-growth').textContent = money(fv - contrib);
    $(SLUG + '-shortfall').textContent = money(Math.max(0, target - fv));
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();