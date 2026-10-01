(function () {
  'use strict';
  var ERR = 'salary-calculator-error';
  function money(n) {
    try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    catch (e) { return '$' + String(Math.round(n * 100) / 100); }
  }
  function calc() {
    if (!TN.el('salary-annual')) return;
    TN.clearErr(ERR);
    var annual = parseFloat(TN.el('salary-annual').value);
    var hours = parseFloat(TN.el('salary-hours').value);
    var days = parseFloat(TN.el('salary-days').value);
    if (!(annual > 0)) { TN.setErr(ERR, 'Enter a valid annual salary greater than 0.'); return; }
    if (!(hours >= 1 && hours <= 168)) { TN.setErr(ERR, 'Enter hours per week between 1 and 168.'); return; }
    if (!(days >= 1 && days <= 7)) { TN.setErr(ERR, 'Enter days per week between 1 and 7.'); return; }
    var weekly = annual / 52;
    TN.el('salary-hourly').textContent = money(weekly / hours);
    TN.el('salary-daily').textContent = money(annual / (52 * days));
    TN.el('salary-weekly').textContent = money(weekly);
    TN.el('salary-biweekly').textContent = money(weekly * 2);
    TN.el('salary-monthly').textContent = money(annual / 12);
  }
  try {
    TN.on('salary-annual', 'input', calc);
    TN.on('salary-hours', 'input', calc);
    TN.on('salary-days', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
