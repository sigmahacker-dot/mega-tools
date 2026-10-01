/* Color Splash Effect — keep one color, desaturate everything else. */
(function () {
  'use strict';
  var SLUG = 'color-splash-effect';
  var ERR = SLUG + '-error';
  var srcCanvas = null; // original
  var MAXW = 1600;

  function hexToRgb(h) {
    h = h.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function apply() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas || !srcCanvas) return;
    var colorEl = document.getElementById(SLUG + '-color');
    var tolEl = document.getElementById(SLUG + '-tol');
    var t = hexToRgb(colorEl ? colorEl.value : '#e11d48');
    var tol = tolEl ? parseInt(tolEl.value, 10) : 80;
    var tol2 = tol * tol;

    canvas.width = srcCanvas.width;
    canvas.height = srcCanvas.height;
    var ctx = canvas.getContext('2d');
    var sctx = srcCanvas.getContext('2d');
    var d = sctx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    var px = d.data;
    for (var i = 0; i < px.length; i += 4) {
      var r = px[i], g = px[i + 1], b = px[i + 2];
      var dr = r - t[0], dg = g - t[1], db = b - t[2];
      if (dr * dr + dg * dg + db * db > tol2) {
        var lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        px[i] = px[i + 1] = px[i + 2] = lum;
      }
    }
    ctx.putImageData(d, 0, 0);
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      TN.clearErr(ERR);
      TN.readAsDataURL(f).then(TN.loadImage).then(function (im) {
        var s = Math.min(1, MAXW / im.naturalWidth);
        srcCanvas = document.createElement('canvas');
        srcCanvas.width = Math.round(im.naturalWidth * s);
        srcCanvas.height = Math.round(im.naturalHeight * s);
        srcCanvas.getContext('2d').drawImage(im, 0, 0, srcCanvas.width, srcCanvas.height);
        apply();
      }).catch(function () {
        TN.setErr(ERR, 'That file could not be read as an image. Try a JPG, PNG or WebP file.');
      });
    });
    TN.on(SLUG + '-color', 'input', TN.debounce(apply, 100));
    TN.on(SLUG + '-tol', 'input', function () {
      var v = document.getElementById(SLUG + '-tol-val');
      if (v) v.textContent = this.value;
      apply();
    });
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      var canvas = document.getElementById(SLUG + '-canvas');
      if (!srcCanvas) { TN.setErr(ERR, 'Choose a photo first.'); return; }
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'color-splash.png');
          else TN.setErr(ERR, 'Could not export the image.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the image.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
