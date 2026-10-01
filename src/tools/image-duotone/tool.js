/* Image Duotone — map luminance between two picked colors, PNG download. */
(function () {
  'use strict';
  var SLUG = 'image-duotone';
  var img = null, base = 'image';

  function canvas() { return TN.el(SLUG + '-canvas'); }
  function hexToRgb(hex) {
    var h = (hex || '#000000').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
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
    x.drawImage(img, 0, 0);
    var id = x.getImageData(0, 0, c.width, c.height), d = id.data;
    var dark = hexToRgb(TN.el(SLUG + '-dark') && TN.el(SLUG + '-dark').value);
    var light = hexToRgb(TN.el(SLUG + '-light') && TN.el(SLUG + '-light').value);
    for (var i = 0; i < d.length; i += 4) {
      var t = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
      d[i] = dark[0] + (light[0] - dark[0]) * t;
      d[i + 1] = dark[1] + (light[1] - dark[1]) * t;
      d[i + 2] = dark[2] + (light[2] - dark[2]) * t;
    }
    x.putImageData(id, 0, 0);
  }

  function download() {
    if (!img) { TN.setErr(SLUG + '-error', 'Choose an image first.'); return; }
    canvas().toBlob(function (b) {
      if (b) TN.download(b, base + '-duotone.png');
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
  TN.on(SLUG + '-dark', 'input', apply);
  TN.on(SLUG + '-light', 'input', apply);
  TN.on(SLUG + '-download', 'click', download);
})();
