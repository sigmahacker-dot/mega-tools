(function () {
  'use strict';
  var ERR = 'carb-cycling-calculator-error';
  function calc() {
    if (!TN.el('cc-weight')) return;
    TN.clearErr(ERR);
    var wlb = parseFloat(TN.el('cc-weight').value);
    var hin = parseFloat(TN.el('cc-height').value);
    var age = parseInt(TN.el('cc-age').value, 10);
    var sex = TN.el('cc-sex').value;
    var act = parseFloat(TN.el('cc-activity').value);
    var goal = parseFloat(TN.el('cc-goal').value);
    if (!(wlb > 0)) { TN.setErr(ERR, 'Enter a weight greater than 0 lb.'); return; }
    if (!(hin > 0)) { TN.setErr(ERR, 'Enter a height greater than 0 inches.'); return; }
    if (!(age >= 10 && age <= 100)) { TN.setErr(ERR, 'Enter an age between 10 and 100.'); return; }
    var wkg = wlb / 2.20462, hcm = hin * 2.54;
    var bmr = 10 * wkg + 6.25 * hcm - 5 * age + (sex === 'm' ? 5 : -161);
    var target = bmr * act * goal;
    var protein = wlb * 1;
    function day(label, carbPerLb) {
      var carbs = wlb * carbPerLb;
      var fat = Math.max(wlb * 0.3, (target - protein * 4 - carbs * 4) / 9);
      var cals = protein * 4 + carbs * 4 + fat * 9;
      return '<tr><td>' + label + '</td><td>' + Math.round(carbs) + ' g</td><td>' + Math.round(fat) + ' g</td><td>' + Math.round(cals) + '</td></tr>';
    }
    TN.el('cc-tdee').textContent = Math.round(target) + ' cal';
    TN.el('cc-protein').textContent = Math.round(protein) + ' g';
    TN.el('cc-body').innerHTML = day('High carb (training)', 2) + day('Medium carb', 1.25) + day('Low carb (rest)', 0.5);
  }
  try {
    ['cc-weight', 'cc-height', 'cc-age'].forEach(function (id) { TN.on(id, 'input', calc); });
    ['cc-sex', 'cc-activity', 'cc-goal'].forEach(function (id) { TN.on(id, 'change', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();