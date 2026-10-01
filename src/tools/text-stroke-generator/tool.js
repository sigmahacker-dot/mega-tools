/* Text Stroke Generator — -webkit-text-stroke CSS with live preview. */
(function () {
  'use strict';
  var SLUG = 'text-stroke-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function update() {
    clear();
    var text = el(SLUG + '-text').value;
    if (!text.trim()) { fail('Enter some text.'); return; }
    var wdt = Math.max(0.5, Math.min(12, parseFloat(el(SLUG + '-width').value) || 0));
    var size = Math.max(12, Math.min(200, parseInt(el(SLUG + '-size').value, 10) || 72));
    var stroke = el(SLUG + '-stroke').value;
    var hollow = el(SLUG + '-transparent').checked;
    var fill = hollow ? 'transparent' : el(SLUG + '-fill').value;
    var css =
      '.ts-text {\n' +
      '  font-family: system-ui, sans-serif;\n' +
      '  font-size: ' + size + 'px;\n' +
      '  font-weight: 800;\n' +
      '  color: ' + fill + ';\n' +
      '  -webkit-text-stroke: ' + wdt + 'px ' + stroke + ';\n' +
      '  paint-order: stroke fill;\n' +
      '}';
    el(SLUG + '-preview').innerHTML = '<style>' + css + '</style><div class="ts-text">' + TN.esc(text) + '</div>';
    el(SLUG + '-output').value = css + '\n';
  }

  try {
    if (!el(SLUG + '-text')) return;
    ['text', 'width', 'size'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    ['stroke', 'fill'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-transparent', 'change', update);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'text-stroke.css', 'text/css');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
