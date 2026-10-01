/* PDF Redactor — burn black redaction rectangles into pages via pdf-lib. */
(function () {
  'use strict';
  var SLUG = 'pdf-redactor';
  var ERR = SLUG + '-error';
  var buffer = null;
  var pdfName = 'document.pdf';
  var pageCount = 0;
  var pageSizes = []; /* {w,h} per page */
  var boxes = [];     /* {page (1-based), x,y,w,h} */

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function renderList() {
    var list = $('list');
    if (!boxes.length) {
      list.innerHTML = '<p class="muted">No boxes added yet.</p>';
    } else {
      var html = '';
      boxes.forEach(function (b, i) {
        html += '<div class="row" style="justify-content:space-between;gap:8px;margin-bottom:8px;">'
          + '<div><span class="tag">p' + b.page + '</span> '
          + '<strong>box ' + (i + 1) + '</strong><br>'
          + '<span class="muted">x=' + b.x + ' y=' + b.y + ' w=' + b.w + ' h=' + b.h + ' pt</span></div>'
          + '<button type="button" class="btn btn-sm btn-danger" data-i="' + i + '" aria-label="Remove box">&times;</button></div>';
      });
      list.innerHTML = html;
      Array.prototype.forEach.call(list.querySelectorAll('button[data-i]'), function (btn) {
        btn.addEventListener('click', function () {
          boxes.splice(parseInt(btn.getAttribute('data-i'), 10), 1);
          renderList();
        });
      });
    }
    $('go').disabled = !(buffer && boxes.length);
  }

  function onFile(ev) {
    TN.clearErr(ERR);
    TN.hide(SLUG + '-result');
    var f = ev.target.files && ev.target.files[0];
    if (!f) return;
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
        pageSizes = doc.getPages().map(function (p) { return { w: p.getWidth(), h: p.getHeight() }; });
        $('page').max = pageCount;
        updateSizeInfo();
        boxes = [];
        renderList();
        TN.clearErr(ERR);
      } catch (e) {
        buffer = null; pageCount = 0; pageSizes = [];
        $('sizeinfo').textContent = 'Load a PDF to see page size.';
        renderList();
        TN.setErr(ERR, 'Could not read "' + pdfName + '" — is it a valid PDF?');
      }
    })();
  }

  function updateSizeInfo() {
    var p = parseInt($('page').value, 10) || 1;
    if (p >= 1 && p <= pageSizes.length) {
      var s = pageSizes[p - 1];
      $('sizeinfo').textContent = 'Page ' + p + ': ' + Math.round(s.w) + ' × ' + Math.round(s.h) + ' pt (' + (s.w / 72).toFixed(2) + ' × ' + (s.h / 72).toFixed(2) + ' in). Origin: bottom-left.';
    } else {
      $('sizeinfo').textContent = 'Page number out of range (1–' + pageCount + ').';
    }
  }

  function onAdd() {
    TN.clearErr(ERR);
    if (!buffer) { TN.setErr(ERR, 'Choose a PDF file first.'); return; }
    var p = parseInt($('page').value, 10);
    var x = parseFloat($('x').value), y = parseFloat($('y').value);
    var w = parseFloat($('w').value), h = parseFloat($('h').value);
    if (!p || p < 1 || p > pageCount) { TN.setErr(ERR, 'Page must be between 1 and ' + pageCount + '.'); return; }
    if ([x, y, w, h].some(function (v) { return isNaN(v); }) || w <= 0 || h <= 0 || x < 0 || y < 0) {
      TN.setErr(ERR, 'Enter valid non-negative numbers with positive width and height.');
      return;
    }
    boxes.push({ page: p, x: x, y: y, w: w, h: h });
    renderList();
  }

  function onGo() {
    TN.clearErr(ERR);
    TN.hide(SLUG + '-result');
    if (!buffer || !boxes.length) { TN.setErr(ERR, 'Load a PDF and add at least one box.'); return; }
    var btn = $('go');
    btn.disabled = true;
    (async function () {
      try {
        var doc = await PDFLib.PDFDocument.load(buffer);
        boxes.forEach(function (b) {
          var page = doc.getPage(b.page - 1);
          page.drawRectangle({
            x: b.x, y: b.y, width: b.w, height: b.h,
            color: PDFLib.rgb(0, 0, 0),
            opacity: 1
          });
        });
        var bytes = await doc.save();
        TN.download(new Blob([bytes], { type: 'application/pdf' }), pdfName.replace(/\.pdf$/i, '') + '-redacted.pdf');
        var res = $('result');
        res.innerHTML = '<p class="success">Applied ' + boxes.length + ' redaction box' + (boxes.length === 1 ? '' : 'es') + '. Download started.</p>';
        TN.show(SLUG + '-result');
      } catch (e) {
        TN.setErr(ERR, 'Redaction failed: ' + (e && e.message ? e.message : 'unknown error.'));
      } finally {
        btn.disabled = false;
      }
    })();
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      TN.on(SLUG + '-file', 'change', onFile);
      TN.on(SLUG + '-page', 'input', updateSizeInfo);
      TN.on(SLUG + '-page', 'change', updateSizeInfo);
      TN.on(SLUG + '-add', 'click', onAdd);
      TN.on(SLUG + '-go', 'click', onGo);
      renderList();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
