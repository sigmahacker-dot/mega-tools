(function () {
  'use strict';
  var ERR = 'tip-calculator-error';
  function money(n) {
    try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    catch (e) { return '$' + String(Math.round(n * 100) / 100); }
  }
  function calc() {
    if (!TN.el('tip-bill')) return;
    TN.clearErr(ERR);
    var bill = parseFloat(TN.el('tip-bill').value);
    var pct = parseFloat(TN.el('tip-percent').value);
    var people = parseInt(TN.el('tip-people').value, 10);
    if (isNaN(pct) || pct < 0 || pct > 100) { TN.setErr(ERR, 'Enter a tip percentage between 0 and 100.'); return; }
    if (!(bill > 0)) { TN.setErr(ERR, 'Enter a valid bill amount greater than 0.'); return; }
    if (!(people >= 1)) { TN.setErr(ERR, 'Enter at least 1 person.'); return; }
    var tip = bill * pct / 100;
    var total = bill + tip;
    TN.el('tip-tip-amount').textContent = money(tip);
    TN.el('tip-total').textContent = money(total);
    TN.el('tip-per-person').textContent = money(total / people);
  }
  try {
    TN.on('tip-bill', 'input', calc);
    TN.on('tip-percent', 'input', calc);
    TN.on('tip-people', 'input', calc);
    TN.qsa('[data-tip]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        TN.el('tip-percent').value = btn.getAttribute('data-tip');
        calc();
      });
    });
    calc();
  } catch (e) { /* never throw on load */ }
})();
