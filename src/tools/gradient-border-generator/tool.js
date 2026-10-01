/* Gradient Border Generator — angle/colors/width/radius → gradient border CSS, live preview. */
(function () {
  'use strict';
  var SLUG = 'gradient-border-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function parseColors(text) {
    return text.split('\n').map(function (l) { return l.trim(); })
      .filter(function (l) { return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(l); });
  }

  function update() {
    clear();
    var width = Math.max(1, Math.min(30, parseInt(el(SLUG + '-width').value, 10) || 0));
    var radius = Math.max(0, Math.min(60, parseInt(el(SLUG + '-radius').value, 10) || 0));
    var angle = Math.max(0, Math.min(360, parseInt(el(SLUG + '-angle').value, 10) || 0));
    var colors = parseColors(el(SLUG + '-colors').value);
    if (colors.length < 2) { fail('Enter at least two valid hex colors, one per line.'); return; }
    var inner = el(SLUG + '-inner').value;
    var text = el(SLUG + '-text').value.trim() || 'Gradient border';
    var grad = 'linear-gradient(' + angle + 'deg, ' + colors.join(', ') + ')';
    var css =
      '.gb-box {\n' +
      '  border: ' + width + 'px solid transparent;\n' +
      '  border-radius: ' + radius + 'px;\n' +
      '  background:\n' +
      '    linear-gradient(' + inner + ', ' + inner + ') padding-box,\n' +
      '    ' + grad + ' border-box;\n' +
      '  padding: 32px 40px;\n' +
      '  color: #fff;\n' +
      '  font-family: system-ui, sans-serif;\n' +
      '  font-size: 20px;\n' +
      '  font-weight: 700;\n' +
      '  text-align: center;\n' +
      '}';
    el(SLUG + '-preview').innerHTML = '<style>' + css + '</style><div class="gb-box">' + TN.esc(text) + '</div>';
    el(SLUG + '-output').value = css + '\n';
  }

  try {
    if (!el(SLUG + '-width')) return;
    ['width', 'radius', 'angle', 'colors', 'text'].forEach(function (k) { TN.on(SLUG + '-' + k, 'input', update); });
    TN.on(SLUG + '-inner', 'input', update);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'gradient-border.css', 'text/css');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
