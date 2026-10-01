/* Slope, intercept, equation + mini SVG graph. */
(function () {
  'use strict';
  var SLUG = 'slope-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) { return (Math.round(x * 1e6) / 1e6).toString(); }
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function draw(x1, y1, x2, y2, m, b, vertical) {
    var svg = $(SLUG + '-svg');
    svg.innerHTML = '';
    var W = 320, H = 240, pad = 24;
    var xs = [x1, x2], ys = [y1, y2];
    var xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
    var yMin = Math.min.apply(null, ys), yMax = Math.max.apply(null, ys);
    if (xMax - xMin < 1e-9) { xMin -= 1; xMax += 1; }
    if (yMax - yMin < 1e-9) { yMin -= 1; yMax += 1; }
    var xr = (xMax - xMin) * 0.25 + 1e-9, yr = (yMax - yMin) * 0.25 + 1e-9;
    xMin -= xr; xMax += xr; yMin -= yr; yMax += yr;
    function X(x) { return pad + (x - xMin) / (xMax - xMin) * (W - 2 * pad); }
    function Y(y) { return H - pad - (y - yMin) / (yMax - yMin) * (H - 2 * pad); }
    // axes
    if (yMin <= 0 && 0 <= yMax) svg.appendChild(el('line', { x1: X(xMin), y1: Y(0), x2: X(xMax), y2: Y(0), stroke: '#999' }));
    if (xMin <= 0 && 0 <= xMax) svg.appendChild(el('line', { x1: X(0), y1: Y(yMin), x2: X(0), y2: Y(yMax), stroke: '#999' }));
    // line
    var p1x, p1y, p2x, p2y;
    if (vertical) { p1x = x1; p1y = yMin; p2x = x1; p2y = yMax; }
    else { p1x = xMin; p1y = m * xMin + b; p2x = xMax; p2y = m * xMax + b; }
    svg.appendChild(el('line', { x1: X(p1x), y1: Y(p1y), x2: X(p2x), y2: Y(p2y), stroke: '#166534', 'stroke-width': 2.5 }));
    [[x1, y1], [x2, y2]].forEach(function (p) {
      svg.appendChild(el('circle', { cx: X(p[0]), cy: Y(p[1]), r: 5, fill: '#d32f2f' }));
    });
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var x1 = parseFloat($(SLUG + '-x1').value), y1 = parseFloat($(SLUG + '-y1').value);
    var x2 = parseFloat($(SLUG + '-x2').value), y2 = parseFloat($(SLUG + '-y2').value);
    if ([x1, y1, x2, y2].some(isNaN)) { err('Enter numeric coordinates.'); return; }
    var dx = x2 - x1, dy = y2 - y1;
    var lines = [];
    if (Math.abs(dx) < 1e-12) {
      lines.push('x\u2082 \u2212 x\u2081 = 0 \u2192 VERTICAL line x = ' + f(x1));
      lines.push('Slope is undefined (division by zero). No y-intercept.');
      $(SLUG + '-m').textContent = 'undefined';
      $(SLUG + '-b').textContent = '\u2014';
      $(SLUG + '-eq').textContent = 'x = ' + f(x1);
      draw(x1, y1, x2, y2, 0, 0, true);
    } else {
      var m = dy / dx, b = y1 - m * x1;
      lines.push('m = (y\u2082 \u2212 y\u2081) / (x\u2082 \u2212 x\u2081) = ' + f(dy) + ' / ' + f(dx) + ' = ' + f(m));
      lines.push('b = y\u2081 \u2212 m\u00D7x\u2081 = ' + f(y1) + ' \u2212 ' + f(m) + '\u00D7' + f(x1) + ' = ' + f(b));
      lines.push('Equation: y = ' + f(m) + 'x ' + (b >= 0 ? '+ ' + f(b) : '\u2212 ' + f(-b)));
      $(SLUG + '-m').textContent = f(m);
      $(SLUG + '-b').textContent = f(b);
      $(SLUG + '-eq').textContent = 'y = ' + f(m) + 'x ' + (b >= 0 ? '+ ' + f(b) : '\u2212 ' + f(-b));
      draw(x1, y1, x2, y2, m, b, false);
    }
    $(SLUG + '-steps').textContent = lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    ['x1', 'y1', 'x2', 'y2'].forEach(function (id) { TN.on(SLUG + '-' + id, 'input', TN.debounce(calc, 400)); });
    calc();
  } catch (e) {}
})();