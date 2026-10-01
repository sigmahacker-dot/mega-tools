(function () {
  'use strict';
  var ERR = 'calorie-calculator-error';
  function whole(n) {
    try { return Math.round(n).toLocaleString('en-US'); }
    catch (e) { return String(Math.round(n)); }
  }
  function num(id) {
    var el = TN.el(id);
    if (!el) return NaN;
    return parseFloat(el.value);
  }
  function calc() {
    if (!TN.el('cal-age')) return;
    TN.clearErr(ERR);
    var sex = TN.el('cal-sex').value;
    var age = num('cal-age');
    var height = num('cal-height');
    var weight = num('cal-weight');
    var factor = parseFloat(TN.el('cal-activity').value);
    if (!(age >= 10 && age <= 100)) { TN.setErr(ERR, 'Enter an age between 10 and 100.'); return; }
    if (!(height >= 100 && height <= 250)) { TN.setErr(ERR, 'Enter a height between 100 and 250 cm.'); return; }
    if (!(weight >= 25 && weight <= 400)) { TN.setErr(ERR, 'Enter a weight between 25 and 400 kg.'); return; }
    // Mifflin-St Jeor
    var bmr = 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161);
    var tdee = bmr * factor;
    TN.el('cal-bmr').textContent = whole(bmr);
    TN.el('cal-tdee').textContent = whole(tdee);
    TN.el('cal-lose').textContent = whole(tdee - 500) + ' kcal';
    TN.el('cal-maintain').textContent = whole(tdee) + ' kcal';
    TN.el('cal-gain').textContent = whole(tdee + 300) + ' kcal';
  }
  try {
    ['cal-sex', 'cal-age', 'cal-height', 'cal-weight', 'cal-activity'].forEach(function (id) {
      TN.on(id, 'input', calc);
      TN.on(id, 'change', calc);
    });
    calc();
  } catch (e) { /* never throw on load */ }
})();
