/* Toggle Switch Generator — size/colors → toggle switch HTML+CSS with working preview. */
(function () {
  'use strict';
  var SLUG = 'toggle-switch-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function build(o) {
    var wdt = o.width, h = Math.round(wdt / 1.75), pad = 3;
    var knob = h - pad * 2;
    var travel = wdt - knob - pad * 2;
    var html =
      '<label class="tg-wrap">\n' +
      '  <input type="checkbox" class="tg-input">\n' +
      '  <span class="tg-track" aria-hidden="true"><span class="tg-knob"></span></span>\n' +
      (o.label ? '  <span class="tg-label">' + TN.esc(o.label) + '</span>\n' : '') +
      '</label>';
    var css =
      '.tg-wrap { display: inline-flex; align-items: center; gap: 12px; cursor: pointer; font-family: system-ui, sans-serif; font-size: 16px; color: #f4f4f5; user-select: none; }\n' +
      '.tg-input { position: absolute; opacity: 0; width: 1px; height: 1px; }\n' +
      '.tg-track { width: ' + wdt + 'px; height: ' + h + 'px; border-radius: 999px; background: ' + o.off + '; position: relative; transition: background .22s; flex-shrink: 0; }\n' +
      '.tg-knob { position: absolute; top: ' + pad + 'px; left: ' + pad + 'px; width: ' + knob + 'px; height: ' + knob + 'px; border-radius: 50%; background: ' + o.knob + '; box-shadow: 0 2px 6px rgba(0,0,0,.3); transition: transform .22s; }\n' +
      '.tg-input:checked + .tg-track { background: ' + o.on + '; }\n' +
      '.tg-input:checked + .tg-track .tg-knob { transform: translateX(' + travel + 'px); }\n' +
      '.tg-input:focus-visible + .tg-track { outline: 2px solid ' + o.on + '; outline-offset: 2px; }';
    return { html: html, css: css };
  }

  function update() {
    clear();
    var width = Math.max(32, Math.min(120, parseInt(el(SLUG + '-width').value, 10) || 56));
    var b = build({
      width: width, on: el(SLUG + '-on').value, off: el(SLUG + '-off').value,
      knob: el(SLUG + '-knob').value, label: el(SLUG + '-label').value.trim()
    });
    el(SLUG + '-preview').innerHTML = '<style>' + b.css + '</style>' + b.html;
    el(SLUG + '-output').value = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Toggle</title>\n<style>\n' +
      b.css + '\nbody { background: #18181b; padding: 40px; }\n</style>\n</head>\n<body>\n' + b.html + '\n</body>\n</html>\n';
  }

  try {
    if (!el(SLUG + '-width')) return;
    ['width', 'label'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    ['on', 'off', 'knob'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'toggle.html', 'text/html');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
