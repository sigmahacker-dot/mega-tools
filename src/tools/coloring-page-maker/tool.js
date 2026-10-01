/* Coloring Page Maker — Sobel edge detection → black-and-white coloring page. */
(function () {
  'use strict';
  var SLUG = 'coloring-page-maker';
  var ERR = SLUG + '-error';
  var gray = null, gw = 0, gh = 0;
  var MAXW = 1200;

  function toGray(im, blurPx) {
    var s = Math.min(1, MAXW / im.naturalWidth);
    var w = Math.round(im.naturalWidth * s), h = Math.round(im.naturalHeight * s);
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    if (blurPx > 0) { try { x.filter = 'blur(' + blurPx + 'px)'; } catch (e) {} }
    x.drawImage(im, 0, 0, w, h);
    try { x.filter = 'none'; } catch (e) {}
    var d = x.getImageData(0, 0, w, h).data;
    var g = new Float32Array(w * h);
    for (var i = 0; i < w * h; i++) {
      g[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
    }
    return { g: g, w: w, h: h };
  }

  function apply() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas || !gray) return;
    var thr = parseInt(document.getElementById(SLUG + '-threshold').value, 10) || 60;
    var invert = document.getElementById(SLUG + '-invert').checked;
    var w = gw, h = gh, g = gray;
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    var out = ctx.createImageData(w, h);
    var px = out.data;
    // Sobel kernels
    for (var y = 1; y < h - 1; y++) {
      for (var x = 1; x < w - 1; x++) {
        var i = y * w + x;
        var gx = -g[i - w - 1] - 2 * g[i - 1] - g[i + w - 1] + g[i - w + 1] + 2 * g[i + 1] + g[i + w + 1];
        var gy = -g[i - w - 1] - 2 * g[i - w] - g[i - w + 1] + g[i + w - 1] + 2 * g[i + w] + g[i + w + 1];
        var mag = Math.sqrt(gx * gx + gy * gy);
        var edge = mag > thr;
        var v = edge ? 0 : 255;
        if (invert) v = 255 - v;
        var o = i * 4;
        px[o] = px[o + 1] = px[o + 2] = v;
        px[o + 3] = 255;
      }
    }
    // border rows/cols: white (or black if inverted)
    var bv = invert ? 0 : 255;
    for (var bx = 0; bx < w; bx++) {
      var t1 = bx * 4, t2 = ((h - 1) * w + bx) * 4;
      px[t1] = px[t1 + 1] = px[t1 + 2] = bv; px[t1 + 3] = 255;
      px[t2] = px[t2 + 1] = px[t2 + 2] = bv; px[t2 + 3] = 255;
    }
    for (var by = 0; by < h; by++) {
      var l1 = (by * w) * 4, l2 = (by * w + w - 1) * 4;
      px[l1] = px[l1 + 1] = px[l1 + 2] = bv; px[l1 + 3] = 255;
      px[l2] = px[l2 + 1] = px[l2 + 2] = bv; px[l2 + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  }

  function recompute() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas || !window.__cpmImg) return;
    var blur = parseInt(document.getElementById(SLUG + '-blur').value, 10) || 0;
    var r = toGray(window.__cpmImg, blur);
    gray = r.g; gw = r.w; gh = r.h;
    apply();
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      TN.clearErr(ERR);
      TN.readAsDataURL(f).then(TN.loadImage).then(function (im) {
        window.__cpmImg = im;
        recompute();
      }).catch(function () {
        TN.setErr(ERR, 'That file could not be read as an image. Try a JPG, PNG or WebP file.');
      });
    });
    TN.on(SLUG + '-threshold', 'input', function () {
      var v = document.getElementById(SLUG + '-threshold-val');
      if (v) v.textContent = this.value;
      apply();
    });
    TN.on(SLUG + '-blur', 'input', function () {
      var v = document.getElementById(SLUG + '-blur-val');
      if (v) v.textContent = this.value;
      recompute();
    });
    TN.on(SLUG + '-invert', 'change', apply);
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      var canvas = document.getElementById(SLUG + '-canvas');
      if (!gray) { TN.setErr(ERR, 'Choose a photo first.'); return; }
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'coloring-page.png');
          else TN.setErr(ERR, 'Could not export the page.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the page.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
