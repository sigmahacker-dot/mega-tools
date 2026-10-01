/* PDF Bates Stamper — PREFIX-000001 numbering on a chosen page corner. */
(function () {
  'use strict';
  var SLUG = 'pdf-bates-stamper';
  var ERR = SLUG + '-error';
  var outBytes = null;
  var busy = false;

  function pad(n, digits) {
    var s = String(n);
    while (s.length < digits) s = '0' + s;
    return s;
  }

  function go() {
    if (busy) return;
    TN.clearErr(ERR);
    var fileEl = document.getElementById(SLUG + '-file');
    var file = fileEl && fileEl.files && fileEl.files[0];
    if (!file) { TN.setErr(ERR, 'Please choose a PDF file first.'); return; }
    if (typeof PDFLib === 'undefined') {
      TN.setErr(ERR, 'The PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    busy = true;
    var btn = document.getElementById(SLUG + '-go');
    if (btn) btn.disabled = true;
    var res = document.getElementById(SLUG + '-result');
    if (res) res.classList.add('hidden');
    outBytes = null;

    var prefix = (document.getElementById(SLUG + '-prefix').value || '').trim() || 'DOC';
    var start = parseInt(document.getElementById(SLUG + '-start').value, 10);
    if (isNaN(start) || start < 0) start = 1;
    var digits = parseInt(document.getElementById(SLUG + '-digits').value, 10) || 6;
    var pos = document.getElementById(SLUG + '-pos').value;
    var size = parseInt(document.getElementById(SLUG + '-size').value, 10) || 12;
    var margin = 36;

    (async function () {
      var buf = await TN.readAsArrayBuffer(file);
      var doc = await PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      var n = doc.getPageCount();
      if (n < 1) throw new Error('This PDF has no pages.');
      var font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
      for (var i = 0; i < n; i++) {
        var page = doc.getPage(i);
        var label = prefix + '-' + pad(start + i, digits);
        var tw = font.widthOfTextAtSize(label, size);
        var W = page.getWidth(), H = page.getHeight();
        var x, y;
        if (pos === 'br') { x = W - margin - tw; y = margin; }
        else if (pos === 'bl') { x = margin; y = margin; }
        else if (pos === 'tr') { x = W - margin - tw; y = H - margin - size; }
        else { x = margin; y = H - margin - size; }
        // white halo behind stamp for readability
        page.drawRectangle({
          x: x - 4, y: y - 4, width: tw + 8, height: size + 8,
          color: PDFLib.rgb(1, 1, 1), opacity: 0.85
        });
        page.drawText(label, { x: x, y: y, size: size, font: font, color: PDFLib.rgb(0.1, 0.1, 0.1) });
      }
      outBytes = await doc.save();
      document.getElementById(SLUG + '-pages').textContent = n;
      document.getElementById(SLUG + '-range').textContent =
        prefix + '-' + pad(start, digits) + ' … ' + prefix + '-' + pad(start + n - 1, digits);
      document.getElementById(SLUG + '-size2').textContent = TN.fmtBytes(outBytes.length);
      res.classList.remove('hidden');
    })().catch(function (e) {
      TN.setErr(ERR, 'Could not stamp the PDF: ' + ((e && e.message) || e));
    }).then(function () {
      busy = false;
      if (btn) btn.disabled = false;
    });
  }

  try {
    if (!document.getElementById(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', go);
    TN.on(SLUG + '-size', 'input', function () {
      var v = document.getElementById(SLUG + '-size-val');
      if (v) v.textContent = this.value;
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!outBytes) return;
      TN.download(new Blob([outBytes], { type: 'application/pdf' }), 'bates-stamped.pdf');
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
