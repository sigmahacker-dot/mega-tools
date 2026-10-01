/* UTM Link Builder — validated base URL + encoded campaign parameters. */
(function () {
  'use strict';

  var SLUG = 'utm-link-builder';
  var FIELDS = ['url', 'source', 'medium', 'campaign', 'term', 'content'];

  function errId() { return SLUG + '-error'; }
  function val(k) { var e = TN.el(SLUG + '-' + k); return e ? e.value.trim() : ''; }

  function build() {
    TN.clearErr(errId());
    var out = TN.el(SLUG + '-output');
    var open = TN.el(SLUG + '-open');
    var base = val('url');
    if (!base) {
      if (out) out.value = '';
      if (open) open.href = '#';
      return;
    }
    var url;
    try {
      url = new URL(base);
    } catch (e) {
      TN.setErr(errId(), 'That is not a valid URL. Include the protocol, e.g. https://example.com/page');
      if (out) out.value = '';
      if (open) open.href = '#';
      return;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      TN.setErr(errId(), 'Only http:// and https:// URLs are supported.');
      if (out) out.value = '';
      if (open) open.href = '#';
      return;
    }
    var params = [
      ['utm_source', val('source')],
      ['utm_medium', val('medium')],
      ['utm_campaign', val('campaign')],
      ['utm_term', val('term')],
      ['utm_content', val('content')]
    ];
    var parts = [];
    // Preserve existing query parameters first.
    var existing = url.search ? url.search.slice(1) : '';
    if (existing) parts.push(existing);
    params.forEach(function (p) {
      if (p[1]) parts.push(encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]));
    });
    var finalUrl = url.origin + url.pathname + (parts.length ? '?' + parts.join('&') : '') + url.hash;
    if (out) out.value = finalUrl;
    if (open) open.href = finalUrl;
    var missing = [];
    if (!val('source')) missing.push('utm_source');
    if (!val('medium')) missing.push('utm_medium');
    if (!val('campaign')) missing.push('utm_campaign');
    if (missing.length && parts.length > (existing ? 1 : 0)) {
      TN.setErr(errId(), 'Note: ' + missing.join(', ') + ' ' + (missing.length === 1 ? 'is' : 'are') + ' empty — the URL still works, but analytics will miss ' + (missing.length === 1 ? 'it' : 'them') + '.');
    }
  }

  function copy() {
    var out = TN.el(SLUG + '-output');
    if (!out || !out.value) { TN.setErr(errId(), 'Enter a valid base URL first.'); return; }
    TN.clearErr(errId());
    TN.copy(out.value).then(function (ok) {
      if (!ok) TN.setErr(errId(), 'Copy failed — select the URL manually and press Ctrl+C.');
    });
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var deb = TN.debounce(build, 200);
      FIELDS.forEach(function (k) {
        var e = TN.el(SLUG + '-' + k);
        if (e) TN.on(e, 'input', deb);
      });
      var cp = TN.el(SLUG + '-copy');
      if (cp) TN.on(cp, 'click', copy);
      build();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();