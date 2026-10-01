/* PDF Page Size Changer — resize every page to a target paper size with pdf-lib. */
(function () {
  'use strict';
  var S = 'pdf-page-size-changer';
  var outBytes = null;

  function targetSize() {
    var v = TN.el(S + '-size').value;
    if (v === 'custom') {
      var w = parseFloat(TN.el(S + '-w').value);
      var h = parseFloat(TN.el(S + '-h').value);
      if (!(w >= 36 && w <= 5000 && h >= 36 && h <= 5000)) return null;
      return { w: w, h: h };
    }
    var p = v.split(',');
    return { w: parseFloat(p[0]), h: parseFloat(p[1]) };
  }

  function run() {
    TN.clearErr(S + '-error');
    if (typeof PDFLib === 'undefined') { TN.setErr(S + '-error', 'PDF engine is still loading — please try again in a moment.'); return; }
    var f = TN.el(S + '-file').files[0];
    if (!f) { TN.setErr(S + '-error', 'Choose a PDF file first.'); return; }
    var size = targetSize();
    if (!size) { TN.setErr(S + '-error', 'Enter a valid custom size (36–5000 pt).'); return; }
    var fit = TN.el(S + '-fit').value === 'fit';
    var goBtn = TN.el(S + '-go');
    goBtn.disabled = true;
    TN.readAsArrayBuffer(f).then(function (buf) {
      return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
    }).then(function (src) {
      return PDFLib.PDFDocument.create().then(function (out) {
        var pages = src.getPages();
        var chain = Promise.resolve();
        pages.forEach(function (pg) {
          chain = chain.then(function () {
            return out.embedPage(pg).then(function (emb) {
              var pw = pg.getWidth(), ph = pg.getHeight();
              var sc = fit ? Math.min(size.w / pw, size.h / ph) : Math.max(size.w / pw, size.h / ph);
              var dw = pw * sc, dh = ph * sc;
              var np = out.addPage([size.w, size.h]);
              np.drawPage(emb, { x: (size.w - dw) / 2, y: (size.h - dh) / 2, width: dw, height: dh });
            });
          });
        });
        return chain.then(function () { return { doc: out, n: pages.length }; });
      });
    }).then(function (r) {
      return r.doc.save().then(function (bytes) {
        outBytes = bytes;
        TN.el(S + '-pages').textContent = String(r.n);
        TN.el(S + '-dim').textContent = Math.round(size.w) + ' × ' + Math.round(size.h);
        TN.show(S + '-result');
        TN.el(S + '-dl').disabled = false;
        goBtn.disabled = false;
      });
    }).catch(function (e) {
      goBtn.disabled = false;
      TN.setErr(S + '-error', 'Could not process this PDF: ' + (e && e.message ? e.message : e));
    });
  }

  try {
    if (!TN.el(S + '-file')) return;
    TN.on(S + '-size', 'change', function () {
      TN.el(S + '-custom').classList.toggle('hidden', TN.el(S + '-size').value !== 'custom');
    });
    TN.on(S + '-go', 'click', run);
    TN.on(S + '-dl', 'click', function () {
      if (outBytes) TN.download(new Blob([outBytes], { type: 'application/pdf' }), 'resized-pages.pdf');
    });
  } catch (e) { /* never throw on load */ }
})();
