(function () {
  'use strict';
  var ERR = 'freelance-rate-calculator-error';
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
    if (!TN.el('free-income')) return;
    TN.clearErr(ERR);
    var income = num('free-income');
    var hours = num('free-hours');
    var weeks = num('free-weeks');
    var buffer = num('free-buffer');
    if (!(income > 0)) { TN.setErr(ERR, 'Enter a target annual income greater than 0.'); return; }
    if (!(hours >= 1 && hours <= 80)) { TN.setErr(ERR, 'Enter billable hours per week between 1 and 80.'); return; }
    if (!(weeks >= 1 && weeks <= 52)) { TN.setErr(ERR, 'Enter working weeks per year between 1 and 52.'); return; }
    if (isNaN(buffer) || buffer < 0 || buffer > 200) { TN.setErr(ERR, 'Enter a buffer between 0 and 200%.'); return; }
    var hourly = income * (1 + buffer / 100) / (hours * weeks);
    TN.el('free-hourly').textContent = money(hourly);
    TN.el('free-daily').textContent = money(hourly * 8);
    TN.el('free-weekly').textContent = money(hourly * hours);
  }
  try {
    ['free-income', 'free-hours', 'free-weeks', 'free-buffer'].forEach(function (id) {
      TN.on(id, 'input', calc);
    });
    calc();
  } catch (e) { /* never throw on load */ }
})();
