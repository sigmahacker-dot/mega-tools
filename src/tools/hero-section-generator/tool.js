/* Hero Section Generator — headline/sub/CTAs/gradient → hero HTML+CSS with live preview. */
(function () {
  'use strict';
  var SLUG = 'hero-section-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function cta(value) {
    var i = value.indexOf('|');
    if (i < 0) return { text: value.trim(), href: '#' };
    return { text: value.slice(0, i).trim() || value.trim(), href: value.slice(i + 1).trim() || '#' };
  }

  function build(o) {
    var c1 = cta(o.cta1), c2 = cta(o.cta2);
    var html =
      '<section class="hs-hero">\n' +
      '  <div class="hs-inner">\n' +
      (o.eyebrow ? '    <p class="hs-eyebrow">' + TN.esc(o.eyebrow) + '</p>\n' : '') +
      '    <h1 class="hs-title">' + TN.esc(o.headline) + '</h1>\n' +
      (o.sub ? '    <p class="hs-sub">' + TN.esc(o.sub) + '</p>\n' : '') +
      '    <div class="hs-ctas">\n' +
      (c1.text ? '      <a href="' + TN.esc(c1.href) + '" class="hs-btn hs-primary">' + TN.esc(c1.text) + '</a>\n' : '') +
      (c2.text ? '      <a href="' + TN.esc(c2.href) + '" class="hs-btn hs-secondary">' + TN.esc(c2.text) + '</a>\n' : '') +
      '    </div>\n  </div>\n</section>';
    var css =
      '.hs-hero { background: linear-gradient(' + o.angle + 'deg, ' + o.c1 + ', ' + o.c2 + '); color: ' + o.text + '; padding: 96px 20px; font-family: system-ui, sans-serif; text-align: ' + o.align + '; }\n' +
      '.hs-inner { max-width: 760px; margin: 0 auto; }\n' +
      (o.align === 'left' ? '.hs-inner { margin: 0; }\n' : '') +
      '.hs-eyebrow { display: inline-block; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; opacity: .85; border: 1px solid currentColor; border-radius: 999px; padding: 6px 16px; margin: 0 0 20px; }\n' +
      '.hs-title { font-size: clamp(36px, 6vw, 64px); line-height: 1.1; margin: 0 0 18px; font-weight: 800; letter-spacing: -0.02em; }\n' +
      '.hs-sub { font-size: clamp(16px, 2.4vw, 20px); line-height: 1.6; opacity: .85; margin: 0 0 32px; }\n' +
      '.hs-ctas { display: flex; gap: 14px; flex-wrap: wrap; ' + (o.align === 'center' ? 'justify-content: center;' : '') + ' }\n' +
      '.hs-btn { text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 30px; border-radius: 12px; display: inline-block; }\n' +
      '.hs-primary { background: #fff; color: #111; }\n' +
      '.hs-secondary { border: 2px solid currentColor; color: inherit; }';
    return { html: html, css: css };
  }

  function update() {
    clear();
    var headline = el(SLUG + '-headline').value.trim();
    if (!headline) { fail('Enter a headline.'); return; }
    var b = build({
      eyebrow: el(SLUG + '-eyebrow').value.trim(),
      headline: headline,
      sub: el(SLUG + '-sub').value.trim(),
      cta1: el(SLUG + '-cta1').value, cta2: el(SLUG + '-cta2').value,
      c1: el(SLUG + '-c1').value, c2: el(SLUG + '-c2').value,
      text: el(SLUG + '-text').value, align: el(SLUG + '-align').value,
      angle: Math.max(0, Math.min(360, parseInt(el(SLUG + '-angle').value, 10) || 0))
    });
    el(SLUG + '-preview').innerHTML = '<style>' + b.css + '</style>' + b.html;
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Hero</title>\n<style>\n' +
      b.css + '\nbody { margin: 0; }\n</style>\n</head>\n<body>\n' + b.html + '\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-headline')) return;
    ['eyebrow', 'headline', 'sub', 'cta1', 'cta2'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    ['c1', 'c2', 'text'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-align', 'change', update);
    TN.on(SLUG + '-angle', 'input', update);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'hero.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
