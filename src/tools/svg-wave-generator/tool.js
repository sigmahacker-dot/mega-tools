/* SVG Wave Generator — smooth sine wave dividers with copyable SVG. */
(function () {
  'use strict';
  var SLUG = 'svg-wave-generator';
  var ERR = SLUG + '-error';
  var W = 1440;

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function wavePath(amp, waves, h, steps) {
    var mid = h / 2;
    var pts = [];
    for (var i = 0; i <= steps; i++) {
      var x = (W * i) / steps;
      var y = mid + amp * Math.sin((Math.PI * 2 * waves * i) / steps);
      pts.push([x, y]);
    }
    /* Catmull-Rom to bezier for a smooth curve */
    var d = 'M ' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var j = 0; j < pts.length - 1; j++) {
      var p0 = pts[Math.max(0, j - 1)], p1 = pts[j], p2 = pts[j + 1], p3 = pts[Math.min(pts.length - 1, j + 2)];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ', ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ', ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }

  function buildSvg(flip, color, h, path) {
    var inner = flip
      ? '<path d="' + path + ' L ' + W + ' 0 L 0 0 Z" fill="' + color + '"/>'
      : '<path d="' + path + ' L ' + W + ' ' + h + ' L 0 ' + h + ' Z" fill="' + color + '"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + h + '" preserveAspectRatio="none" style="width:100%;height:' + h + 'px;display:block">' + inner + '</svg>';
  }

  function render() {
    TN.clearErr(ERR);
    try {
      var amp = parseInt($('amp').value, 10);
      var waves = parseInt($('waves').value, 10);
      var h = parseInt($('height').value, 10);
      var color = $('color').value;
      var flip = $('flip').value === 'yes';
      var smooth = parseInt($('smooth').value, 10);
      $('amp-v').textContent = amp;
      $('waves-v').textContent = waves;
      $('height-v').textContent = h + 'px';
      $('smooth-v').textContent = smooth;
      var path = wavePath(amp, waves, h, smooth);
      var svg = buildSvg(flip, color, h, path);
      $('stage').innerHTML = svg;
      $('code').textContent = svg;
    } catch (e) {
      TN.setErr(ERR, 'Could not render the wave.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['amp', 'waves', 'height', 'color', 'flip', 'smooth'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', render);
        TN.on(SLUG + '-' + k, 'change', render);
      });
      TN.on(SLUG + '-copy', 'click', function () {
        var txt = $('code').textContent;
        if (!txt) { TN.setErr(ERR, 'Nothing to copy yet.'); return; }
        TN.copy(txt).then(function (ok) {
          if (ok) TN.clearErr(ERR);
          else TN.setErr(ERR, 'Copy failed — select the code and copy manually.');
        });
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
