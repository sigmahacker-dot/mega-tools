/* Sitemap Generator — validates URLs and builds a standards-compliant sitemap.xml */
(function () {
  'use strict';
  var S = 'sitemap-generator';
  var lastXml = '';

  function xmlEsc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function flash(msg) {
    var el = TN.el(S + '-success');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(function () { el.classList.add('hidden'); }, 2500);
  }

  function generate() {
    try {
      TN.clearErr(S + '-error');
      var listEl = TN.el(S + '-invalid-list');
      if (listEl) { listEl.classList.remove('show'); listEl.textContent = ''; }

      var urlsEl = TN.el(S + '-urls');
      var rawText = urlsEl ? urlsEl.value : '';
      if (!rawText.trim()) {
        TN.setErr(S + '-error', 'Paste at least one URL to generate a sitemap.');
        return;
      }

      var addSlashEl = TN.el(S + '-trailing-slash');
      var addSlash = !!(addSlashEl && addSlashEl.checked);
      var cfEl = TN.el(S + '-changefreq');
      var prEl = TN.el(S + '-priority');
      var cf = cfEl ? cfEl.value : 'weekly';
      var pr = prEl ? prEl.value : '0.5';

      var valid = [], invalid = [];
      rawText.split(/\r?\n/).forEach(function (line, i) {
        var u = line.trim();
        if (!u) return;
        try {
          var url = new URL(u);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            invalid.push('Line ' + (i + 1) + ': ' + u + ' — only http:// and https:// URLs are allowed');
            return;
          }
          if (addSlash && url.pathname.charAt(url.pathname.length - 1) !== '/') {
            url.pathname = url.pathname + '/';
          }
          valid.push(url.toString());
        } catch (e) {
          invalid.push('Line ' + (i + 1) + ': ' + u + ' — not a valid URL');
        }
      });

      var today = new Date().toISOString().slice(0, 10);
      var parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
      valid.forEach(function (u) {
        parts.push('  <url>');
        parts.push('    <loc>' + xmlEsc(u) + '</loc>');
        parts.push('    <lastmod>' + today + '</lastmod>');
        parts.push('    <changefreq>' + xmlEsc(cf) + '</changefreq>');
        parts.push('    <priority>' + xmlEsc(pr) + '</priority>');
        parts.push('  </url>');
      });
      parts.push('</urlset>');
      lastXml = parts.join('\n');

      var codeEl = TN.el(S + '-code');
      if (codeEl) codeEl.textContent = lastXml;
      var cEl = TN.el(S + '-count');
      if (cEl) cEl.textContent = String(valid.length);
      var icEl = TN.el(S + '-invalid-count');
      if (icEl) icEl.textContent = String(invalid.length);
      TN.show(S + '-stats');
      TN.show(S + '-output');

      if (invalid.length && listEl) {
        listEl.innerHTML = '<strong>Invalid lines (' + invalid.length + '):</strong><br>' +
          invalid.map(function (x) { return TN.esc(x); }).join('<br>');
        listEl.classList.add('show');
      }
      if (!valid.length) {
        TN.setErr(S + '-error', 'No valid URLs found. Fix the invalid lines above and generate again.');
      }
    } catch (err) {
      TN.setErr(S + '-error', 'Something went wrong while generating the sitemap.');
    }
  }

  function copyXml() {
    TN.clearErr(S + '-error');
    if (!lastXml) { TN.setErr(S + '-error', 'Generate the sitemap first, then copy.'); return; }
    TN.copy(lastXml).then(function (ok) {
      if (ok) flash('Sitemap XML copied to clipboard.');
      else TN.setErr(S + '-error', 'Copy was blocked by the browser. Select the XML manually.');
    });
  }

  function downloadXml() {
    TN.clearErr(S + '-error');
    if (!lastXml) { TN.setErr(S + '-error', 'Generate the sitemap first, then download.'); return; }
    TN.downloadText(lastXml, 'sitemap.xml', 'application/xml;charset=utf-8');
  }

  function init() {
    try {
      TN.on(S + '-generate', 'click', generate);
      TN.on(S + '-copy', 'click', copyXml);
      TN.on(S + '-download', 'click', downloadXml);
    } catch (err) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
