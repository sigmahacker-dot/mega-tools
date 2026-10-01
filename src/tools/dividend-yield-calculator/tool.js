(function () {
  'use strict';
  var ERR = 'dividend-yield-calculator-error';
  function money(n) { try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return '$' + (Math.round(n * 100) / 100); } }
  function calc() {
    if (!TN.el('dy-div')) return;
    TN.clearErr(ERR);
    var div = parseFloat(TN.el('dy-div').value);
    var price = parseFloat(TN.el('dy-price').value);
    var shares = parseFloat(TN.el('dy-shares').value);
    if (!(div >= 0)) { TN.setErr(ERR, 'Enter a valid dividend (0 or more).'); return; }
    if (!(price > 0)) { TN.setErr(ERR, 'Enter a share price greater than 0.'); return; }
    if (!(shares >= 0)) { TN.setErr(ERR, 'Enter valid shares owned (0 or more).'); return; }
    var yld = div / price * 100;
    var annual = div * shares;
    TN.el('dy-yield').textContent = yld.toFixed(2) + '%';
    TN.el('dy-annual').textContent = money(annual);
    TN.el('dy-monthly').textContent = money(annual / 12);
    TN.el('dy-body').innerHTML =
      '<tr><td>Annual</td><td>' + money(annual) + '</td></tr>' +
      '<tr><td>Quarterly</td><td>' + money(annual / 4) + '</td></tr>' +
      '<tr><td>Monthly</td><td>' + money(annual / 12) + '</td></tr>' +
      '<tr><td>Per share</td><td>' + money(div) + '</td></tr>';
  }
  try {
    ['dy-div', 'dy-price', 'dy-shares'].forEach(function (id) { TN.on(id, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();