/* Image Vignette Adder — radial darkening overlay, PNG download. */
(function () {
  'use strict';
  var SLUG = 'image-vignette-adder';
  var img = null, base = 'image';

  function canvas() { return TN.el(SLUG + '-canvas'); }
  function strength() {
    var el = TN.el(SLUG + '-strength');
    return el ? (parseFloat(el.value) || 0) / 100 : 0;
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
    var s = strength();
    if (s <= 0) return;
    var w = c.width, h = c.height;
    var r = Math.sqrt(w * w + h * h) / 2;
    var g = x.createRadialGradient(w / 2, h / 2, r * 0.35, w / 2, h / 2, r);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,' + (0.85 * s).toFixed(3) + ')');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
  }

  function download() {
    if (!img) { TN.setErr(SLUG + '-error', 'Choose an image first.'); return; }
    canvas().toBlob(function (b) {
      if (b) TN.download(b, base + '-vignette.png');
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
  TN.on(SLUG + '-strength', 'input', function () {
    var el = TN.el(SLUG + '-strength'), v = TN.el(SLUG + '-strength-val');
    if (el && v) v.textContent = el.value;
    apply();
  });
  TN.on(SLUG + '-download', 'click', download);
})();
