/* Image Edge Detect — Sobel operator edge detection, PNG download. */
(function () {
  'use strict';
  var SLUG = 'image-edge-detect';
  var img = null, base = 'image';

  function canvas() { return TN.el(SLUG + '-canvas'); }

  function loadFile(f) {
    if (!f) return;
    TN.clearErr(SLUG + '-error');
    base = (f.name || 'image').replace(/\.[^.]+$/, '') || 'image';
    TN.readAsDataURL(f).then(TN.loadImage).then(function (im) {
      img = im;
      var c = canvas();
      c.width = im.naturalWidth; c.height = im.naturalHeight;
      TN.show(SLUG + '-wrap');
      apply();
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Could not read that image file.');
    });
  }

  function lumAt(sd, w, h, x, y) {
    var px = Math.min(w - 1, Math.max(0, x));
    var py = Math.min(h - 1, Math.max(0, y));
    var i = (py * w + px) * 4;
    return 0.299 * sd[i] + 0.587 * sd[i + 1] + 0.114 * sd[i + 2];
  }

  function apply() {
    if (!img) return;
    var c = canvas(), x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    var w = c.width, h = c.height;
    var src = x.getImageData(0, 0, w, h), sd = src.data;
    var out = x.createImageData(w, h), od = out.data;
    var GX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    var GY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    for (var yy = 0; yy < h; yy++) {
      for (var xx = 0; xx < w; xx++) {
        var gx = 0, gy = 0;
        for (var ky = -1; ky <= 1; ky++) {
          for (var kx = -1; kx <= 1; kx++) {
            var l = lumAt(sd, w, h, xx + kx, yy + ky);
            var k = (ky + 1) * 3 + (kx + 1);
            gx += l * GX[k]; gy += l * GY[k];
          }
        }
        var m = Math.min(255, Math.sqrt(gx * gx + gy * gy));
        var oi = (yy * w + xx) * 4;
        od[oi] = od[oi + 1] = od[oi + 2] = m;
        od[oi + 3] = 255;
      }
    }
    x.putImageData(out, 0, 0);
  }

  function download() {
    if (!img) { TN.setErr(SLUG + '-error', 'Choose an image first.'); return; }
    canvas().toBlob(function (b) {
      if (b) TN.download(b, base + '-edges.png');
      else TN.setErr(SLUG + '-error', 'Your browser could not encode the PNG.');
    }, 'image/png');
  }

  var dz = TN.el(SLUG + '-drop'), input = TN.el(SLUG + '-file');
  if (dz && input) {
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) loadFile(input.files[0]);
      input.value = '';
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
    });
  }
  TN.on(SLUG + '-download', 'click', download);
})();
