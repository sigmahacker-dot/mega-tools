/* Meta Tag Generator — builds the full <meta>/<title> block with live previews */
(function () {
  'use strict';
  var S = 'meta-tag-generator';
  var lastCode = '';

  function get(id) { var el = TN.el(S + '-' + id); return el ? el.value : ''; }
  function trimVal(id) { return get(id).trim(); }
  function isHttpUrl(u) { return /^(https?:\/\/)/i.test(u); }

  function flash(msg) {
    var el = TN.el(S + '-success');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(function () { el.classList.add('hidden'); }, 2500);
  }

  function build() {
    var title = trimVal('title');
    var desc = trimVal('description');
    var kw = trimVal('keywords');
    var author = trimVal('author');
    var theme = trimVal('theme-color');
    var ogt = trimVal('og-title') || title;
    var ogd = trimVal('og-description') || desc;
    var ogi = trimVal('og-image');
    var card = trimVal('twitter-card') || 'summary';
    var e = TN.esc;
    var lines = [];
    lines.push('<!-- Primary meta tags -->');
    if (title) lines.push('<title>' + e(title) + '</title>');
    if (desc) lines.push('<meta name="description" content="' + e(desc) + '" />');
    if (kw) lines.push('<meta name="keywords" content="' + e(kw) + '" />');
    if (author) lines.push('<meta name="author" content="' + e(author) + '" />');
    if (theme) lines.push('<meta name="theme-color" content="' + e(theme) + '" />');
    lines.push('');
    lines.push('<!-- Open Graph / Facebook -->');
    lines.push('<meta property="og:type" content="website" />');
    if (ogt) lines.push('<meta property="og:title" content="' + e(ogt) + '" />');
    if (ogd) lines.push('<meta property="og:description" content="' + e(ogd) + '" />');
    if (ogi) lines.push('<meta property="og:image" content="' + e(ogi) + '" />');
    lines.push('');
    lines.push('<!-- Twitter -->');
    lines.push('<meta name="twitter:card" content="' + e(card) + '" />');
    if (ogt) lines.push('<meta name="twitter:title" content="' + e(ogt) + '" />');
    if (ogd) lines.push('<meta name="twitter:description" content="' + e(ogd) + '" />');
    if (ogi) lines.push('<meta name="twitter:image" content="' + e(ogi) + '" />');
    return { code: lines.join('\n'), title: title, desc: desc, ogt: ogt, ogd: ogd, ogi: ogi };
  }

  function renderPreviews(d) {
    var e = TN.esc;
    var siteLabel = 'example.com';
    if (d.ogi && isHttpUrl(d.ogi)) {
      try { siteLabel = new URL(d.ogi).hostname; } catch (err) { /* keep default */ }
    }
    var g = TN.el(S + '-google');
    if (g) {
      g.innerHTML =
        '<div style="font-size:13px;color:#202124;margin-bottom:2px">' + e(siteLabel) + '</div>' +
        '<div style="font-size:20px;color:#1a0dab;line-height:1.3;margin-bottom:2px">' + e(d.title || 'Your page title') + '</div>' +
        '<div style="font-size:14px;color:#4d5156;line-height:1.4">' + e(d.desc || 'Your meta description will appear here in search results.') + '</div>';
    }
    var so = TN.el(S + '-social');
    if (so) {
      var imgHtml;
      if (d.ogi && isHttpUrl(d.ogi)) {
        imgHtml = '<img src="' + e(d.ogi) + '" alt="Social preview image" style="width:100%;display:block;max-height:200px;object-fit:cover" onerror="this.style.display=\'none\'">';
      } else {
        imgHtml = '<div style="height:90px;background:#eef0ff;display:flex;align-items:center;justify-content:center;color:#8a90a8;font-size:13px">No image</div>';
      }
      so.innerHTML =
        '<div style="border:1px solid #e2e6f5;border-radius:10px;overflow:hidden;max-width:480px;background:#fff">' +
        imgHtml +
        '<div style="padding:10px 12px">' +
        '<div style="font-weight:700;font-size:14px;color:#111;margin-bottom:2px">' + e(d.ogt || 'Social title') + '</div>' +
        '<div style="font-size:13px;color:#555">' + e(d.ogd || 'Social description') + '</div>' +
        '</div></div>';
    }
  }

  function render() {
    try {
      TN.clearErr(S + '-error');
      var d = build();
      lastCode = d.code;
      var codeEl = TN.el(S + '-code');
      if (codeEl) codeEl.textContent = d.code;
      TN.show(S + '-output');
      renderPreviews(d);
      TN.show(S + '-preview');
    } catch (err) {
      TN.setErr(S + '-error', 'Something went wrong while generating the tags.');
    }
  }

  function copyCode() {
    TN.clearErr(S + '-error');
    if (!lastCode) { TN.setErr(S + '-error', 'Nothing to copy yet — enter a title or description first.'); return; }
    TN.copy(lastCode).then(function (ok) {
      if (ok) flash('Copied to clipboard.');
      else TN.setErr(S + '-error', 'Copy was blocked by the browser. Select the code manually.');
    });
  }

  function downloadCode() {
    TN.clearErr(S + '-error');
    if (!lastCode) { TN.setErr(S + '-error', 'Nothing to download yet — enter a title or description first.'); return; }
    TN.downloadText(lastCode, 'meta-tags.html', 'text/html;charset=utf-8');
  }

  function init() {
    try {
      var renderLive = (typeof TN.debounce === 'function') ? TN.debounce(render, 350) : render;
      ['title', 'description', 'keywords', 'author', 'theme-color', 'og-title', 'og-description', 'og-image', 'twitter-card'].forEach(function (id) {
        TN.on(S + '-' + id, 'input', renderLive);
        TN.on(S + '-' + id, 'change', renderLive);
      });
      TN.on(S + '-copy', 'click', copyCode);
      TN.on(S + '-download', 'click', downloadCode);
      render();
    } catch (err) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
