/* PDF OCR Tool — render pages with pdf.js, recognize with Tesseract.js (loaded dynamically). */
(function () {
  'use strict';
  var SLUG = 'pdf-ocr-tool';
  var ERR = SLUG + '-error';
  var TESS_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
  var PDF_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  var SCALE = 1.8;
  var results = []; // {page, text}
  var busy = false;

  function setProgress(t) {
    var w = document.getElementById(SLUG + '-progress-wrap');
    var p = document.getElementById(SLUG + '-progress');
    if (!w) return;
    if (t === null) { w.classList.add('hidden'); }
    else { w.classList.remove('hidden'); if (p) p.textContent = t; }
  }

  function loadTesseract() {
    return new Promise(function (res, rej) {
      if (typeof Tesseract !== 'undefined') { res(); return; }
      var s = document.createElement('script');
      s.src = TESS_URL;
      s.onload = function () {
        if (typeof Tesseract !== 'undefined') res();
        else rej(new Error('loaded but unavailable'));
      };
      s.onerror = function () { rej(new Error('load failed')); };
      document.head.appendChild(s);
      setTimeout(function () {
        if (typeof Tesseract === 'undefined') rej(new Error('timed out'));
      }, 30000);
    });
  }

  function go() {
    if (busy) return;
    TN.clearErr(ERR);
    var fileEl = document.getElementById(SLUG + '-file');
    var file = fileEl && fileEl.files && fileEl.files[0];
    if (!file) { TN.setErr(ERR, 'Please choose a PDF file first.'); return; }
    if (typeof pdfjsLib === 'undefined') {
      TN.setErr(ERR, 'The PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    busy = true;
    var btn = document.getElementById(SLUG + '-go');
    if (btn) btn.disabled = true;
    var res = document.getElementById(SLUG + '-result');
    if (res) res.classList.add('hidden');
    var dl = document.getElementById(SLUG + '-download');
    if (dl) dl.classList.add('hidden');
    results = [];
    var lang = document.getElementById(SLUG + '-lang').value || 'eng';

    setProgress('Loading OCR engine…');
    loadTesseract().then(function () {
      try { pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER; } catch (e) {}
      setProgress('Reading PDF…');
      return TN.readAsArrayBuffer(file);
    }).then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var n = pdf.numPages;
      var chain = Promise.resolve();
      for (var p = 1; p <= n; p++) {
        (function (p) {
          chain = chain.then(function () {
            setProgress('Recognizing page ' + p + ' of ' + n + '…');
            return pdf.getPage(p).then(function (page) {
              var vp = page.getViewport({ scale: SCALE });
              var canvas = document.createElement('canvas');
              canvas.width = Math.floor(vp.width);
              canvas.height = Math.floor(vp.height);
              return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise.then(function () {
                return Tesseract.recognize(canvas, lang);
              }).then(function (r) {
                var text = (r && r.data && r.data.text || '').trim();
                results.push({ page: p, text: text });
              });
            });
          });
        })(p);
      }
      return chain;
    }).then(function () {
      setProgress(null);
      renderResults(file.name);
    }).catch(function (e) {
      setProgress(null);
      var msg = (e && e.message) || String(e);
      if (/load failed|timed out|unavailable/.test(msg)) {
        TN.setErr(ERR, 'The OCR engine (Tesseract.js) could not be loaded from the CDN. Check your internet connection and try again — no fake results were produced.');
      } else {
        TN.setErr(ERR, 'OCR failed: ' + msg);
      }
    }).then(function () {
      busy = false;
      if (btn) btn.disabled = false;
    });
  }

  function renderResults(name) {
    var wrap = document.getElementById(SLUG + '-pages');
    var res = document.getElementById(SLUG + '-result');
    var dl = document.getElementById(SLUG + '-download');
    if (!wrap || !res) return;
    wrap.innerHTML = '';
    results.sort(function (a, b) { return a.page - b.page; });
    results.forEach(function (r) {
      var d = document.createElement('div');
      d.className = 'field';
      d.style.cssText = 'border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin-bottom:12px;';
      var label = document.createElement('label');
      label.textContent = 'Page ' + r.page + ' — ' + (r.text ? r.text.length + ' characters' : 'no text recognized');
      var ta = document.createElement('textarea');
      ta.className = 'textarea';
      ta.rows = 6;
      ta.readOnly = true;
      ta.value = r.text || '(no text recognized on this page)';
      var row = document.createElement('div');
      row.className = 'btn-row';
      row.style.marginTop = '8px';
      var cp = document.createElement('button');
      cp.className = 'btn btn-sm btn-outline';
      cp.textContent = 'Copy page text';
      cp.onclick = function () {
        TN.copy(r.text || '').then(function () { cp.textContent = 'Copied ✓'; setTimeout(function () { cp.textContent = 'Copy page text'; }, 1500); })
          .catch(function () { TN.setErr(ERR, 'Copy failed — select the text manually.'); });
      };
      row.appendChild(cp);
      d.appendChild(label); d.appendChild(ta); d.appendChild(row);
      wrap.appendChild(d);
    });
    res.classList.remove('hidden');
    if (dl) dl.classList.remove('hidden');
    TN.clearErr(ERR);
    if (!results.some(function (r) { return r.text; })) {
      TN.setErr(ERR, 'No text was recognized in any page. The PDF may be blank, or the scan quality too low.');
    }
  }

  try {
    if (!document.getElementById(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', go);
    TN.on(SLUG + '-download', 'click', function () {
      if (!results.length) return;
      var txt = results.map(function (r) {
        return '===== Page ' + r.page + ' =====\n' + (r.text || '(no text recognized)') + '\n';
      }).join('\n');
      TN.downloadText(txt, 'ocr-output.txt', 'text/plain');
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
