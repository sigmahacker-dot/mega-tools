(function () {
  'use strict';
  var ERR = 'water-intake-calculator-error';
  var ACTIVITY_ML = { sedentary: 0, light: 250, moderate: 500, intense: 750 };
  function r1(n) { return (Math.round(n * 10) / 10).toLocaleString('en-US'); }
  function calc() {
    if (!TN.el('water-weight')) return;
    TN.clearErr(ERR);
    var weight = parseFloat(TN.el('water-weight').value);
    if (!(weight >= 25 && weight <= 400)) { TN.setErr(ERR, 'Enter a body weight between 25 and 400 kg.'); return; }
    var activity = TN.el('water-activity').value;
    var ml = weight * 35 + (ACTIVITY_ML[activity] || 0);
    if (TN.el('water-hot').checked) ml += 500;
    TN.el('water-liters').textContent = r1(ml / 1000) + ' L';
    TN.el('water-glasses').textContent = r1(ml / 250);
    TN.el('water-oz').textContent = r1(ml / 29.5735) + ' fl oz';
  }
  try {
    TN.on('water-weight', 'input', calc);
    TN.on('water-activity', 'change', calc);
    TN.on('water-hot', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
