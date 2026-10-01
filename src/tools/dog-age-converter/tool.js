(function () {
  'use strict';
  var S = 'dog-age-converter';
  /* size-based human-year charts, indexed by dog year (0..15) */
  var CHARTS = {
    small:  [0, 15, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76],
    medium: [0, 15, 24, 28, 32, 36, 42, 47, 51, 56, 60, 65, 69, 74, 78, 83],
    large:  [0, 15, 24, 28, 32, 36, 45, 50, 55, 61, 66, 72, 77, 82, 88, 93]
  };
  function chartAge(age, chart) {
    if (age >= chart.length - 1) {
      /* extrapolate with the last interval's slope */
      var n = chart.length - 1;
      return chart[n] + (age - n) * (chart[n] - chart[n - 1]);
    }
    var lo = Math.floor(age), hi = Math.ceil(age);
    if (lo === hi) return chart[lo];
    return chart[lo] + (chart[hi] - chart[lo]) * (age - lo);
  }
  function lifeStage(age) {
    if (age < 1) return 'Puppy';
    if (age < 3) return 'Young adult';
    if (age < 7) return 'Adult';
    return 'Senior';
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var epiEl = TN.el(S + '-epi'), chEl = TN.el(S + '-chart'), stEl = TN.el(S + '-stage');
      var noteEl = TN.el(S + '-note');
      var raw = TN.el(S + '-age').value;
      if (raw === '' || raw === null) {
        [epiEl, chEl, stEl].forEach(function (el) { if (el) el.textContent = '–'; });
        if (noteEl) noteEl.textContent = 'Enter your dog\'s age to compare both methods.';
        return;
      }
      var age = parseFloat(raw);
      if (!isFinite(age) || age < 0) { TN.setErr(S + '-error', 'Enter a non-negative age.'); return; }
      if (age > 30) { TN.setErr(S + '-error', 'That age seems unrealistic — check your value.'); return; }
      var epi = age <= 0 ? 0 : 16 * Math.log(age) + 31;
      var chart = chartAge(age, CHARTS[TN.el(S + '-size').value] || CHARTS.small);
      if (epiEl) epiEl.textContent = Math.round(epi) + ' human yrs';
      if (chEl) chEl.textContent = Math.round(chart) + ' human yrs';
      if (stEl) stEl.textContent = lifeStage(age);
      if (noteEl) {
        noteEl.textContent = 'Epigenetic (Wang et al., Cell Systems 2019): human_age = 16·ln(' + age + ') + 31 ≈ ' +
          (Math.round(epi * 10) / 10) + '. Size-chart interpolation: ≈ ' + (Math.round(chart * 10) / 10) + '.';
      }
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    TN.on(S + '-age', 'input', convert);
    TN.on(S + '-size', 'change', convert);
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
