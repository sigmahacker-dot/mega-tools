/* SVG Blob Generator — deterministic seeded blobs, smooth Catmull-Rom paths. */
(function () {
  'use strict';
  var SLUG = 'svg-blob-generator';
  var ERR = SLUG + '-error';
  var SIZE = 300, R = 110;

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  /* mulberry32 PRNG — deterministic per seed */
  function prng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function blobPath(seed, points, round, wobble) {
    var rnd = prng(seed);
    var cx = SIZE / 2, cy = SIZE / 2;
    var pts = [];
    for (var i = 0; i < points; i++) {
      var ang = (Math.PI * 2 * i) / points;
      var r = R * (1 - wobble + rnd() * wobble * 2);
      pts.push([cx + r * Math.cos(ang), cy + r * Math.sin(ang)]);
    }
    var d = 'M ' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var j = 0; j < points; j++) {
      var p0 = pts[(j - 1 + points) % points], p1 = pts[j], p2 = pts[(j + 1) % points], p3 = pts[(j + 2) % points];
      var k = round / 6;
      var c1x = p1[0] + (p2[0] - p0[0]) * k, c1y = p1[1] + (p2[1] - p0[1]) * k;
      var c2x = p2[0] - (p3[0] - p1[0]) * k, c2y = p2[1] - (p3[1] - p1[1]) * k;
      d += ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ', ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ', ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d + ' Z';
  }

  function shade(hex, amt) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return hex;
    var c = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)].map(function (v) {
      return Math.max(0, Math.min(255, v + amt)).toString(16).padStart(2, '0');
    });
    return '#' + c.join('');
  }

  function buildSvg(color, fillStyle, path) {
    var fill = color, defs = '';
    if (fillStyle === 'grad') {
      defs = '<defs><linearGradient id="blobg" x1="0" y1="0" x2="1" y2="1">'
        + '<stop offset="0" stop-color="' + shade(color, 50) + '"/><stop offset="1" stop-color="' + shade(color, -60) + '"/></linearGradient></defs>';
      fill = 'url(#blobg)';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + SIZE + ' ' + SIZE + '" style="width:280px;height:280px">' + defs + '<path d="' + path + '" fill="' + fill + '"/></svg>';
  }

  function render() {
    TN.clearErr(ERR);
    try {
      var seed = parseInt($('seed').value, 10);
      var points = parseInt($('points').value, 10);
      var round = parseFloat($('round').value);
      var wobble = parseFloat($('wobble').value);
      var color = $('color').value;
      var fillStyle = $('fill').value;
      $('seed-v').textContent = seed;
      $('points-v').textContent = points;
      $('round-v').textContent = round.toFixed(2);
      $('wobble-v').textContent = wobble.toFixed(2);
      var path = blobPath(seed, points, round, wobble);
      var svg = buildSvg(color, fillStyle, path);
      $('stage').innerHTML = svg;
      $('code').textContent = svg;
    } catch (e) {
      TN.setErr(ERR, 'Could not render the blob.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['seed', 'points', 'round', 'wobble', 'color', 'fill'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', render);
        TN.on(SLUG + '-' + k, 'change', render);
      });
      TN.on(SLUG + '-random', 'click', function () {
        $('seed').value = 1 + Math.floor(Math.random() * 999);
        render();
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
