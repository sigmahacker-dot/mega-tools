/* Rectangle area, perimeter, diagonal. */
(function () {
  'use strict';
  var SLUG = 'rectangle-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) { return (Math.round(x * 1e6) / 1e6).toString(); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var l = parseFloat($(SLUG + '-l').value), w = parseFloat($(SLUG + '-w').value);
    if (isNaN(l) || isNaN(w) || l < 0 || w < 0) { err('Enter non-negative length and width.'); return; }
    var a = l * w, p = 2 * (l + w), d = Math.sqrt(l * l + w * w);
    var lines = [
      'Area = l \u00D7 w = ' + f(l) + ' \u00D7 ' + f(w) + ' = ' + f(a),
      'Perimeter = 2(l + w) = 2 \u00D7 ' + f(l + w) + ' = ' + f(p),
      'Diagonal = \u221A(l\u00B2 + w\u00B2) = \u221A(' + f(l * l) + ' + ' + f(w * w) + ') = ' + f(d) + '   (Pythagoras)'
    ];
    $(SLUG + '-a').textContent = f(a);
    $(SLUG + '-p').textContent = f(p);
    $(SLUG + '-d').textContent = f(d);
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-l', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-w', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();