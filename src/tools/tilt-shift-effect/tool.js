/* Tilt Shift Effect — sharp focus band, blurred top/bottom with smooth transitions. */
(function () {
  'use strict';
  var SLUG = 'tilt-shift-effect';
  var ERR = SLUG + '-error';
  var srcCanvas = null;
  var MAXW = 1600;

  function apply() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas || !srcCanvas) return;
    var pos = parseInt(document.getElementById(SLUG + '-pos').value, 10) / 100;
    var band = parseInt(document.getElementById(SLUG + '-band').value, 10) / 100;
    var blur = parseInt(document.getElementById(SLUG + '-blur').value, 10) || 2;
    var w = srcCanvas.width, h = srcCanvas.height;
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');

    // blurred layer
    var bc = document.createElement('canvas');
    bc.width = w; bc.height = h;
    var bctx = bc.getContext('2d');
    try { bctx.filter = 'blur(' + blur + 'px)'; } catch (e) {}
    bctx.drawImage(srcCanvas, 0, 0);
    try { bctx.filter = 'none'; } catch (e) {}

    // sharp base
    ctx.drawImage(srcCanvas, 0, 0);

    // mask: alpha 1 (show blur) outside band, 0 inside — with smooth falloff
    var mc = document.createElement('canvas');
    mc.width = 1; mc.height = h;
    var mctx = mc.getContext('2d');
    var md = mctx.createImageData(1, h);
    var cy = pos * h, half = (band * h) / 2, feather = h * 0.18;
    for (var y = 0; y < h; y++) {
      var dist = Math.abs(y - cy) - half;
      var a;
      if (dist <= 0) a = 0;
      else a = Math.min(1, dist / feather);
      // smoothstep
      a = a * a * (3 - 2 * a);
      md.data[y * 4 + 3] = Math.round(a * 255);
    }
    mctx.putImageData(md, 0, 0);

    // draw blurred layer through mask
    var masked = document.createElement('canvas');
    masked.width = w; masked.height = h;
    var xctx = masked.getContext('2d');
    xctx.drawImage(bc, 0, 0);
    xctx.globalCompositeOperation = 'destination-in';
    xctx.drawImage(mc, 0, 0, w, h);
    ctx.drawImage(masked, 0, 0);
  }

  var debApply = null;

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    debApply = TN.debounce(apply, 120);
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
    [['pos', '%'], ['band', '%'], ['blur', 'px']].forEach(function (k) {
      TN.on(SLUG + '-' + k[0], 'input', function () {
        var v = document.getElementById(SLUG + '-' + k[0] + '-val');
        if (v) v.textContent = this.value;
        debApply();
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      var canvas = document.getElementById(SLUG + '-canvas');
      if (!srcCanvas) { TN.setErr(ERR, 'Choose a photo first.'); return; }
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'tilt-shift.png');
          else TN.setErr(ERR, 'Could not export the image.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the image.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
