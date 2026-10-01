(function () {
  'use strict';
  var ERR = 'savings-goal-calculator-error';
  function money(n) {
    try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    catch (e) { return '$' + String(Math.round(n * 100) / 100); }
  }
  function num(id) {
    var el = TN.el(id);
    if (!el) return NaN;
    return parseFloat(el.value);
  }
  function calc() {
    if (!TN.el('goal-amount')) return;
    TN.clearErr(ERR);
    var goal = num('goal-amount');
    var current = num('goal-current');
    var rate = num('goal-rate');
    var years = num('goal-years');
    if (!(goal > 0)) { TN.setErr(ERR, 'Enter a savings goal greater than 0.'); return; }
    if (isNaN(current) || current < 0) { TN.setErr(ERR, 'Enter valid current savings (0 or more).'); return; }
    if (current >= goal) { TN.setErr(ERR, 'Your current savings already meet or exceed the goal.'); return; }
    if (isNaN(rate) || rate < 0 || rate > 30) { TN.setErr(ERR, 'Enter an annual rate between 0 and 30%.'); return; }
    if (!(years >= 0.1 && years <= 60)) { TN.setErr(ERR, 'Enter a timeframe between 0.1 and 60 years.'); return; }

    var i = Math.pow(1 + rate / 100, 1 / 12) - 1; // equivalent monthly rate
    var n = Math.max(1, Math.round(years * 12));
    var grown = current * Math.pow(1 + i, n);
    var need = goal - grown;
    var pmt;
    if (need <= 0) {
      pmt = 0;
    } else if (i === 0) {
      pmt = need / n;
    } else {
      pmt = need * i / (Math.pow(1 + i, n) - 1);
    }
    var deposits = pmt * n;
    var interest = goal - current - deposits;

    TN.el('goal-monthly').textContent = money(pmt);
    TN.el('goal-deposits').textContent = money(deposits);
    TN.el('goal-interest').textContent = money(Math.max(0, interest));
  }
  try {
    ['goal-amount', 'goal-current', 'goal-rate', 'goal-years'].forEach(function (id) {
      TN.on(id, 'input', calc);
    });
    calc();
  } catch (e) { /* never throw on load */ }
})();
