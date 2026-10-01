(function () {
  'use strict';
  var P = 'color-temperature-converter-', ERR = P + 'error';
  function kelvinToRgb(k) {
    var t = k / 100, r, g, b;
    if (t <= 66) { r = 255; g = 99.4708025861 * Math.log(t) - 161.1195681661; }
    else { r = 329.698727446 * Math.pow(t - 60, -0.1332047592); g = 288.1221695283 * Math.pow(t - 60, -0.0755148492); }
    if (t >= 66) b = 255;
    else if (t <= 19) b = 0;
    else b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
    function cl(x) { return Math.max(0, Math.min(255, Math.round(x))); }
    return [cl(r), cl(g), cl(b)];
  }
  function label(k) {
    if (k < 3300) return 'Warm';
    if (k <= 5300) return 'Neutral';
    return 'Cool';
  }
  function update(fromExact) {
    try {
      TN.clearErr(ERR);
      var k = fromExact ? parseFloat(TN.el(P + 'exact').value) : parseInt(TN.el(P + 'k').value, 10);
      if (!(k >= 1000 && k <= 12000)) { TN.setErr(ERR, 'Enter a temperature between 1000 K and 12000 K.'); return; }
      TN.el(P + 'k').value = k;
      TN.el(P + 'exact').value = Math.round(k);
      TN.el(P + 'k-v').textContent = Math.round(k).toLocaleString('en-US');
      var rgb = kelvinToRgb(k);
      function hx(n) { var s = n.toString(16); return s.length < 2 ? '0' + s : s; }
      var hex = '#' + hx(rgb[0]) + hx(rgb[1]) + hx(rgb[2]);
      TN.el(P + 'swatch').style.background = hex;
      TN.el(P + 'hex').textContent = hex;
      TN.el(P + 'rgb').textContent = 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
      TN.el(P + 'label').textContent = label(k);
    } catch (e) { TN.setErr(ERR, 'Could not convert the temperature. Please try again.'); }
  }
  try {
    TN.on(P + 'k', 'input', function () { update(false); });
    TN.on(P + 'exact', 'input', TN.debounce(function () { update(true); }, 200));
    update(false);
  } catch (e) { /* never throw on load */ }
})();
