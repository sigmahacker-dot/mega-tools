/* PDF Metadata Editor — read/edit title, author, subject, keywords with PDF-Lib. */
(function () {
  'use strict';

  var SLUG = 'pdf-metadata-editor';
  var state = { doc: null, name: '' };

  function errId() { return SLUG + '-error'; }
  function set(id, v) { var e = TN.el(id); if (e) e.textContent = v; }
  function field(k) { var e = TN.el(SLUG + '-' + k); return e ? e.value : ''; }

  function show(v) { return v ? v : 'not set'; }

  function onFile(ev) {
    TN.clearErr(errId());
    var f = ev.target && ev.target.files && ev.target.files[0];
    var res = TN.el(SLUG + '-result');
    if (!f) { if (res) TN.hide(res); state.doc = null; return; }
    if (typeof PDFLib === 'undefined') {
      TN.setErr(errId(), 'PDF engine failed to load. Check your connection and reload the page.');
      return;
    }
    (async function () {
      try {
        var buf = await TN.readAsArrayBuffer(f);
        var doc = await PDFLib.PDFDocument.load(buf);
        state.doc = doc;
        state.name = f.name.replace(/\.pdf$/i, '') || 'document';
        var title = '', author = '', subject = '', keywords = '';
        try { title = doc.getTitle() || ''; } catch (e) {}
        try { author = doc.getAuthor() || ''; } catch (e) {}
        try { subject = doc.getSubject() || ''; } catch (e) {}
        try { keywords = doc.getKeywords() || ''; } catch (e) {}
        set(SLUG + '-cur-title', show(title));
        set(SLUG + '-cur-author', show(author));
        set(SLUG + '-cur-subject', show(subject));
        set(SLUG + '-cur-keywords', show(keywords));
        var t = TN.el(SLUG + '-title'); if (t) t.value = title;
        var a = TN.el(SLUG + '-author'); if (a) a.value = author;
        var s = TN.el(SLUG + '-subject'); if (s) s.value = subject;
        var k = TN.el(SLUG + '-keywords'); if (k) k.value = keywords;
        if (res) TN.show(res);
      } catch (e) {
        state.doc = null;
        if (res) TN.hide(res);
        TN.setErr(errId(), 'Could not read "' + f.name + '" — is it a valid PDF?');
      }
      try { ev.target.value = ''; } catch (e) {}
    })();
  }

  function save() {
    TN.clearErr(errId());
    if (!state.doc) { TN.setErr(errId(), 'Choose a PDF file first.'); return; }
    var btn = TN.el(SLUG + '-save');
    if (btn) btn.disabled = true;
    (async function () {
      try {
        var doc = state.doc;
        var title = field('title').trim();
        var author = field('author').trim();
        var subject = field('subject').trim();
        var keywords = field('keywords').trim();
        // pdf-lib setters accept undefined to clear; use try/catch per field.
        try { doc.setTitle(title || undefined); } catch (e) {}
        try { doc.setAuthor(author || undefined); } catch (e) {}
        try { doc.setSubject(subject || undefined); } catch (e) {}
        try { doc.setKeywords(keywords ? keywords.split(/\s*,\s*/) : undefined); } catch (e) {}
        var bytes = await doc.save();
        TN.download(new Blob([bytes], { type: 'application/pdf' }), state.name + '-metadata.pdf');
        set(SLUG + '-cur-title', show(title));
        set(SLUG + '-cur-author', show(author));
        set(SLUG + '-cur-subject', show(subject));
        set(SLUG + '-cur-keywords', show(keywords));
      } catch (e) {
        TN.setErr(errId(), 'Saving failed: ' + (e && e.message ? e.message : 'unknown error.'));
      } finally {
        if (btn) btn.disabled = false;
      }
    })();
  }

  function clear() {
    TN.clearErr(errId());
    state.doc = null;
    state.name = '';
    var f = TN.el(SLUG + '-file');
    if (f) f.value = '';
    ['title', 'author', 'subject', 'keywords'].forEach(function (k) {
      var e = TN.el(SLUG + '-' + k);
      if (e) e.value = '';
    });
    ['cur-title', 'cur-author', 'cur-subject', 'cur-keywords'].forEach(function (k) { set(SLUG + '-' + k, '–'); });
    var res = TN.el(SLUG + '-result');
    if (res) TN.hide(res);
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var f = TN.el(SLUG + '-file');
      if (f) TN.on(f, 'change', onFile);
      var s = TN.el(SLUG + '-save');
      if (s) TN.on(s, 'click', save);
      var c = TN.el(SLUG + '-clear');
      if (c) TN.on(c, 'click', clear);
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();