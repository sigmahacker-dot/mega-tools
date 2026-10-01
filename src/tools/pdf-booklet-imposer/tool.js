/* PDF Booklet Imposer — 4-pages-per-sheet spreads in correct saddle-stitch order. */
(function () {
  'use strict';
  var SLUG = 'pdf-booklet-imposer';
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

    (async function () {
      var buf = await TN.readAsArrayBuffer(file);
      var src = await PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      var n = src.getPageCount();
      if (n < 1) throw new Error('This PDF has no pages.');
      var total = Math.ceil(n / 4) * 4;
      var sheets = total / 4;
      var p0 = src.getPage(0);
      var pw = p0.getWidth(), ph = p0.getHeight();

      var out = await PDFLib.PDFDocument.create();
      // gather source pages + blank padding
      var srcPages = [];
      for (var i = 0; i < n; i++) srcPages.push(src.getPage(i));
      var blanks = total - n;
      // embed real pages into out doc
      var embedded = [];
      for (var e = 0; e < n; e++) {
        var em = await out.embedPage(srcPages[e]);
        embedded.push(em);
      }
      function embFor(idx) { return idx < n ? embedded[idx] : null; }

      for (var k = 0; k < sheets; k++) {
        // front: [last, first], back: [second, second-last]
        var pairs = [
          [total - 1 - 2 * k, 2 * k],
          [2 * k + 1, total - 2 - 2 * k]
        ];
        for (var s = 0; s < 2; s++) {
          var sheet = out.addPage([pw * 2, ph]);
          for (var c = 0; c < 2; c++) {
            var em2 = embFor(pairs[s][c]);
            if (!em2) continue;
            // scale source page to fit half-sheet, keep aspect
            var ew = em2.width, eh = em2.height;
            var sc = Math.min(pw / ew, ph / eh);
            var dw = ew * sc, dh = eh * sc;
            sheet.drawPage(em2, {
              x: c * pw + (pw - dw) / 2,
              y: (ph - dh) / 2,
              width: dw,
              height: dh
            });
          }
        }
      }
      outBytes = await out.save();
      document.getElementById(SLUG + '-pages').textContent = n + (blanks ? ' (+' + blanks + ' blank)' : '');
      document.getElementById(SLUG + '-sheets').textContent = sheets * 2 + ' (' + sheets + ' paper sheets)';
      document.getElementById(SLUG + '-size').textContent = TN.fmtBytes(outBytes.length);
      var info = document.getElementById(SLUG + '-info');
      if (info) info.textContent = 'Sheet order: front [last+first], back [second+second-last], … Print double-sided, flip on short edge.';
      res.classList.remove('hidden');
    })().catch(function (e) {
      TN.setErr(ERR, 'Could not impose the booklet: ' + ((e && e.message) || e));
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
      TN.download(new Blob([outBytes], { type: 'application/pdf' }), 'booklet.pdf');
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
