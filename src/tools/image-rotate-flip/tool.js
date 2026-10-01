(function () {
  'use strict';
  var S = 'image-rotate-flip';
  var img = null;
  var fileName = 'image';
  var rot = 0;      // 0..3 quarter turns clockwise
  var flipH = false;
  var flipV = false;

  function looksLikeImage(f) {
    var t = (f.type || '').toLowerCase();
    if (t.indexOf('image/') === 0) return true;
    return /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name || '');
  }

  function render() {
    if (!img) return;
    var canvas = TN.el(S + '-canvas');
    var ctx = canvas.getContext('2d');
    var sideways = (rot % 2) === 1;
    canvas.width = sideways ? img.naturalHeight : img.naturalWidth;
    canvas.height = sideways ? img.naturalWidth : img.naturalHeight;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rot * Math.PI / 2);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  }

  function load(file) {
    TN.clearErr(S + '-error');
    fileName = (file.name || 'image').replace(/\.[^.]+$/, '') || 'image';
    TN.readAsDataURL(file).then(TN.loadImage).then(function (im) {
      if (!im.naturalWidth || !im.naturalHeight) throw new Error('Could not read that image.');
      img = im;
      rot = 0; flipH = false; flipV = false;
      render();
      TN.show(S + '-controls');
      TN.show(S + '-result');
    }).catch(function (e) {
      TN.setErr(S + '-error', 'Could not load that image: ' + (e && e.message ? e.message : 'unknown error'));
    });
  }

  function handleFiles(list) {
    if (!list || !list.length) return;
    var file = list[0];
    if (!looksLikeImage(file)) {
      TN.setErr(S + '-error', 'That does not look like an image file.');
      return;
    }
    load(file);
  }

  function download() {
    try {
      var canvas = TN.el(S + '-canvas');
      if (!img || !canvas || !canvas.width) { TN.setErr(S + '-error', 'Load an image first.'); return; }
      canvas.toBlob(function (blob) {
        try {
          if (blob) TN.download(blob, fileName + '-rotated.png');
          else TN.setErr(S + '-error', 'Could not export the image.');
        } catch (e) {}
      }, 'image/png');
    } catch (e) { TN.setErr(S + '-error', 'Could not export the image.'); }
  }

  function init() {
    var dz = TN.el(S + '-drop');
    var input = TN.el(S + '-file');
    if (!dz || !input) return;
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      handleFiles(input.files || []);
      input.value = '';
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });
    TN.on(S + '-left', 'click', function () { rot = (rot + 3) % 4; render(); });
    TN.on(S + '-right', 'click', function () { rot = (rot + 1) % 4; render(); });
    TN.on(S + '-h', 'click', function () { flipH = !flipH; render(); });
    TN.on(S + '-v', 'click', function () { flipV = !flipV; render(); });
    TN.on(S + '-reset', 'click', function () { rot = 0; flipH = false; flipV = false; render(); });
    TN.on(S + '-download', 'click', download);
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
