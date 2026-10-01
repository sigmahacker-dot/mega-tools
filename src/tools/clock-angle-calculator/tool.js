/* Clock hand angle with formula + dial drawing. */
(function () {
  'use strict';
  var SLUG = 'clock-angle-calculator';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) { return (Math.round(x * 1e6) / 1e6).toString(); }
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function draw(h, m) {
    var svg = $(SLUG + '-svg');
    svg.innerHTML = '';
    var cx = 110, cy = 110, R = 95;
    svg.appendChild(el('circle', { cx: cx, cy: cy, r: R, fill: 'none', stroke: '#333', 'stroke-width': 2 }));
    for (var i = 0; i < 12; i++) {
      var a = i * 30 * Math.PI / 180;
      svg.appendChild(el('line', {
        x1: cx + Math.sin(a) * (R - 10), y1: cy - Math.cos(a) * (R - 10),
        x2: cx + Math.sin(a) * R, y2: cy - Math.cos(a) * R, stroke: '#333', 'stroke-width': i % 3 === 0 ? 3 : 1
      }));
    }
    var ha = (h % 12) * 30 + m * 0.5, ma = m * 6;
    function hand(deg, len, w, color) {
      var r = deg * Math.PI / 180;
      svg.appendChild(el('line', { x1: cx, y1: cy, x2: cx + Math.sin(r) * len, y2: cy - Math.cos(r) * len, stroke: color, 'stroke-width': w, 'stroke-linecap': 'round' }));
    }
    hand(ma, 75, 4, '#1976d2');
    hand(ha, 50, 6, '#d32f2f');
    svg.appendChild(el('circle', { cx: cx, cy: cy, r: 6, fill: '#333' }));
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var h = parseInt($(SLUG + '-h').value, 10), m = parseInt($(SLUG + '-m').value, 10);
    if (isNaN(h) || isNaN(m) || h < 1 || h > 12 || m < 0 || m > 59) { err('Hour 1\u201312, minute 0\u201359.'); return; }
    var hourAngle = (h % 12) * 30 + m * 0.5;
    var minAngle = m * 6;
    var diff = Math.abs(hourAngle - minAngle);
    var small = Math.min(diff, 360 - diff);
    var big = 360 - small;
    var lines = [
      'Hour hand: 30\u00B0 per hour + 0.5\u00B0 per minute = 30\u00D7' + (h % 12) + ' + 0.5\u00D7' + m + ' = ' + f(hourAngle) + '\u00B0',
      'Minute hand: 6\u00B0 per minute = 6\u00D7' + m + ' = ' + f(minAngle) + '\u00B0',
      '|difference| = |' + f(hourAngle) + ' \u2212 ' + f(minAngle) + '| = ' + f(diff) + '\u00B0',
      'Smaller angle = min(' + f(diff) + '\u00B0, 360\u00B0 \u2212 ' + f(diff) + '\u00B0) = ' + f(small) + '\u00B0',
      'Reflex angle = 360\u00B0 \u2212 ' + f(small) + '\u00B0 = ' + f(big) + '\u00B0'
    ];
    $(SLUG + '-ang').textContent = f(small) + '\u00B0';
    $(SLUG + '-big').textContent = f(big) + '\u00B0';
    $(SLUG + '-steps').textContent = lines.join('\n');
    draw(h, m);
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-h', 'input', TN.debounce(calc, 400));
    TN.on(SLUG + '-m', 'input', TN.debounce(calc, 400));
    calc();
  } catch (e) {}
})();