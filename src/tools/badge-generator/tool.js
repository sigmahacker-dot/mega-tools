/* Badge Generator — text/colors/size/shape → CSS badge HTML+CSS with live preview. */
(function () {
  'use strict';
  var SLUG = 'badge-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function luminance(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255;
    var g = parseInt(hex.slice(3, 5), 16) / 255;
    var b = parseInt(hex.slice(5, 7), 16) / 255;
    function f(c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }

  function build(o) {
    var sizes = {
      sm: { pad: '4px 10px', fs: '11px', dot: '6px' },
      md: { pad: '6px 14px', fs: '13px', dot: '8px' },
      lg: { pad: '9px 20px', fs: '16px', dot: '10px' }
    };
    var s = sizes[o.size];
    var radius = o.radius === 'pill' ? '999px' : (o.radius === 'rounded' ? '8px' : '2px');
    var textC = o.auto ? (luminance(o.bg) > 0.35 ? '#111111' : '#ffffff') : '#ffffff';
    var html = '<span class="bdg-badge">' + (o.dot ? '<span class="bdg-dot"></span>' : '') + TN.esc(o.text) + '</span>';
    var css =
      '.bdg-badge { display: inline-flex; align-items: center; gap: 6px; background: ' + o.bg + '; color: ' + textC +
      '; font-family: system-ui, sans-serif; font-size: ' + s.fs + '; font-weight: 700; padding: ' + s.pad +
      '; border-radius: ' + radius + ';' + (o.upper ? ' text-transform: uppercase; letter-spacing: .06em;' : '') + ' }\n' +
      (o.dot ? '.bdg-dot { width: ' + s.dot + '; height: ' + s.dot + '; border-radius: 50%; background: ' + o.dotcolor + '; }\n' : '');
    return { html: html, css: css };
  }

  function update() {
    clear();
    var text = el(SLUG + '-text').value.trim();
    if (!text) { fail('Enter badge text.'); return; }
    var b = build({
      text: text, bg: el(SLUG + '-bg').value, size: el(SLUG + '-size').value,
      radius: el(SLUG + '-radius').value, auto: el(SLUG + '-auto').checked,
      upper: el(SLUG + '-upper').checked, dot: el(SLUG + '-dot').checked,
      dotcolor: el(SLUG + '-dotcolor').value
    });
    el(SLUG + '-preview').innerHTML = '<style>' + b.css + '</style>' + b.html;
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Badge</title>\n<style>\n' +
      b.css + '\nbody { background: #f4f4f5; padding: 40px; text-align: center; }\n</style>\n</head>\n<body>\n' +
      b.html + '\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-text')) return;
    ['text', 'bg', 'dotcolor'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    ['size', 'radius'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', update); });
    ['auto', 'upper', 'dot'].forEach(function (k) { TN.on(SLUG + '-' + k, 'change', update); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'badge.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
