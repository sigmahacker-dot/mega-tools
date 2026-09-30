/* PDF Merger — combine multiple PDFs in a chosen order. Requires PDFLib (pdf-lib). */
(function () {
  'use strict';

  var SLUG = 'pdf-merger';
  var queue = []; // { name, size, pages, buffer }

  function errId() { return SLUG + '-error'; }

  function setProgress(pct) {
    try {
      var wrap = TN.el(SLUG + '-progress');
      if (!wrap) return;
      var bar = wrap.querySelector('div');
      if (pct === null) { TN.hide(wrap); if (bar) bar.style.width = '0%'; }
      else { TN.show(wrap); if (bar) bar.style.width = pct + '%'; }
    } catch (e) { /* never throw */ }
  }

  function onFilesChosen(ev) {
    TN.clearErr(errId());
    var picked = ev.target && ev.target.files ? Array.prototype.slice.call(ev.target.files) : [];
    if (!picked.length) return;
    (async function () {
      for (var i = 0; i < picked.length; i++) {
        var f = picked[i];
        try {
          if (typeof PDFLib === 'undefined') throw new Error('engine-missing');
          var buf = await TN.readAsArrayBuffer(f);
          var doc = await PDFLib.PDFDocument.load(buf);
          queue.push({ name: f.name, size: f.size, pages: doc.getPageCount(), buffer: buf });
        } catch (e) {
          TN.setErr(errId(), e && e.message === 'engine-missing'
            ? 'PDF engine failed to load. Check your connection and reload the page.'
            : 'Could not read "' + f.name + '" — is it a valid PDF?');
        }
      }
      try { ev.target.value = ''; } catch (e) {}
      renderList();
    })();
  }

  function renderList() {
    var list;
    try { list = TN.el(SLUG + '-list'); } catch (e) { return; }
    if (!list) return;
    if (!queue.length) {
      list.innerHTML = '<p class="muted">No files added yet.</p>';
      return;
    }
    var html = '';
    queue.forEach(function (item, i) {
      html += '<div class="row" style="justify-content:space-between;gap:8px;margin-bottom:8px;">'
        + '<div><span class="tag">' + (i + 1) + '</span> '
        + '<strong>' + TN.esc(item.name) + '</strong><br>'
        + '<span class="muted">' + item.pages + ' page' + (item.pages === 1 ? '' : 's')
        + ' &middot; ' + TN.fmtBytes(item.size) + '</span></div>'
        + '<div class="btn-row">'
        + '<button type="button" class="btn btn-sm btn-outline" data-act="up" data-i="' + i + '"' + (i === 0 ? ' disabled' : '') + ' aria-label="Move up">&uarr;</button>'
        + '<button type="button" class="btn btn-sm btn-outline" data-act="down" data-i="' + i + '"' + (i === queue.length - 1 ? ' disabled' : '') + ' aria-label="Move down">&darr;</button>'
        + '<button type="button" class="btn btn-sm btn-danger" data-act="rm" data-i="' + i + '" aria-label="Remove">&times;</button>'
        + '</div></div>';
    });
    list.innerHTML = html;
    var btns = list.querySelectorAll('button[data-act]');
    Array.prototype.forEach.call(btns, function (btn) {
      TN.on(btn, 'click', function () {
        var i = parseInt(btn.getAttribute('data-i'), 10);
        var act = btn.getAttribute('data-act');
        if (isNaN(i) || i < 0 || i >= queue.length) return;
        if (act === 'up' && i > 0) {
          var t = queue[i - 1]; queue[i - 1] = queue[i]; queue[i] = t;
        } else if (act === 'down' && i < queue.length - 1) {
          var t2 = queue[i + 1]; queue[i + 1] = queue[i]; queue[i] = t2;
        } else if (act === 'rm') {
          queue.splice(i, 1);
        } else { return; }
        TN.clearErr(errId());
        renderList();
      });
    });
  }

  function onMerge() {
    TN.clearErr(errId());
    var res = null;
    try { res = TN.el(SLUG + '-result'); if (res) TN.hide(res); } catch (e) {}
    if (typeof PDFLib === 'undefined') {
      TN.setErr(errId(), 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    if (queue.length < 2) {
      TN.setErr(errId(), 'Add at least two PDF files to merge.');
      return;
    }
    var btn = null;
    try { btn = TN.el(SLUG + '-merge'); if (btn) btn.disabled = true; } catch (e) {}
    setProgress(0);
    (async function () {
      try {
        var out = await PDFLib.PDFDocument.create();
        var totalPages = 0;
        for (var i = 0; i < queue.length; i++) {
          var src = await PDFLib.PDFDocument.load(queue[i].buffer);
          var idx = [];
          for (var p = 0; p < queue[i].pages; p++) idx.push(p);
          var pages = await out.copyPages(src, idx);
          pages.forEach(function (pg) { out.addPage(pg); });
          totalPages += queue[i].pages;
          setProgress(Math.round(((i + 1) / queue.length) * 100));
          await new Promise(function (r) { setTimeout(r, 0); });
        }
        var bytes = await out.save();
        TN.download(new Blob([bytes], { type: 'application/pdf' }), 'merged.pdf');
        if (res) {
          res.innerHTML = '<p class="success">Merged ' + queue.length + ' PDFs (' + totalPages
            + ' pages) into <strong>merged.pdf</strong> (' + TN.fmtBytes(bytes.length) + ').</p>';
          TN.show(res);
        }
      } catch (e) {
        TN.setErr(errId(), 'Merge failed: ' + (e && e.message ? e.message : 'unknown error.'));
      } finally {
        if (btn) btn.disabled = false;
        setProgress(null);
      }
    })();
  }

  function onClear() {
    queue = [];
    TN.clearErr(errId());
    try {
      var input = TN.el(SLUG + '-files');
      if (input) input.value = '';
      var res = TN.el(SLUG + '-result');
      if (res) TN.hide(res);
    } catch (e) {}
    setProgress(null);
    renderList();
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var input = TN.el(SLUG + '-files');
      if (!input) return;
      TN.on(input, 'change', onFilesChosen);
      var mergeBtn = TN.el(SLUG + '-merge');
      if (mergeBtn) TN.on(mergeBtn, 'click', onMerge);
      var clearBtn = TN.el(SLUG + '-clear');
      if (clearBtn) TN.on(clearBtn, 'click', onClear);
      renderList();
    } catch (e) { /* nothing may throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
