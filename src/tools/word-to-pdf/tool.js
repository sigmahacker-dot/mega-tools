/* Word to PDF — mammoth raw text rendered into a clean PDF via pdf-lib. */
(function () {
  'use strict';

  var SLUG = 'word-to-pdf';

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

  async function buildPdf(title, text) {
    var size = 12;
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

  function onConvert() {
    TN.clearErr(errId());
    var res = null;
    try { res = TN.el(SLUG + '-result'); if (res) TN.hide(res); } catch (e) {}
    if (typeof PDFLib === 'undefined') {
      TN.setErr(errId(), 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    var file = null, pasted = '';
    try {
      var input = TN.el(SLUG + '-file');
      file = input && input.files ? input.files[0] : null;
      var tEl = TN.el(SLUG + '-text');
      pasted = tEl ? tEl.value.trim() : '';
    } catch (e) {}
    if (!file && !pasted) {
      TN.setErr(errId(), 'Choose a .docx file or paste some text first.');
      return;
    }
    if (file && !/\.docx$/i.test(file.name || '')) {
      TN.setErr(errId(), 'Only .docx files are supported. Save your document as .docx and try again.');
      return;
    }
    if (file && typeof mammoth === 'undefined') {
      TN.setErr(errId(), 'Word engine failed to load. Check your connection and reload the page.');
      return;
    }
    var btn = null;
    try { btn = TN.el(SLUG + '-convert'); if (btn) btn.disabled = true; } catch (e) {}
    (async function () {
      try {
        var text, title;
        if (file) {
          var buf = await TN.readAsArrayBuffer(file);
          var result = await mammoth.extractRawText({ arrayBuffer: buf });
          text = (result && result.value ? result.value : '').trim();
          title = file.name.replace(/\.docx$/i, '');
          if (!text) {
            TN.setErr(errId(), 'No readable text was found in that .docx file.');
            return;
          }
        } else {
          text = pasted;
          title = 'Document';
        }
        var bytes = await buildPdf(title, text);
        var fname = (title ? title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() : 'document') || 'document';
        TN.download(new Blob([bytes], { type: 'application/pdf' }), fname.slice(0, 60) + '.pdf');
        if (res) {
          res.innerHTML = '<p class="success">Your PDF has been created and downloaded.</p>';
          TN.show(res);
        }
      } catch (e) {
        TN.setErr(errId(), 'Conversion failed: ' + (e && e.message ? e.message : 'unknown error.'));
      } finally {
        if (btn) btn.disabled = false;
      }
    })();
  }

  function onClear() {
    TN.clearErr(errId());
    try {
      var input = TN.el(SLUG + '-file');
      if (input) input.value = '';
      var tEl = TN.el(SLUG + '-text');
      if (tEl) tEl.value = '';
      var res = TN.el(SLUG + '-result');
      if (res) TN.hide(res);
    } catch (e) {}
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var btn = TN.el(SLUG + '-convert');
      if (!btn) return;
      TN.on(btn, 'click', onConvert);
      var clearBtn = TN.el(SLUG + '-clear');
      if (clearBtn) TN.on(clearBtn, 'click', onClear);
    } catch (e) { /* nothing may throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
