(function () {
  'use strict';
  var P = 'letter-spacing-tuner-', ERR = P + 'error';
  function update() {
    try {
      TN.clearErr(ERR);
      var text = TN.el(P + 'text').value || 'DESIGN WITH SPACE';
      var ls = parseFloat(TN.el(P + 'ls').value), fs = parseInt(TN.el(P + 'fs').value, 10);
      var upper = TN.el(P + 'upper').checked;
      TN.el(P + 'ls-v').textContent = ls;
      TN.el(P + 'ls-em').textContent = (ls / fs).toFixed(3);
      TN.el(P + 'fs-v').textContent = fs;
      var prev = TN.el(P + 'preview');
      prev.textContent = upper ? text.toUpperCase() : text;
      prev.style.letterSpacing = ls + 'px';
      prev.style.fontSize = fs + 'px';
      TN.el(P + 'css').value = 'letter-spacing: ' + ls + 'px; /* ' + (ls / fs).toFixed(3) + 'em at ' + fs + 'px */';
    } catch (e) { TN.setErr(ERR, 'Could not tune the spacing. Please try again.'); }
  }
  try {
    ['text', 'ls', 'fs'].forEach(function (k) { TN.on(P + k, 'input', update); });
    TN.on(P + 'upper', 'change', update);
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
