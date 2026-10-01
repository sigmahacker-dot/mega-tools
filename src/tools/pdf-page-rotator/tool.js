/* PDF Page Rotator — rotate selected pages with pdf-lib (lossless metadata rotation). */
(function () {
  'use strict';
  var SLUG = 'pdf-page-rotator';
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
      } else { return null; }
    }
    return Object.keys(set).map(Number).sort(function (x, y) { return x - y; });
  }

  function go() {
    if (typeof PDFLib === 'undefined') { TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload.'); return; }
    if (!buf) { TN.setErr(ERR, 'Upload a PDF first.'); return; }
    var deg = parseInt($('pdf-page-rotator-deg').value, 10) || 90;
    var targets;
    if ($('pdf-page-rotator-scope').value === 'all') {
      targets = [];
      for (var i = 0; i < pageCount; i++) targets.push(i);
    } else {
      var pages = parsePages($('pdf-page-rotator-pages').value, pageCount);
      if (pages === null) { TN.setErr(ERR, 'Invalid page specification. Use numbers and ranges like “1, 4-6”.'); return; }
      if (!pages.length) { TN.setErr(ERR, 'No valid pages selected.'); return; }
      targets = pages.map(function (p) { return p - 1; });
    }
    TN.clearErr(ERR);
    PDFLib.PDFDocument.load(buf.slice(0)).then(function (doc) {
      targets.forEach(function (idx) {
        var page = doc.getPage(idx);
        var cur = page.getRotation().angle || 0;
        page.setRotation(PDFLib.degrees((cur + deg) % 360));
      });
      return doc.save();
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = pdfName.replace(/\.pdf$/i, '') + '-rotated.pdf';
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); }, 100);
      TN.clearErr(ERR);
    }).catch(function () {
      TN.setErr(ERR, 'Could not process that PDF. It may be encrypted or corrupted.');
    });
  }

  try {
    TN.on('pdf-page-rotator-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      pdfName = f.name || pdfName;
      var r = new FileReader();
      r.onload = function () {
        buf = r.result;
        if (typeof PDFLib === 'undefined') { TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload.'); return; }
        PDFLib.PDFDocument.load(buf.slice(0)).then(function (doc) {
          pageCount = doc.getPageCount();
          $('pdf-page-rotator-form').hidden = false;
          $('pdf-page-rotator-result').hidden = false;
          $('pdf-page-rotator-info').textContent = 'Loaded ' + pageCount + ' page' + (pageCount === 1 ? '' : 's') + '.';
          $('pdf-page-rotator-go').disabled = false;
          TN.clearErr(ERR);
        }).catch(function () { TN.setErr(ERR, 'Could not read that PDF. It may be encrypted or corrupted.'); });
      };
      r.onerror = function () { TN.setErr(ERR, 'Could not read the file.'); };
      r.readAsArrayBuffer(f);
    });
    TN.on('pdf-page-rotator-scope', 'change', function () {
      $('pdf-page-rotator-pages-wrap').hidden = $('pdf-page-rotator-scope').value !== 'some';
    });
    TN.on('pdf-page-rotator-go', 'click', go);
  } catch (e) { /* never throw on load */ }
})();
