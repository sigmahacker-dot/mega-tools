/* CSS Checkbox Styler — custom checkbox HTML+CSS with working live preview. */
(function () {
  'use strict';
  var SLUG = 'css-checkbox-styler';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function build(o) {
    var s = o.size, r = Math.min(o.radius, Math.floor(s / 2));
    var mark = o.mark === 'dash' ? '–' : '✓';
    var html =
      '<label class="cb-wrap">\n' +
      '  <input type="checkbox" class="cb-input">\n' +
      '  <span class="cb-box" aria-hidden="true"></span>\n' +
      '  <span class="cb-label">' + TN.esc(o.label) + '</span>\n</label>';
    var css =
      '.cb-wrap { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; font-family: system-ui, sans-serif; font-size: 16px; color: #f4f4f5; user-select: none; }\n' +
      '.cb-input { position: absolute; opacity: 0; width: 1px; height: 1px; }\n' +
      '.cb-box { width: ' + s + 'px; height: ' + s + 'px; border-radius: ' + r + 'px; border: 2px solid #71717a; background: transparent; display: inline-flex; align-items: center; justify-content: center; font-size: ' + Math.round(s * 0.72) + 'px; color: #fff; transition: all .18s; flex-shrink: 0; }\n' +
      '.cb-box::after { content: "' + mark + '"; opacity: 0; transform: scale(.5); transition: all .18s; line-height: 1; }\n' +
      '.cb-input:checked + .cb-box { background: ' + o.accent + '; border-color: ' + o.accent + '; }\n' +
      '.cb-input:checked + .cb-box::after { opacity: 1; transform: scale(1); }\n' +
      '.cb-input:focus-visible + .cb-box { outline: 2px solid ' + o.accent + '; outline-offset: 2px; }';
    return { html: html, css: css };
  }

  function update() {
    clear();
    var size = Math.max(14, Math.min(48, parseInt(el(SLUG + '-size').value, 10) || 22));
    var radius = Math.max(0, Math.min(24, parseInt(el(SLUG + '-radius').value, 10) || 0));
    var b = build({
      accent: el(SLUG + '-accent').value, size: size, radius: radius,
      mark: el(SLUG + '-mark').value, label: el(SLUG + '-label').value.trim() || 'Option'
    });
    el(SLUG + '-preview').innerHTML = '<style>' + b.css + '</style>' + b.html;
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Checkbox</title>\n<style>\n' +
      b.css + '\nbody { background: #18181b; padding: 40px; }\n</style>\n</head>\n<body>\n' + b.html + '\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-accent')) return;
    TN.on(SLUG + '-accent', 'input', update);
    ['size', 'radius', 'label'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-mark', 'change', update);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'checkbox.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
