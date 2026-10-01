(function () {
  'use strict';
  var P = 'color-mixer-', ERR = P + 'error';
  function hex2rgb(h) {
    h = h.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgb2hex(r, g, b) {
    function p(n) { var s = Math.round(Math.max(0, Math.min(255, n))).toString(16); return s.length < 2 ? '0' + s : s; }
    return '#' + p(r) + p(g) + p(b);
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var a = hex2rgb(TN.el(P + 'a').value), b = hex2rgb(TN.el(P + 'b').value);
      var r = parseInt(TN.el(P + 'ratio').value, 10) / 100;
      TN.el(P + 'ratio-v').textContent = Math.round(r * 100);
      TN.el(P + 'ratio-w').textContent = 100 - Math.round(r * 100);
      var m = [a[0] * r + b[0] * (1 - r), a[1] * r + b[1] * (1 - r), a[2] * r + b[2] * (1 - r)];
      var hex = rgb2hex(m[0], m[1], m[2]);
      TN.el(P + 'preview').style.background = hex;
      TN.el(P + 'hex').textContent = hex;
      TN.el(P + 'rgb').textContent = 'rgb(' + Math.round(m[0]) + ', ' + Math.round(m[1]) + ', ' + Math.round(m[2]) + ')';
    } catch (e) { TN.setErr(ERR, 'Could not mix the colors. Please try again.'); }
  }
  try {
    ['a', 'b', 'ratio'].forEach(function (k) { TN.on(P + k, 'input', update); TN.on(P + k, 'change', update); });
    TN.on(P + 'copy', 'click', function () {
      TN.clearErr(ERR);
      TN.copy(TN.el(P + 'hex').textContent).then(function (ok) {
        var b = TN.el(P + 'copy');
        b.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { b.textContent = 'Copy HEX'; }, 1200);
      });
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
