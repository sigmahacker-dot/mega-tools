/* Halftone Effect — dot-grid halftone by luminance, PNG download. */
(function () {
  'use strict';
  var SLUG = 'halftone-effect';
  var img = null, base = 'image';

  function canvas() { return TN.el(SLUG + '-canvas'); }
  function dotSize() {
    var el = TN.el(SLUG + '-size');
    return el ? Math.max(4, parseInt(el.value, 10) || 8) : 8;
  }

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

  function apply() {
    if (!img) return;
    var c = canvas(), x = c.getContext('2d');
    var w = c.width, h = c.height, cell = dotSize();
    // Read luminance from a temp canvas
    var t = document.createElement('canvas');
    t.width = w; t.height = h;
    var tx = t.getContext('2d');
    tx.drawImage(img, 0, 0);
    var sd = tx.getImageData(0, 0, w, h).data;
    x.fillStyle = '#ffffff';
    x.fillRect(0, 0, w, h);
    x.fillStyle = '#111111';
    var cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
    for (var ry = 0; ry < rows; ry++) {
      for (var rx = 0; rx < cols; rx++) {
        var sum = 0, n = 0;
        var x0 = rx * cell, y0 = ry * cell;
        for (var yy = y0; yy < Math.min(y0 + cell, h); yy += 2) {
          for (var xx = x0; xx < Math.min(x0 + cell, w); xx += 2) {
            var i = (yy * w + xx) * 4;
            sum += 0.299 * sd[i] + 0.587 * sd[i + 1] + 0.114 * sd[i + 2];
            n++;
          }
        }
        var lum = n ? sum / n / 255 : 1;
        var r = (cell / 2) * (1 - lum) * 0.95;
        if (r > 0.4) {
          x.beginPath();
          x.arc(x0 + cell / 2, y0 + cell / 2, r, 0, Math.PI * 2);
          x.fill();
        }
      }
    }
  }

  function download() {
    if (!img) { TN.setErr(SLUG + '-error', 'Choose an image first.'); return; }
    canvas().toBlob(function (b) {
      if (b) TN.download(b, base + '-halftone.png');
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
  TN.on(SLUG + '-size', 'input', function () {
    var el = TN.el(SLUG + '-size'), v = TN.el(SLUG + '-size-val');
    if (el && v) v.textContent = el.value;
    apply();
  });
  TN.on(SLUG + '-download', 'click', download);
})();
