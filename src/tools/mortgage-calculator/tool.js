(function () {
  'use strict';
  var ERR = 'mortgage-calculator-error';
  function money(n) {
    try { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    catch (e) { return '$' + String(Math.round(n * 100) / 100); }
  }
  function num(id) {
    var el = TN.el(id);
    if (!el) return NaN;
    return parseFloat(el.value);
  }
  function calc() {
    if (!TN.el('mortgage-price')) return;
    TN.clearErr(ERR);
    var price = num('mortgage-price');
    var down = num('mortgage-down');
    var rate = num('mortgage-rate');
    var term = num('mortgage-term');
    if (!(price > 0)) { TN.setErr(ERR, 'Enter a valid home price greater than 0.'); return; }
    if (isNaN(down) || down < 0) { TN.setErr(ERR, 'Enter a valid down payment (0 or more).'); return; }
    if (down >= price) { TN.setErr(ERR, 'Down payment must be less than the home price.'); return; }
    if (isNaN(rate) || rate < 0 || rate > 30) { TN.setErr(ERR, 'Enter an annual interest rate between 0 and 30%.'); return; }
    if (!(term >= 1 && term <= 50)) { TN.setErr(ERR, 'Enter a loan term between 1 and 50 years.'); return; }

    var P = price - down;
    var r = rate / 100 / 12;
    var n = Math.round(term * 12);
    var M = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);

    var bal = P, rows = [], totInt = 0, totPaid = 0;
    for (var y = 1; y <= term; y++) {
      var princ = 0, intr = 0;
      for (var m = 0; m < 12; m++) {
        var i = bal * r;
        var pmt = Math.min(M, bal + i);
        var pp = pmt - i;
        bal -= pp;
        princ += pp;
        intr += i;
        totPaid += pmt;
        if (bal <= 0.005) { bal = 0; break; }
      }
      totInt += intr;
      rows.push('<tr><td>' + y + '</td><td>' + money(princ) + '</td><td>' + money(intr) + '</td><td>' + money(bal) + '</td></tr>');
      if (bal === 0) break;
    }

    TN.el('mortgage-payment').textContent = money(M);
    TN.el('mortgage-interest').textContent = money(totInt);
    TN.el('mortgage-total').textContent = money(totPaid);
    TN.el('mortgage-schedule-body').innerHTML = rows.join('');
  }
  try {
    TN.on('mortgage-price', 'input', calc);
    TN.on('mortgage-down', 'input', calc);
    TN.on('mortgage-rate', 'input', calc);
    TN.on('mortgage-term', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
