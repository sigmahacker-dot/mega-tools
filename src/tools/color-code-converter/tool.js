(function () {
  'use strict';
  var P = 'color-code-converter-';

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = l - c / 2;
    var r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) { h = ((g - b) / d + (g < b ? 6 : 0)); }
      else if (max === g) { h = (b - r) / d + 2; }
      else { h = (r - g) / d + 4; }
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function toHex2(n) {
    var h = clamp(Math.round(n), 0, 255).toString(16);
    return h.length === 1 ? '0' + h : h;
  }

  // Returns {r,g,b,a} or null.
  function parseColor(s) {
    s = s.trim();
    var m;
    // Hex: #rgb, #rgba, #rrggbb, #rrggbbaa
    if ((m = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.exec(s))) {
      var h = m[1];
      var r, g, b, a = 1;
      if (h.length === 3 || h.length === 4) {
        r = parseInt(h[0] + h[0], 16);
        g = parseInt(h[1] + h[1], 16);
        b = parseInt(h[2] + h[2], 16);
        if (h.length === 4) a = parseInt(h[3] + h[3], 16) / 255;
      } else {
        r = parseInt(h.substr(0, 2), 16);
        g = parseInt(h.substr(2, 2), 16);
        b = parseInt(h.substr(4, 2), 16);
        if (h.length === 8) a = parseInt(h.substr(6, 2), 16) / 255;
      }
      return { r: r, g: g, b: b, a: a };
    }
    // rgb() / rgba()
    if ((m = /^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*(?:,\s*([0-9]*\.?[0-9]+)\s*)?\)$/i.exec(s))) {
      var r2 = +m[1], g2 = +m[2], b2 = +m[3];
      if (r2 > 255 || g2 > 255 || b2 > 255) return null;
      var a2 = m[4] === undefined ? 1 : +m[4];
      if (a2 < 0 || a2 > 1) return null;
      return { r: r2, g: g2, b: b2, a: a2 };
    }
    // hsl() / hsla()
    if ((m = /^hsla?\(\s*(-?[0-9]*\.?[0-9]+)\s*,\s*([0-9]*\.?[0-9]+)%\s*,\s*([0-9]*\.?[0-9]+)%\s*(?:,\s*([0-9]*\.?[0-9]+)\s*)?\)$/i.exec(s))) {
      var s3 = +m[2], l3 = +m[3];
      if (s3 > 100 || l3 > 100) return null;
      var a3 = m[4] === undefined ? 1 : +m[4];
      if (a3 < 0 || a3 > 1) return null;
      var rgb = hslToRgb(+m[1], s3, l3);
      rgb.a = a3;
      return rgb;
    }
    return null;
  }

  function fmtAlpha(a) {
    return Math.round(a * 100) / 100;
  }

  TN.on(P + 'convert', 'click', function () {
    var input = TN.el(P + 'input').value;
    if (!input.trim()) { TN.setErr(P + 'error', 'Type a color first, e.g. #ff0000.'); return; }
    var c = parseColor(input);
    if (!c) {
      TN.hide(P + 'result');
      TN.setErr(P + 'error', 'Could not recognize that color. Try #ff0000, rgb(255, 0, 0) or hsl(0, 100%, 50%).');
      return;
    }
    TN.clearErr(P + 'error');
    var hex = '#' + toHex2(c.r) + toHex2(c.g) + toHex2(c.b);
    var hexA = c.a < 1 ? hex + toHex2(c.a * 255) : hex;
    var rgbStr = c.a < 1
      ? 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + fmtAlpha(c.a) + ')'
      : 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')';
    var hsl = rgbToHsl(c.r, c.g, c.b);
    var hslStr = c.a < 1
      ? 'hsla(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%, ' + fmtAlpha(c.a) + ')'
      : 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
    TN.el(P + 'hex').textContent = hexA;
    TN.el(P + 'rgb').textContent = rgbStr;
    TN.el(P + 'hsl').textContent = hslStr;
    TN.el(P + 'swatch').style.background = hexA;
    TN.show(P + 'result');
  });

  function copyVal(id, label) {
    var t = TN.el(id).textContent;
    if (!t) return;
    TN.copy(t).then(null, function () {
      TN.setErr(P + 'error', label + ' copy failed — select the text manually.');
    });
  }
  TN.on(P + 'copy-hex', 'click', function () { copyVal(P + 'hex', 'HEX'); });
  TN.on(P + 'copy-rgb', 'click', function () { copyVal(P + 'rgb', 'RGB'); });
  TN.on(P + 'copy-hsl', 'click', function () { copyVal(P + 'hsl', 'HSL'); });
})();
