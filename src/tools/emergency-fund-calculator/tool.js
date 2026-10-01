(function () {
  'use strict';
  var ERR = 'emergency-fund-calculator-error';
  function money(n) { try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return '$' + (Math.round(n * 100) / 100); } }
  function calc() {
    if (!TN.el('ef-expenses')) return;
    TN.clearErr(ERR);
    var exp = parseFloat(TN.el('ef-expenses').value);
    var saved = parseFloat(TN.el('ef-saved').value) || 0;
    var mo = parseFloat(TN.el('ef-monthly').value) || 0;
    if (!(exp > 0)) { TN.setErr(ERR, 'Enter monthly expenses greater than 0.'); return; }
    if (saved < 0) { TN.setErr(ERR, 'Savings cannot be negative.'); return; }
    if (mo < 0) { TN.setErr(ERR, 'Monthly contribution cannot be negative.'); return; }
    function row(months) {
      var target = exp * months;
      var need = Math.max(0, target - saved);
      var mAway = need === 0 ? 0 : (mo > 0 ? Math.ceil(need / mo) : Infinity);
      return '<tr><td>' + months + ' months</td><td>' + money(target) + '</td><td>' + money(need) + '</td><td>' + (mAway === Infinity ? '—' : mAway) + '</td></tr>';
    }
    var t6 = exp * 6;
    var need6 = Math.max(0, t6 - saved);
    TN.el('ef-target6').textContent = money(t6);
    TN.el('ef-pct').textContent = Math.min(100, Math.round(saved / t6 * 100)) + '%';
    TN.el('ef-months').textContent = need6 === 0 ? 'Done!' : (mo > 0 ? Math.ceil(need6 / mo) : '—');
    TN.el('ef-bar').value = Math.min(100, saved / t6 * 100);
    TN.el('ef-body').innerHTML = row(3) + row(6) + row(9);
  }
  try {
    ['ef-expenses', 'ef-saved', 'ef-monthly'].forEach(function (id) { TN.on(id, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();