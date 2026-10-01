/* PDF Page Deleter — remove selected pages via pdf-lib. */
(function () {
  'use strict';
  var SLUG = 'pdf-page-deleter';
  var ERR = SLUG + '-error';
  var buf = null;
  var pageCount = 0;
  var pdfName = 'document.pdf';

  function $(id) { return document.getElementById(id); }

  function parsePages(spec, max) {
    var set = {};
    var parts = (spec || '').split(',');
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].trim();
      if (!p) continue;
      var m = p.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        var a = parseInt(m[1], 10), b = parseInt(m[2], 10);
        if (a > b) { var t = a; a = b; b = t; }
        for (var n = a; n <= b; n++) { if (n >= 1 && n <= max) set[n] = true; }
      } else if (/^\d+$/.test(p)) {
        var v = parseInt(p, 10);
        if (v >= 1 && v <= max) set[v] = true;
      } else {
        return null; // invalid token
      }
    }
    return Object.keys(set).map(Number).sort(function (x, y) { return x - y; });
  }

  function refreshStats() {
    var pages = parsePages($('pdf-page-deleter-pages').value, pageCount);
    if (pages === null) {
      $('pdf-page-deleter-del').textContent = '–';
      $('pdf-page-deleter-keep').textContent = '–';
      $('pdf-page-deleter-list').textContent = '';
      return;
    }
    $('pdf-page-deleter-del').textContent = pages.length;
    $('pdf-page-deleter-keep').textContent = pageCount - pages.length;
    $('pdf-page-deleter-list').textContent = pages.length
      ? 'Deleting pages: ' + pages.join(', ')
      : 'No valid pages selected yet.';
  }

  function go() {
    if (typeof PDFLib === 'undefined') { TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload.'); return; }
    if (!buf) { TN.setErr(ERR, 'Upload a PDF first.'); return; }
    var pages = parsePages($('pdf-page-deleter-pages').value, pageCount);
    if (pages === null) { TN.setErr(ERR, 'Invalid page specification. Use numbers and ranges like “2, 5-8”.'); return; }
    if (!pages.length) { TN.setErr(ERR, 'No valid pages to delete.'); return; }
    if (pages.length >= pageCount) { TN.setErr(ERR, 'You cannot delete all pages of the PDF.'); return; }
    TN.clearErr(ERR);
    PDFLib.PDFDocument.load(buf.slice(0)).then(function (src) {
      return PDFLib.PDFDocument.create().then(function (doc) {
        var delSet = {};
        pages.forEach(function (p) { delSet[p - 1] = true; });
        var keepIdx = [];
        for (var i = 0; i < pageCount; i++) { if (!delSet[i]) keepIdx.push(i); }
        return doc.copyPages(src, keepIdx).then(function (copied) {
          copied.forEach(function (p) { doc.addPage(p); });
          return doc.save();
        });
      });
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = pdfName.replace(/\.pdf$/i, '') + '-trimmed.pdf';
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); }, 100);
    }).catch(function () {
      TN.setErr(ERR, 'Could not process that PDF. It may be encrypted or corrupted.');
    });
  }

  try {
    TN.on('pdf-page-deleter-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      pdfName = f.name || pdfName;
      var r = new FileReader();
      r.onload = function () {
        buf = r.result;
        if (typeof PDFLib === 'undefined') { TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload.'); return; }
        PDFLib.PDFDocument.load(buf.slice(0)).then(function (doc) {
          pageCount = doc.getPageCount();
          $('pdf-page-deleter-total').textContent = pageCount;
          $('pdf-page-deleter-form').hidden = false;
          $('pdf-page-deleter-result').hidden = false;
          $('pdf-page-deleter-go').disabled = false;
          TN.clearErr(ERR);
          refreshStats();
        }).catch(function () { TN.setErr(ERR, 'Could not read that PDF. It may be encrypted or corrupted.'); });
      };
      r.onerror = function () { TN.setErr(ERR, 'Could not read the file.'); };
      r.readAsArrayBuffer(f);
    });
    TN.on('pdf-page-deleter-pages', 'input', refreshStats);
    TN.on('pdf-page-deleter-go', 'click', go);
  } catch (e) { /* never throw on load */ }
})();
