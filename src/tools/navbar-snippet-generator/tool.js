/* Navbar Snippet Generator — brand/links/colors → responsive navbar HTML+CSS+JS, live preview. */
(function () {
  'use strict';
  var SLUG = 'navbar-snippet-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function parseLinks(text) {
    return text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var i = l.indexOf('|');
      if (i < 0) return { label: l, href: '#' };
      return { label: l.slice(0, i).trim() || l, href: l.slice(i + 1).trim() || '#' };
    });
  }

  function build(brand, links, cta, bg, accent, text, sticky) {
    var linkHtml = links.map(function (l) {
      return '      <li><a href="' + TN.esc(l.href) + '">' + TN.esc(l.label) + '</a></li>';
    }).join('\n');
    var html =
      '<header class="nb-bar' + (sticky ? ' nb-sticky' : '') + '">\n' +
      '  <nav class="nb-inner" aria-label="Main">\n' +
      '    <a href="/" class="nb-brand">' + TN.esc(brand) + '</a>\n' +
      '    <button class="nb-toggle" aria-expanded="false" aria-label="Toggle menu"><span></span><span></span><span></span></button>\n' +
      '    <ul class="nb-links">\n' + linkHtml + '\n    </ul>\n' +
      (cta ? '    <a href="#" class="nb-cta">' + TN.esc(cta) + '</a>\n' : '') +
      '  </nav>\n</header>';
    var css =
      '.nb-bar { background: ' + bg + '; color: ' + text + '; font-family: system-ui, sans-serif; }\n' +
      '.nb-sticky { position: sticky; top: 0; z-index: 50; }\n' +
      '.nb-inner { max-width: 1100px; margin: 0 auto; padding: 0 20px; height: 64px; display: flex; align-items: center; gap: 24px; }\n' +
      '.nb-brand { color: ' + text + '; font-weight: 800; font-size: 20px; text-decoration: none; margin-right: auto; }\n' +
      '.nb-links { display: flex; gap: 4px; list-style: none; margin: 0; padding: 0; align-items: center; }\n' +
      '.nb-links a { color: ' + text + '; text-decoration: none; padding: 8px 14px; border-radius: 8px; font-size: 15px; }\n' +
      '.nb-links a:hover { background: rgba(255,255,255,.08); color: ' + accent + '; }\n' +
      '.nb-cta { background: ' + accent + '; color: #fff; text-decoration: none; font-weight: 700; padding: 10px 20px; border-radius: 10px; font-size: 15px; white-space: nowrap; }\n' +
      '.nb-toggle { display: none; background: none; border: none; cursor: pointer; padding: 8px; }\n' +
      '.nb-toggle span { display: block; width: 24px; height: 2px; background: ' + text + '; margin: 5px 0; transition: .25s; }\n' +
      '@media (max-width: 768px) {\n' +
      '  .nb-toggle { display: block; margin-left: auto; }\n' +
      '  .nb-brand { margin-right: 0; }\n' +
      '  .nb-links { position: absolute; top: 64px; left: 0; right: 0; background: ' + bg + '; flex-direction: column; align-items: stretch; padding: 12px 20px 20px; display: none; border-top: 1px solid rgba(255,255,255,.08); }\n' +
      '  .nb-links.nb-open { display: flex; }\n' +
      '  .nb-links a { padding: 12px 8px; }\n' +
      '  .nb-cta { display: none; }\n' +
      '  .nb-inner { position: relative; }\n' +
      '  .nb-toggle[aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }\n' +
      '  .nb-toggle[aria-expanded="true"] span:nth-child(2) { opacity: 0; }\n' +
      '  .nb-toggle[aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }\n' +
      '}';
    var js =
      "var nbToggle = document.querySelector('.nb-toggle');\n" +
      "var nbLinks = document.querySelector('.nb-links');\n" +
      "nbToggle.addEventListener('click', function () {\n" +
      "  var open = nbToggle.getAttribute('aria-expanded') === 'true';\n" +
      "  nbToggle.setAttribute('aria-expanded', String(!open));\n" +
      "  nbLinks.classList.toggle('nb-open', !open);\n" +
      "});";
    return { html: html, css: css, js: js };
  }

  function wirePreview(pv) {
    var t = pv.querySelector('.nb-toggle'), l = pv.querySelector('.nb-links');
    if (!t || !l) return;
    t.addEventListener('click', function () {
      var open = t.getAttribute('aria-expanded') === 'true';
      t.setAttribute('aria-expanded', String(!open));
      l.classList.toggle('nb-open', !open);
    });
  }

  function update() {
    clear();
    var brand = el(SLUG + '-brand').value.trim() || 'Brand';
    var links = parseLinks(el(SLUG + '-links').value);
    if (!links.length) { fail('Add at least one link.'); return; }
    var b = build(brand, links, el(SLUG + '-cta').value.trim(),
      el(SLUG + '-bg').value, el(SLUG + '-accent').value, el(SLUG + '-text').value,
      el(SLUG + '-sticky').checked);
    var pv = el(SLUG + '-preview');
    pv.innerHTML = '<style>' + b.css + '</style>' + b.html +
      '<div style="padding:60px 20px;color:#a1a1aa;font-size:14px;text-align:center">Preview area — shrink this panel to see the hamburger menu.</div>';
    wirePreview(pv);
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Navbar</title>\n<style>\n' +
      b.css + '\nbody { margin: 0; }\n</style>\n</head>\n<body>\n' + b.html +
      '\n<script>\n' + b.js + '\n<\/script>\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-brand')) return;
    ['brand', 'cta'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-links', 'input', update);
    ['bg', 'accent', 'text'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-sticky', 'change', update);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'navbar.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
