(function () {
  'use strict';
  var ERR = 'ovulation-calculator-error';
  function addDays(d, n) {
    var c = new Date(d.getTime());
    c.setDate(c.getDate() + n);
    return c;
  }
  function fmtDate(d) {
    try { return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); }
    catch (e) { return d.toDateString(); }
  }
  function parse(d) {
    if (!d) return null;
    var dt = new Date(d + 'T00:00:00');
    return isNaN(dt.getTime()) ? null : dt;
  }
  function calc() {
    if (!TN.el('ovu-last')) return;
    TN.clearErr(ERR);
    var last = parse(TN.el('ovu-last').value);
    var cycle = parseInt(TN.el('ovu-cycle').value, 10);
    if (!last) { TN.setErr(ERR, 'Enter the first day of your last period.'); return; }
    if (!(cycle >= 21 && cycle <= 35)) { TN.setErr(ERR, 'Enter a cycle length between 21 and 35 days.'); return; }
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (last > today) { TN.setErr(ERR, 'Last period start cannot be in the future.'); return; }
    var ovulation = addDays(last, cycle - 14);
    var fertileStart = addDays(ovulation, -5);
    var fertileEnd = addDays(ovulation, 1);
    var next = addDays(last, cycle);
    TN.el('ovu-fertile').textContent = fmtDate(fertileStart) + ' – ' + fmtDate(fertileEnd);
    TN.el('ovu-ovulation').textContent = fmtDate(ovulation);
    TN.el('ovu-next').textContent = fmtDate(next);
  }
  try {
    TN.on('ovu-last', 'input', calc);
    TN.on('ovu-last', 'change', calc);
    TN.on('ovu-cycle', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
