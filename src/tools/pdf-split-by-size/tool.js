/* PDF Split by Size — greedy split; each part is saved and measured for real. */
(function () {
  'use strict';
  var SLUG = 'pdf-split-by-size';
  var ERR = SLUG + '-error';
  var parts = []; // {bytes: Uint8Array, from, to}
  var busy = false;

  function buildPart(src, indices) {
    return PDFLib.PDFDocument.create().then(function (doc) {
      return doc.copyPages(src, indices).then(function (pages) {
        pages.forEach(function (p) { doc.addPage(p); });
        return doc.save();
      });
    });
  }

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
    var mb = parseFloat(document.getElementById(SLUG + '-mb').value) || 5;
    var limit = Math.floor(mb * 1024 * 1024);
    busy = true;
    var btn = document.getElementById(SLUG + '-go');
    if (btn) btn.disabled = true;
    var res = document.getElementById(SLUG + '-result');
    if (res) res.classList.add('hidden');
    parts = [];

    (async function () {
      var buf = await TN.readAsArrayBuffer(file);
      var src = await PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      var n = src.getPageCount();
      if (n < 1) throw new Error('This PDF has no pages.');
      if (n > 300) throw new Error('This PDF has ' + n + ' pages — splitting by measured size would be too slow. Try a smaller document.');
      var cur = [];
      for (var i = 0; i < n; i++) {
        cur.push(i);
        var bytes = await buildPart(src, cur);
        if (bytes.length > limit && cur.length > 1) {
          // finalize without the last page
          var fin = cur.slice(0, -1);
          var finBytes = await buildPart(src, fin);
          parts.push({ bytes: finBytes, from: fin[0] + 1, to: fin[fin.length - 1] + 1, over: false });
          cur = [i];
        }
      }
      if (cur.length) {
        var lastBytes = await buildPart(src, cur);
        parts.push({ bytes: lastBytes, from: cur[0] + 1, to: cur[cur.length - 1] + 1, over: lastBytes.length > limit });
      }
      renderParts();
      res.classList.remove('hidden');
    })().catch(function (e) {
      TN.setErr(ERR, 'Could not split the PDF: ' + ((e && e.message) || e));
    }).then(function () {
      busy = false;
      if (btn) btn.disabled = false;
    });
  }

  function renderParts() {
    var rows = document.getElementById(SLUG + '-rows');
    if (!rows) return;
    rows.innerHTML = '';
    parts.forEach(function (p, i) {
      var tr = document.createElement('tr');
      var td0 = document.createElement('td'); td0.textContent = 'Part ' + (i + 1);
      var td1 = document.createElement('td'); td1.textContent = p.from + '–' + p.to;
      var td2 = document.createElement('td');
      td2.textContent = TN.fmtBytes(p.bytes.length) + (p.over ? ' ⚠ over limit (single page)' : '');
      var td3 = document.createElement('td');
      var b = document.createElement('button');
      b.className = 'btn btn-sm btn-outline';
      b.textContent = 'Download';
      b.onclick = function () {
        TN.download(new Blob([p.bytes], { type: 'application/pdf' }), 'part-' + (i + 1) + '.pdf');
      };
      td3.appendChild(b);
      tr.appendChild(td0); tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
      rows.appendChild(tr);
    });
  }

  try {
    if (!document.getElementById(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', go);
    TN.on(SLUG + '-mb', 'input', function () {
      var v = document.getElementById(SLUG + '-mb-val');
      if (v) v.textContent = this.value;
    });
    TN.on(SLUG + '-zip', 'click', function () {
      TN.clearErr(ERR);
      if (!parts.length) return;
      if (typeof JSZip === 'undefined') { TN.setErr(ERR, 'The ZIP library failed to load. Check your connection and reload.'); return; }
      try {
        var zip = new JSZip();
        parts.forEach(function (p, i) {
          zip.file('part-' + (i + 1) + '-pages-' + p.from + '-' + p.to + '.pdf', p.bytes);
        });
        zip.generateAsync({ type: 'blob' }).then(function (blob) {
          TN.download(blob, 'pdf-parts.zip');
        }).catch(function () { TN.setErr(ERR, 'Could not build the ZIP file.'); });
      } catch (e) { TN.setErr(ERR, 'Could not build the ZIP file.'); }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
