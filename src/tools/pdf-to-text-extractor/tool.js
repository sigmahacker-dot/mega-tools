/* PDF to Text Extractor — page-by-page text extraction with PDF.js. */
(function () {
  'use strict';
  var SLUG = 'pdf-to-text-extractor';
  var ERR = SLUG + '-error';
  var WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  var fullText = '';
  var pdfName = 'document.pdf';

  function $(id) { return document.getElementById(id); }

  function ensureWorker() {
    try {
      if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
      }
    } catch (e) { /* ignore */ }
  }

  function extract(buf) {
    ensureWorker();
    if (typeof pdfjsLib === 'undefined') { TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload.'); return; }
    TN.clearErr(ERR);
    $('pdf-to-text-extractor-out').value = 'Extracting text…';
    $('pdf-to-text-extractor-result').hidden = false;
    pdfjsLib.getDocument({ data: buf }).promise.then(function (pdf) {
      var n = pdf.numPages;
      $('pdf-to-text-extractor-pages').textContent = n;
      var parts = [];
      var chain = Promise.resolve();
      for (var i = 1; i <= n; i++) {
        (function (pageNum) {
          chain = chain.then(function () {
            return pdf.getPage(pageNum).then(function (page) {
              return page.getTextContent().then(function (tc) {
                var strs = tc.items.map(function (it) { return it.str; });
                parts.push('--- Page ' + pageNum + ' ---\n' + strs.join(' '));
                $('pdf-to-text-extractor-out').value = 'Extracted ' + pageNum + ' / ' + n + ' pages…';
              });
            });
          });
        })(i);
      }
      return chain.then(function () {
        fullText = parts.join('\n\n');
        $('pdf-to-text-extractor-out').value = fullText || '(No text found — this PDF may be scanned images.)';
        $('pdf-to-text-extractor-chars').textContent = fullText.length.toLocaleString('en-US');
        $('pdf-to-text-extractor-words').textContent = (fullText.match(/\S+/g) || []).length.toLocaleString('en-US');
        $('pdf-to-text-extractor-copy').disabled = !fullText;
        $('pdf-to-text-extractor-dl').disabled = !fullText;
      });
    }).catch(function () {
      TN.setErr(ERR, 'Could not read that PDF. It may be encrypted or corrupted.');
    });
  }

  try {
    TN.on('pdf-to-text-extractor-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      pdfName = f.name || pdfName;
      fullText = '';
      $('pdf-to-text-extractor-copy').disabled = true;
      $('pdf-to-text-extractor-dl').disabled = true;
      var r = new FileReader();
      r.onload = function () { extract(r.result); };
      r.onerror = function () { TN.setErr(ERR, 'Could not read the file.'); };
      r.readAsArrayBuffer(f);
    });
    TN.on('pdf-to-text-extractor-copy', 'click', function () {
      if (!fullText) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullText).then(function () { TN.clearErr(ERR); }, function () { TN.setErr(ERR, 'Copy failed — select the text and copy manually.'); });
      } else { TN.setErr(ERR, 'Clipboard not available — select the text and copy manually.'); }
    });
    TN.on('pdf-to-text-extractor-dl', 'click', function () {
      if (!fullText) return;
      var blob = new Blob([fullText], { type: 'text/plain' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = pdfName.replace(/\.pdf$/i, '') + '.txt';
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); }, 100);
    });
  } catch (e) { /* never throw on load */ }
})();
