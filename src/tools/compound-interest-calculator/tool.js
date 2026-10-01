(function () {
  'use strict';
  var ERR = 'compound-interest-calculator-error';
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
    if (!TN.el('compound-principal')) return;
    TN.clearErr(ERR);
    var P = num('compound-principal');
    var C = num('compound-monthly');
    var rate = num('compound-rate');
    var years = num('compound-years');
    var freq = parseInt(TN.el('compound-freq').value, 10);
    if (isNaN(P) || P < 0) { TN.setErr(ERR, 'Enter a valid starting principal (0 or more).'); return; }
    if (isNaN(C) || C < 0) { TN.setErr(ERR, 'Enter a valid monthly contribution (0 or more).'); return; }
    if (isNaN(rate) || rate < 0 || rate > 50) { TN.setErr(ERR, 'Enter an annual rate between 0 and 50%.'); return; }
    if (!(years >= 1 && years <= 60)) { TN.setErr(ERR, 'Enter a number of years between 1 and 60.'); return; }
    if (P === 0 && C === 0) { TN.setErr(ERR, 'Enter a starting principal or a monthly contribution — both cannot be zero.'); return; }

    var annual = rate / 100;
    // Equivalent monthly rate from a nominal annual rate compounding at `freq`
    var iM = Math.pow(1 + annual / freq, freq / 12) - 1;

    var bal = P, totContrib = P, rows = [];
    for (var y = 1; y <= years; y++) {
      var start = bal, contribYear = 0;
      for (var m = 0; m < 12; m++) {
        bal = bal * (1 + iM) + C;
        contribYear += C;
        totContrib += C;
      }
      var interestYear = bal - start - contribYear;
      rows.push('<tr><td>' + y + '</td><td>' + money(contribYear) + '</td><td>' + money(interestYear) + '</td><td>' + money(bal) + '</td></tr>');
    }
    var interest = bal - totContrib;

    TN.el('compound-fv').textContent = money(bal);
    TN.el('compound-contrib').textContent = money(totContrib);
    TN.el('compound-interest').textContent = money(interest);
    TN.el('compound-table-body').innerHTML = rows.join('');
  }
  try {
    TN.on('compound-principal', 'input', calc);
    TN.on('compound-monthly', 'input', calc);
    TN.on('compound-rate', 'input', calc);
    TN.on('compound-years', 'input', calc);
    TN.on('compound-freq', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
