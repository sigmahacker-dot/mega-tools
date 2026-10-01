/* PDF Page Cropper — set crop boxes from inch margins via pdf-lib. */
(function () {
  'use strict';
  var SLUG = 'pdf-page-cropper';
  var ERR = SLUG + '-error';
  var buffer = null;
  var pdfName = 'document.pdf';
  var pageCount = 0;

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function margins() {
    return {
      top: Math.max(0, parseFloat($('top').value) || 0),
      right: Math.max(0, parseFloat($('right').value) || 0),
      bottom: Math.max(0, parseFloat($('bottom').value) || 0),
      left: Math.max(0, parseFloat($('left').value) || 0)
    };
  }

  function paintPreview() {
    try {
      var m = margins();
      var t = Math.min(45, m.top * 60), r = Math.min(45, m.right * 60);
      var b = Math.min(45, m.bottom * 60), l = Math.min(45, m.left * 60);
      var crop = $('crop');
      crop.style.top = t + 'px';
      crop.style.right = r + 'px';
      crop.style.bottom = b + 'px';
      crop.style.left = l + 'px';
    } catch (e) { /* ignore */ }
  }

  function onFile(ev) {
    TN.clearErr(ERR);
    TN.hide(SLUG + '-result');
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
        pageCount = doc.getPageCount();
        $('go').disabled = false;
        TN.clearErr(ERR);
      } catch (e) {
        buffer = null; pageCount = 0;
        $('go').disabled = true;
        TN.setErr(ERR, 'Could not read "' + pdfName + '" — is it a valid PDF?');
      }
    })();
  }

  function parsePages(spec, total) {
    var out = [];
    spec = (spec || '').trim();
    if (!spec) { for (var i = 0; i < total; i++) out.push(i); return out; }
    var seen = {};
    spec.split(',').forEach(function (part) {
      part = part.trim();
      var m = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        var a = parseInt(m[1], 10), b = parseInt(m[2], 10);
        var lo = Math.min(a, b), hi = Math.max(a, b);
        for (var p = lo; p <= hi; p++) { if (p >= 1 && p <= total && !seen[p]) { seen[p] = 1; out.push(p - 1); } }
      } else {
        var n = parseInt(part, 10);
        if (n >= 1 && n <= total && !seen[n]) { seen[n] = 1; out.push(n - 1); }
      }
    });
    return out.sort(function (x, y) { return x - y; });
  }

  function onGo() {
    TN.clearErr(ERR);
    TN.hide(SLUG + '-result');
    if (!buffer) { TN.setErr(ERR, 'Choose a PDF file first.'); return; }
    if (typeof PDFLib === 'undefined') {
      TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    var m = margins();
    var btn = $('go');
    btn.disabled = true;
    (async function () {
      try {
        var doc = await PDFLib.PDFDocument.load(buffer);
        var total = doc.getPageCount();
        var idx = parsePages($('pages').value, total);
        if (!idx.length) throw new Error('No valid pages selected. Use 1–' + total + ' or ranges like 1-3,5.');
        var cropped = 0;
        idx.forEach(function (i) {
          var page = doc.getPage(i);
          var mb = page.getMediaBox();
          var ml = m.left * 72, mr = m.right * 72, mt = m.top * 72, mbt = m.bottom * 72;
          var nx = mb.x + ml, ny = mb.y + mbt;
          var nw = mb.width - ml - mr, nh = mb.height - mt - mbt;
          if (nw <= 10 || nh <= 10) throw new Error('Margins too large for page ' + (i + 1) + ' — the crop box would be empty.');
          if (typeof page.setCropBox === 'function') {
            page.setCropBox(nx, ny, nw, nh);
          } else {
            var arr = PDFLib.PDFArray.withContext(doc.context);
            arr.push(PDFLib.PDFNumber.of(nx), PDFLib.PDFNumber.of(ny),
              PDFLib.PDFNumber.of(nx + nw), PDFLib.PDFNumber.of(ny + nh));
            page.node.set(PDFLib.PDFName.of('CropBox'), arr);
          }
          cropped++;
        });
        var bytes = await doc.save();
        TN.download(new Blob([bytes], { type: 'application/pdf' }), pdfName.replace(/\.pdf$/i, '') + '-cropped.pdf');
        var res = $('result');
        res.innerHTML = '<p class="success">Cropped ' + cropped + ' page' + (cropped === 1 ? '' : 's') + '. Download started.</p>';
        TN.show(SLUG + '-result');
      } catch (e) {
        TN.setErr(ERR, 'Crop failed: ' + (e && e.message ? e.message : 'unknown error.'));
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
      ['top', 'right', 'bottom', 'left'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', paintPreview);
      });
      paintPreview();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
