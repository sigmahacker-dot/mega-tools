(function () {
  'use strict';
  var ERR = 'retirement-calculator-error';
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
    if (!TN.el('retire-age-now')) return;
    TN.clearErr(ERR);
    var ageNow = num('retire-age-now');
    var ageRetire = num('retire-age-retire');
    var savings = num('retire-savings');
    var monthly = num('retire-monthly');
    var ret = num('retire-return');
    if (!(ageNow >= 16 && ageNow <= 90)) { TN.setErr(ERR, 'Enter a current age between 16 and 90.'); return; }
    if (!(ageRetire > ageNow && ageRetire <= 100)) { TN.setErr(ERR, 'Retirement age must be greater than your current age.'); return; }
    if (isNaN(savings) || savings < 0) { TN.setErr(ERR, 'Enter valid current savings (0 or more).'); return; }
    if (isNaN(monthly) || monthly < 0) { TN.setErr(ERR, 'Enter a valid monthly contribution (0 or more).'); return; }
    if (isNaN(ret) || ret < 0 || ret > 30) { TN.setErr(ERR, 'Enter an expected annual return between 0 and 30%.'); return; }
    if (savings === 0 && monthly === 0) { TN.setErr(ERR, 'Enter some savings or a monthly contribution — both cannot be zero.'); return; }

    var years = Math.floor(ageRetire - ageNow);
    var iM = Math.pow(1 + ret / 100, 1 / 12) - 1;
    var bal = savings, totContrib = savings, rows = [];
    for (var y = 1; y <= years; y++) {
      var start = bal, contribYear = 0;
      for (var m = 0; m < 12; m++) {
        bal = bal * (1 + iM) + monthly;
        contribYear += monthly;
        totContrib += monthly;
      }
      var growthYear = bal - start - contribYear;
      rows.push('<tr><td>' + (Math.floor(ageNow) + y) + '</td><td>' + money(contribYear) + '</td><td>' + money(growthYear) + '</td><td>' + money(bal) + '</td></tr>');
    }
    var growth = bal - totContrib;
    TN.el('retire-projected').textContent = money(bal);
    TN.el('retire-contrib').textContent = money(totContrib);
    TN.el('retire-growth').textContent = money(growth);
    TN.el('retire-table-body').innerHTML = rows.join('');
  }
  try {
    ['retire-age-now', 'retire-age-retire', 'retire-savings', 'retire-monthly', 'retire-return'].forEach(function (id) {
      TN.on(id, 'input', calc);
    });
    calc();
  } catch (e) { /* never throw on load */ }
})();
