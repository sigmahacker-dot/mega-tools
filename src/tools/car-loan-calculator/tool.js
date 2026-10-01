(function () {
  'use strict';
  var ERR = 'car-loan-calculator-error';
  function money(n) { try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return '$' + (Math.round(n * 100) / 100); } }
  function calc() {
    if (!TN.el('car-price')) return;
    TN.clearErr(ERR);
    var price = parseFloat(TN.el('car-price').value);
    var down = parseFloat(TN.el('car-down').value) || 0;
    var trade = parseFloat(TN.el('car-trade').value) || 0;
    var rate = parseFloat(TN.el('car-rate').value);
    var term = parseInt(TN.el('car-term').value, 10);
    if (!(price > 0)) { TN.setErr(ERR, 'Enter a vehicle price greater than 0.'); return; }
    if (down < 0 || trade < 0) { TN.setErr(ERR, 'Down payment and trade-in cannot be negative.'); return; }
    if (down + trade >= price) { TN.setErr(ERR, 'Down payment plus trade-in must be less than the price.'); return; }
    if (isNaN(rate) || rate < 0 || rate > 30) { TN.setErr(ERR, 'Enter an APR between 0 and 30%.'); return; }
    if (!(term >= 1 && term <= 120)) { TN.setErr(ERR, 'Enter a term between 1 and 120 months.'); return; }
    var P = price - down - trade;
    var r = rate / 100 / 12;
    var M = r === 0 ? P / term : P * r * Math.pow(1 + r, term) / (Math.pow(1 + r, term) - 1);
    var totalPaid = M * term;
    var interest = totalPaid - P;
    TN.el('car-payment').textContent = money(M);
    TN.el('car-interest').textContent = money(interest);
    TN.el('car-total').textContent = money(down + trade + totalPaid);
    TN.el('car-body').innerHTML =
      '<tr><td>Amount financed</td><td>' + money(P) + '</td></tr>' +
      '<tr><td>Monthly payment × ' + term + '</td><td>' + money(M) + '</td></tr>' +
      '<tr><td>Total interest</td><td>' + money(interest) + '</td></tr>' +
      '<tr><td><strong>Total cost of car</strong></td><td><strong>' + money(down + trade + totalPaid) + '</strong></td></tr>';
  }
  try {
    ['car-price', 'car-down', 'car-trade', 'car-rate', 'car-term'].forEach(function (id) { TN.on(id, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();