(function () {
  'use strict';
  var P = 'color-harmony-generator-', ERR = P + 'error';
  function hex2hsl(h) {
    h = h.replace('#', '');
    var r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, hh = 0, s = 0, l = (mx + mn) / 2;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) hh = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (mx === g) hh = ((b - r) / d + 2) / 6;
      else hh = ((r - g) / d + 4) / 6;
    }
    return [hh * 360, s, l];
  }
  function hsl2hex(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    function ch(t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    function hx(n) { var x = Math.round(n * 255).toString(16); return x.length < 2 ? '0' + x : x; }
    return '#' + hx(ch(h + 1 / 3)) + hx(ch(h)) + hx(ch(h - 1 / 3));
  }
  var RULES = [
    ['Complementary', [0, 180]],
    ['Analogous', [-30, 0, 30]],
    ['Triadic', [0, 120, 240]],
    ['Tetradic', [0, 90, 180, 270]],
    ['Split-complementary', [0, 150, 210]]
  ];
  function sw(hex) {
    return '<div class="swatch" data-hex="' + hex + '" style="background:' + hex + '" title="' + hex + '"><span>' + hex + '</span></div>';
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var base = TN.el(P + 'base').value;
      var hsl = hex2hsl(base), html = '';
      for (var i = 0; i < RULES.length; i++) {
        var cells = RULES[i][1].map(function (a) { return sw(hsl2hex(hsl[0] + a, hsl[1], hsl[2])); }).join('');
        html += '<div class="field" style="margin-bottom:18px;"><label>' + RULES[i][0] + '</label><div class="swatch-grid">' + cells + '</div></div>';
      }
      var out = TN.el(P + 'out');
      out.innerHTML = html;
      var sws = out.querySelectorAll('.swatch');
      for (var j = 0; j < sws.length; j++) {
        (function (el) {
          TN.on(el, 'click', function () {
            TN.copy(el.getAttribute('data-hex')).then(function () {
              el.style.transform = 'scale(1.25)';
              setTimeout(function () { el.style.transform = ''; }, 200);
            });
          });
        })(sws[j]);
      }
    } catch (e) { TN.setErr(ERR, 'Could not generate harmonies. Please try again.'); }
  }
  try {
    TN.on(P + 'base', 'input', update);
    TN.on(P + 'base', 'change', update);
    update();
  } catch (e) { /* never throw on load */ }
})();
