(function () {
  'use strict';
  var ERR = 'vo2max-estimator-error';
  function rating(v) {
    if (v < 30) return 'Poor';
    if (v < 38) return 'Below average';
    if (v < 45) return 'Average';
    if (v < 52) return 'Good';
    return 'Excellent';
  }
  function calc() {
    if (!TN.el('vo2-dist')) return;
    TN.clearErr(ERR);
    var method = TN.el('vo2-method').value;
    var v = NaN;
    if (method === 'cooper') {
      var d = parseFloat(TN.el('vo2-dist').value);
      if (!(d > 0)) { TN.setErr(ERR, 'Enter the distance you covered in 12 minutes (meters).'); return; }
      if (d > 6000) { TN.setErr(ERR, 'That distance is beyond human limits — check your entry.'); return; }
      v = (d - 504.9) / 44.73;
    } else {
      var age = parseInt(TN.el('vo2-age').value, 10);
      var rest = parseInt(TN.el('vo2-rest').value, 10);
      if (!(age >= 10 && age <= 100)) { TN.setErr(ERR, 'Enter an age between 10 and 100.'); return; }
      if (!(rest >= 30 && rest <= 120)) { TN.setErr(ERR, 'Enter a resting heart rate between 30 and 120 bpm.'); return; }
      var maxHR = 208 - 0.7 * age;
      v = 15 * (maxHR / rest);
    }
    TN.el('vo2-score').textContent = v.toFixed(1);
    TN.el('vo2-rating').textContent = rating(v);
  }
  try {
    TN.on('vo2-method', 'change', calc);
    TN.on('vo2-dist', 'input', calc);
    TN.on('vo2-age', 'input', calc);
    TN.on('vo2-rest', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();