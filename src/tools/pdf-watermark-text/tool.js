/* PDF Watermark Text — stamp text on every page via pdf-lib. */
(function () {
  'use strict';
  var SLUG = 'pdf-watermark-text';
  var ERR = SLUG + '-error';
  var buffer = null;
  var pdfName = 'document.pdf';

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function hexRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return [0.85, 0.15, 0.15];
    return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
  }

  function onFile(ev) {
    TN.clearErr(ERR);
    TN.hide(SLUG + '-result');
    var f = ev.target.files && ev.target.files[0];
    if (!f) { buffer = null; $('go').disabled = true; return; }
    pdfName = f.name || pdfName;
    TN.readAsArrayBuffer(f).then(function (buf) {
      buffer = buf;
      $('go').disabled = false;
      TN.clearErr(ERR);
    }).catch(function () {
      buffer = null;
      $('go').disabled = true;
      TN.setErr(ERR, 'Could not read "' + pdfName + '".');
    });
  }

  function onGo() {
    TN.clearErr(ERR);
    TN.hide(SLUG + '-result');
    if (!buffer) { TN.setErr(ERR, 'Choose a PDF file first.'); return; }
    if (typeof PDFLib === 'undefined') {
      TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    var text = ($('text').value || '').trim();
    if (!text) { TN.setErr(ERR, 'Enter the watermark text.'); return; }
    var opacity = parseFloat($('opacity').value);
    var rotation = parseInt($('rotation').value, 10);
    var size = parseInt($('size').value, 10);
    var color = $('color').value;
    var repeat = parseInt($('repeat').value, 10);
    var btn = $('go');
    btn.disabled = true;
    (async function () {
      try {
        var doc = await PDFLib.PDFDocument.load(buffer);
        var font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
        var rgb = hexRgb(color);
        var textW = font.widthOfTextAtSize(text, size);
        var pages = doc.getPages();
        for (var i = 0; i < pages.length; i++) {
          var page = pages[i];
          var w = page.getWidth(), h = page.getHeight();
          var spots = [];
          if (repeat === 1) spots.push([w / 2, h / 2]);
          else if (repeat === 2) spots.push([w / 2, h * 0.68], [w / 2, h * 0.32]);
          else spots.push([w * 0.32, h * 0.68], [w * 0.68, h * 0.68], [w * 0.32, h * 0.32], [w * 0.68, h * 0.32]);
          spots.forEach(function (s) {
            page.drawText(text, {
              x: s[0] - textW / 2,
              y: s[1] - size * 0.35,
              size: size,
              font: font,
              color: PDFLib.rgb(rgb[0], rgb[1], rgb[2]),
              opacity: opacity,
              rotate: PDFLib.degrees(rotation)
            });
          });
        }
        var bytes = await doc.save();
        TN.download(new Blob([bytes], { type: 'application/pdf' }), pdfName.replace(/\.pdf$/i, '') + '-watermarked.pdf');
        var res = $('result');
        res.innerHTML = '<p class="success">Watermark stamped on ' + pages.length + ' page' + (pages.length === 1 ? '' : 's') + '. Download started.</p>';
        TN.show(SLUG + '-result');
      } catch (e) {
        TN.setErr(ERR, 'Watermark failed: ' + (e && e.message ? e.message : 'unknown error.'));
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
      ['opacity', 'rotation', 'size'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', function () {
          $('opacity-v').textContent = parseFloat($('opacity').value).toFixed(2);
          $('rotation-v').textContent = $('rotation').value + '°';
          $('size-v').textContent = $('size').value;
        });
      });
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
