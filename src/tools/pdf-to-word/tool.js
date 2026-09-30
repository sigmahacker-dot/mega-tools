/* PDF to Word — extract per-page text with pdf.js, build .docx with the docx lib. */
(function () {
  'use strict';

  var SLUG = 'pdf-to-word';
  var WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  var state = { file: null, name: '' };

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
    state = { file: f || null, name: f ? f.name : '' };
    if (f) setStatus('Selected: ' + f.name + ' (' + TN.fmtBytes(f.size) + ')');
  }

  function itemsToLines(items) {
    var kept = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it && typeof it.str === 'string' && it.str.trim() && it.transform) kept.push(it);
    }
    kept.sort(function (a, b) {
      var dy = b.transform[5] - a.transform[5];
      if (Math.abs(dy) > 1) return dy;
      return a.transform[4] - b.transform[4];
    });
    var lines = [];
    kept.forEach(function (it) {
      var y = it.transform[5], x = it.transform[4];
      var last = lines[lines.length - 1];
      if (last && Math.abs(last.y - y) < 3) {
        last.parts.push({ x: x, s: it.str });
      } else {
        lines.push({ y: y, parts: [{ x: x, s: it.str }] });
      }
    });
    return lines.map(function (L) {
      L.parts.sort(function (a, b) { return a.x - b.x; });
      return L.parts.map(function (p) { return p.s; }).join(' ');
    });
  }

  function onConvert() {
    TN.clearErr(errId());
    try { var res0 = TN.el(SLUG + '-result'); if (res0) TN.hide(res0); } catch (e) {}
    setStatus('');
    if (typeof pdfjsLib === 'undefined') {
      TN.setErr(errId(), 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    if (typeof docx === 'undefined') {
      TN.setErr(errId(), 'Word engine failed to load. Check your connection and reload the page.');
      return;
    }
    if (!state.file) {
      TN.setErr(errId(), 'Choose a PDF file first.');
      return;
    }
    ensureWorker();
    var btn = null;
    try { btn = TN.el(SLUG + '-convert'); if (btn) btn.disabled = true; } catch (e) {}
    setProgress(0);
    (async function () {
      try {
        var data = await TN.readAsArrayBuffer(state.file);
        var pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise;
        var n = pdf.numPages;
        var children = [];
        var totalChars = 0;
        for (var i = 1; i <= n; i++) {
          setStatus('Extracting text from page ' + i + ' of ' + n + '…');
          var page = await pdf.getPage(i);
          var tc = await page.getTextContent();
          var paras = itemsToLines(tc.items || []);
          children.push(new docx.Paragraph({
            heading: docx.HeadingLevel.HEADING_1,
            children: [new docx.TextRun('Page ' + i)]
          }));
          if (!paras.length) {
            children.push(new docx.Paragraph({
              children: [new docx.TextRun({ text: '(no extractable text on this page — it may be a scanned image)', italics: true })]
            }));
          }
          paras.forEach(function (para) {
            totalChars += para.length;
            children.push(new docx.Paragraph({ children: [new docx.TextRun(para)] }));
          });
          children.push(new docx.Paragraph({}));
          try { page.cleanup(); } catch (e2) {}
          setProgress(Math.round((i / n) * 100));
          await new Promise(function (r) { setTimeout(r, 0); });
        }
        if (totalChars === 0) {
          TN.setErr(errId(), 'No extractable text was found in this PDF — it is probably made of scanned images. This tool does not do OCR.');
          return;
        }
        var doc = new docx.Document({ sections: [{ children: children }] });
        var blob = await docx.Packer.toBlob(doc);
        TN.download(blob, 'extracted.docx');
        try {
          var res = TN.el(SLUG + '-result');
          if (res) {
            res.innerHTML = '<p class="success">Extracted text from ' + n + ' page' + (n === 1 ? '' : 's')
              + ' — <strong>extracted.docx</strong> downloaded.</p>';
            TN.show(res);
          }
        } catch (e3) {}
        setStatus('Done.');
      } catch (e) {
        TN.setErr(errId(), 'Conversion failed: ' + (e && e.message ? e.message : 'unknown error.'));
      } finally {
        if (btn) btn.disabled = false;
        setProgress(null);
      }
    })();
  }

  function onClear() {
    state = { file: null, name: '' };
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
      var cBtn = TN.el(SLUG + '-convert');
      if (cBtn) TN.on(cBtn, 'click', onConvert);
      var clearBtn = TN.el(SLUG + '-clear');
      if (clearBtn) TN.on(clearBtn, 'click', onClear);
      ensureWorker();
    } catch (e) { /* nothing may throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
