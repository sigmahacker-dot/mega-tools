/* Resize PDF to A4 — scale each page to fit A4 via pdf-lib page embedding. */
(function () {
  'use strict';
  var SLUG = 'pdf-resize-to-a4';
  var ERR = SLUG + '-error';
  var A4W = 595.28, A4H = 841.89; /* points: 210 × 297 mm */
  var buffer = null;
  var pdfName = 'document.pdf';

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function onFile(ev) {
    TN.clearErr(ERR);
    TN.hide(SLUG + '-result');
    $('info').textContent = '';
    var f = ev.target.files && ev.target.files[0];
    if (!f) { buffer = null; $('go').disabled = true; return; }
    if (typeof PDFLib === 'undefined') {
      TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    pdfName = f.name || pdfName;
    (async function () {
      try {
        buffer = await TN.readAsArrayBuffer(f);
        var doc = await PDFLib.PDFDocument.load(buffer);
        var n = doc.getPageCount();
        var first = doc.getPage(0);
        $('info').textContent = pdfName + ' — ' + n + ' page' + (n === 1 ? '' : 's')
          + ', first page ' + Math.round(first.getWidth()) + ' × ' + Math.round(first.getHeight()) + ' pt.';
        $('go').disabled = false;
        TN.clearErr(ERR);
      } catch (e) {
        buffer = null;
        $('go').disabled = true;
        TN.setErr(ERR, 'Could not read "' + pdfName + '" — is it a valid PDF?');
      }
    })();
  }

  function onGo() {
    TN.clearErr(ERR);
    TN.hide(SLUG + '-result');
    if (!buffer) { TN.setErr(ERR, 'Choose a PDF file first.'); return; }
    if (typeof PDFLib === 'undefined') {
      TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    var orient = $('orient').value;
    var pad = parseFloat($('pad').value) * 72;
    var btn = $('go');
    btn.disabled = true;
    (async function () {
      try {
        var src = await PDFLib.PDFDocument.load(buffer);
        var out = await PDFLib.PDFDocument.create();
        var n = src.getPageCount();
        for (var i = 0; i < n; i++) {
          var sp = src.getPage(i);
          var pw = sp.getWidth(), ph = sp.getHeight();
          var landscape;
          if (orient === 'portrait') landscape = false;
          else if (orient === 'landscape') landscape = true;
          else landscape = pw > ph;
          var tw = landscape ? A4H : A4W;
          var th = landscape ? A4W : A4H;
          var embed = await out.embedPage(sp);
          var np = out.addPage([tw, th]);
          var availW = tw - pad * 2, availH = th - pad * 2;
          var scale = Math.min(availW / pw, availH / ph);
          var dw = pw * scale, dh = ph * scale;
          np.drawPage(embed, {
            x: (tw - dw) / 2,
            y: (th - dh) / 2,
            width: dw,
            height: dh
          });
          await new Promise(function (r) { setTimeout(r, 0); });
        }
        var bytes = await out.save();
        TN.download(new Blob([bytes], { type: 'application/pdf' }), pdfName.replace(/\.pdf$/i, '') + '-a4.pdf');
        var res = $('result');
        res.innerHTML = '<p class="success">' + n + ' page' + (n === 1 ? '' : 's') + ' resized to A4. Download started.</p>';
        TN.show(SLUG + '-result');
      } catch (e) {
        TN.setErr(ERR, 'Resize failed: ' + (e && e.message ? e.message : 'unknown error.'));
      } finally {
        btn.disabled = false;
      }
    })();
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      TN.on(SLUG + '-file', 'change', onFile);
      TN.on(SLUG + '-go', 'click', onGo);
      TN.on(SLUG + '-pad', 'input', function () {
        $('pad-v').textContent = parseFloat($('pad').value).toFixed(2) + 'in';
      });
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
