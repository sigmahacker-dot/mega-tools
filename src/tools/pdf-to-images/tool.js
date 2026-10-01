/* PDF to Images — render each page at scale 2 with PDF.js, download PNGs or ZIP. */
(function () {
  'use strict';

  var SLUG = 'pdf-to-images';
  var WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  var SCALE = 2;
  var pages = []; // canvas elements per page (0-indexed)
  var pdfName = '';

  function errId() { return SLUG + '-error'; }

  function ensureWorker() {
    try {
      if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
      }
    } catch (e) {}
  }

  function setProgress(pct) {
    try {
      var wrap = TN.el(SLUG + '-progress');
      if (!wrap) return;
      var bar = wrap.querySelector('div');
      if (pct === null) { TN.hide(wrap); if (bar) bar.style.width = '0%'; }
      else { TN.show(wrap); if (bar) bar.style.width = pct + '%'; }
    } catch (e) {}
  }

  function canvasToBlob(canvas) {
    return new Promise(function (res, rej) {
      try {
        canvas.toBlob(function (b) { b ? res(b) : rej(new Error('encode failed')); }, 'image/png');
      } catch (e) { rej(e); }
    });
  }

  function convert() {
    TN.clearErr(errId());
    var res = TN.el(SLUG + '-result');
    if (res) TN.hide(res);
    var fileEl = TN.el(SLUG + '-file');
    var file = fileEl && fileEl.files && fileEl.files[0];
    if (!file) { TN.setErr(errId(), 'Please choose a PDF file first.'); return; }
    if (typeof pdfjsLib === 'undefined') {
      TN.setErr(errId(), 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    ensureWorker();
    var btn = TN.el(SLUG + '-convert');
    if (btn) btn.disabled = true;
    setProgress(0);
    pages = [];
    pdfName = file.name.replace(/\.pdf$/i, '') || 'pdf';
    (async function () {
      try {
        var buf = await TN.readAsArrayBuffer(file);
        var pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        var n = pdf.numPages;
        var thumbs = TN.el(SLUG + '-thumbs');
        if (thumbs) thumbs.innerHTML = '';
        for (var p = 1; p <= n; p++) {
          var page = await pdf.getPage(p);
          var viewport = page.getViewport({ scale: SCALE });
          var canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          var ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
          pages.push(canvas);
          if (thumbs) {
            var card = document.createElement('div');
            card.className = 'field';
            var label = document.createElement('label');
            label.textContent = 'Page ' + p;
            var thumb = document.createElement('canvas');
            var tw = 220, th = Math.round((canvas.height / canvas.width) * tw) || 220;
            thumb.width = tw; thumb.height = th;
            thumb.style.cssText = 'width:100%;border:1px solid #e5e7eb;border-radius:8px;';
            thumb.getContext('2d').drawImage(canvas, 0, 0, tw, th);
            var dl = document.createElement('button');
            dl.type = 'button';
            dl.className = 'btn btn-sm btn-outline';
            dl.textContent = 'Download PNG';
            dl.setAttribute('data-page', String(p - 1));
            dl.addEventListener('click', function () {
              var idx = parseInt(this.getAttribute('data-page'), 10);
              downloadPage(idx);
            });
            card.appendChild(label);
            card.appendChild(thumb);
            card.appendChild(dl);
            thumbs.appendChild(card);
          }
          setProgress(Math.round((p / n) * 100));
          await new Promise(function (r) { setTimeout(r, 0); });
        }
        if (res) TN.show(res);
      } catch (e) {
        TN.setErr(errId(), 'Could not render "' + file.name + '" — is it a valid PDF?');
      } finally {
        if (btn) btn.disabled = false;
        setProgress(null);
      }
    })();
  }

  function downloadPage(idx) {
    if (idx < 0 || idx >= pages.length) return;
    TN.clearErr(errId());
    canvasToBlob(pages[idx]).then(function (blob) {
      TN.download(blob, pdfName + '-page-' + (idx + 1) + '.png');
    }).catch(function () {
      TN.setErr(errId(), 'Could not encode page ' + (idx + 1) + ' as PNG.');
    });
  }

  function downloadZip() {
    TN.clearErr(errId());
    if (!pages.length) { TN.setErr(errId(), 'Convert a PDF first.'); return; }
    if (typeof JSZip === 'undefined') {
      TN.setErr(errId(), 'ZIP engine failed to load. Check your connection and reload the page.');
      return;
    }
    var btn = TN.el(SLUG + '-zip');
    if (btn) btn.disabled = true;
    (async function () {
      try {
        var zip = new JSZip();
        for (var i = 0; i < pages.length; i++) {
          var blob = await canvasToBlob(pages[i]);
          zip.file(pdfName + '-page-' + (i + 1) + '.png', blob);
        }
        var out = await zip.generateAsync({ type: 'blob' });
        TN.download(out, pdfName + '-pages.zip');
      } catch (e) {
        TN.setErr(errId(), 'ZIP creation failed: ' + (e && e.message ? e.message : 'unknown error.'));
      } finally {
        if (btn) btn.disabled = false;
      }
    })();
  }

  function clear() {
    TN.clearErr(errId());
    pages = [];
    pdfName = '';
    var f = TN.el(SLUG + '-file');
    if (f) f.value = '';
    var thumbs = TN.el(SLUG + '-thumbs');
    if (thumbs) thumbs.innerHTML = '';
    var res = TN.el(SLUG + '-result');
    if (res) TN.hide(res);
    setProgress(null);
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var c = TN.el(SLUG + '-convert');
      if (c) TN.on(c, 'click', convert);
      var z = TN.el(SLUG + '-zip');
      if (z) TN.on(z, 'click', downloadZip);
      var x = TN.el(SLUG + '-clear');
      if (x) TN.on(x, 'click', clear);
      ensureWorker();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();