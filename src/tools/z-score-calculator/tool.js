/* Z-score + percentile via normal CDF approximation. */
(function () {
  'use strict';
  var SLUG = 'z-score-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function phi(z) { // standard normal CDF, Abramowitz & Stegun 7.1.26
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var d = 0.3989423 * Math.exp(-z * z / 2);
    var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var x = parseFloat($(SLUG + '-x').value), mu = parseFloat($(SLUG + '-mu').value), sd = parseFloat($(SLUG + '-sigma').value);
    if ([x, mu, sd].some(isNaN)) { err('Enter numbers for x, \u03BC and \u03C3.'); return; }
    if (sd <= 0) { err('\u03C3 must be positive.'); return; }
    var z = (x - mu) / sd;
    var pct = phi(z) * 100;
    var lines = [
      'z = (x \u2212 \u03BC) / \u03C3 = (' + x + ' \u2212 ' + mu + ') / ' + sd + ' = ' + (Math.round(z * 1e6) / 1e6),
      'Interpretation: x is ' + Math.abs(Math.round(z * 100) / 100) + ' standard deviation' + (Math.abs(z) === 1 ? '' : 's') + ' ' + (z >= 0 ? 'above' : 'below') + ' the mean.',
      'Percentile = \u03A6(z) \u00D7 100 \u2248 ' + pct.toFixed(2) + '%   (\u03A6 = standard normal CDF, Abramowitz\u2013Stegun approximation)',
      'So about ' + pct.toFixed(2) + '% of values fall at or below x, and ' + (100 - pct).toFixed(2) + '% fall above.'
    ];
    $(SLUG + '-z').textContent = (Math.round(z * 1e6) / 1e6).toString();
    $(SLUG + '-pct').textContent = pct.toFixed(2) + '%';
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    ['x', 'mu', 'sigma'].forEach(function (id) { TN.on(SLUG + '-' + id, 'input', TN.debounce(calc, 400)); });
    calc();
  } catch (e) {}
})();