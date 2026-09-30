(function () {
  'use strict';
  var S = 'button-generator';
  function on(id, evt, fn) { try { TN.on(id, evt, fn); } catch (e) {} }
  function update() {
    try {
      TN.clearErr(S + '-error');
      var text = TN.el(S + '-text').value || 'Click Me';
      var bg = TN.el(S + '-bg').value || '#166534';
      var color = TN.el(S + '-color').value || '#ffffff';
      var radius = parseInt(TN.el(S + '-radius').value, 10) || 0;
      var pad = parseInt(TN.el(S + '-padding').value, 10);
      if (!(pad >= 0)) pad = 14;
      var shadow = TN.el(S + '-shadow').checked;
      TN.el(S + '-radius-val').textContent = radius;
      TN.el(S + '-padding-val').textContent = pad;
      var css = 'background-color: ' + bg + ';\n' +
        'color: ' + color + ';\n' +
        'border: none;\n' +
        'border-radius: ' + radius + 'px;\n' +
        'padding: ' + pad + 'px ' + (pad * 2) + 'px;\n' +
        'font-size: 16px;\n' +
        'cursor: pointer;\n' +
        (shadow ? 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);\n' : '');
      var btn = TN.el(S + '-preview');
      btn.textContent = text;
      btn.style.backgroundColor = bg;
      btn.style.color = color;
      btn.style.border = 'none';
      btn.style.borderRadius = radius + 'px';
      btn.style.padding = pad + 'px ' + (pad * 2) + 'px';
      btn.style.fontSize = '16px';
      btn.style.cursor = 'pointer';
      btn.style.boxShadow = shadow ? '0 4px 12px rgba(0, 0, 0, 0.25)' : 'none';
      TN.el(S + '-css').textContent = '.my-button {\n' + css + '}';
    } catch (e) {}
  }
  ['text', 'bg', 'color', 'radius', 'padding'].forEach(function (k) {
    on(S + '-' + k, 'input', update);
    on(S + '-' + k, 'change', update);
  });
  on(S + '-shadow', 'change', update);
  on(S + '-copy', 'click', function () {
    try {
      var css = TN.el(S + '-css').textContent;
      if (!css) return;
      TN.copy(css).catch(function () { TN.setErr(S + '-error', 'Copy failed — please copy manually.'); });
    } catch (e) {}
  });
  try { update(); } catch (e) {}
})();
