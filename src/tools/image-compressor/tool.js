/* Image Compressor — batch compress via canvas, optional ZIP via JSZip. */
(function () {
  'use strict';

  var files = [];
  var outputs = [];

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

  function extFor(mime) {
    if (mime === 'image/jpeg') return 'jpg';
    if (mime === 'image/webp') return 'webp';
    return 'png';
  }

  function looksLikeImage(f) {
    var t = (f.type || '').toLowerCase();
    if (t.indexOf('image/') === 0) return true;
    return /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name || '');
  }

  function addFiles(list) {
    var added = 0;
    for (var i = 0; i < list.length; i++) {
      if (looksLikeImage(list[i])) { files.push(list[i]); added++; }
    }
    if (!added) TN.setErr('image-compressor-error', 'No image files found in that selection.');
    else TN.clearErr('image-compressor-error');
    renderList();
  }

  function renderList() {
    var ul = $('image-compressor-list');
    if (!ul) return;
    if (!files.length) { ul.innerHTML = ''; return; }
    var html = '';
    for (var i = 0; i < files.length; i++) {
      html += '<li><span>' + TN.esc(files[i].name || 'image') +
        ' <span class="muted">(' + TN.fmtBytes(files[i].size) + ')</span></span>' +
        '<button class="btn btn-sm btn-danger" data-rm="' + i + '">Remove</button></li>';
    }
    ul.innerHTML = html;
  }

  function compressOne(file, quality, mime) {
    return TN.readAsDataURL(file).then(TN.loadImage).then(function (img) {
      if (!img.naturalWidth || !img.naturalHeight) {
        throw new Error('Could not read "' + (file.name || 'image') + '".');
      }
      var canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      var ctx = canvas.getContext('2d');
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      var q = (mime === 'image/jpeg' || mime === 'image/webp') ? quality / 100 : undefined;
      return canvasToBlob(canvas, mime, q).then(function (blob) {
        var base = (file.name || 'image').replace(/\.[^.]+$/, '') || 'image';
        var name = base + '-compressed.' + extFor(mime);
        outputs.push({ blob: blob, name: name });
        var saved = file.size > 0 ? Math.round((1 - blob.size / file.size) * 100) : 0;
        return { name: file.name || 'image', orig: file.size, size: blob.size, saved: saved, idx: outputs.length - 1 };
      });
    });
  }

  function renderTable(rows) {
    var wrap = $('image-compressor-result');
    var tbody = $('image-compressor-rows');
    if (!wrap || !tbody) return;
    var html = '';
    rows.forEach(function (r) {
      var tag = r.saved > 0
        ? '<span class="tag">−' + r.saved + '%</span>'
        : '<span class="tag">±0%</span>';
      html += '<tr><td>' + TN.esc(r.name) + '</td><td>' + TN.fmtBytes(r.orig) + '</td><td>' +
        TN.fmtBytes(r.size) + '</td><td>' + tag + '</td>' +
        '<td><button class="btn btn-sm btn-outline" data-dl="' + r.idx + '">Download</button></td></tr>';
    });
    tbody.innerHTML = html;
    wrap.classList.remove('hidden');
    var zipBtn = $('image-compressor-zip');
    if (zipBtn) {
      if (outputs.length > 1) zipBtn.classList.remove('hidden');
      else zipBtn.classList.add('hidden');
    }
  }

  function compress() {
    if (!files.length) {
      TN.setErr('image-compressor-error', 'Choose at least one image first.');
      return;
    }
    TN.clearErr('image-compressor-error');
    var btn = $('image-compressor-go');
    if (btn) { btn.disabled = true; btn.textContent = 'Compressing…'; }
    outputs = [];
    var wrap = $('image-compressor-result');
    if (wrap) wrap.classList.add('hidden');
    var zipBtn = $('image-compressor-zip');
    if (zipBtn) zipBtn.classList.add('hidden');
    var quality = parseInt($('image-compressor-quality').value, 10) || 80;
    var format = $('image-compressor-format').value;
    var rows = [];
    var chain = Promise.resolve();
    files.forEach(function (file) {
      chain = chain.then(function () {
        var mime = format === 'keep' ? (file.type || 'image/png') : format;
        if (mime !== 'image/jpeg' && mime !== 'image/webp' && mime !== 'image/png') mime = 'image/png';
        return compressOne(file, quality, mime).then(function (r) { rows.push(r); });
      });
    });
    chain.then(function () {
      renderTable(rows);
      if (btn) { btn.disabled = false; btn.textContent = 'Compress images'; }
    }).catch(function (e) {
      if (btn) { btn.disabled = false; btn.textContent = 'Compress images'; }
      TN.setErr('image-compressor-error', 'Compression failed: ' + (e && e.message ? e.message : 'unknown error'));
    });
  }

  function downloadZip() {
    if (typeof JSZip === 'undefined') {
      TN.setErr('image-compressor-error', 'The ZIP library failed to load. Check your connection and reload the page.');
      return;
    }
    if (!outputs.length) return;
    try {
      var zip = new JSZip();
      outputs.forEach(function (o) { zip.file(o.name, o.blob); });
      zip.generateAsync({ type: 'blob' }).then(function (blob) {
        TN.download(blob, 'compressed-images.zip');
      }).catch(function () {
        TN.setErr('image-compressor-error', 'Could not build the ZIP file.');
      });
    } catch (e) {
      TN.setErr('image-compressor-error', 'Could not build the ZIP file.');
    }
  }

  function init() {
    var dz = $('image-compressor-drop');
    var input = $('image-compressor-file');
    if (!dz || !input) return;
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      addFiles(input.files || []);
      input.value = '';
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });

    var list = $('image-compressor-list');
    if (list) list.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-rm]') : null;
      if (b) { files.splice(parseInt(b.getAttribute('data-rm'), 10), 1); renderList(); }
    });

    var q = $('image-compressor-quality');
    var qv = $('image-compressor-quality-val');
    if (q && qv) q.addEventListener('input', function () { qv.textContent = q.value; });

    TN.on('image-compressor-go', 'click', compress);
    TN.on('image-compressor-zip', 'click', downloadZip);

    var res = $('image-compressor-result');
    if (res) res.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-dl]') : null;
      if (b) {
        var o = outputs[parseInt(b.getAttribute('data-dl'), 10)];
        if (o) TN.download(o.blob, o.name);
      }
    });
  }

  try { init(); } catch (e) { /* never throw on page load */ }
})();
