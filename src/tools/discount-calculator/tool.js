(function () {
  'use strict';
  var ERR = 'discount-calculator-error';
  function money(n) {
    try {
      return n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    } catch (e) { return String(Math.round(n * 100) / 100); }
  }
  function calc() {
    var pEl = TN.el('discount-price'), dEl = TN.el('discount-percent'),
        sEl = TN.el('discount-second'), cEl = TN.el('discount-coupon');
    if (!pEl || !dEl) return;
    TN.clearErr(ERR);
    var price = parseFloat(pEl.value);
    var d1 = parseFloat(dEl.value);
    var d2 = sEl ? parseFloat(sEl.value) : NaN;
    var coupon = cEl ? parseFloat(cEl.value) : NaN;
    if (!(price > 0)) { TN.setErr(ERR, 'Please enter an original price greater than 0.'); return; }
    if (isNaN(d1) || d1 < 0 || d1 > 100) { TN.setErr(ERR, 'Discount must be between 0 and 100%.'); return; }
    if (!isNaN(d2) && (d2 < 0 || d2 > 100)) { TN.setErr(ERR, 'Second discount must be between 0 and 100%.'); return; }
    if (!isNaN(coupon) && coupon < 0) { TN.setErr(ERR, 'Coupon amount cannot be negative.'); return; }

    var steps = [];
    var running = price;
    steps.push('Original: ' + money(price));
    if (d1 > 0) {
      running = running * (1 - d1 / 100);
      steps.push('After ' + d1 + '% off: ' + money(running));
    }
    if (!isNaN(d2) && d2 > 0) {
      running = running * (1 - d2 / 100);
      steps.push('After extra ' + d2 + '% off: ' + money(running));
    }
    if (!isNaN(coupon) && coupon > 0) {
      running = running - coupon;
      steps.push('After coupon of ' + money(coupon) + ': ' + money(running));
    }
    if (running < 0) running = 0;

    var savings = price - running;
    var pct = savings / price * 100;

    TN.el('discount-final').textContent = money(running);
    TN.el('discount-savings').textContent = money(savings);
    TN.el('discount-pct').textContent = pct.toFixed(2) + '%';
    var bd = TN.el('discount-breakdown');
    if (bd) bd.textContent = steps.join(' → ');
  }
  try {
    ['discount-price', 'discount-percent', 'discount-second', 'discount-coupon'].forEach(function (id) {
      TN.on(id, 'input', calc);
    });
  } catch (e) { /* never throw on load */ }
})();
