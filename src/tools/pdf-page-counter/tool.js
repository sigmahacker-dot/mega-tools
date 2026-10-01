/* PDF Page Counter — page count + metadata via pdf-lib. */
(function () {
  'use strict';
  var SLUG = 'pdf-page-counter';
  var ERR = SLUG + '-error';

  function $(id) { return document.getElementById(id); }

  function fmtBytes(n) {
    try { return TN.fmtBytes(n); } catch (e) {
      if (n < 1024) return n + ' B';
      if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
      return (n / 1048576).toFixed(1) + ' MB';
    }
  }

  function analyze(file) {
    if (typeof PDFLib === 'undefined') { TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload.'); return; }
    var r = new FileReader();
    r.onload = function () {
      var buf = r.result;
      PDFLib.PDFDocument.load(buf, { ignoreEncryption: true }).then(function (doc) {
        var n = doc.getPageCount();
        $('pdf-page-counter-pages').textContent = n;
        $('pdf-page-counter-size').textContent = fmtBytes(file.size);
        $('pdf-page-counter-enc').textContent = doc.isEncrypted ? 'Yes' : 'No';
        $('pdf-page-counter-name').textContent = file.name || '–';
        var sizes = {};
        for (var i = 0; i < n; i++) {
          var s = doc.getPage(i).getSize();
          var key = Math.round(s.width) + ' × ' + Math.round(s.height);
          sizes[key] = (sizes[key] || 0) + 1;
        }
        $('pdf-page-counter-dims').textContent = Object.keys(sizes).map(function (k) { return k + ' (' + sizes[k] + '×)'; }).join(', ') || '–';
        var title = '', producer = '';
        try { title = doc.getTitle() || ''; producer = doc.getProducer() || ''; } catch (e) { /* ignore */ }
        $('pdf-page-counter-title').textContent = title || '–';
        $('pdf-page-counter-producer').textContent = producer || '–';
        $('pdf-page-counter-result').hidden = false;
        TN.clearErr(ERR);
      }).catch(function () {
        TN.setErr(ERR, 'Could not read that PDF. It may be corrupted.');
      });
    };
    r.onerror = function () { TN.setErr(ERR, 'Could not read the file.'); };
    r.readAsArrayBuffer(file);
  }

  try {
    TN.on('pdf-page-counter-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) analyze(f);
    });
  } catch (e) { /* never throw on load */ }
})();
