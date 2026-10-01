(function () {
  'use strict';
  var ERR = 'overtime-pay-calculator-error';
  function money(n) { try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return '$' + (Math.round(n * 100) / 100); } }
  function calc() {
    if (!TN.el('ot-rate')) return;
    TN.clearErr(ERR);
    var rate = parseFloat(TN.el('ot-rate').value);
    var reg = parseFloat(TN.el('ot-reg').value) || 0;
    var over = parseFloat(TN.el('ot-over').value) || 0;
    var dbl = parseFloat(TN.el('ot-double').value) || 0;
    if (!(rate >= 0)) { TN.setErr(ERR, 'Enter a valid hourly rate (0 or more).'); return; }
    if (reg < 0 || over < 0 || dbl < 0 || reg > 168 || over > 168 || dbl > 168) { TN.setErr(ERR, 'Hours must be between 0 and 168.'); return; }
    var regPay = reg * rate, otPay = over * rate * 1.5, dtPay = dbl * rate * 2;
    var gross = regPay + otPay + dtPay;
    var totH = reg + over + dbl;
    TN.el('ot-gross').textContent = money(gross);
    TN.el('ot-extra').textContent = money(over * rate * 0.5 + dbl * rate);
    TN.el('ot-eff').textContent = totH > 0 ? money(gross / totH) : '–';
    TN.el('ot-body').innerHTML =
      '<tr><td>Regular</td><td>' + reg + '</td><td>' + money(rate) + '</td><td>' + money(regPay) + '</td></tr>' +
      '<tr><td>Overtime 1.5×</td><td>' + over + '</td><td>' + money(rate * 1.5) + '</td><td>' + money(otPay) + '</td></tr>' +
      '<tr><td>Double time 2×</td><td>' + dbl + '</td><td>' + money(rate * 2) + '</td><td>' + money(dtPay) + '</td></tr>' +
      '<tr><td><strong>Total</strong></td><td><strong>' + totH + '</strong></td><td></td><td><strong>' + money(gross) + '</strong></td></tr>';
  }
  try {
    ['ot-rate', 'ot-reg', 'ot-over', 'ot-double'].forEach(function (id) { TN.on(id, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();