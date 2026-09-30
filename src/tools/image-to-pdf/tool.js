/* Image to PDF — pdf-lib: one full-size page per image, reorderable. */
(function () {
  'use strict';
  var SLUG = 'image-to-pdf';
  var items = []; // {file, url}

  function $(id) { return document.getElementById(id); }
  function errId() { return SLUG + '-error'; }

  function addFiles(list) {
    var added = 0;
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      var t = (f.type || '').toLowerCase();
      if (t.indexOf('image/') === 0 || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name || '')) {
        items.push({ file: f, url: URL.createObjectURL(f) });
        added++;
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
    for (var i = 0; i < items.length; i++) {
      html += '<li><span><b>' + (i + 1) + '.</b> ' + TN.esc(items[i].file.name || 'image') +
        ' <span class="muted">(' + TN.fmtBytes(items[i].file.size) + ')</span></span>' +
        '<span class="btn-row" style="margin-top:0">' +
        '<button class="btn btn-sm btn-outline" data-up="' + i + '" title="Move up">↑</button>' +
        '<button class="btn btn-sm btn-outline" data-down="' + i + '" title="Move down">↓</button>' +
        '<button class="btn btn-sm btn-danger" data-rm="' + i + '" title="Remove">✕</button>' +
        '</span></li>';
    }
    ul.innerHTML = html;
  }

  function toPngBytes(img) {
    return new Promise(function (resolve, reject) {
      try {
        var canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        canvas.toBlob(function (b) {
          if (!b) { reject(new Error('Could not encode image.')); return; }
          var r = new FileReader();
          r.onload = function () { resolve(r.result); };
          r.onerror = function () { reject(r.error || new Error('Read failed.')); };
          r.readAsArrayBuffer(b);
        }, 'image/png');
      } catch (e) { reject(e); }
    });
  }

  function setProgress(pct) {
    var bar = $(SLUG + '-bar');
    if (bar) bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
  }

  function setStatus(msg) {
    var s = $(SLUG + '-status');
    if (s) s.textContent = msg;
  }

  function createPdf() {
    if (typeof PDFLib === 'undefined' || !PDFLib.PDFDocument) {
      TN.setErr(errId(), 'The PDF library failed to load. Check your connection and reload the page.');
      return;
    }
    if (!items.length) {
      TN.setErr(errId(), 'Add at least one image first.');
      return;
    }
    TN.clearErr(errId());
    var btn = $(SLUG + '-go');
    if (btn) { btn.disabled = true; btn.textContent = 'Building PDF…'; }
    var pw = $(SLUG + '-progresswrap');
    if (pw) pw.classList.remove('hidden');
    setProgress(0);

    var chain = PDFLib.PDFDocument.create().then(function (pdf) {
      var step = Promise.resolve();
      items.forEach(function (item, i) {
        step = step.then(function () {
          setStatus('Adding image ' + (i + 1) + ' of ' + items.length + '…');
          return TN.loadImage(item.url).then(function (img) {
            if (!img.naturalWidth || !img.naturalHeight) {
              throw new Error('Could not read "' + (item.file.name || 'image') + '".');
            }
            var w = img.naturalWidth, h = img.naturalHeight;
            var embed;
            if ((item.file.type || '').toLowerCase() === 'image/jpeg') {
              embed = TN.readAsArrayBuffer(item.file).then(function (buf) { return pdf.embedJpg(buf); });
            } else {
              embed = toPngBytes(img).then(function (buf) { return pdf.embedPng(buf); });
            }
            return embed.then(function (embedded) {
              var page = pdf.addPage([w, h]);
              page.drawImage(embedded, { x: 0, y: 0, width: w, height: h });
              setProgress(((i + 1) / items.length) * 90);
            });
          });
        });
      });
      return step.then(function () {
        setStatus('Finalizing PDF…');
        return pdf.save();
      });
    });

    chain.then(function (bytes) {
      setProgress(100);
      TN.download(new Blob([bytes], { type: 'application/pdf' }), 'images.pdf');
      setStatus('Done — your PDF has been downloaded.');
      if (btn) { btn.disabled = false; btn.textContent = 'Create PDF'; }
      setTimeout(function () {
        setProgress(0);
        if (pw) pw.classList.add('hidden');
      }, 1200);
    }).catch(function (e) {
      if (btn) { btn.disabled = false; btn.textContent = 'Create PDF'; }
      setStatus('');
      setProgress(0);
      if (pw) pw.classList.add('hidden');
      TN.setErr(errId(), 'Could not build the PDF: ' + (e && e.message ? e.message : 'unknown error'));
    });
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
      var t = e.target && e.target.closest ? e.target.closest('button') : null;
      if (!t) return;
      var i, j;
      if (t.hasAttribute('data-rm')) {
        i = parseInt(t.getAttribute('data-rm'), 10);
        try { URL.revokeObjectURL(items[i].url); } catch (ex) {}
        items.splice(i, 1);
      } else if (t.hasAttribute('data-up')) {
        i = parseInt(t.getAttribute('data-up'), 10);
        if (i > 0) { j = items[i]; items[i] = items[i - 1]; items[i - 1] = j; }
      } else if (t.hasAttribute('data-down')) {
        i = parseInt(t.getAttribute('data-down'), 10);
        if (i < items.length - 1) { j = items[i]; items[i] = items[i + 1]; items[i + 1] = j; }
      }
      renderList();
    });

    TN.on(SLUG + '-go', 'click', createPdf);
  }

  try { init(); } catch (e) { /* never throw on page load */ }
})();
