/* Testimonial Card Generator — quote/author/rating → testimonial card HTML+CSS, live preview. */
(function () {
  'use strict';
  var SLUG = 'testimonial-card-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function initials(name) {
    var parts = name.trim().split(/\s+/);
    if (!parts[0]) return '?';
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }

  function build(quote, name, role, rating, accent, style) {
    var stars = '';
    for (var i = 0; i < 5; i++) stars += i < rating ? '★' : '☆';
    var html =
      '<figure class="tm-card tm-' + style + '">\n' +
      '  <div class="tm-stars" aria-label="' + rating + ' out of 5 stars">' + stars + '</div>\n' +
      '  <blockquote class="tm-quote">&ldquo;' + TN.esc(quote) + '&rdquo;</blockquote>\n' +
      '  <figcaption class="tm-author">\n' +
      '    <span class="tm-avatar">' + TN.esc(initials(name)) + '</span>\n' +
      '    <span class="tm-meta"><strong>' + TN.esc(name) + '</strong><small>' + TN.esc(role) + '</small></span>\n' +
      '  </figcaption>\n</figure>';
    var css =
      '.tm-card { max-width: 480px; margin: 0 auto; background: #fff; color: #18181b; border-radius: 16px; padding: 28px; font-family: system-ui, sans-serif; box-shadow: 0 8px 30px rgba(0,0,0,.10); }\n' +
      '.tm-card.tm-border { border-left: 6px solid ' + accent + '; border-radius: 8px; }\n' +
      '.tm-card.tm-minimal { box-shadow: none; background: transparent; padding: 8px; }\n' +
      '.tm-stars { color: ' + accent + '; font-size: 20px; letter-spacing: 3px; margin-bottom: 12px; }\n' +
      '.tm-quote { font-size: 18px; line-height: 1.6; margin: 0 0 20px; font-style: italic; }\n' +
      '.tm-author { display: flex; align-items: center; gap: 14px; }\n' +
      '.tm-avatar { width: 48px; height: 48px; border-radius: 50%; background: ' + accent + '; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; flex-shrink: 0; }\n' +
      '.tm-meta strong { display: block; font-size: 15px; }\n' +
      '.tm-meta small { color: #52525b; font-size: 13px; }';
    return { html: html, css: css };
  }

  function update() {
    clear();
    var quote = el(SLUG + '-quote').value.trim();
    var name = el(SLUG + '-name').value.trim();
    if (!quote) { fail('Enter the testimonial quote.'); return; }
    if (!name) { fail('Enter the author name.'); return; }
    var b = build(quote, name, el(SLUG + '-role').value.trim(),
      parseInt(el(SLUG + '-rating').value, 10), el(SLUG + '-accent').value, el(SLUG + '-style').value);
    el(SLUG + '-preview').innerHTML = '<style>' + b.css + '</style>' + b.html;
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Testimonial</title>\n<style>\n' +
      b.css + '\nbody { background: #f4f4f5; padding: 40px 16px; }\n</style>\n</head>\n<body>\n' + b.html + '\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-quote')) return;
    ['quote', 'name', 'role'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    ['rating', 'style'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', update); });
    TN.on(SLUG + '-accent', 'input', update);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'testimonial.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
