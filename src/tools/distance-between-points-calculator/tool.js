/* Euclidean distance between two points, 2D or 3D. */
(function () {
  'use strict';
  var SLUG = 'distance-between-points-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) { return (Math.round(x * 1e6) / 1e6).toString(); }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var dim = $(SLUG + '-dim').value;
    var x1 = parseFloat($(SLUG + '-x1').value), y1 = parseFloat($(SLUG + '-y1').value);
    var x2 = parseFloat($(SLUG + '-x2').value), y2 = parseFloat($(SLUG + '-y2').value);
    var z1 = parseFloat($(SLUG + '-z1').value) || 0, z2 = parseFloat($(SLUG + '-z2').value) || 0;
    if ([x1, y1, x2, y2].some(isNaN)) { err('Enter numeric coordinates.'); return; }
    var dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
    var lines = [];
    lines.push('P\u2081 = (' + f(x1) + ', ' + f(y1) + (dim === '3' ? ', ' + f(z1) : '') + '),   P\u2082 = (' + f(x2) + ', ' + f(y2) + (dim === '3' ? ', ' + f(z2) : '') + ')');
    lines.push('\u0394x = ' + f(dx) + ',  \u0394y = ' + f(dy) + (dim === '3' ? ',  \u0394z = ' + f(dz) : ''));
    var d2 = dx * dx + dy * dy + (dim === '3' ? dz * dz : 0);
    var expr = '\u0394x\u00B2 + \u0394y\u00B2' + (dim === '3' ? ' + \u0394z\u00B2' : '');
    lines.push('d = \u221A(' + expr + ') = \u221A(' + f(dx * dx) + ' + ' + f(dy * dy) + (dim === '3' ? ' + ' + f(dz * dz) : '') + ')');
    var d = Math.sqrt(d2);
    lines.push('d = \u221A' + f(d2) + ' = ' + f(d));
    $(SLUG + '-d').textContent = f(d);
    $(SLUG + '-d2').textContent = f(d2);
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-dim', 'change', function () {
      var is3 = $(SLUG + '-dim').value === '3';
      $(SLUG + '-z1w').classList.toggle('hidden', !is3);
      $(SLUG + '-z2w').classList.toggle('hidden', !is3);
      calc();
    });
    ['x1', 'y1', 'z1', 'x2', 'y2', 'z2'].forEach(function (id) { TN.on(SLUG + '-' + id, 'input', TN.debounce(calc, 400)); });
    calc();
  } catch (e) {}
})();