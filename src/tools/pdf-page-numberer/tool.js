/* PDF Page Numberer — stamp page numbers with PDF-Lib. */
(function () {
  'use strict';

  var SLUG = 'pdf-page-numberer';
  var MARGIN = 36;

  function errId() { return SLUG + '-error'; }

  function setProgress(pct) {
    try {
      var wrap = TN.el(SLUG + '-progress');
      if (!wrap) return;
      var bar = wrap.querySelector('div');
      if (pct === null) { TN.hide(wrap); if (bar) bar.style.width = '0%'; }
      else { TN.show(wrap); if (bar) bar.style.width = pct + '%'; }
    } catch (e) {}
  }

  function run() {
    TN.clearErr(errId());
    var res = TN.el(SLUG + '-result');
    if (res) TN.hide(res);
    var fileEl = TN.el(SLUG + '-file');
    var file = fileEl && fileEl.files && fileEl.files[0];
    if (!file) { TN.setErr(errId(), 'Please choose a PDF file first.'); return; }
    if (typeof PDFLib === 'undefined') {
      TN.setErr(errId(), 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    var posEl = TN.el(SLUG + '-position');
    var pos = posEl ? posEl.value : 'bottom-center';
    var fmtEl = TN.el(SLUG + '-format');
    var fmt = fmtEl ? fmtEl.value : 'n';
    var startEl = TN.el(SLUG + '-start');
    var start = startEl ? parseInt(startEl.value, 10) : 1;
    if (isNaN(start) || start < 1) start = 1;
    var sizeEl = TN.el(SLUG + '-size');
    var size = sizeEl ? parseInt(sizeEl.value, 10) : 10;
    if (isNaN(size) || size < 6) size = 6;
    if (size > 48) size = 48;

    var btn = TN.el(SLUG + '-run');
    if (btn) btn.disabled = true;
    setProgress(0);
    (async function () {
      try {
        var buf = await TN.readAsArrayBuffer(file);
        var doc = await PDFLib.PDFDocument.load(buf);
        var font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
        var n = doc.getPageCount();
        for (var i = 0; i < n; i++) {
          var page = doc.getPage(i);
          var w = page.getWidth(), h = page.getHeight();
          var num = start + i;
          var text = fmt === 'page-n' ? 'Page ' + num : fmt === 'n-total' ? num + ' / ' + (start + n - 1) : String(num);
          var tw = font.widthOfTextAtSize(text, size);
          var x, y;
          var horiz = pos.split('-')[1]; // left|center|right
          var vert = pos.split('-')[0]; // top|bottom
          if (horiz === 'left') x = MARGIN;
          else if (horiz === 'right') x = w - MARGIN - tw;
          else x = (w - tw) / 2;
          y = vert === 'top' ? h - MARGIN - size : MARGIN;
          page.drawText(text, { x: x, y: y, size: size, font: font, color: PDFLib.rgb(0.25, 0.25, 0.25) });
          setProgress(Math.round(((i + 1) / n) * 100));
          await new Promise(function (r) { setTimeout(r, 0); });
        }
        var bytes = await doc.save();
        var name = file.name.replace(/\.pdf$/i, '') || 'document';
        TN.download(new Blob([bytes], { type: 'application/pdf' }), name + '-numbered.pdf');
        if (res) {
          res.innerHTML = '<p class="success">Added page numbers to ' + n + ' page' + (n === 1 ? '' : 's')
            + ' of <strong>' + TN.esc(file.name) + '</strong>.</p>';
          TN.show(res);
        }
      } catch (e) {
        TN.setErr(errId(), 'Could not process "' + file.name + '" — is it a valid PDF?');
      } finally {
        if (btn) btn.disabled = false;
        setProgress(null);
      }
    })();
  }

  function clear() {
    TN.clearErr(errId());
    var f = TN.el(SLUG + '-file');
    if (f) f.value = '';
    var res = TN.el(SLUG + '-result');
    if (res) TN.hide(res);
    setProgress(null);
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var r = TN.el(SLUG + '-run');
      if (r) TN.on(r, 'click', run);
      var c = TN.el(SLUG + '-clear');
      if (c) TN.on(c, 'click', clear);
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();