/* Image Blur Tool — adjustable blur radius via canvas filter, PNG download. */
(function () {
  'use strict';
  var SLUG = 'image-blur-tool';
  var img = null, base = 'image';

  function canvas() { return TN.el(SLUG + '-canvas'); }
  function radius() {
    var el = TN.el(SLUG + '-radius');
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
    x.filter = radius() > 0 ? 'blur(' + radius() + 'px)' : 'none';
    x.clearRect(0, 0, c.width, c.height);
    x.drawImage(img, 0, 0);
    x.filter = 'none';
  }

  function download() {
    if (!img) { TN.setErr(SLUG + '-error', 'Choose an image first.'); return; }
    canvas().toBlob(function (b) {
      if (b) TN.download(b, base + '-blurred.png');
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
  TN.on(SLUG + '-radius', 'input', function () {
    var el = TN.el(SLUG + '-radius'), v = TN.el(SLUG + '-radius-val');
    if (el && v) v.textContent = el.value;
    apply();
  });
  TN.on(SLUG + '-download', 'click', download);
})();
