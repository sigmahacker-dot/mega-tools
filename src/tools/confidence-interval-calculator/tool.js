/* Confidence interval for a mean: z or t critical value. */
(function () {
  'use strict';
  var SLUG = 'confidence-interval-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  var Z = { 90: 1.645, 95: 1.96, 99: 2.576 };
  // t critical values (two-sided) for df 1..30, 40, 60, 120
  var T = {
    90: { 1: 6.314, 2: 2.92, 3: 2.353, 4: 2.132, 5: 2.015, 6: 1.943, 7: 1.895, 8: 1.86, 9: 1.833, 10: 1.812, 11: 1.796, 12: 1.782, 13: 1.771, 14: 1.761, 15: 1.753, 16: 1.746, 17: 1.74, 18: 1.734, 19: 1.729, 20: 1.725, 21: 1.721, 22: 1.717, 23: 1.714, 24: 1.711, 25: 1.708, 26: 1.706, 27: 1.703, 28: 1.701, 29: 1.699, 30: 1.697, 40: 1.684, 60: 1.671, 120: 1.658 },
    95: { 1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228, 11: 2.201, 12: 2.179, 13: 2.16, 14: 2.145, 15: 2.131, 16: 2.12, 17: 2.11, 18: 2.101, 19: 2.093, 20: 2.086, 21: 2.08, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.06, 26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042, 40: 2.021, 60: 2.0, 120: 1.98 },
    99: { 1: 63.657, 2: 9.925, 3: 5.841, 4: 4.604, 5: 4.032, 6: 3.707, 7: 3.499, 8: 3.355, 9: 3.25, 10: 3.169, 11: 3.106, 12: 3.055, 13: 3.012, 14: 2.977, 15: 2.947, 16: 2.921, 17: 2.898, 18: 2.878, 19: 2.861, 20: 2.845, 21: 2.831, 22: 2.819, 23: 2.807, 24: 2.797, 25: 2.787, 26: 2.779, 27: 2.771, 28: 2.763, 29: 2.756, 30: 2.75, 40: 2.704, 60: 2.66, 120: 2.617 }
  };
  function tCrit(conf, df) {
    var tab = T[conf];
    if (tab[df] !== undefined) return { v: tab[df], note: 't-table, df=' + df };
    var keys = Object.keys(tab).map(Number).sort(function (a, b) { return a - b; });
    var lo = keys[0];
    for (var i = 0; i < keys.length; i++) if (keys[i] <= df) lo = keys[i];
    if (df > 120) return { v: Z[conf], note: 'z (df > 120 \u2248 normal)' };
    return { v: tab[lo], note: 't-table, nearest df \u2264 ' + df + ' (df=' + lo + ', conservative)' };
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var mean = parseFloat($(SLUG + '-mean').value), s = parseFloat($(SLUG + '-s').value);
    var n = parseInt($(SLUG + '-n').value, 10), conf = parseInt($(SLUG + '-conf').value, 10);
    if ([mean, s].some(isNaN) || isNaN(n)) { err('Enter mean, s and n.'); return; }
    if (s <= 0) { err('Sample std dev s must be positive.'); return; }
    if (n < 2) { err('Sample size n must be at least 2.'); return; }
    var se = s / Math.sqrt(n);
    var crit, dist;
    if (n >= 30) { crit = { v: Z[conf], note: 'z (n \u2265 30, CLT)' }; dist = 'z'; }
    else { crit = tCrit(conf, n - 1); dist = 't'; }
    var me = crit.v * se;
    var lo = mean - me, hi = mean + me;
    var lines = [
      'Standard error SE = s / \u221An = ' + s + ' / \u221A' + n + ' = ' + (Math.round(se * 1e6) / 1e6),
      'Critical value (' + dist + '): ' + (Math.round(crit.v * 1e4) / 1e4) + '  \u2014 ' + crit.note,
      'Margin of error = critical \u00D7 SE = ' + (Math.round(crit.v * 1e4) / 1e4) + ' \u00D7 ' + (Math.round(se * 1e6) / 1e6) + ' = ' + (Math.round(me * 1e4) / 1e4),
      '',
      conf + '% CI: ' + mean + ' \u00B1 ' + (Math.round(me * 1e4) / 1e4) + '  \u2192  (' + (Math.round(lo * 1e4) / 1e4) + ', ' + (Math.round(hi * 1e4) / 1e4) + ')',
      'Interpretation: we are ' + conf + '% confident the true population mean lies between ' + (Math.round(lo * 1e4) / 1e4) + ' and ' + (Math.round(hi * 1e4) / 1e4) + '.'
    ];
    $(SLUG + '-lo').textContent = (Math.round(lo * 1e4) / 1e4).toString();
    $(SLUG + '-hi').textContent = (Math.round(hi * 1e4) / 1e4).toString();
    $(SLUG + '-me').textContent = (Math.round(me * 1e4) / 1e4).toString();
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    ['mean', 's', 'n'].forEach(function (id) { TN.on(SLUG + '-' + id, 'input', TN.debounce(calc, 400)); });
    TN.on(SLUG + '-conf', 'change', calc);
    calc();
  } catch (e) {}
})();