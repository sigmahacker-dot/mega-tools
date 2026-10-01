/* Cylinder volume + surface areas. */
(function () {
  'use strict';
  var SLUG = 'cylinder-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) { return (Math.round(x * 1e6) / 1e6).toString(); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var r = parseFloat($(SLUG + '-r').value), h = parseFloat($(SLUG + '-h').value);
    if (isNaN(r) || isNaN(h) || r < 0 || h < 0) { err('Enter non-negative radius and height.'); return; }
    var v = Math.PI * r * r * h;
    var lat = 2 * Math.PI * r * h;
    var tot = lat + 2 * Math.PI * r * r;
    var lines = [
      'V = \u03C0r\u00B2h = \u03C0 \u00D7 ' + f(r) + '\u00B2 \u00D7 ' + f(h) + ' = ' + f(v),
      'Lateral area = 2\u03C0rh = ' + f(lat) + '   (unwrap the side into a rectangle)',
      'Total SA = lateral + 2 \u00D7 base = ' + f(lat) + ' + 2\u03C0(' + f(r) + ')\u00B2 = ' + f(tot)
    ];
    $(SLUG + '-v').textContent = f(v);
    $(SLUG + '-lat').textContent = f(lat);
    $(SLUG + '-tot').textContent = f(tot);
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-r', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-h', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();