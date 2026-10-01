(function () {
  'use strict';
  var ERR = 'rule-of-72-calculator-error';
  function calc() {
    if (!TN.el('r72-rate')) return;
    TN.clearErr(ERR);
    var rate = parseFloat(TN.el('r72-rate').value);
    var years = parseFloat(TN.el('r72-years').value);
    var hasRate = rate > 0, hasYears = years > 0;
    if (!isNaN(rate) && !(rate >= 0)) { TN.setErr(ERR, 'Rate cannot be negative.'); return; }
    if (!isNaN(years) && !(years >= 0)) { TN.setErr(ERR, 'Years cannot be negative.'); return; }
    if (!hasRate && !hasYears) { TN.setErr(ERR, 'Enter a rate or a target number of years.'); return; }
    if (hasRate) {
      var dbl = 72 / rate, tpl = 114 / rate, qd = 144 / rate;
      var rd = rate / 100;
      var exD = Math.log(2) / Math.log(1 + rd), exT = Math.log(3) / Math.log(1 + rd), exQ = Math.log(4) / Math.log(1 + rd);
      TN.el('r72-double').textContent = dbl.toFixed(1) + ' yrs';
      TN.el('r72-triple').textContent = tpl.toFixed(1) + ' yrs';
      TN.el('r72-body').innerHTML =
        '<tr><td>Double (×2)</td><td>' + dbl.toFixed(1) + ' yrs</td><td>' + exD.toFixed(1) + ' yrs</td></tr>' +
        '<tr><td>Triple (×3)</td><td>' + tpl.toFixed(1) + ' yrs</td><td>' + exT.toFixed(1) + ' yrs</td></tr>' +
        '<tr><td>Quadruple (×4)</td><td>' + qd.toFixed(1) + ' yrs</td><td>' + exQ.toFixed(1) + ' yrs</td></tr>';
    } else {
      TN.el('r72-double').textContent = '–';
      TN.el('r72-triple').textContent = '–';
      TN.el('r72-body').innerHTML = '<tr><td colspan="3" class="muted">Enter a rate to see milestones.</td></tr>';
    }
    TN.el('r72-need').textContent = hasYears ? (72 / years).toFixed(2) + '%' : '–';
  }
  try {
    TN.on('r72-rate', 'input', calc);
    TN.on('r72-years', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();