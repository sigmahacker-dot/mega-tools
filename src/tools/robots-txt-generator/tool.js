/* Robots.txt Generator — builds a valid robots.txt with live preview */
(function () {
  'use strict';
  var S = 'robots-txt-generator';
  var lastTxt = '';

  function get(id) { var el = TN.el(S + '-' + id); return el ? el.value : ''; }
  function trimVal(id) { return get(id).trim(); }

  function flash(msg) {
    var el = TN.el(S + '-success');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(function () { el.classList.add('hidden'); }, 2500);
  }

  function normPath(p) {
    p = p.trim();
    if (!p) return '';
    return p.charAt(0) === '/' ? p : '/' + p;
  }

  function eachLine(text, fn) {
    text.split(/\r?\n/).forEach(function (line) {
      var p = normPath(line);
      if (p) fn(p);
    });
  }

  function selectedDefault() {
    var radios = TN.qsa('input[name="' + S + '-default"]');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) return radios[i].value;
    }
    return 'allow';
  }

  function build() {
    var ua = trimVal('useragent') || '*';
    var cd = trimVal('crawl-delay');
    var sm = trimVal('sitemap');
    if (cd && !/^\d+$/.test(cd)) throw new Error('Crawl-delay must be a whole number of seconds.');
    if (sm) {
      try {
        var u = new URL(sm);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('bad');
      } catch (e) {
        throw new Error('Sitemap URL is not a valid http(s) URL.');
      }
    }
    var lines = [];
    lines.push('User-agent: ' + ua);
    if (selectedDefault() === 'allow') lines.push('Allow: /');
    else lines.push('Disallow: /');
    eachLine(trimVal('allow-paths'), function (p) { lines.push('Allow: ' + p); });
    eachLine(trimVal('disallow-paths'), function (p) { lines.push('Disallow: ' + p); });
    if (cd) lines.push('Crawl-delay: ' + cd);
    if (sm) { lines.push(''); lines.push('Sitemap: ' + sm); }
    return lines.join('\n');
  }

  function render() {
    try {
      TN.clearErr(S + '-error');
      lastTxt = build();
      var codeEl = TN.el(S + '-code');
      if (codeEl) codeEl.textContent = lastTxt;
      TN.show(S + '-output');
    } catch (err) {
      TN.setErr(S + '-error', err && err.message ? err.message : 'Invalid input.');
    }
  }

  function copyTxt() {
    TN.clearErr(S + '-error');
    if (!lastTxt) { TN.setErr(S + '-error', 'Nothing to copy yet — adjust the form above.'); return; }
    TN.copy(lastTxt).then(function (ok) {
      if (ok) flash('robots.txt copied to clipboard.');
      else TN.setErr(S + '-error', 'Copy was blocked by the browser. Select the text manually.');
    });
  }

  function downloadTxt() {
    TN.clearErr(S + '-error');
    if (!lastTxt) { TN.setErr(S + '-error', 'Nothing to download yet — adjust the form above.'); return; }
    TN.downloadText(lastTxt, 'robots.txt', 'text/plain;charset=utf-8');
  }

  function init() {
    try {
      var live = (typeof TN.debounce === 'function') ? TN.debounce(render, 350) : render;
      ['useragent', 'crawl-delay', 'disallow-paths', 'allow-paths', 'sitemap'].forEach(function (id) {
        TN.on(S + '-' + id, 'input', live);
        TN.on(S + '-' + id, 'change', live);
      });
      TN.qsa('input[name="' + S + '-default"]').forEach(function (r) {
        r.addEventListener('change', live);
      });
      TN.on(S + '-copy', 'click', copyTxt);
      TN.on(S + '-download', 'click', downloadTxt);
      render();
    } catch (err) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
