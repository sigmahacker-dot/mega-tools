(function () {
  'use strict';
  var ERR = 'student-loan-calculator-error';
  function money(n) { try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return '$' + (Math.round(n * 100) / 100); } }
  function calc() {
    if (!TN.el('sl-balance')) return;
    TN.clearErr(ERR);
    var mode = TN.el('sl-mode').value;
    var P = parseFloat(TN.el('sl-balance').value);
    var rate = parseFloat(TN.el('sl-rate').value);
    if (!(P > 0)) { TN.setErr(ERR, 'Enter a loan balance greater than 0.'); return; }
    if (isNaN(rate) || rate < 0 || rate > 30) { TN.setErr(ERR, 'Enter a rate between 0 and 30%.'); return; }
    var r = rate / 100 / 12;
    if (mode === 'payoff') {
      var pmt = parseFloat(TN.el('sl-payment').value);
      if (!(pmt > 0)) { TN.setErr(ERR, 'Enter a monthly payment greater than 0.'); return; }
      if (r > 0 && pmt <= r * P) { TN.setErr(ERR, 'That payment does not cover the monthly interest (' + money(r * P) + ') — the balance would never shrink.'); return; }
      var n = r === 0 ? P / pmt : -Math.log(1 - r * P / pmt) / Math.log(1 + r);
      n = Math.ceil(n);
      var total = pmt * n;
      var yrs = Math.floor(n / 12), mo = n % 12;
      TN.el('sl-main-label').textContent = 'Time to payoff';
      TN.el('sl-main').textContent = yrs > 0 ? yrs + 'y ' + mo + 'm' : mo + ' months';
      TN.el('sl-interest').textContent = money(total - P);
      TN.el('sl-total').textContent = money(total);
    } else {
      var yrs2 = parseInt(TN.el('sl-term').value, 10);
      if (!(yrs2 >= 1 && yrs2 <= 40)) { TN.setErr(ERR, 'Enter a term between 1 and 40 years.'); return; }
      var n2 = yrs2 * 12;
      var M = r === 0 ? P / n2 : P * r * Math.pow(1 + r, n2) / (Math.pow(1 + r, n2) - 1);
      TN.el('sl-main-label').textContent = 'Monthly payment';
      TN.el('sl-main').textContent = money(M);
      TN.el('sl-interest').textContent = money(M * n2 - P);
      TN.el('sl-total').textContent = money(M * n2);
    }
  }
  try {
    TN.on('sl-mode', 'change', calc);
    ['sl-balance', 'sl-rate', 'sl-payment', 'sl-term'].forEach(function (id) { TN.on(id, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();