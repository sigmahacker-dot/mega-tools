(function () {
  'use strict';
  var ERR = 'emi-calculator-error';
  function money(n) {
    try {
      return n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    } catch (e) { return String(Math.round(n * 100) / 100); }
  }
  function calc() {
    var pEl = TN.el('emi-principal'), rEl = TN.el('emi-rate'),
        tEl = TN.el('emi-tenure'), uEl = TN.el('emi-tenure-unit');
    if (!pEl || !rEl || !tEl || !uEl) return;
    TN.clearErr(ERR);
    var P = parseFloat(pEl.value);
    var annual = parseFloat(rEl.value);
    var t = parseFloat(tEl.value);
    if (!(P > 0)) { TN.setErr(ERR, 'Please enter a loan amount greater than 0.'); return; }
    if (!(annual >= 0)) { TN.setErr(ERR, 'Please enter an annual interest rate of 0 or more.'); return; }
    if (!(t > 0)) { TN.setErr(ERR, 'Please enter a tenure greater than 0.'); return; }
    var n = uEl.value === 'months' ? Math.round(t) : Math.round(t * 12);
    if (!(n > 0)) { TN.setErr(ERR, 'Tenure is too short.'); return; }
    var r = annual / 1200; // monthly rate
    var emi;
    if (r === 0) {
      emi = P / n;
    } else {
      var pow = Math.pow(1 + r, n);
      emi = P * r * pow / (pow - 1);
    }
    var total = emi * n;
    var interest = total - P;
    TN.el('emi-monthly').textContent = money(emi);
    TN.el('emi-interest').textContent = money(interest);
    TN.el('emi-total').textContent = money(total);
  }
  try {
    ['emi-principal', 'emi-rate', 'emi-tenure', 'emi-tenure-unit'].forEach(function (id) {
      TN.on(id, 'input', calc);
      TN.on(id, 'change', calc);
    });
  } catch (e) { /* never throw on load */ }
})();
