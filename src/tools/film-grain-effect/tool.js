/* Film Grain Effect — monochromatic per-pixel grain with intensity control. */
(function () {
  'use strict';
  var SLUG = 'film-grain-effect';
  var ERR = SLUG + '-error';
  var srcData = null, srcW = 0, srcH = 0;
  var MAXW = 1600;

  function apply() {
    var canvas = document.getElementById(SLUG + '-canvas');
    if (!canvas || !srcData) return;
    var inten = parseInt(document.getElementById(SLUG + '-intensity').value, 10) || 0;
    canvas.width = srcW; canvas.height = srcH;
    var ctx = canvas.getContext('2d');
    var d = new ImageData(new Uint8ClampedArray(srcData.data), srcW, srcH);
    var px = d.data;
    var amp = (inten / 100) * 90; // max ±90 luminance shift
    for (var i = 0; i < px.length; i += 4) {
      var n = (Math.random() * 2 - 1) * amp;
      px[i] += n; px[i + 1] += n; px[i + 2] += n;
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
        var c = document.createElement('canvas');
        c.width = Math.round(im.naturalWidth * s);
        c.height = Math.round(im.naturalHeight * s);
        var x = c.getContext('2d');
        x.drawImage(im, 0, 0, c.width, c.height);
        srcW = c.width; srcH = c.height;
        srcData = x.getImageData(0, 0, srcW, srcH);
        apply();
      }).catch(function () {
        TN.setErr(ERR, 'That file could not be read as an image. Try a JPG, PNG or WebP file.');
      });
    });
    TN.on(SLUG + '-intensity', 'input', function () {
      var v = document.getElementById(SLUG + '-intensity-val');
      if (v) v.textContent = this.value;
      apply();
    });
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      var canvas = document.getElementById(SLUG + '-canvas');
      if (!srcData) { TN.setErr(ERR, 'Choose a photo first.'); return; }
      try {
        canvas.toBlob(function (b) {
          if (b) TN.download(b, 'film-grain.png');
          else TN.setErr(ERR, 'Could not export the image.');
        }, 'image/png');
      } catch (e) { TN.setErr(ERR, 'Could not export the image.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
