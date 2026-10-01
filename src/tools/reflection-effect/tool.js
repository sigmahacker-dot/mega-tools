/* Reflection Effect — flipped mirror copy below the image with gradient fade. */
(function () {
  'use strict';
  var SLUG = 'reflection-effect';
  var ERR = SLUG + '-error';
  var img = null;
  var MAXW = 1600;

  function apply() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas) return;
    var rh = (parseInt(document.getElementById(SLUG + '-height').value, 10) || 45) / 100;
    var gap = parseInt(document.getElementById(SLUG + '-gap').value, 10) || 0;
    var op = (parseInt(document.getElementById(SLUG + '-fade').value, 10) || 55) / 100;

    var w = 800, ih = 500, s = 1;
    if (img) {
      s = Math.min(1, MAXW / img.naturalWidth);
      w = Math.round(img.naturalWidth * s);
      ih = Math.round(img.naturalHeight * s);
    }
    var reflH = Math.round(ih * rh);
    canvas.width = w;
    canvas.height = ih + gap + reflH;
    var ctx = canvas.getContext('2d');

    if (img) ctx.drawImage(img, 0, 0, w, ih);
    else {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, 0, w, ih);
      ctx.fillStyle = '#9aa0a8';
      ctx.font = '28px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Choose a photo', w / 2, ih / 2);
    }

    if (img && reflH > 0) {
      // flipped copy with gradient mask
      var fc = document.createElement('canvas');
      fc.width = w; fc.height = reflH;
      var fctx = fc.getContext('2d');
      fctx.save();
      fctx.translate(0, reflH);
      fctx.scale(1, -1);
      // draw the bottom reflH of the image, flipped
      fctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight,
        0, -(ih / s - reflH / s), w, ih);
      fctx.restore();
      // fade mask
      fctx.globalCompositeOperation = 'destination-in';
      var g = fctx.createLinearGradient(0, 0, 0, reflH);
      g.addColorStop(0, 'rgba(0,0,0,' + op + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      fctx.fillStyle = g;
      fctx.fillRect(0, 0, w, reflH);
      ctx.drawImage(fc, 0, ih + gap);
    }
  }

  try {
    if (!document.getElementById(SLUG + '-canvas')) return;
    apply();
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      TN.clearErr(ERR);
      TN.readAsDataURL(f).then(TN.loadImage).then(function (im) { img = im; apply(); })
        .catch(function () { TN.setErr(ERR, 'That file could not be read as an image. Try a JPG, PNG or WebP file.'); });
    });
    [['height', '%'], ['gap', 'px'], ['fade', '%']].forEach(function (k) {
      TN.on(SLUG + '-' + k[0], 'input', function () {
        var v = document.getElementById(SLUG + '-' + k[0] + '-val');
        if (v) v.textContent = this.value;
        apply();
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      var canvas = document.getElementById(SLUG + '-canvas');
      if (!img) { TN.setErr(ERR, 'Choose a photo first.'); return; }
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'reflection.png');
          else TN.setErr(ERR, 'Could not export the image.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the image.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
