/* FAQ Accordion Generator — FAQ blocks → accessible accordion HTML+CSS+JS, live preview. */
(function () {
  'use strict';
  var SLUG = 'faq-accordion-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function parseFaqs(text) {
    return text.split(/\n\s*\n/).map(function (b) {
      return b.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    }).filter(function (lines) { return lines.length >= 2; })
      .map(function (lines) { return { q: lines[0], a: lines.slice(1).join(' ') }; });
  }

  function build(faqs, accent, theme, icon) {
    var dark = theme === 'dark';
    var cardBg = dark ? '#27272a' : '#ffffff';
    var textC = dark ? '#f4f4f5' : '#18181b';
    var items = faqs.map(function (f, i) {
      var ic = icon === 'chevron' ? '<span class="fq-ic">▾</span>' : '<span class="fq-ic">+</span>';
      return '  <div class="fq-item">\n' +
        '    <button class="fq-q" aria-expanded="false" aria-controls="fq-a-' + i + '" id="fq-q-' + i + '">' +
        TN.esc(f.q) + ic + '</button>\n' +
        '    <div class="fq-a" id="fq-a-' + i + '" role="region" aria-labelledby="fq-q-' + i + '" hidden>\n' +
        '      <p>' + TN.esc(f.a) + '</p>\n    </div>\n  </div>';
    }).join('\n');
    var html = '<div class="fq-wrap">\n' + items + '\n</div>';
    var css =
      '.fq-wrap { max-width: 640px; margin: 0 auto; font-family: system-ui, sans-serif; }\n' +
      '.fq-item { background: ' + cardBg + '; border: 1px solid ' + (dark ? '#3f3f46' : '#e4e4e7') + '; border-radius: 12px; margin-bottom: 10px; overflow: hidden; }\n' +
      '.fq-q { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px; background: none; border: none; color: ' + textC + '; font-size: 16px; font-weight: 600; text-align: left; padding: 16px 18px; cursor: pointer; }\n' +
      '.fq-q:focus-visible { outline: 2px solid ' + accent + '; outline-offset: -2px; }\n' +
      '.fq-ic { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: ' + accent + '; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; transition: transform .25s; }\n' +
      '.fq-q[aria-expanded="true"] .fq-ic { transform: rotate(' + (icon === 'chevron' ? '180' : '45') + 'deg); }\n' +
      '.fq-a { padding: 0 18px; }\n' +
      '.fq-a p { margin: 0 0 16px; color: ' + (dark ? '#d4d4d8' : '#3f3f46') + '; line-height: 1.6; font-size: 15px; }\n' +
      '.fq-a[hidden] { display: none; }';
    var js =
      "document.querySelectorAll('.fq-q').forEach(function (btn) {\n" +
      "  btn.addEventListener('click', function () {\n" +
      "    var open = btn.getAttribute('aria-expanded') === 'true';\n" +
      "    document.querySelectorAll('.fq-q[aria-expanded=\"true\"]').forEach(function (b) {\n" +
      "      b.setAttribute('aria-expanded', 'false');\n" +
      "      document.getElementById(b.getAttribute('aria-controls')).hidden = true;\n" +
      "    });\n" +
      "    btn.setAttribute('aria-expanded', String(!open));\n" +
      "    document.getElementById(btn.getAttribute('aria-controls')).hidden = open;\n" +
      "  });\n" +
      "});";
    return { html: html, css: css, js: js };
  }

  function wirePreview() {
    var pv = el(SLUG + '-preview');
    pv.querySelectorAll('.fq-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        pv.querySelectorAll('.fq-q[aria-expanded="true"]').forEach(function (b) {
          b.setAttribute('aria-expanded', 'false');
          var r = pv.querySelector('#' + CSS.escape(b.getAttribute('aria-controls')));
          if (r) r.hidden = true;
        });
        btn.setAttribute('aria-expanded', String(!open));
        var region = pv.querySelector('#' + CSS.escape(btn.getAttribute('aria-controls')));
        if (region) region.hidden = open;
      });
    });
  }

  function update() {
    clear();
    var faqs = parseFaqs(el(SLUG + '-faqs').value);
    if (!faqs.length) { fail('Add at least one FAQ (question line + answer line, blank line between).'); return; }
    var b = build(faqs, el(SLUG + '-accent').value, el(SLUG + '-theme').value, el(SLUG + '-icon').value);
    el(SLUG + '-preview').style.background = el(SLUG + '-theme').value === 'dark' ? '#18181b' : '#f4f4f5';
    el(SLUG + '-preview').innerHTML = '<style>' + b.css + '</style>' + b.html;
    wirePreview();
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>FAQ</title>\n<style>\n' +
      b.css + '\nbody { background: ' + (el(SLUG + '-theme').value === 'dark' ? '#111' : '#fafafa') + '; padding: 40px 16px; }\n</style>\n</head>\n<body>\n' +
      b.html + '\n<script>\n' + b.js + '\n<\/script>\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-faqs')) return;
    TN.on(SLUG + '-faqs', 'input', update);
    TN.on(SLUG + '-accent', 'input', update);
    ['theme', 'icon'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', update); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'faq.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
