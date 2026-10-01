/* URL Slug Generator — live slug preview with separator and max-length options. */
(function () {
  'use strict';

  var SLUG = 'slug-generator';

  function errId() { return SLUG + '-error'; }

  function makeSlug(text, sep, maxLen) {
    var s = text
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip diacritics
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, sep); // non-alphanumeric -> separator
    // collapse repeats and trim separators
    var escSep = sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(escSep + '{2,}', 'g'), sep)
         .replace(new RegExp('^' + escSep + '|' + escSep + '$', 'g'), '');
    if (maxLen > 0 && s.length > maxLen) {
      s = s.slice(0, maxLen);
      var cut = s.lastIndexOf(sep);
      if (cut > 0) s = s.slice(0, cut); // cut at word boundary
      s = s.replace(new RegExp(escSep + '$'), '');
    }
    return s;
  }

  function update() {
    TN.clearErr(errId());
    var inEl = TN.el(SLUG + '-input');
    var text = inEl ? inEl.value : '';
    var sepEl = TN.el(SLUG + '-sep');
    var sep = sepEl ? sepEl.value : '-';
    var maxEl = TN.el(SLUG + '-maxlen');
    var maxLen = maxEl ? parseInt(maxEl.value, 10) : 0;
    if (isNaN(maxLen) || maxLen < 0) maxLen = 0;
    var slug = makeSlug(text, sep, maxLen);
    var out = TN.el(SLUG + '-output');
    if (out) out.value = slug;
    var ex = TN.el(SLUG + '-example');
    if (ex) ex.textContent = slug || 'your-slug';
  }

  function copy() {
    var out = TN.el(SLUG + '-output');
    if (!out || !out.value) { TN.setErr(errId(), 'Type a headline first to generate a slug.'); return; }
    TN.clearErr(errId());
    TN.copy(out.value).then(function (ok) {
      if (!ok) TN.setErr(errId(), 'Copy failed — select the slug manually and press Ctrl+C.');
    });
  }

  function clear() {
    TN.clearErr(errId());
    var inEl = TN.el(SLUG + '-input');
    if (inEl) inEl.value = '';
    update();
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var deb = TN.debounce(update, 120);
      ['input', 'sep', 'maxlen'].forEach(function (k) {
        var e = TN.el(SLUG + '-' + k);
        if (e) { TN.on(e, 'input', deb); TN.on(e, 'change', update); }
      });
      var cp = TN.el(SLUG + '-copy');
      if (cp) TN.on(cp, 'click', copy);
      var c = TN.el(SLUG + '-clear');
      if (c) TN.on(c, 'click', clear);
      update();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();