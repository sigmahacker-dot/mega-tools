/* WebP Converter — batch canvas re-encode to image/webp, ZIP via JSZip. */
(function () {
  'use strict';
  var SLUG = 'webp-converter';
  var files = [];
  var outputs = [];

  function $(id) { return document.getElementById(id); }
  function errId() { return SLUG + '-error'; }

  function toBlobP(canvas, type, quality) {
    return new Promise(function (resolve, reject) {
      try {
        canvas.toBlob(function (b) {
          if (b) resolve(b);
          else reject(new Error('This browser could not encode WebP. Try a different browser.'));
        }, type, quality);
      } catch (e) { reject(e); }
    });
  }

  function addFiles(list) {
    var added = 0;
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      var t = (f.type || '').toLowerCase();
      if (t.indexOf('image/') === 0 || /\.(jpe?g|png|gif|bmp|avif)$/i.test(f.name || '')) {
        files.push(f); added++;
      }
    }
    if (!added) TN.setErr(errId(), 'No image files found in that selection.');
    else TN.clearErr(errId());
    renderList();
  }

  function renderList() {
    var ul = $(SLUG + '-list');
    if (!ul) return;
    var html = '';
    for (var i = 0; i < files.length; i++) {
      html += '<li><span>' + TN.esc(files[i].name || 'image') +
        ' <span class="muted">(' + TN.fmtBytes(files[i].size) + ')</span></span>' +
        '<button class="btn btn-sm btn-danger" data-rm="' + i + '">Remove</button></li>';
    }
    ul.innerHTML = html;
  }

  function convertOne(file, quality) {
    return TN.readAsDataURL(file).then(TN.loadImage).then(function (img) {
      if (!img.naturalWidth || !img.naturalHeight) {
        throw new Error('Could not read "' + (file.name || 'image') + '".');
      }
      var canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      return toBlobP(canvas, 'image/webp', quality).then(function (blob) {
        var base = (file.name || 'image').replace(/\.[^.]+$/, '') || 'image';
        var name = base + '.webp';
        outputs.push({ blob: blob, name: name });
        var saved = file.size > 0 ? Math.round((1 - blob.size / file.size) * 100) : 0;
        return { name: file.name || 'image', orig: file.size, size: blob.size, saved: saved, idx: outputs.length - 1 };
      });
    });
  }

  function renderTable(rows) {
    var wrap = $(SLUG + '-result');
    var tbody = $(SLUG + '-rows');
    if (!wrap || !tbody) return;
    var html = '';
    rows.forEach(function (r) {
      var tag = r.saved > 0 ? '<span class="tag">−' + r.saved + '%</span>' : '<span class="tag">±0%</span>';
      html += '<tr><td>' + TN.esc(r.name) + '</td><td>' + TN.fmtBytes(r.orig) + '</td><td>' +
        TN.fmtBytes(r.size) + '</td><td>' + tag + '</td>' +
        '<td><button class="btn btn-sm btn-outline" data-dl="' + r.idx + '">Download</button></td></tr>';
    });
    tbody.innerHTML = html;
    wrap.classList.remove('hidden');
    var zipBtn = $(SLUG + '-zip');
    if (zipBtn) {
      if (outputs.length > 1) zipBtn.classList.remove('hidden');
      else zipBtn.classList.add('hidden');
    }
  }

  function convert() {
    if (!files.length) { TN.setErr(errId(), 'Choose at least one image first.'); return; }
    TN.clearErr(errId());
    var btn = $(SLUG + '-go');
    if (btn) { btn.disabled = true; btn.textContent = 'Converting…'; }
    outputs = [];
    $(SLUG + '-result').classList.add('hidden');
    $(SLUG + '-zip').classList.add('hidden');
    var quality = (parseInt($(SLUG + '-quality').value, 10) || 85) / 100;
    var rows = [];
    var chain = Promise.resolve();
    files.forEach(function (file) {
      chain = chain.then(function () {
        return convertOne(file, quality).then(function (r) { rows.push(r); });
      });
    });
    chain.then(function () {
      renderTable(rows);
      if (btn) { btn.disabled = false; btn.textContent = 'Convert to WebP'; }
    }).catch(function (e) {
      if (btn) { btn.disabled = false; btn.textContent = 'Convert to WebP'; }
      TN.setErr(errId(), 'Conversion failed: ' + (e && e.message ? e.message : 'unknown error'));
    });
  }

  function downloadZip() {
    if (typeof JSZip === 'undefined') {
      TN.setErr(errId(), 'The ZIP library failed to load. Check your connection and reload the page.');
      return;
    }
    if (!outputs.length) return;
    try {
      var zip = new JSZip();
      outputs.forEach(function (o) { zip.file(o.name, o.blob); });
      zip.generateAsync({ type: 'blob' }).then(function (blob) {
        TN.download(blob, 'webp-images.zip');
      }).catch(function () { TN.setErr(errId(), 'Could not build the ZIP file.'); });
    } catch (e) { TN.setErr(errId(), 'Could not build the ZIP file.'); }
  }

  function init() {
    var dz = $(SLUG + '-drop');
    var input = $(SLUG + '-file');
    if (!dz || !input) return;
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () { addFiles(input.files || []); input.value = ''; });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
    var list = $(SLUG + '-list');
    if (list) list.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-rm]') : null;
      if (b) { files.splice(parseInt(b.getAttribute('data-rm'), 10), 1); renderList(); }
    });
    var q = $(SLUG + '-quality');
    var qv = $(SLUG + '-quality-val');
    if (q && qv) q.addEventListener('input', function () { qv.textContent = q.value; });
    TN.on(SLUG + '-go', 'click', convert);
    TN.on(SLUG + '-zip', 'click', downloadZip);
    var res = $(SLUG + '-result');
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
