/* Image Polaroid Frame — white polaroid frame + caption, PNG download. */
(function () {
  'use strict';
  var SLUG = 'image-polaroid-frame';
  var img = null, base = 'image';

  function canvas() { return TN.el(SLUG + '-canvas'); }
  function caption() {
    var el = TN.el(SLUG + '-caption');
    return el ? el.value : '';
  }

  function loadFile(f) {
    if (!f) return;
    TN.clearErr(SLUG + '-error');
    base = (f.name || 'image').replace(/\.[^.]+$/, '') || 'image';
    TN.readAsDataURL(f).then(TN.loadImage).then(function (im) {
      img = im;
      TN.show(SLUG + '-wrap');
      apply();
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Could not read that image file.');
    });
  }

  function apply() {
    if (!img) return;
    var c = canvas(), x = c.getContext('2d');
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var scale = Math.min(1, 1600 / Math.max(iw, ih));
    var pw = Math.round(iw * scale), ph = Math.round(ih * scale);
    var side = Math.round(pw * 0.09);
    var top = Math.round(pw * 0.09);
    var bottom = Math.round(pw * 0.28);
    c.width = pw + side * 2;
    c.height = ph + top + bottom;
    x.fillStyle = '#ffffff';
    x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = 'rgba(0,0,0,0.18)';
    x.fillRect(side + 3, top + 4, pw, ph);
    x.drawImage(img, 0, 0, iw, ih, side, top, pw, ph);
    var cap = caption();
    if (cap) {
      x.fillStyle = '#222222';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      var fs = Math.max(14, Math.round(c.width / 22));
      x.font = 'italic ' + fs + 'px Georgia, "Times New Roman", serif';
      x.fillText(cap, c.width / 2, top + ph + bottom / 2, c.width - side);
    }
  }

  function download() {
    if (!img) { TN.setErr(SLUG + '-error', 'Choose an image first.'); return; }
    canvas().toBlob(function (b) {
      if (b) TN.download(b, base + '-polaroid.png');
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
  TN.on(SLUG + '-caption', 'input', apply);
  TN.on(SLUG + '-download', 'click', download);
})();
