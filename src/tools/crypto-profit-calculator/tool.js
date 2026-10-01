(function () {
  'use strict';
  var ERR = 'crypto-profit-calculator-error';
  function money(n) { var neg = n < 0; try { return (neg ? '−$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return (neg ? '−$' : '$') + (Math.round(Math.abs(n) * 100) / 100); } }
  function calc() {
    if (!TN.el('cp-buy')) return;
    TN.clearErr(ERR);
    var buy = parseFloat(TN.el('cp-buy').value);
    var sell = parseFloat(TN.el('cp-sell').value);
    var amt = parseFloat(TN.el('cp-amount').value);
    var bf = parseFloat(TN.el('cp-buyfee').value) || 0;
    var sf = parseFloat(TN.el('cp-sellfee').value) || 0;
    if (!(buy > 0)) { TN.setErr(ERR, 'Enter a buy price greater than 0.'); return; }
    if (!(sell > 0)) { TN.setErr(ERR, 'Enter a sell price greater than 0.'); return; }
    if (!(amt > 0)) { TN.setErr(ERR, 'Enter an amount greater than 0.'); return; }
    if (bf < 0 || bf > 100 || sf < 0 || sf > 100) { TN.setErr(ERR, 'Fees must be between 0 and 100%.'); return; }
    var invested = buy * amt * (1 + bf / 100);
    var received = sell * amt * (1 - sf / 100);
    var profit = received - invested;
    var fees = buy * amt * bf / 100 + sell * amt * sf / 100;
    TN.el('cp-profit').textContent = money(profit);
    TN.el('cp-roi').textContent = (profit / invested * 100).toFixed(2) + '%';
    TN.el('cp-fees').textContent = money(fees);
    TN.el('cp-body').innerHTML =
      '<tr><td>Total invested (incl. buy fee)</td><td>' + money(invested) + '</td></tr>' +
      '<tr><td>Total received (after sell fee)</td><td>' + money(received) + '</td></tr>' +
      '<tr><td><strong>Net profit / loss</strong></td><td><strong>' + money(profit) + '</strong></td></tr>';
  }
  try {
    ['cp-buy', 'cp-sell', 'cp-amount', 'cp-buyfee', 'cp-sellfee'].forEach(function (id) { TN.on(id, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();