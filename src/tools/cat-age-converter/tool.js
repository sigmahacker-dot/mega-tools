(function () {
  'use strict';
  var S = 'cat-age-converter';
  function humanYears(age) {
    if (age <= 0) return 0;
    if (age <= 1) return 15 * age;
    if (age <= 2) return 15 + 9 * (age - 1);
    return 24 + 4 * (age - 2);
  }
  function lifeStage(age) {
    if (age < 1) return 'Kitten';
    if (age < 2) return 'Junior';
    if (age < 7) return 'Prime';
    if (age < 11) return 'Mature';
    if (age < 15) return 'Senior';
    return 'Geriatric';
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var raw = TN.el(S + '-age').value;
      var hEl = TN.el(S + '-human'), sEl = TN.el(S + '-stage');
      if (raw === '' || raw === null) {
        if (hEl) hEl.textContent = '–';
        if (sEl) sEl.textContent = '–';
        return;
      }
      var age = parseFloat(raw);
      if (!isFinite(age) || age < 0) { TN.setErr(S + '-error', 'Enter a non-negative age.'); return; }
      if (age > 40) { TN.setErr(S + '-error', 'That age seems unrealistic — check your value.'); return; }
      if (hEl) hEl.textContent = Math.round(humanYears(age)) + ' yrs';
      if (sEl) sEl.textContent = lifeStage(age);
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    var tb = TN.el(S + '-table');
    if (tb) {
      var rows = '';
      var marks = [1, 2, 3, 5, 7, 10, 12, 15, 18, 20];
      for (var i = 0; i < marks.length; i++) {
        rows += '<tr><td>' + marks[i] + '</td><td>' + Math.round(humanYears(marks[i])) + '</td><td>' + lifeStage(marks[i]) + '</td></tr>';
      }
      tb.innerHTML = rows;
    }
    TN.on(S + '-age', 'input', convert);
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
