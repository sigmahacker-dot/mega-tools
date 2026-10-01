(function () {
  'use strict';
  var P = 'billable-hours-calculator-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function money(x) { return '$' + x.toFixed(2); }
  function num(id, name, min) {
    var v = parseFloat(g(id).value);
    if (isNaN(v) || v < min) throw new Error(name + ' must be a number ≥ ' + min + '.');
    return v;
  }
  function calc() {
    try {
      TN.clearErr(ERR);
      var hours = num('hours', 'Billable hours', 0);
      var rate = num('rate', 'Hourly rate', 0);
      var nonbill = num('nonbill', 'Non-billable hours', 0);
      var exp = num('exp', 'Expenses', 0);
      var disc = num('disc', 'Discount', 0);
      var sub = hours * rate;
      var totalH = hours + nonbill;
      var util = totalH === 0 ? 0 : hours / totalH * 100;
      var total = sub + exp - disc;
      if (total < 0) { TN.setErr(ERR, 'Discount exceeds the subtotal + expenses — the total would be negative.'); return; }
      TN.show(P + 'out');
      g('sub').textContent = money(sub);
      g('util').textContent = util.toFixed(1) + '%';
      g('total').textContent = money(total);
      g('steps').innerHTML = '<ol>' +
        '<li>Billable amount = ' + hours + ' h × ' + money(rate) + ' = <b>' + money(sub) + '</b>.</li>' +
        '<li>Utilization = ' + hours + ' ÷ ' + totalH + ' total hours = <b>' + util.toFixed(1) + '%</b>.</li>' +
        '<li>Invoice total = ' + money(sub) + ' + ' + money(exp) + ' expenses − ' + money(disc) + ' discount = <b>' + money(total) + '</b>.</li>' +
        '</ol>';
    } catch (e) { TN.setErr(ERR, e.message || 'Could not calculate.'); }
  }
  try {
    if (!TN.el(P + 'calc')) return;
    TN.on(P + 'calc', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
