/* Image Resizer — canvas resize with aspect lock, presets, format choice. */
(function () {
  'use strict';

  var img = null, imgName = 'image', imgType = 'image/png';
  var origW = 0, origH = 0;
  var outBlob = null, outUrl = null, outName = '';

  function $(id) { return document.getElementById(id); }

  function canvasToBlob(canvas, type, quality) {
    return new Promise(function (resolve, reject) {
      try {
        canvas.toBlob(function (b) {
          if (b) resolve(b);
          else reject(new Error('This browser could not encode the image in that format.'));
        }, type, quality);
      } catch (e) { reject(e); }
    });
  }

  function setFile(f) {
    if (!f) return;
    TN.clearErr('image-resizer-error');
    TN.readAsDataURL(f).then(TN.loadImage).then(function (im) {
      if (!im.naturalWidth || !im.naturalHeight) throw new Error('unreadable');
      img = im;
      imgName = f.name || 'image';
      imgType = f.type || 'image/png';
      origW = im.naturalWidth;
      origH = im.naturalHeight;
      $('image-resizer-width').value = origW;
      $('image-resizer-height').value = origH;
      $('image-resizer-orig').textContent = 'Original: ' + origW + ' × ' + origH + ' px';
      $('image-resizer-controls').classList.remove('hidden');
      $('image-resizer-result').classList.add('hidden');
    }).catch(function () {
      TN.setErr('image-resizer-error', 'That file could not be read as an image. Try a JPG, PNG or WebP file.');
    });
  }

  function dims() {
    var w = parseInt($('image-resizer-width').value, 10);
    var h = parseInt($('image-resizer-height').value, 10);
    return {
      w: Math.min(12000, Math.max(1, isNaN(w) ? 1 : w)),
      h: Math.min(12000, Math.max(1, isNaN(h) ? 1 : h))
    };
  }

  function onWidth() {
    if ($('image-resizer-lock').checked && origW > 0) {
      var w = parseInt($('image-resizer-width').value, 10);
      if (!isNaN(w) && w > 0) $('image-resizer-height').value = Math.max(1, Math.round(w * origH / origW));
    }
  }

  function onHeight() {
    if ($('image-resizer-lock').checked && origH > 0) {
      var h = parseInt($('image-resizer-height').value, 10);
      if (!isNaN(h) && h > 0) $('image-resizer-width').value = Math.max(1, Math.round(h * origW / origH));
    }
  }

  function applyPreset(kind) {
    if (!img) {
      TN.setErr('image-resizer-error', 'Choose an image first.');
      return;
    }
    var w, h;
    if (kind === 'half') { w = Math.round(origW / 2); h = Math.round(origH / 2); }
    else if (kind === 'quarter') { w = Math.round(origW / 4); h = Math.round(origH / 4); }
    else {
      var target = parseInt(kind, 10);
      var s = target / Math.max(origW, origH);
      w = Math.round(origW * s); h = Math.round(origH * s);
    }
    $('image-resizer-width').value = w;
    $('image-resizer-height').value = h;
  }

  function resize() {
    if (!img) {
      TN.setErr('image-resizer-error', 'Choose an image first.');
      return;
    }
    TN.clearErr('image-resizer-error');
    var d = dims();
    var fmt = $('image-resizer-format').value;
    var mime = fmt === 'keep' ? imgType : fmt;
    if (mime !== 'image/png' && mime !== 'image/jpeg' && mime !== 'image/webp') mime = 'image/png';
    var canvas = document.createElement('canvas');
    canvas.width = d.w;
    canvas.height = d.h;
    var ctx = canvas.getContext('2d');
    if (mime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, d.w, d.h);
    }
    ctx.drawImage(img, 0, 0, d.w, d.h);
    var lossy = (mime === 'image/jpeg' || mime === 'image/webp');
    var q = lossy ? (parseInt($('image-resizer-quality').value, 10) || 90) / 100 : undefined;
    var btn = $('image-resizer-go');
    if (btn) { btn.disabled = true; btn.textContent = 'Resizing…'; }
    canvasToBlob(canvas, mime, q).then(function (blob) {
      outBlob = blob;
      if (outUrl) { try { URL.revokeObjectURL(outUrl); } catch (e) {} }
      outUrl = URL.createObjectURL(blob);
      var pv = $('image-resizer-preview');
      pv.src = outUrl;
      pv.classList.remove('hidden');
      var ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png';
      var base = (imgName || 'image').replace(/\.[^.]+$/, '') || 'image';
      outName = base + '-' + d.w + 'x' + d.h + '.' + ext;
      $('image-resizer-outinfo').textContent = d.w + ' × ' + d.h + ' px · ' + TN.fmtBytes(blob.size) + ' · ' + ext.toUpperCase();
      $('image-resizer-result').classList.remove('hidden');
      if (btn) { btn.disabled = false; btn.textContent = 'Resize image'; }
    }).catch(function (e) {
      if (btn) { btn.disabled = false; btn.textContent = 'Resize image'; }
      TN.setErr('image-resizer-error', 'Resize failed: ' + (e && e.message ? e.message : 'unknown error'));
    });
  }

  function init() {
    var dz = $('image-resizer-drop');
    var input = $('image-resizer-file');
    if (!dz || !input) return;
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      input.value = '';
      setFile(f);
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      setFile(f);
    });

    TN.on('image-resizer-width', 'input', onWidth);
    TN.on('image-resizer-height', 'input', onHeight);
    TN.on('image-resizer-go', 'click', resize);
    TN.on('image-resizer-download', 'click', function () {
      if (outBlob) TN.download(outBlob, outName || 'resized.png');
    });

    var ctrls = $('image-resizer-controls');
    if (ctrls) ctrls.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-preset]') : null;
      if (b) applyPreset(b.getAttribute('data-preset'));
    });
  }

  try { init(); } catch (e) { /* never throw on page load */ }
})();
