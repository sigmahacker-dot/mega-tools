(function () {
  'use strict';
  var S = 'color-picker';
  function on(id, evt, fn) { try { TN.on(id, evt, fn); } catch (e) {} }
  function hexToRgb(hex) {
    hex = (hex || '').trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(hex)) hex = hex.split('').map(function (c) { return c + c; }).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
    var n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex(r, g, b) {
    function h(x) { var s = Math.round(Math.max(0, Math.min(255, x))).toString(16); return s.length === 1 ? '0' + s : s; }
    return '#' + h(r) + h(g) + h(b);
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  function setColor(hex) {
    try {
      var rgb = hexToRgb(hex);
      if (!rgb) { TN.setErr(S + '-error', 'Invalid HEX value. Use the format #RRGGBB.'); return; }
      TN.clearErr(S + '-error');
      var full = rgbToHex(rgb.r, rgb.g, rgb.b);
      TN.el(S + '-input').value = full;
      TN.el(S + '-hex').value = full;
      var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      TN.el(S + '-hex-out').textContent = full;
      TN.el(S + '-rgb-out').textContent = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
      TN.el(S + '-hsl-out').textContent = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
      renderPalette(rgb.r, rgb.g, rgb.b);
    } catch (e) {}
  }
  function renderPalette(r, g, b) {
    try {
      var pal = TN.el(S + '-palette');
      pal.innerHTML = '';
      var frag = document.createDocumentFragment();
      var steps = [-40, -20, 0, 20, 40, 60, 80];
      steps.forEach(function (p) {
        var hex;
        if (p === 0) { hex = rgbToHex(r, g, b); }
        else if (p < 0) { var k = 1 + p / 100; hex = rgbToHex(r * k, g * k, b * k); }
        else { hex = rgbToHex(r + (255 - r) * p / 100, g + (255 - g) * p / 100, b + (255 - b) * p / 100); }
        var sw = document.createElement('button');
        sw.className = 'btn btn-sm';
        sw.textContent = hex;
        sw.title = 'Use ' + hex;
        sw.style.background = hex;
        sw.style.color = (p > 30) ? '#111' : '#fff';
        sw.style.border = '1px solid #ccc';
        (function (h2) {
          sw.addEventListener('click', function () { setColor(h2); });
        })(hex);
        frag.appendChild(sw);
      });
      pal.appendChild(frag);
    } catch (e) {}
  }
  function copyVal(outId) {
    try {
      var t = TN.el(outId).textContent;
      if (!t) return;
      TN.copy(t).catch(function () { TN.setErr(S + '-error', 'Copy failed — please copy manually.'); });
    } catch (e) {}
  }
  on(S + '-input', 'input', function () { setColor(TN.el(S + '-input').value); });
  on(S + '-hex', 'change', function () { setColor(TN.el(S + '-hex').value); });
  on(S + '-random', 'click', function () {
    var h = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    setColor(h);
  });
  on(S + '-copy-hex', 'click', function () { copyVal(S + '-hex-out'); });
  on(S + '-copy-rgb', 'click', function () { copyVal(S + '-rgb-out'); });
  on(S + '-copy-hsl', 'click', function () { copyVal(S + '-hsl-out'); });
  try { setColor(TN.el(S + '-input').value); } catch (e) {}
})();
