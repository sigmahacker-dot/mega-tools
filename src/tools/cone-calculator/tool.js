/* Cone: volume, slant height, surface area. */
(function () {
  'use strict';
  var SLUG = 'cone-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) { return (Math.round(x * 1e6) / 1e6).toString(); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var r = parseFloat($(SLUG + '-r').value), h = parseFloat($(SLUG + '-h').value);
    if (isNaN(r) || isNaN(h) || r < 0 || h < 0) { err('Enter non-negative radius and height.'); return; }
    var l = Math.sqrt(r * r + h * h);
    var v = Math.PI * r * r * h / 3;
    var lat = Math.PI * r * l;
    var tot = lat + Math.PI * r * r;
    var lines = [
      'Slant height l = \u221A(r\u00B2 + h\u00B2) = \u221A(' + f(r * r) + ' + ' + f(h * h) + ') = ' + f(l),
      'V = (1/3)\u03C0r\u00B2h = ' + f(v) + '   (a cone is 1/3 of its cylinder)',
      'Lateral area = \u03C0rl = ' + f(lat),
      'Total SA = \u03C0rl + \u03C0r\u00B2 = ' + f(tot)
    ];
    $(SLUG + '-v').textContent = f(v);
    $(SLUG + '-sl').textContent = f(l);
    $(SLUG + '-sa').textContent = f(tot);
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-r', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-h', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();