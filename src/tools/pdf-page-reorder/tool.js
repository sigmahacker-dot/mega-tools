/* PDF Page Reorder — arrange pages visually, save with pdf-lib. */
(function () {
  'use strict';
  var SLUG = 'pdf-page-reorder';
  var ERR = SLUG + '-error';
  var buf = null;
  var order = []; // 0-based page indices in current order
  var selected = -1;
  var pdfName = 'document.pdf';

  function $(id) { return document.getElementById(id); }

  function renderList() {
    var ul = $('pdf-page-reorder-list');
    ul.innerHTML = '';
    order.forEach(function (origIdx, pos) {
      var li = document.createElement('li');
      li.style.cssText = 'padding:8px 12px;border:1px solid #ddd;border-radius:8px;margin-bottom:6px;cursor:pointer;background:' +
        (pos === selected ? '#e8f5e9' : '#fff');
      li.textContent = (pos + 1) + '. Original page ' + (origIdx + 1);
      li.onclick = function () { selected = pos; renderList(); };
      ul.appendChild(li);
    });
    $('pdf-page-reorder-seq').textContent = order.map(function (i) { return i + 1; }).join(' → ');
  }

  function moveSel(fn) {
    if (selected < 0 || selected >= order.length) { TN.setErr(ERR, 'Select a page in the list first.'); return; }
    TN.clearErr(ERR);
    fn();
    renderList();
  }

  function save() {
    if (typeof PDFLib === 'undefined') { TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload.'); return; }
    if (!buf) { TN.setErr(ERR, 'Upload a PDF first.'); return; }
    TN.clearErr(ERR);
    PDFLib.PDFDocument.load(buf.slice(0)).then(function (src) {
      return PDFLib.PDFDocument.create().then(function (doc) {
        return doc.copyPages(src, order).then(function (copied) {
          copied.forEach(function (p) { doc.addPage(p); });
          return doc.save();
        });
      });
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = pdfName.replace(/\.pdf$/i, '') + '-reordered.pdf';
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); }, 100);
    }).catch(function () {
      TN.setErr(ERR, 'Could not process that PDF. It may be encrypted or corrupted.');
    });
  }

  try {
    TN.on('pdf-page-reorder-file', 'change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      pdfName = f.name || pdfName;
      var r = new FileReader();
      r.onload = function () {
        buf = r.result;
        if (typeof PDFLib === 'undefined') { TN.setErr(ERR, 'PDF engine failed to load. Check your connection and reload.'); return; }
        PDFLib.PDFDocument.load(buf.slice(0)).then(function (doc) {
          var n = doc.getPageCount();
          order = [];
          for (var i = 0; i < n; i++) order.push(i);
          selected = -1;
          $('pdf-page-reorder-result').hidden = false;
          $('pdf-page-reorder-go').disabled = false;
          TN.clearErr(ERR);
          renderList();
        }).catch(function () { TN.setErr(ERR, 'Could not read that PDF. It may be encrypted or corrupted.'); });
      };
      r.onerror = function () { TN.setErr(ERR, 'Could not read the file.'); };
      r.readAsArrayBuffer(f);
    });
    TN.on('pdf-page-reorder-up', 'click', function () {
      moveSel(function () {
        if (selected > 0) { var t = order[selected - 1]; order[selected - 1] = order[selected]; order[selected] = t; selected--; }
      });
    });
    TN.on('pdf-page-reorder-down', 'click', function () {
      moveSel(function () {
        if (selected < order.length - 1) { var t = order[selected + 1]; order[selected + 1] = order[selected]; order[selected] = t; selected++; }
      });
    });
    TN.on('pdf-page-reorder-top', 'click', function () {
      moveSel(function () { var t = order.splice(selected, 1)[0]; order.unshift(t); selected = 0; });
    });
    TN.on('pdf-page-reorder-bottom', 'click', function () {
      moveSel(function () { var t = order.splice(selected, 1)[0]; order.push(t); selected = order.length - 1; });
    });
    TN.on('pdf-page-reorder-go', 'click', save);
  } catch (e) { /* never throw on load */ }
})();
