(function () {
  'use strict';
  var P = 'gradient-text-generator-', ERR = P + 'error';
  function update() {
    try {
      TN.clearErr(ERR);
      var text = TN.el(P + 'text').value || 'Gradient Text';
      var c1 = TN.el(P + 'c1').value, c2 = TN.el(P + 'c2').value, c3 = TN.el(P + 'c3').value;
      var angle = parseInt(TN.el(P + 'angle').value, 10);
      TN.el(P + 'angle-v').textContent = angle;
      var grad = 'linear-gradient(' + angle + 'deg, ' + c1 + ', ' + c2 + ', ' + c3 + ')';
      var prev = TN.el(P + 'preview');
      prev.textContent = text;
      prev.style.background = grad;
      prev.style.webkitBackgroundClip = 'text';
      prev.style.backgroundClip = 'text';
      prev.style.webkitTextFillColor = 'transparent';
      prev.style.color = 'transparent';
      TN.el(P + 'css').value =
        '.gradient-text {\n' +
        '  background: ' + grad + ';\n' +
        '  -webkit-background-clip: text;\n' +
        '  background-clip: text;\n' +
        '  -webkit-text-fill-color: transparent;\n' +
        '  color: transparent;\n' +
        '}';
    } catch (e) { TN.setErr(ERR, 'Could not build the gradient text. Please try again.'); }
  }
  try {
    ['text', 'c1', 'c2', 'c3', 'angle'].forEach(function (k) { TN.on(P + k, 'input', update); TN.on(P + k, 'change', update); });
    TN.on(P + 'copy', 'click', function () {
      TN.clearErr(ERR);
      TN.copy(TN.el(P + 'css').value).then(function (ok) {
        var b = TN.el(P + 'copy');
        b.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { b.textContent = 'Copy CSS'; }, 1200);
      });
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
