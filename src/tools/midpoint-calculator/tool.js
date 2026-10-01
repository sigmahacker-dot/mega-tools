/* Midpoint of a segment, 2D or 3D. */
(function () {
  'use strict';
  var SLUG = 'midpoint-calculator';
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
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, mz = (z1 + z2) / 2;
    var lines = [
      'M = ((x\u2081 + x\u2082)/2, (y\u2081 + y\u2082)/2' + (dim === '3' ? ', (z\u2081 + z\u2082)/2' : '') + ')',
      'x: (' + f(x1) + ' + ' + f(x2) + ') / 2 = ' + f(mx),
      'y: (' + f(y1) + ' + ' + f(y2) + ') / 2 = ' + f(my)
    ];
    if (dim === '3') lines.push('z: (' + f(z1) + ' + ' + f(z2) + ') / 2 = ' + f(mz));
    var mstr = '(' + f(mx) + ', ' + f(my) + (dim === '3' ? ', ' + f(mz) : '') + ')';
    lines.push('\nMidpoint M = ' + mstr);
    $(SLUG + '-m').textContent = mstr;
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