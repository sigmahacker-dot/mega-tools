/* PDF N-Up Imposer — 2/4/9 pages per portrait sheet, aspect-preserving. */
(function () {
  'use strict';
  var SLUG = 'pdf-n-up-imposer';
  var ERR = SLUG + '-error';
  var outBytes = null;
  var busy = false;

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

    var perSheet = parseInt(document.getElementById(SLUG + '-n').value, 10) || 4;
    var showNums = document.getElementById(SLUG + '-numbers').checked;
    var cols = perSheet === 2 ? 1 : (perSheet === 4 ? 2 : 3);
    var rows = perSheet === 2 ? 2 : (perSheet === 4 ? 2 : 3);

    (async function () {
      var buf = await TN.readAsArrayBuffer(file);
      var src = await PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      var n = src.getPageCount();
      if (n < 1) throw new Error('This PDF has no pages.');
      var out = await PDFLib.PDFDocument.create();
      var font = await out.embedFont(PDFLib.StandardFonts.Helvetica);
      var p0 = src.getPage(0);
      var SW = p0.getWidth(), SH = p0.getHeight();
      var cellW = SW / cols, cellH = SH / rows;
      var sheets = Math.ceil(n / perSheet);

      for (var s = 0; s < sheets; s++) {
        var sheet = out.addPage([SW, SH]);
        for (var c = 0; c < perSheet; c++) {
          var pi = s * perSheet + c;
          if (pi >= n) break;
          var em = await out.embedPage(src.getPage(pi));
          var sc = Math.min((cellW - 12) / em.width, (cellH - 12) / em.height);
          var dw = em.width * sc, dh = em.height * sc;
          var col = c % cols, row = Math.floor(c / cols);
          var x = col * cellW + (cellW - dw) / 2;
          var y = SH - (row + 1) * cellH + (cellH - dh) / 2;
          sheet.drawPage(em, { x: x, y: y, width: dw, height: dh });
          // cell border
          sheet.drawRectangle({
            x: col * cellW + 2, y: SH - (row + 1) * cellH + 2,
            width: cellW - 4, height: cellH - 4,
            borderColor: PDFLib.rgb(0.75, 0.75, 0.78), borderWidth: 0.75
          });
          if (showNums) {
            sheet.drawText(String(pi + 1), {
              x: col * cellW + 8, y: SH - row * cellH - 16,
              size: 10, font: font, color: PDFLib.rgb(0.45, 0.45, 0.5)
            });
          }
        }
      }
      outBytes = await out.save();
      document.getElementById(SLUG + '-in').textContent = n;
      document.getElementById(SLUG + '-out').textContent = sheets;
      document.getElementById(SLUG + '-size').textContent = TN.fmtBytes(outBytes.length);
      res.classList.remove('hidden');
    })().catch(function (e) {
      TN.setErr(ERR, 'Could not impose the PDF: ' + ((e && e.message) || e));
    }).then(function () {
      busy = false;
      if (btn) btn.disabled = false;
    });
  }

  try {
    if (!document.getElementById(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', go);
    TN.on(SLUG + '-download', 'click', function () {
      if (!outBytes) return;
      TN.download(new Blob([outBytes], { type: 'application/pdf' }), 'n-up.pdf');
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
