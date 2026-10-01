/* PDF Blank Page Adder — insert blank pages at start/end/after page N. */
(function () {
  'use strict';
  var SLUG = 'pdf-blank-page-adder';
  var ERR = SLUG + '-error';
  var buf = null;
  var pageCount = 0;
  var pdfName = 'document.pdf';

  function $(id) { return document.getElementById(id); }

  function go() {
    if (typeof PDFLib === 'undefined') { TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload.'); return; }
    if (!buf) { TN.setErr(ERR, 'Upload a PDF first.'); return; }
    var count = parseInt($('pdf-blank-page-adder-count').value, 10);
    if (!(count >= 1 && count <= 100)) { TN.setErr(ERR, 'Enter a page count between 1 and 100.'); return; }
    var where = $('pdf-blank-page-adder-where').value;
    var after = parseInt($('pdf-blank-page-adder-after').value, 10) || 1;
    if (where === 'after' && (after < 1 || after > pageCount)) {
      TN.setErr(ERR, '“After page” must be between 1 and ' + pageCount + '.');
      return;
    }
    TN.clearErr(ERR);
    PDFLib.PDFDocument.load(buf.slice(0)).then(function (src) {
      return PDFLib.PDFDocument.create().then(function (doc) {
        return doc.copyPages(src, (function () { var a = []; for (var i = 0; i < pageCount; i++) a.push(i); return a; })()).then(function (copied) {
          copied.forEach(function (p) { doc.addPage(p); });
          // determine blank page size
          var sizeOpt = $('pdf-blank-page-adder-size').value;
          var w, h;
          if (sizeOpt === 'match') {
            var s = doc.getPage(0).getSize();
            w = s.width; h = s.height;
          } else {
            var parts = sizeOpt.split(',');
            w = parseFloat(parts[0]); h = parseFloat(parts[1]);
          }
          var at;
          if (where === 'start') at = 0;
          else if (where === 'after') at = after; // after page N (1-based) => index N
          else at = doc.getPageCount();
          for (var k = 0; k < count; k++) {
            doc.insertPage(at + k, [w, h]);
          }
          return doc.save();
        });
      });
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = pdfName.replace(/\.pdf$/i, '') + '-with-blanks.pdf';
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); }, 100);
      $('pdf-blank-page-adder-info').textContent = 'Added ' + count + ' blank page' + (count === 1 ? '' : 's') + ' — new total: ' + (pageCount + count) + ' pages.';
      $('pdf-blank-page-adder-result').hidden = false;
    }).catch(function () {
      TN.setErr(ERR, 'Could not process that PDF. It may be encrypted or corrupted.');
    });
  }

  try {
    TN.on('pdf-blank-page-adder-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      pdfName = f.name || pdfName;
      var r = new FileReader();
      r.onload = function () {
        buf = r.result;
        if (typeof PDFLib === 'undefined') { TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload.'); return; }
        PDFLib.PDFDocument.load(buf.slice(0)).then(function (doc) {
          pageCount = doc.getPageCount();
          $('pdf-blank-page-adder-form').hidden = false;
          $('pdf-blank-page-adder-go').disabled = false;
          TN.clearErr(ERR);
        }).catch(function () { TN.setErr(ERR, 'Could not read that PDF. It may be encrypted or corrupted.'); });
      };
      r.onerror = function () { TN.setErr(ERR, 'Could not read the file.'); };
      r.readAsArrayBuffer(f);
    });
    TN.on('pdf-blank-page-adder-where', 'change', function () {
      $('pdf-blank-page-adder-after-wrap').hidden = $('pdf-blank-page-adder-where').value !== 'after';
    });
    TN.on('pdf-blank-page-adder-go', 'click', go);
  } catch (e) { /* never throw on load */ }
})();
