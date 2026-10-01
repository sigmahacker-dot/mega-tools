/* Image Brightness & Contrast — live sliders, PNG download. */
(function () {
  'use strict';
  var SLUG = 'image-brightness-contrast';
  var img = null, base = 'image';

  function canvas() { return TN.el(SLUG + '-canvas'); }
  function bright() {
    var el = TN.el(SLUG + '-bright');
    return el ? parseFloat(el.value) || 0 : 0;
  }
  function contrast() {
    var el = TN.el(SLUG + '-cont');
    return el ? parseFloat(el.value) || 0 : 0;
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
    var b = bright() * 2.55;
    var cf = (259 * (contrast() + 255)) / (255 * (259 - contrast()));
    for (var i = 0; i < d.length; i += 4) {
      d[i] = cf * (d[i] - 128) + 128 + b;
      d[i + 1] = cf * (d[i + 1] - 128) + 128 + b;
      d[i + 2] = cf * (d[i + 2] - 128) + 128 + b;
    }
    x.putImageData(id, 0, 0);
  }

  function download() {
    if (!img) { TN.setErr(SLUG + '-error', 'Choose an image first.'); return; }
    canvas().toBlob(function (b) {
      if (b) TN.download(b, base + '-adjusted.png');
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
  TN.on(SLUG + '-bright', 'input', function () {
    var v = TN.el(SLUG + '-bright-val');
    if (v) v.textContent = bright();
    apply();
  });
  TN.on(SLUG + '-cont', 'input', function () {
    var v = TN.el(SLUG + '-cont-val');
    if (v) v.textContent = contrast();
    apply();
  });
  TN.on(SLUG + '-download', 'click', download);
})();
