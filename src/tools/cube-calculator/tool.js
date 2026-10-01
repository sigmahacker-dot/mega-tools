/* Cube properties from side length. */
(function () {
  'use strict';
  var SLUG = 'cube-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) { return (Math.round(x * 1e6) / 1e6).toString(); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var s = parseFloat($(SLUG + '-s').value);
    if (isNaN(s) || s < 0) { err('Enter a non-negative side length.'); return; }
    var v = Math.pow(s, 3), sa = 6 * s * s, fd = s * Math.SQRT2, sd = s * Math.sqrt(3);
    var lines = [
      'V = s\u00B3 = ' + f(v),
      'SA = 6s\u00B2 = 6 \u00D7 ' + f(s * s) + ' = ' + f(sa) + '   (6 identical square faces)',
      'Face diagonal = s\u221A2 = ' + f(fd),
      'Space diagonal = s\u221A3 = ' + f(sd) + '   (corner to opposite corner through the cube)'
    ];
    $(SLUG + '-v').textContent = f(v);
    $(SLUG + '-sa').textContent = f(sa);
    $(SLUG + '-dg').textContent = f(sd);
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-s', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();