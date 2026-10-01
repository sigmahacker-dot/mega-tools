/* Image Circle Crop — circular crop with transparent corners, PNG download. */
(function () {
  'use strict';
  var SLUG = 'image-circle-crop';
  var img = null, base = 'image';

  function canvas() { return TN.el(SLUG + '-canvas'); }

  function loadFile(f) {
    if (!f) return;
    TN.clearErr(SLUG + '-error');
    base = (f.name || 'image').replace(/\.[^.]+$/, '') || 'image';
    TN.readAsDataURL(f).then(TN.loadImage).then(function (im) {
      img = im;
      var size = Math.min(im.naturalWidth, im.naturalHeight);
      var c = canvas();
      c.width = size; c.height = size;
      TN.show(SLUG + '-wrap');
      apply();
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Could not read that image file.');
    });
  }

  function apply() {
    if (!img) return;
    var c = canvas(), x = c.getContext('2d');
    var size = c.width;
    var sx = (img.naturalWidth - size) / 2, sy = (img.naturalHeight - size) / 2;
    x.clearRect(0, 0, size, size);
    x.save();
    x.beginPath();
    x.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    x.clip();
    x.drawImage(img, sx, sy, size, size, 0, 0, size, size);
    x.restore();
  }

  function download() {
    if (!img) { TN.setErr(SLUG + '-error', 'Choose an image first.'); return; }
    canvas().toBlob(function (b) {
      if (b) TN.download(b, base + '-circle.png');
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
