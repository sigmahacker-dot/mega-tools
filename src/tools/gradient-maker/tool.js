(function () {
  'use strict';
  var P = 'gradient-maker-', ERR = P + 'error';
  function update() {
    try {
      TN.clearErr(ERR);
      var c1 = TN.el(P + 'c1').value, c2 = TN.el(P + 'c2').value, c3 = TN.el(P + 'c3').value;
      var type = TN.el(P + 'type').value, angle = parseInt(TN.el(P + 'angle').value, 10);
      TN.el(P + 'angle-v').textContent = angle;
      var css;
      if (type === 'linear') css = 'linear-gradient(' + angle + 'deg, ' + c1 + ' 0%, ' + c2 + ' 50%, ' + c3 + ' 100%)';
      else if (type === 'radial') css = 'radial-gradient(circle, ' + c1 + ' 0%, ' + c2 + ' 50%, ' + c3 + ' 100%)';
      else css = 'conic-gradient(from ' + angle + 'deg, ' + c1 + ' 0%, ' + c2 + ' 50%, ' + c3 + ' 100%)';
      TN.el(P + 'preview').style.background = css;
      TN.el(P + 'css').value = 'background: ' + css + ';';
    } catch (e) { TN.setErr(ERR, 'Could not build the gradient. Please try again.'); }
  }
  try {
    ['c1', 'c2', 'c3', 'type', 'angle'].forEach(function (k) { TN.on(P + k, 'input', update); TN.on(P + k, 'change', update); });
    TN.on(P + 'copy', 'click', function () {
      var v = TN.el(P + 'css').value;
      TN.clearErr(ERR);
      TN.copy(v).then(function (ok) {
        var b = TN.el(P + 'copy');
        b.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { b.textContent = 'Copy CSS'; }, 1200);
      });
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
