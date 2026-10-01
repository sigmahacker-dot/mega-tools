/* Regular polygon angles. */
(function () {
  'use strict';
  var SLUG = 'polygon-angle-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) { return (Math.round(x * 1e6) / 1e6).toString(); }
  var NAMES = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };
  function calc() {
    TN.clearErr(SLUG + '-error');
    var n = parseInt($(SLUG + '-n').value, 10);
    if (isNaN(n) || n < 3) { err('A polygon needs at least 3 sides.'); return; }
    var sum = (n - 2) * 180;
    var interior = sum / n;
    var exterior = 360 / n;
    var lines = [
      'Regular ' + (NAMES[n] || n + '-gon') + ' (n = ' + n + ')',
      'Sum of interior angles = (n \u2212 2) \u00D7 180\u00B0 = ' + (n - 2) + ' \u00D7 180\u00B0 = ' + f(sum) + '\u00B0',
      'Each interior angle = sum / n = ' + f(sum) + '\u00B0 / ' + n + ' = ' + f(interior) + '\u00B0',
      'Each exterior angle = 360\u00B0 / n = ' + f(exterior) + '\u00B0',
      'Check: interior + exterior = ' + f(interior + exterior) + '\u00B0 = 180\u00B0 \u2713'
    ];
    $(SLUG + '-int').textContent = f(interior) + '\u00B0';
    $(SLUG + '-ext').textContent = f(exterior) + '\u00B0';
    $(SLUG + '-sum').textContent = f(sum) + '\u00B0';
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-n', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();