/* Break-even calculator — units and revenue from fixed/variable costs. */
(function () {
  'use strict';
  var SLUG = 'break-even-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var fixed = num(SLUG + '-fixed'), price = num(SLUG + '-price'), vc = num(SLUG + '-variable');
    if (isNaN(fixed) || isNaN(price) || isNaN(vc) || fixed < 0 || price < 0 || vc < 0) {
      TN.setErr(SLUG + '-error', 'Enter valid fixed costs, price and variable cost.');
      return;
    }
    var cm = price - vc;
    if (cm <= 0) {
      TN.setErr(SLUG + '-error', 'Price must exceed variable cost per unit — otherwise you never break even.');
      $(SLUG + '-units').textContent = '—'; $(SLUG + '-revenue').textContent = '—';
      $(SLUG + '-margin').textContent = money(cm); $(SLUG + '-ratio').textContent = '—';
      return;
    }
    var units = fixed / cm;
    $(SLUG + '-units').textContent = Math.ceil(units).toLocaleString();
    $(SLUG + '-revenue').textContent = money(Math.ceil(units) * price);
    $(SLUG + '-margin').textContent = money(cm);
    $(SLUG + '-ratio').textContent = (cm / price * 100).toFixed(2) + '%';
  }
  try {
    TN.on(SLUG + '-calc', 'click', calc);
    var els = document.querySelectorAll('input[id^="' + SLUG + '-"]');
    for (var i = 0; i < els.length; i++) { els[i].addEventListener('input', calc); }
    calc();
  } catch (e) { /* never throw on load */ }
})();