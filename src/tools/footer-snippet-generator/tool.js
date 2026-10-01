/* Footer Snippet Generator — brand/columns/social → multi-column footer HTML+CSS, live preview. */
(function () {
  'use strict';
  var SLUG = 'footer-snippet-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function parseCols(text) {
    return text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean)
      .slice(0, 4).map(function (l) {
        var parts = l.split('|').map(function (p) { return p.trim(); }).filter(Boolean);
        return { title: parts[0] || 'Links', links: parts.slice(1) };
      }).filter(function (c) { return c.links.length; });
  }
  function parseSocial(text) {
    return text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var i = l.indexOf('|');
      if (i < 0) return { label: l, href: '#' };
      return { label: l.slice(0, i).trim() || l, href: l.slice(i + 1).trim() || '#' };
    }).slice(0, 8);
  }

  function build(brand, tagline, cols, social, copyright, bg, accent) {
    var colHtml = cols.map(function (c) {
      var links = c.links.map(function (l) {
        return '        <li><a href="#">' + TN.esc(l) + '</a></li>';
      }).join('\n');
      return '      <div class="ft-col">\n        <h4>' + TN.esc(c.title) + '</h4>\n        <ul>\n' + links + '\n        </ul>\n      </div>';
    }).join('\n');
    var socHtml = social.length ? '      <div class="ft-social">\n' + social.map(function (s) {
      return '        <a href="' + TN.esc(s.href) + '">' + TN.esc(s.label) + '</a>';
    }).join('\n') + '\n      </div>\n' : '';
    var html =
      '<footer class="ft-footer">\n' +
      '  <div class="ft-inner">\n' +
      '    <div class="ft-brandcol">\n' +
      '      <div class="ft-brand">' + TN.esc(brand) + '</div>\n' +
      '      <p class="ft-tag">' + TN.esc(tagline) + '</p>\n' + socHtml +
      '    </div>\n' + colHtml + '\n' +
      '  </div>\n' +
      '  <div class="ft-bottom">' + TN.esc(copyright) + '</div>\n</footer>';
    var css =
      '.ft-footer { background: ' + bg + '; color: #d4d4d8; font-family: system-ui, sans-serif; }\n' +
      '.ft-inner { max-width: 1100px; margin: 0 auto; padding: 48px 20px 32px; display: grid; grid-template-columns: 1.4fr repeat(' + Math.max(cols.length, 1) + ', 1fr); gap: 32px; }\n' +
      '@media (max-width: 768px) { .ft-inner { grid-template-columns: 1fr 1fr; } }\n' +
      '@media (max-width: 480px) { .ft-inner { grid-template-columns: 1fr; } }\n' +
      '.ft-brand { font-size: 22px; font-weight: 800; color: #fff; }\n' +
      '.ft-tag { color: #a1a1aa; font-size: 14px; margin: 8px 0 16px; }\n' +
      '.ft-col h4 { color: #fff; font-size: 14px; text-transform: uppercase; letter-spacing: .08em; margin: 0 0 14px; }\n' +
      '.ft-col ul { list-style: none; margin: 0; padding: 0; }\n' +
      '.ft-col li { margin-bottom: 10px; }\n' +
      '.ft-col a { color: #a1a1aa; text-decoration: none; font-size: 14px; }\n' +
      '.ft-col a:hover { color: ' + accent + '; }\n' +
      '.ft-social { display: flex; gap: 8px; flex-wrap: wrap; }\n' +
      '.ft-social a { color: #d4d4d8; text-decoration: none; font-size: 13px; border: 1px solid #3f3f46; padding: 6px 12px; border-radius: 999px; }\n' +
      '.ft-social a:hover { border-color: ' + accent + '; color: ' + accent + '; }\n' +
      '.ft-bottom { border-top: 1px solid #27272a; text-align: center; padding: 18px; font-size: 13px; color: #71717a; }';
    return { html: html, css: css };
  }

  function update() {
    clear();
    var brand = el(SLUG + '-brand').value.trim() || 'Brand';
    var cols = parseCols(el(SLUG + '-cols').value);
    if (!cols.length) { fail('Add at least one column with at least one link.'); return; }
    var b = build(brand, el(SLUG + '-tagline').value.trim(),
      cols, parseSocial(el(SLUG + '-social').value),
      el(SLUG + '-copyright').value.trim(),
      el(SLUG + '-bg').value, el(SLUG + '-accent').value);
    el(SLUG + '-preview').innerHTML = '<style>' + b.css + '</style>' + b.html;
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Footer</title>\n<style>\n' +
      b.css + '\nbody { margin: 0; }\n</style>\n</head>\n<body>\n' + b.html + '\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-brand')) return;
    ['brand', 'tagline', 'copyright'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    ['cols', 'social'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    ['bg', 'accent'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'footer.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
