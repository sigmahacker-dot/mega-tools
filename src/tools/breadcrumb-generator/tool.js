/* Breadcrumb Generator — path segments → accessible breadcrumb HTML+CSS, live preview. */
(function () {
  'use strict';
  var SLUG = 'breadcrumb-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function parseSegs(text) {
    var raw = text.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (raw.length === 1 && raw[0].indexOf('/') >= 0) {
      return raw[0].split('/').map(function (s) { return s.trim(); }).filter(Boolean);
    }
    return raw;
  }

  function build(segs, sep, style, accent, theme) {
    var dark = theme === 'dark';
    var textC = dark ? '#f4f4f5' : '#18181b';
    var mutC = dark ? '#a1a1aa' : '#52525b';
    var items = segs.map(function (s, i) {
      var last = i === segs.length - 1;
      var inner = last
        ? '<span aria-current="page">' + TN.esc(s) + '</span>'
        : '<a href="#">' + TN.esc(s) + '</a>';
      return '    <li' + (last ? ' class="bc-current"' : '') + '>' + inner + '</li>';
    }).join('\n');
    var html = '<nav aria-label="Breadcrumb" class="bc-nav bc-' + style + '">\n  <ol>\n' + items + '\n  </ol>\n</nav>';
    var css =
      '.bc-nav { font-family: system-ui, sans-serif; font-size: 15px; }\n' +
      '.bc-nav ol { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; list-style: none; margin: 0; padding: 0; }\n' +
      '.bc-nav li { display: flex; align-items: center; gap: 8px; color: ' + mutC + '; }\n' +
      '.bc-nav li + li::before { content: "' + sep.replace(/"/g, '\\"') + '"; color: ' + mutC + '; }\n' +
      '.bc-nav a { color: ' + accent + '; text-decoration: none; }\n' +
      '.bc-nav a:hover { text-decoration: underline; }\n' +
      '.bc-current span { color: ' + textC + '; font-weight: 600; }\n' +
      '.bc-pill li { background: ' + (dark ? '#27272a' : '#f4f4f5') + '; border-radius: 999px; padding: 6px 14px; }\n' +
      '.bc-pill li + li::before { content: none; }\n' +
      '.bc-pill ol { gap: 6px; }\n' +
      '.bc-underline a { text-decoration: underline; text-underline-offset: 3px; }';
    return { html: html, css: css };
  }

  function update() {
    clear();
    var segs = parseSegs(el(SLUG + '-path').value);
    if (segs.length < 2) { fail('Enter at least two segments.'); return; }
    var sepChoice = el(SLUG + '-sep').value;
    var sep = sepChoice === 'custom' ? (el(SLUG + '-custom').value || '•') : sepChoice;
    var b = build(segs, sep, el(SLUG + '-style').value, el(SLUG + '-accent').value, el(SLUG + '-theme').value);
    el(SLUG + '-preview').style.background = el(SLUG + '-theme').value === 'dark' ? '#18181b' : '#f4f4f5';
    el(SLUG + '-preview').innerHTML = '<style>' + b.css + '</style>' + b.html;
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Breadcrumb</title>\n<style>\n' +
      b.css + '\nbody { background: ' + (el(SLUG + '-theme').value === 'dark' ? '#111' : '#fafafa') + '; padding: 40px 16px; }\n</style>\n</head>\n<body>\n' +
      b.html + '\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-path')) return;
    TN.on(SLUG + '-path', 'input', update);
    ['sep', 'style', 'theme'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', update); });
    ['custom', 'accent'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'breadcrumb.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
