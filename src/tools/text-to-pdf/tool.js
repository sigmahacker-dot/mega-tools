/* Text to PDF — word-wrap plain text onto A4 pages. Requires PDFLib (pdf-lib). */
(function () {
  'use strict';

  var SLUG = 'text-to-pdf';

  function errId() { return SLUG + '-error'; }

  function wrapLines(font, text, size, maxW) {
    var lines = [];
    var paras = String(text).split('\n');
    for (var i = 0; i < paras.length; i++) {
      var para = paras[i];
      if (!para.trim()) { lines.push(''); continue; }
      var words = para.split(/\s+/);
      var cur = '';
      for (var w = 0; w < words.length; w++) {
        var test = cur ? cur + ' ' + words[w] : words[w];
        if (font.widthOfTextAtSize(test, size) <= maxW) {
          cur = test;
        } else {
          if (cur) lines.push(cur);
          var word = words[w];
          while (font.widthOfTextAtSize(word, size) > maxW && word.length > 1) {
            var k = word.length;
            while (k > 1 && font.widthOfTextAtSize(word.slice(0, k), size) > maxW) k--;
            lines.push(word.slice(0, k));
            word = word.slice(k);
          }
          cur = word;
        }
      }
      if (cur) lines.push(cur);
    }
    return lines;
  }

  async function buildPdf(title, text, size) {
    var doc = await PDFLib.PDFDocument.create();
    var font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    var bold = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    var W = 595.28, H = 841.89, M = 50;
    var lineH = size * 1.45;
    var page = doc.addPage([W, H]);
    var y = H - M;
    if (title) {
      page.drawText(title, { x: M, y: y - (size + 4), size: size + 4, font: bold, maxWidth: W - 2 * M });
      y -= (size + 4) * 1.6 + 10;
    }
    var lines = wrapLines(font, text, size, W - 2 * M);
    for (var i = 0; i < lines.length; i++) {
      if (y < M + lineH) {
        page = doc.addPage([W, H]);
        y = H - M;
      }
      page.drawText(lines[i] === '' ? ' ' : lines[i], { x: M, y: y - size, size: size, font: font });
      y -= lineH;
    }
    return await doc.save();
  }

  function onCreate() {
    TN.clearErr(errId());
    var res = null;
    try { res = TN.el(SLUG + '-result'); if (res) TN.hide(res); } catch (e) {}
    if (typeof PDFLib === 'undefined') {
      TN.setErr(errId(), 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    var text = '', title = '', size = 12;
    try {
      var tEl = TN.el(SLUG + '-text');
      text = tEl ? tEl.value : '';
      var titleEl = TN.el(SLUG + '-title');
      title = titleEl ? titleEl.value.trim() : '';
      var sizeEl = TN.el(SLUG + '-size');
      size = sizeEl ? parseInt(sizeEl.value, 10) : 12;
      if (isNaN(size) || size < 6 || size > 72) size = 12;
    } catch (e) {}
    if (!text.trim()) {
      TN.setErr(errId(), 'Type or paste some text first.');
      return;
    }
    var btn = null;
    try { btn = TN.el(SLUG + '-create'); if (btn) btn.disabled = true; } catch (e) {}
    buildPdf(title, text, size).then(function (bytes) {
      var fname = (title ? title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() : 'document') || 'document';
      TN.download(new Blob([bytes], { type: 'application/pdf' }), fname.slice(0, 60) + '.pdf');
      if (res) {
        res.innerHTML = '<p class="success">Your PDF has been created and downloaded.</p>';
        TN.show(res);
      }
    }).catch(function (e) {
      TN.setErr(errId(), 'Could not create the PDF: ' + (e && e.message ? e.message : 'unknown error.'));
    }).then(function () {
      if (btn) btn.disabled = false;
    });
  }

  function onClear() {
    TN.clearErr(errId());
    try {
      var tEl = TN.el(SLUG + '-text');
      if (tEl) tEl.value = '';
      var titleEl = TN.el(SLUG + '-title');
      if (titleEl) titleEl.value = '';
      var res = TN.el(SLUG + '-result');
      if (res) TN.hide(res);
    } catch (e) {}
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var createBtn = TN.el(SLUG + '-create');
      if (!createBtn) return;
      TN.on(createBtn, 'click', onCreate);
      var clearBtn = TN.el(SLUG + '-clear');
      if (clearBtn) TN.on(clearBtn, 'click', onClear);
    } catch (e) { /* nothing may throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
