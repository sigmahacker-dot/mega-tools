/* Image Color Replace — click to sample source color, tolerance + target color, PNG download. */
(function () {
  'use strict';
  var SLUG = 'image-color-replace';
  var img = null, base = 'image';
  var srcColor = null;

  function canvas() { return TN.el(SLUG + '-canvas'); }
  function tolerance() {
    var el = TN.el(SLUG + '-tol');
    return el ? parseFloat(el.value) || 0 : 40;
  }
  function hexToRgb(hex) {
    var h = (hex || '#ff0000').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function rgbStr(c) { return 'rgb(' + c[0] + ', ' + c[1] + ', ' + c[2] + ')'; }

  function loadFile(f) {
    if (!f) return;
    TN.clearErr(SLUG + '-error');
    srcColor = null;
    var sv = TN.el(SLUG + '-src');
    if (sv) sv.textContent = 'none — click the image';
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
    x.drawImage(img, 0, 0);
    if (!srcColor) return;
    var id = x.getImageData(0, 0, c.width, c.height), d = id.data;
    var tol = tolerance(), tol2 = tol * tol;
    var tgt = hexToRgb(TN.el(SLUG + '-target') && TN.el(SLUG + '-target').value);
    for (var i = 0; i < d.length; i += 4) {
      var dr = d[i] - srcColor[0], dg = d[i + 1] - srcColor[1], db = d[i + 2] - srcColor[2];
      if (dr * dr + dg * dg + db * db <= tol2) {
        d[i] = tgt[0]; d[i + 1] = tgt[1]; d[i + 2] = tgt[2];
      }
    }
    x.putImageData(id, 0, 0);
  }

  function pickColor(e) {
    if (!img) return;
    var c = canvas();
    var rect = c.getBoundingClientRect();
    var px = Math.floor((e.clientX - rect.left) * (c.width / rect.width));
    var py = Math.floor((e.clientY - rect.top) * (c.height / rect.height));
    var x = c.getContext('2d');
    var id = x.getImageData(Math.max(0, Math.min(c.width - 1, px)), Math.max(0, Math.min(c.height - 1, py)), 1, 1);
    srcColor = [id.data[0], id.data[1], id.data[2]];
    var sv = TN.el(SLUG + '-src');
    if (sv) sv.textContent = rgbStr(srcColor);
    apply();
  }

  function download() {
    if (!img) { TN.setErr(SLUG + '-error', 'Choose an image first.'); return; }
    canvas().toBlob(function (b) {
      if (b) TN.download(b, base + '-recolored.png');
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
  var cv = TN.el(SLUG + '-canvas');
  if (cv) cv.addEventListener('click', pickColor);
  TN.on(SLUG + '-tol', 'input', function () {
    var el = TN.el(SLUG + '-tol'), v = TN.el(SLUG + '-tol-val');
    if (el && v) v.textContent = el.value;
    apply();
  });
  TN.on(SLUG + '-target', 'input', apply);
  TN.on(SLUG + '-download', 'click', download);
})();
