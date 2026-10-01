/* Markup & margin calculator — two directions. */
(function () {
  'use strict';
  var SLUG = 'markup-margin-calculator';
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
    var out = $(SLUG + '-result');
    if (mode === 1) {
      var cost = num(SLUG + '-cost1'), price = num(SLUG + '-price1');
      if (isNaN(cost) || isNaN(price) || cost <= 0 || price < 0) {
        TN.setErr(SLUG + '-error', 'Enter a valid cost (above 0) and selling price.');
        out.textContent = '—';
        return;
      }
      var markup = (price - cost) / cost * 100;
      var margin = price > 0 ? (price - cost) / price * 100 : NaN;
      out.innerHTML = 'Markup = <b>' + markup.toFixed(2) + '%</b> &nbsp;·&nbsp; Margin = <b>' +
        (isNaN(margin) ? '—' : margin.toFixed(2) + '%') + '</b> &nbsp;·&nbsp; Profit = <b>' + money(price - cost) + '</b>';
    } else {
      var cost2 = num(SLUG + '-cost2'), m2 = num(SLUG + '-margin2');
      if (isNaN(cost2) || isNaN(m2) || cost2 <= 0 || m2 < 0 || m2 >= 100) {
        TN.setErr(SLUG + '-error', 'Enter a valid cost and a margin between 0 and 100 (exclusive).');
        out.textContent = '—';
        return;
      }
      var price2 = cost2 / (1 - m2 / 100);
      out.innerHTML = 'Sell at <b>' + money(price2) + '</b> to earn a ' + m2.toFixed(2) + '% margin (profit ' + money(price2 - cost2) + ' per unit).';
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