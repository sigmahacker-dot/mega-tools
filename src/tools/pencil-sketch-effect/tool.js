/* Pencil Sketch Effect — grayscale > invert > blur > color-dodge blend, PNG download. */
(function () {
  'use strict';
  var SLUG = 'pencil-sketch-effect';
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

  function apply() {
    if (!img) return;
    var w = img.naturalWidth, h = img.naturalHeight;
    // Step 1: grayscale base
    var baseC = document.createElement('canvas');
    baseC.width = w; baseC.height = h;
    var bx = baseC.getContext('2d');
    bx.drawImage(img, 0, 0);
    var bid = bx.getImageData(0, 0, w, h), bd = bid.data;
    for (var i = 0; i < bd.length; i += 4) {
      var lum = 0.299 * bd[i] + 0.587 * bd[i + 1] + 0.114 * bd[i + 2];
      bd[i] = bd[i + 1] = bd[i + 2] = lum;
    }
    bx.putImageData(bid, 0, 0);
    // Step 2: inverted + blurred copy
    var blurC = document.createElement('canvas');
    blurC.width = w; blurC.height = h;
    var fx = blurC.getContext('2d');
    fx.drawImage(baseC, 0, 0);
    var fid = fx.getImageData(0, 0, w, h), fd = fid.data;
    for (var j = 0; j < fd.length; j += 4) {
      fd[j] = 255 - fd[j]; fd[j + 1] = 255 - fd[j + 1]; fd[j + 2] = 255 - fd[j + 2];
    }
    fx.putImageData(fid, 0, 0);
    fx.filter = 'blur(4px)';
    fx.drawImage(blurC, 0, 0);
    fx.filter = 'none';
    var blurData = fx.getImageData(0, 0, w, h).data;
    // Step 3: color-dodge blend of grayscale base with blurred inverted layer
    var c = canvas(), x = c.getContext('2d');
    var out = x.createImageData(w, h), od = out.data;
    for (var k = 0; k < od.length; k += 4) {
      for (var ch = 0; ch < 3; ch++) {
        var A = bd[k + ch], B = blurData[k + ch];
        var v = B >= 255 ? 255 : Math.min(255, (A * 255) / (255 - B));
        od[k + ch] = v;
      }
      od[k + 3] = 255;
    }
    x.putImageData(out, 0, 0);
  }

  function download() {
    if (!img) { TN.setErr(SLUG + '-error', 'Choose an image first.'); return; }
    canvas().toBlob(function (b) {
      if (b) TN.download(b, base + '-sketch.png');
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
