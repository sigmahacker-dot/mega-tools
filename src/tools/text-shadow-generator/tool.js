(function () {
  'use strict';
  var P = 'text-shadow-generator-', ERR = P + 'error';
  function update() {
    try {
      TN.clearErr(ERR);
      var text = TN.el(P + 'text').value || 'Shadow Text';
      var x = parseInt(TN.el(P + 'x').value, 10), y = parseInt(TN.el(P + 'y').value, 10);
      var blur = parseInt(TN.el(P + 'blur').value, 10), op = parseInt(TN.el(P + 'opacity').value, 10);
      var c = TN.el(P + 'color').value;
      TN.el(P + 'x-v').textContent = x; TN.el(P + 'y-v').textContent = y;
      TN.el(P + 'blur-v').textContent = blur; TN.el(P + 'opacity-v').textContent = op;
      var r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
      var css = 'text-shadow: ' + x + 'px ' + y + 'px ' + blur + 'px rgba(' + r + ', ' + g + ', ' + b + ', ' + (op / 100).toFixed(2) + ');';
      var prev = TN.el(P + 'preview');
      prev.textContent = text;
      prev.style.textShadow = x + 'px ' + y + 'px ' + blur + 'px rgba(' + r + ',' + g + ',' + b + ',' + (op / 100).toFixed(2) + ')';
      var dark = TN.el(P + 'dark').checked;
      prev.style.background = dark ? '#111827' : 'transparent';
      prev.style.color = dark ? '#f9fafb' : '';
      TN.el(P + 'css').value = css;
    } catch (e) { TN.setErr(ERR, 'Could not build the shadow. Please try again.'); }
  }
  try {
    ['text', 'x', 'y', 'blur', 'opacity', 'color'].forEach(function (k) { TN.on(P + k, 'input', update); TN.on(P + k, 'change', update); });
    TN.on(P + 'dark', 'change', update);
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
