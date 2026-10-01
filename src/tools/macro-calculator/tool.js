(function () {
  'use strict';
  var ERR = 'macro-calculator-error';
  function r1(n) { return (Math.round(n * 10) / 10).toLocaleString('en-US'); }
  function calc() {
    if (!TN.el('macro-calories')) return;
    TN.clearErr(ERR);
    var cal = parseFloat(TN.el('macro-calories').value);
    var weight = parseFloat(TN.el('macro-weight').value);
    var goal = TN.el('macro-goal').value;
    if (!(cal >= 800 && cal <= 10000)) { TN.setErr(ERR, 'Enter daily calories between 800 and 10000.'); return; }
    if (!(weight >= 25 && weight <= 400)) { TN.setErr(ERR, 'Enter a body weight between 25 and 400 kg.'); return; }
    var proteinFactor = goal === 'cut' ? 2.2 : 2.0;
    var pG = proteinFactor * weight;
    var pKcal = pG * 4;
    var fKcal = 0.25 * cal;
    var fG = fKcal / 9;
    var cKcal = cal - pKcal - fKcal;
    if (cKcal < 0) { TN.setErr(ERR, 'Protein and fat minimums exceed your calorie target — raise calories or lower body weight.'); return; }
    var cG = cKcal / 4;
    TN.el('macro-p-g').textContent = r1(pG) + ' g';
    TN.el('macro-p-kcal').textContent = r1(pKcal) + ' kcal';
    TN.el('macro-p-pct').textContent = r1(pKcal / cal * 100) + '%';
    TN.el('macro-f-g').textContent = r1(fG) + ' g';
    TN.el('macro-f-kcal').textContent = r1(fKcal) + ' kcal';
    TN.el('macro-f-pct').textContent = r1(fKcal / cal * 100) + '%';
    TN.el('macro-c-g').textContent = r1(cG) + ' g';
    TN.el('macro-c-kcal').textContent = r1(cKcal) + ' kcal';
    TN.el('macro-c-pct').textContent = r1(cKcal / cal * 100) + '%';
  }
  try {
    ['macro-calories', 'macro-weight', 'macro-goal'].forEach(function (id) {
      TN.on(id, 'input', calc);
      TN.on(id, 'change', calc);
    });
    calc();
  } catch (e) { /* never throw on load */ }
})();
