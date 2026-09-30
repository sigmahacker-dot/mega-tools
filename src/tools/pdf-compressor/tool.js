/* PDF Compressor — re-render pages as JPEG images and rebuild the PDF. Requires pdfjsLib + PDFLib. */
(function () {
  'use strict';

  var SLUG = 'pdf-compressor';
  var WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  var QUALITY = {
    low: { scale: 1.0, q: 0.4 },
    medium: { scale: 1.5, q: 0.6 },
    high: { scale: 2.0, q: 0.85 }
  };
  var state = { file: null, name: '', bytes: null };

  function errId() { return SLUG + '-error'; }

  function setProgress(pct) {
    try {
      var wrap = TN.el(SLUG + '-progress');
      if (!wrap) return;
      var bar = wrap.querySelector('div');
      if (pct === null) { TN.hide(wrap); if (bar) bar.style.width = '0%'; }
      else { TN.show(wrap); if (bar) bar.style.width = pct + '%'; }
    } catch (e) {}
  }

  function setStatus(msg) {
    try {
      var s = TN.el(SLUG + '-status');
      if (s) s.textContent = msg || '';
    } catch (e) {}
  }

  function ensureWorker() {
    try {
      if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
      }
    } catch (e) {}
  }

  function onFileChosen(ev) {
    TN.clearErr(errId());
    try { var res = TN.el(SLUG + '-result'); if (res) TN.hide(res); } catch (e) {}
    setStatus('');
    var f = ev.target && ev.target.files ? ev.target.files[0] : null;
    state = { file: f || null, name: f ? f.name : '', bytes: f ? f.size : null };
    if (f) setStatus('Selected: ' + f.name + ' (' + TN.fmtBytes(f.size) + ')');
  }

  function canvasToJpeg(canvas, q) {
    return new Promise(function (resolve, reject) {
      try {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error('Could not encode page image.'));
        }, 'image/jpeg', q);
      } catch (e) { reject(e); }
    });
  }

  function onCompress() {
    TN.clearErr(errId());
    try { var res0 = TN.el(SLUG + '-result'); if (res0) TN.hide(res0); } catch (e) {}
    setStatus('');
    if (typeof pdfjsLib === 'undefined' || typeof PDFLib === 'undefined') {
      TN.setErr(errId(), 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    if (!state.file) {
      TN.setErr(errId(), 'Choose a PDF file first.');
      return;
    }
    var qkey = 'medium';
    try {
      var qEl = TN.el(SLUG + '-quality');
      if (qEl && QUALITY[qEl.value]) qkey = qEl.value;
    } catch (e) {}
    var q = QUALITY[qkey];
    ensureWorker();
    var btn = null;
    try { btn = TN.el(SLUG + '-compress'); if (btn) btn.disabled = true; } catch (e) {}
    var dlBtn = null;
    try { dlBtn = TN.el(SLUG + '-download'); } catch (e) {}
    if (dlBtn) TN.on(dlBtn, 'click', function () {
      if (state.bytes) TN.download(new Blob([state.bytes], { type: 'application/pdf' }), 'compressed.pdf');
    });
    setProgress(0);
    (async function () {
      try {
        var data = await TN.readAsArrayBuffer(state.file);
        var pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise;
        var n = pdf.numPages;
        var out = await PDFLib.PDFDocument.create();
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas is not supported in this browser.');
        for (var i = 1; i <= n; i++) {
          setStatus('Rendering page ' + i + ' of ' + n + '…');
          var page = await pdf.getPage(i);
          var viewport = page.getViewport({ scale: q.scale });
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
          var blob = await canvasToJpeg(canvas, q.q);
          var jpgBytes = new Uint8Array(await blob.arrayBuffer());
          var img = await out.embedJpg(jpgBytes);
          var pg = out.addPage([viewport.width, viewport.height]);
          pg.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
          try { page.cleanup(); } catch (e2) {}
          setProgress(Math.round((i / n) * 100));
          await new Promise(function (r) { setTimeout(r, 0); });
        }
        var bytes = await out.save();
        state.bytes = bytes;
        try {
          TN.el(SLUG + '-orig').textContent = TN.fmtBytes(state.file.size);
          TN.el(SLUG + '-new').textContent = TN.fmtBytes(bytes.length);
          var saved = state.file.size > 0 ? Math.round((1 - bytes.length / state.file.size) * 100) : 0;
          TN.el(SLUG + '-saved').textContent = (saved >= 0 ? saved : 0) + '%';
        } catch (e3) {}
        try {
          var res = TN.el(SLUG + '-result');
          if (res) TN.show(res);
        } catch (e4) {}
        setStatus('Done — ' + n + ' page' + (n === 1 ? '' : 's') + ' compressed.');
        TN.download(new Blob([bytes], { type: 'application/pdf' }), 'compressed.pdf');
      } catch (e) {
        TN.setErr(errId(), 'Compression failed: ' + (e && e.message ? e.message : 'unknown error.')
          + ' Very large PDFs may run out of memory — try the Low quality setting.');
      } finally {
        if (btn) btn.disabled = false;
        setProgress(null);
      }
    })();
  }

  function onClear() {
    state = { file: null, name: '', bytes: null };
    TN.clearErr(errId());
    setStatus('');
    setProgress(null);
    try {
      var input = TN.el(SLUG + '-file');
      if (input) input.value = '';
      var res = TN.el(SLUG + '-result');
      if (res) TN.hide(res);
    } catch (e) {}
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var input = TN.el(SLUG + '-file');
      if (!input) return;
      TN.on(input, 'change', onFileChosen);
      var cBtn = TN.el(SLUG + '-compress');
      if (cBtn) TN.on(cBtn, 'click', onCompress);
      var clearBtn = TN.el(SLUG + '-clear');
      if (clearBtn) TN.on(clearBtn, 'click', onClear);
      var dlBtn = TN.el(SLUG + '-download');
      if (dlBtn) TN.on(dlBtn, 'click', function () {
        if (state.bytes) TN.download(new Blob([state.bytes], { type: 'application/pdf' }), 'compressed.pdf');
      });
      ensureWorker();
    } catch (e) { /* nothing may throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
