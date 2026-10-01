(function () {
  'use strict';
  var ERR = 'heart-rate-zone-calculator-error';
  var ZONES = [
    { n: 'Zone 1', lo: 50, hi: 60, purpose: 'Recovery — easy warm-up and cool-down' },
    { n: 'Zone 2', lo: 60, hi: 70, purpose: 'Fat burn — steady endurance base' },
    { n: 'Zone 3', lo: 70, hi: 80, purpose: 'Aerobic — builds cardio fitness' },
    { n: 'Zone 4', lo: 80, hi: 90, purpose: 'Threshold — challenging tempo efforts' },
    { n: 'Zone 5', lo: 90, hi: 100, purpose: 'Maximum — short all-out intervals' }
  ];
  function calc() {
    if (!TN.el('hr-age')) return;
    TN.clearErr(ERR);
    var age = parseFloat(TN.el('hr-age').value);
    var resting = parseFloat(TN.el('hr-resting').value);
    if (!(age >= 10 && age <= 100)) { TN.setErr(ERR, 'Enter an age between 10 and 100.'); return; }
    if (!(resting >= 30 && resting <= 120)) { TN.setErr(ERR, 'Enter a resting heart rate between 30 and 120 BPM.'); return; }
    var max = 220 - age;
    if (resting >= max) { TN.setErr(ERR, 'Resting heart rate must be below your estimated max heart rate.'); return; }
    var hrr = max - resting;
    TN.el('hr-max').textContent = String(Math.round(max));
    TN.el('hr-zone-body').innerHTML = ZONES.map(function (z) {
      var lo = Math.round(resting + hrr * z.lo / 100);
      var hi = Math.round(resting + hrr * z.hi / 100);
      return '<tr><td>' + z.n + '</td><td>' + z.lo + '–' + z.hi + '%</td><td>' + lo + '–' + hi + ' BPM</td><td>' + z.purpose + '</td></tr>';
    }).join('');
  }
  try {
    TN.on('hr-age', 'input', calc);
    TN.on('hr-resting', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
