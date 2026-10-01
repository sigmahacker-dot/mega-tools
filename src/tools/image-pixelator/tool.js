/* Image Pixelator — draw tiny, scale up with smoothing off. */
(function () {
  'use strict';

  var SLUG = 'image-pixelator';
  var img = null;
  var imgName = '';

  function errId() { return SLUG + '-error'; }

  function pixelate() {
    TN.clearErr(errId());
    if (!img) return;
    var sizeEl = TN.el(SLUG + '-size');
    var size = sizeEl ? parseInt(sizeEl.value, 10) : 16;
    if (isNaN(size) || size < 2) size = 16;
    var val = TN.el(SLUG + '-size-val');
    if (val) val.textContent = String(size);

    var w = Math.max(1, Math.floor(img.naturalWidth / size));
    var h = Math.max(1, Math.floor(img.naturalHeight / size));

    var small = document.createElement('canvas');
    small.width = w;
    small.height = h;
    var sctx = small.getContext('2d');
    sctx.drawImage(img, 0, 0, w, h);

    var canvas = TN.el(SLUG + '-canvas');
    if (!canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, canvas.width, canvas.height);

    var dims = TN.el(SLUG + '-dims');
    if (dims) dims.textContent = img.naturalWidth + ' × ' + img.naturalHeight + ' px → ' + w + ' × ' + h + ' blocks.';
  }

  function onFile(ev) {
    TN.clearErr(errId());
    var f = ev.target && ev.target.files && ev.target.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) {
      TN.setErr(errId(), 'Please choose an image file.');
      return;
    }
    imgName = f.name.replace(/\.[^.]+$/, '') || 'image';
    TN.readAsDataURL(f).then(function (url) {
      return TN.loadImage(url);
    }).then(function (loaded) {
      img = loaded;
      pixelate();
    }).catch(function () {
      TN.setErr(errId(), 'Could not read that image. Try another file.');
    });
  }

  function download() {
    if (!img) { TN.setErr(errId(), 'Choose an image first.'); return; }
    var canvas = TN.el(SLUG + '-canvas');
    if (!canvas) return;
    TN.clearErr(errId());
    canvas.toBlob(function (blob) {
      if (!blob) { TN.setErr(errId(), 'Could not create the PNG. Try another image.'); return; }
      TN.download(blob, imgName + '-pixelated.png');
    }, 'image/png');
  }

  function clear() {
    TN.clearErr(errId());
    img = null;
    imgName = '';
    var f = TN.el(SLUG + '-file');
    if (f) f.value = '';
    var canvas = TN.el(SLUG + '-canvas');
    if (canvas) {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    var dims = TN.el(SLUG + '-dims');
    if (dims) dims.textContent = '';
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var f = TN.el(SLUG + '-file');
      if (f) TN.on(f, 'change', onFile);
      var size = TN.el(SLUG + '-size');
      if (size) TN.on(size, 'input', pixelate);
      var d = TN.el(SLUG + '-download');
      if (d) TN.on(d, 'click', download);
      var c = TN.el(SLUG + '-clear');
      if (c) TN.on(c, 'click', clear);
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();