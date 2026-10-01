(function () {
  'use strict';
  var S = 'color-palette-generator';
  function hexToHsl(hex) {
    var h = String(hex).replace('#', '').trim();
    if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split('').map(function (c) { return c + c; }).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    var n = parseInt(h, 16);
    var r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var hh = 0, ss = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      ss = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) hh = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) hh = (b - r) / d + 2;
      else hh = (r - g) / d + 4;
      hh *= 60;
    }
    return { h: hh, s: ss * 100, l: l * 100 };
  }
  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.min(100, Math.max(0, s)) / 100;
    l = Math.min(100, Math.max(0, l)) / 100;
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
    function t(v) { return ('0' + Math.round((v + m) * 255).toString(16)).slice(-2); }
    return '#' + t(r) + t(g) + t(b);
  }
  function harmonies(base) {
    var h = base.h, s = base.s, l = base.l;
    function c(dh, dl) { return hslToHex(h + dh, s, l + (dl || 0)); }
    return [
      { name: 'Analogous', colors: [c(-30), c(-15), c(0), c(15), c(30)] },
      { name: 'Complementary', colors: [c(0), c(0, 22), c(0, -22), c(180), c(180, 22)] },
      { name: 'Triadic', colors: [c(0), c(120), c(240), c(0, 25), c(120, -22)] },
      { name: 'Split-complementary', colors: [c(0), c(150), c(210), c(150, 22), c(210, -22)] },
      { name: 'Square', colors: [c(0), c(90), c(180), c(270), c(0, 25)] },
      { name: 'Monochromatic', colors: [20, 35, 50, 65, 80].map(function (ll) { return hslToHex(h, s, ll); }) }
    ];
  }
  function render(hex) {
    try {
      TN.clearErr(S + '-error');
      var base = hexToHsl(hex);
      if (!base) { TN.setErr(S + '-error', 'Please enter a valid hex color like #4D7C0F.'); return; }
      var rows = harmonies(base);
      var wrap = TN.el(S + '-rows');
      var html = '';
      rows.forEach(function (row) {
        html += '<div style="margin-bottom:14px;"><div class="muted" style="margin-bottom:6px;">' +
          TN.esc(row.name) + '</div><div style="display:flex;gap:8px;flex-wrap:wrap;">';
        row.colors.forEach(function (col) {
          html += '<button type="button" data-hex="' + col + '" title="Copy ' + col + '" ' +
            'style="flex:1 1 0;min-width:88px;border:none;border-radius:8px;padding:26px 6px 8px;cursor:pointer;background:' +
            col + ';color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);font-size:12px;font-family:monospace;">' +
            col + '</button>';
        });
        html += '</div></div>';
      });
      wrap.innerHTML = html;
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    var base = TN.el(S + '-base'), hex = TN.el(S + '-hex');
    function fromPicker() {
      hex.value = base.value;
      render(base.value);
    }
    function fromHex() {
      var v = hex.value.trim();
      if (v && v[0] !== '#') v = '#' + v;
      render(v);
      var ok = hexToHsl(v);
      if (ok) base.value = v;
    }
    TN.on(S + '-base', 'input', fromPicker);
    TN.on(S + '-hex', 'input', fromHex);
    var wrap = TN.el(S + '-rows');
    if (wrap) wrap.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-hex]') : null;
      if (!b) return;
      var col = b.getAttribute('data-hex');
      TN.copy(col).then(function (ok) {
        TN.el(S + '-status').textContent = ok ? 'Copied ' + col + ' to the clipboard.' : 'Copy failed — select the hex and copy it manually.';
      });
    });
    render(base.value);
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
