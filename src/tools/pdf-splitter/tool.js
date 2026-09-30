/* PDF Splitter — extract page ranges into a new PDF. Requires PDFLib (pdf-lib). */
(function () {
  'use strict';

  var SLUG = 'pdf-splitter';
  var state = { name: '', buffer: null, pages: 0 };

  function errId() { return SLUG + '-error'; }

  function parseRanges(str, max) {
    var pages = [];
    var seen = {};
    var parts = str.split(',');
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim();
      if (!part) continue;
      var m = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        var a = parseInt(m[1], 10), b = parseInt(m[2], 10);
        if (a < 1 || b < 1) throw new Error('Page numbers must be 1 or higher (bad part: "' + part + '").');
        if (a > b) throw new Error('Range start is bigger than the end in "' + part + '". Try "' + b + '-' + a + '" instead.');
        if (b > max) throw new Error('Page ' + b + ' is beyond this PDF — it only has ' + max + ' page' + (max === 1 ? '' : 's') + '.');
        for (var p = a; p <= b; p++) {
          if (!seen[p]) { seen[p] = 1; pages.push(p); }
        }
      } else if (/^\d+$/.test(part)) {
        var n = parseInt(part, 10);
        if (n < 1) throw new Error('Page numbers must be 1 or higher (bad part: "' + part + '").');
        if (n > max) throw new Error('Page ' + n + ' is beyond this PDF — it only has ' + max + ' page' + (max === 1 ? '' : 's') + '.');
        if (!seen[n]) { seen[n] = 1; pages.push(n); }
      } else {
        throw new Error('Could not understand "' + part + '". Use formats like 1-3, 5, 8-10.');
      }
    }
    if (!pages.length) throw new Error('No valid pages found. Try something like 1-3, 5, 8-10.');
    return pages;
  }

  function onFileChosen(ev) {
    TN.clearErr(errId());
    var f = ev.target && ev.target.files ? ev.target.files[0] : null;
    state = { name: '', buffer: null, pages: 0 };
    updateInfo();
    if (!f) return;
    (async function () {
      try {
        if (typeof PDFLib === 'undefined') throw new Error('engine-missing');
        var buf = await TN.readAsArrayBuffer(f);
        var doc = await PDFLib.PDFDocument.load(buf);
        state = { name: f.name, buffer: buf, pages: doc.getPageCount() };
      } catch (e) {
        TN.setErr(errId(), e && e.message === 'engine-missing'
          ? 'PDF engine failed to load. Check your connection and reload the page.'
          : 'Could not read "' + f.name + '" — is it a valid PDF?');
        try { ev.target.value = ''; } catch (e2) {}
      }
      updateInfo();
    })();
  }

  function updateInfo() {
    try {
      var info = TN.el(SLUG + '-info');
      if (!info) return;
      if (state.pages > 0) {
        info.textContent = 'Loaded: ' + state.name + ' — ' + state.pages + ' page' + (state.pages === 1 ? '' : 's') + '.';
      } else {
        info.textContent = 'No file loaded yet.';
      }
    } catch (e) {}
  }

  function onSplit() {
    TN.clearErr(errId());
    var res = null;
    try { res = TN.el(SLUG + '-result'); if (res) TN.hide(res); } catch (e) {}
    if (typeof PDFLib === 'undefined') {
      TN.setErr(errId(), 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    if (!state.buffer || state.pages < 1) {
      TN.setErr(errId(), 'Choose a PDF file first.');
      return;
    }
    var raw = '';
    try {
      var inp = TN.el(SLUG + '-ranges');
      raw = inp ? inp.value : '';
    } catch (e) {}
    if (!raw.trim()) {
      TN.setErr(errId(), 'Type the pages you want, e.g. 1-3, 5, 8-10.');
      return;
    }
    var pages;
    try {
      pages = parseRanges(raw, state.pages);
    } catch (e) {
      TN.setErr(errId(), e.message);
      return;
    }
    var btn = null;
    try { btn = TN.el(SLUG + '-split'); if (btn) btn.disabled = true; } catch (e) {}
    (async function () {
      try {
        var src = await PDFLib.PDFDocument.load(state.buffer);
        var out = await PDFLib.PDFDocument.create();
        var idx = pages.map(function (p) { return p - 1; });
        var copied = await out.copyPages(src, idx);
        copied.forEach(function (pg) { out.addPage(pg); });
        var bytes = await out.save();
        var fname = 'pages-' + pages.join('-').slice(0, 40) + '.pdf';
        TN.download(new Blob([bytes], { type: 'application/pdf' }), fname);
        if (res) {
          res.innerHTML = '<p class="success">Extracted ' + pages.length + ' page' + (pages.length === 1 ? '' : 's')
            + ' into <strong>' + TN.esc(fname) + '</strong>.</p>';
          TN.show(res);
        }
      } catch (e) {
        TN.setErr(errId(), 'Split failed: ' + (e && e.message ? e.message : 'unknown error.'));
      } finally {
        if (btn) btn.disabled = false;
      }
    })();
  }

  function onClear() {
    state = { name: '', buffer: null, pages: 0 };
    TN.clearErr(errId());
    try {
      var input = TN.el(SLUG + '-file');
      if (input) input.value = '';
      var ranges = TN.el(SLUG + '-ranges');
      if (ranges) ranges.value = '';
      var res = TN.el(SLUG + '-result');
      if (res) TN.hide(res);
    } catch (e) {}
    updateInfo();
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var input = TN.el(SLUG + '-file');
      if (!input) return;
      TN.on(input, 'change', onFileChosen);
      var splitBtn = TN.el(SLUG + '-split');
      if (splitBtn) TN.on(splitBtn, 'click', onSplit);
      var clearBtn = TN.el(SLUG + '-clear');
      if (clearBtn) TN.on(clearBtn, 'click', onClear);
    } catch (e) { /* nothing may throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
