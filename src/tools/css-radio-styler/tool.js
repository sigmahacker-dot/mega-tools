/* CSS Radio Styler — custom radio group HTML+CSS with working live preview. */
(function () {
  'use strict';
  var SLUG = 'css-radio-styler';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function build(o) {
    var s = o.size;
    var inner = o.style === 'ring'
      ? '.rd-input:checked + .rd-circle::after { background: transparent; border: ' + Math.max(3, Math.round(s * 0.16)) + 'px solid ' + o.accent + '; width: ' + Math.round(s * 0.44) + 'px; height: ' + Math.round(s * 0.44) + 'px; }\n'
      : '';
    var radios = o.labels.map(function (label, i) {
      return '  <label class="rd-wrap">\n' +
        '    <input type="radio" name="choice" class="rd-input"' + (i === 0 ? ' checked' : '') + '>\n' +
        '    <span class="rd-circle" aria-hidden="true"></span>\n' +
        '    <span>' + TN.esc(label) + '</span>\n  </label>';
    }).join('\n');
    var html = '<div class="rd-group">\n' + radios + '\n</div>';
    var css =
      '.rd-group { display: flex; flex-direction: column; gap: 12px; font-family: system-ui, sans-serif; font-size: 16px; color: #f4f4f5; }\n' +
      '.rd-wrap { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }\n' +
      '.rd-input { position: absolute; opacity: 0; width: 1px; height: 1px; }\n' +
      '.rd-circle { width: ' + s + 'px; height: ' + s + 'px; border-radius: 50%; border: 2px solid #71717a; display: inline-flex; align-items: center; justify-content: center; transition: all .18s; flex-shrink: 0; }\n' +
      '.rd-circle::after { content: ""; width: ' + Math.round(s * 0.5) + 'px; height: ' + Math.round(s * 0.5) + 'px; border-radius: 50%; background: ' + o.accent + '; opacity: 0; transform: scale(.4); transition: all .18s; box-sizing: border-box; }\n' +
      inner +
      '.rd-input:checked + .rd-circle { border-color: ' + o.accent + '; }\n' +
      '.rd-input:checked + .rd-circle::after { opacity: 1; transform: scale(1); }\n' +
      '.rd-input:focus-visible + .rd-circle { outline: 2px solid ' + o.accent + '; outline-offset: 2px; }';
    return { html: html, css: css };
  }

  function update() {
    clear();
    var size = Math.max(14, Math.min(48, parseInt(el(SLUG + '-size').value, 10) || 22));
    var labels = el(SLUG + '-labels').value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (!labels.length) { fail('Enter at least one option label.'); return; }
    var b = build({ accent: el(SLUG + '-accent').value, size: size, style: el(SLUG + '-style').value, labels: labels });
    el(SLUG + '-preview').innerHTML = '<style>' + b.css + '</style>' + b.html;
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Radio</title>\n<style>\n' +
      b.css + '\nbody { background: #18181b; padding: 40px; }\n</style>\n</head>\n<body>\n' + b.html + '\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-accent')) return;
    TN.on(SLUG + '-accent', 'input', update);
    TN.on(SLUG + '-size', 'input', update);
    TN.on(SLUG + '-labels', 'input', update);
    TN.on(SLUG + '-style', 'change', update);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'radio.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
