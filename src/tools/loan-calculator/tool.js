(function () {
  'use strict';
  var ERR = 'loan-calculator-error';
  function money(n) {
    try {
      return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    } catch (e) { return String(Math.round(n)); }
  }
  function calc() {
    var pEl = TN.el('loan-principal'), rEl = TN.el('loan-rate'),
        tEl = TN.el('loan-tenure'), uEl = TN.el('loan-tenure-unit');
    if (!pEl || !rEl || !tEl || !uEl) return;
    TN.clearErr(ERR);
    var P = parseFloat(pEl.value);
    var annual = parseFloat(rEl.value);
    var t = parseFloat(tEl.value);
    if (!(P > 0)) { TN.setErr(ERR, 'Please enter a loan amount greater than 0.'); return; }
    if (!(annual >= 0)) { TN.setErr(ERR, 'Please enter an annual interest rate of 0 or more.'); return; }
    if (!(t > 0)) { TN.setErr(ERR, 'Please enter a tenure greater than 0.'); return; }
    var n = uEl.value === 'months' ? Math.round(t) : Math.round(t * 12);
    if (!(n > 0)) { TN.setErr(ERR, 'Tenure is too short.'); return; }
    var r = annual / 1200;
    var emi = r === 0 ? P / n : (function () {
      var pow = Math.pow(1 + r, n);
      return P * r * pow / (pow - 1);
    })();

    var totalInterest = 0, totalPaid = 0;
    var balance = P;
    var rows = [];
    var year = 1, yPrin = 0, yInt = 0;
    for (var i = 1; i <= n; i++) {
      var intPart = balance * r;
      var prinPart = emi - intPart;
      if (i === n) { prinPart = balance; intPart = emi - prinPart; } // last payment adjustment
      balance -= prinPart;
      if (balance < 0.005) balance = 0;
      yPrin += prinPart; yInt += intPart;
      totalInterest += intPart; totalPaid += prinPart + intPart;
      if (i % 12 === 0 || i === n) {
        rows.push({ y: year, p: yPrin, i: yInt, b: balance });
        year++; yPrin = 0; yInt = 0;
      }
    }

    TN.el('loan-monthly').textContent = money(emi);
    TN.el('loan-interest').textContent = money(totalInterest);
    TN.el('loan-total').textContent = money(P + totalInterest);

    var tbody = TN.el('loan-tbody');
    if (tbody) {
      var html = '';
      rows.forEach(function (row) {
        html += '<tr><td>' + row.y + '</td><td>' + money(row.p) + '</td><td>' +
                money(row.i) + '</td><td>' + money(row.b) + '</td></tr>';
      });
      tbody.innerHTML = html;
    }
  }
  try {
    ['loan-principal', 'loan-rate', 'loan-tenure', 'loan-tenure-unit'].forEach(function (id) {
      TN.on(id, 'input', calc);
      TN.on(id, 'change', calc);
    });
  } catch (e) { /* never throw on load */ }
})();
