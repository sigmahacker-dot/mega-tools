/* Stock split calculator — new shares/price with value-unchanged proof. */
(function () {
  'use strict';
  var SLUG = 'stock-split-calculator';
  function $(id) { return document.getElementById(id); }
  function num(id) { var v = parseFloat(String($(id).value).replace(/,/g, '').trim()); return isNaN(v) ? NaN : v; }
  function money(n) { if (!isFinite(n)) return '—'; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var shares = num(SLUG + '-shares'), price = num(SLUG + '-price');
    var parts = $(SLUG + '-ratio').value.split(':');
    var a = parseFloat(parts[0]), b = parseFloat(parts[1]);
    if (isNaN(shares) || isNaN(price) || shares < 0 || price < 0) {
      TN.setErr(SLUG + '-error', 'Enter valid shares owned and price per share.');
      return;
    }
    var newShares = shares * a / b;
    var newPrice = price * b / a;
    var before = shares * price, after = newShares * newPrice;
    $(SLUG + '-newshares').textContent = newShares.toLocaleString('en-US', { maximumFractionDigits: 4 });
    $(SLUG + '-newprice').textContent = money(newPrice);
    $(SLUG + '-before').textContent = money(before);
    $(SLUG + '-after').textContent = money(after);
    $(SLUG + '-proof').textContent = 'Proof: ' + shares.toLocaleString() + ' × ' + money(price) + ' = ' +
      newShares.toLocaleString('en-US', { maximumFractionDigits: 4 }) + ' × ' + money(newPrice) + ' — identical total value.';
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