(function () {
  'use strict';
  var ERR = 'stock-profit-calculator-error';
  function money(n) { var neg = n < 0; try { return (neg ? '−$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return (neg ? '−$' : '$') + (Math.round(Math.abs(n) * 100) / 100); } }
  function calc() {
    if (!TN.el('sp-buy')) return;
    TN.clearErr(ERR);
    var buy = parseFloat(TN.el('sp-buy').value);
    var shares = parseFloat(TN.el('sp-shares').value);
    var bc = parseFloat(TN.el('sp-buycomm').value) || 0;
    var sell = parseFloat(TN.el('sp-sell').value);
    var sc = parseFloat(TN.el('sp-sellcomm').value) || 0;
    if (!(buy > 0)) { TN.setErr(ERR, 'Enter a buy price greater than 0.'); return; }
    if (!(shares > 0)) { TN.setErr(ERR, 'Enter shares greater than 0.'); return; }
    if (!(sell > 0)) { TN.setErr(ERR, 'Enter a sell price greater than 0.'); return; }
    if (bc < 0 || sc < 0) { TN.setErr(ERR, 'Commissions cannot be negative.'); return; }
    var cost = buy * shares + bc;
    var proceeds = sell * shares - sc;
    var profit = proceeds - cost;
    var breakeven = (buy * shares + bc + sc) / shares;
    TN.el('sp-profit').textContent = money(profit);
    TN.el('sp-ret').textContent = (profit / cost * 100).toFixed(2) + '%';
    TN.el('sp-breakeven').textContent = money(breakeven);
    TN.el('sp-body').innerHTML =
      '<tr><td>Total buy cost</td><td>' + money(cost) + '</td></tr>' +
      '<tr><td>Total sell proceeds</td><td>' + money(proceeds) + '</td></tr>' +
      '<tr><td><strong>Net profit / loss</strong></td><td><strong>' + money(profit) + '</strong></td></tr>';
  }
  try {
    ['sp-buy', 'sp-shares', 'sp-buycomm', 'sp-sell', 'sp-sellcomm'].forEach(function (id) { TN.on(id, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();