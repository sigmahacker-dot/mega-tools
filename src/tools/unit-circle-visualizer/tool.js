/* Unit circle visualizer with live trig values. */
(function () {
  'use strict';
  var SLUG = 'unit-circle-visualizer';
  function $(id) { return document.getElementById(id); }
  var R = 110, NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function draw(deg) {
    var svg = $(SLUG + '-svg');
    svg.innerHTML = '';
    var rad = deg * Math.PI / 180;
    var cx = Math.cos(rad) * R, cy = -Math.sin(rad) * R; // SVG y flipped
    svg.appendChild(el('line', { x1: -140, y1: 0, x2: 140, y2: 0, stroke: '#ccc' }));
    svg.appendChild(el('line', { x1: 0, y1: -140, x2: 0, y2: 140, stroke: '#ccc' }));
    svg.appendChild(el('circle', { cx: 0, cy: 0, r: R, fill: 'none', stroke: '#166534', 'stroke-width': 2 }));
    // radius line
    svg.appendChild(el('line', { x1: 0, y1: 0, x2: cx, y2: cy, stroke: '#d32f2f', 'stroke-width': 2.5 }));
    // cos projection (x) and sin projection (y)
    svg.appendChild(el('line', { x1: cx, y1: 0, x2: cx, y2: cy, stroke: '#1976d2', 'stroke-width': 2, 'stroke-dasharray': '5,4' }));
    svg.appendChild(el('line', { x1: 0, y1: cy, x2: cx, y2: cy, stroke: '#7b1fa2', 'stroke-width': 2, 'stroke-dasharray': '5,4' }));
    svg.appendChild(el('circle', { cx: cx, cy: cy, r: 6, fill: '#d32f2f' }));
    var t = svg.appendChild(el('text', { x: cx + 10, y: cy - 8, 'font-size': 12, fill: '#333' }));
    t.textContent = deg + '\u00B0';
    var s = Math.sin(rad), c = Math.cos(rad), tn = Math.tan(rad);
    $(SLUG + '-sin').textContent = s.toFixed(4);
    $(SLUG + '-cos').textContent = c.toFixed(4);
    $(SLUG + '-tan').textContent = Math.abs(c) < 1e-10 ? '\u00B1\u221E' : tn.toFixed(4);
    $(SLUG + '-pt').textContent = 'Point: (cos \u03B8, sin \u03B8) = (' + c.toFixed(4) + ', ' + s.toFixed(4) + ')   \u00B7   \u03B8 = ' + deg + '\u00B0 = ' + rad.toFixed(4) + ' rad';
  }
  function sync(fromSlider) {
    var v = fromSlider ? parseFloat($(SLUG + '-slider').value) : parseFloat($(SLUG + '-ang').value);
    if (isNaN(v)) return;
    v = Math.max(0, Math.min(360, v));
    $(SLUG + '-ang').value = v;
    $(SLUG + '-slider').value = v;
    draw(v);
  }
  try {
    TN.on(SLUG + '-slider', 'input', function () { sync(true); });
    TN.on(SLUG + '-ang', 'input', function () { sync(false); });
    draw(45);
  } catch (e) {}
})();