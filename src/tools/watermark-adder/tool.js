/* Watermark Adder — text watermark with position/opacity/angle/tile, live preview. */
(function () {
  'use strict';
  var SLUG = 'watermark-adder';
  var ERR = SLUG + '-error';
  var img = null;

  function $(id) { return document.getElementById(id); }
  function val(id) { var e = $(id); return e ? e.value : ''; }

  function hexToRgb(h) {
    h = (h || '#ffffff').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }

  function drawMark(ctx, text, x, y, size, rgb, alpha, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180);
    ctx.globalAlpha = alpha;
    ctx.font = 'bold ' + size + 'px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',1)';
    // subtle dark outline for readability on light backgrounds
    ctx.strokeStyle = 'rgba(0,0,0,' + (alpha * 0.6) + ')';
    ctx.lineWidth = Math.max(1, size / 24);
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  function render() {
    if (!img) return;
    var text = val('watermark-adder-text') || '';
    if (!text.trim()) { TN.setErr(ERR, 'Type some watermark text first.'); return; }
    TN.clearErr(ERR);
    var cv = $('watermark-adder-canvas');
    cv.width = img.naturalWidth;
    cv.height = img.naturalHeight;
    var ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var size = parseInt(val('watermark-adder-size'), 10) || 48;
    var opacity = (parseInt(val('watermark-adder-opacity'), 10) || 60) / 100;
    var angle = parseInt(val('watermark-adder-angle'), 10) || 0;
    var rgb = hexToRgb(val('watermark-adder-color'));
    var W = cv.width, H = cv.height;
    if ($('watermark-adder-tile').checked) {
      ctx.font = 'bold ' + size + 'px Arial, sans-serif';
      var tw = ctx.measureText(text).width;
      var stepX = tw + size * 1.5, stepY = size * 3;
      for (var y = stepY / 2; y < H + stepY; y += stepY) {
        for (var x = stepX / 2; x < W + stepX; x += stepX) {
          drawMark(ctx, text, x, y, size, rgb, opacity, angle || -30);
        }
      }
    } else {
      var pos = val('watermark-adder-pos');
      var pad = size * 0.6;
      var x = W / 2, y = H / 2;
      if (pos[0] === 't') y = pad; else if (pos[0] === 'b') y = H - pad;
      if (pos[1] === 'l') x = pad; else if (pos[1] === 'r') x = W - pad;
      else if (pos[1] === 'c' && pos.length === 2) x = W / 2;
      drawMark(ctx, text, x, y, size, rgb, opacity, angle);
    }
    $('watermark-adder-result').hidden = false;
    $('watermark-adder-dl').disabled = false;
  }

  try {
    ['watermark-adder-text', 'watermark-adder-pos', 'watermark-adder-size',
     'watermark-adder-opacity', 'watermark-adder-color', 'watermark-adder-angle'
    ].forEach(function (id) {
      TN.on(id, 'input', function () {
        var map = { 'watermark-adder-size': 'watermark-adder-size-v', 'watermark-adder-opacity': 'watermark-adder-opacity-v', 'watermark-adder-angle': 'watermark-adder-angle-v' };
        if (map[id]) $(map[id]).textContent = $(id).value;
        render();
      });
      TN.on(id, 'change', render);
    });
    TN.on('watermark-adder-tile', 'change', render);
    TN.on('watermark-adder-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var url = URL.createObjectURL(f);
      var im = new Image();
      im.onload = function () { img = im; URL.revokeObjectURL(url); TN.clearErr(ERR); render(); };
      im.onerror = function () { URL.revokeObjectURL(url); TN.setErr(ERR, 'Could not read that file as an image.'); };
      im.src = url;
    });
    TN.on('watermark-adder-dl', 'click', function () {
      var cv = $('watermark-adder-canvas');
      cv.toBlob(function (b) {
        if (!b) { TN.setErr(ERR, 'Could not export the image.'); return; }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'watermarked.png';
        document.body.appendChild(a); a.click();
        setTimeout(function () { document.body.removeChild(a); }, 100);
      }, 'image/png');
    });
  } catch (e) { /* never throw on load */ }
})();
