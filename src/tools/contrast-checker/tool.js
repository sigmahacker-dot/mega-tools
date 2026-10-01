(function () {
  'use strict';
  var ERR = 'contrast-checker-error';

  function lum(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255;
    var g = parseInt(hex.slice(3, 5), 16) / 255;
    var b = parseInt(hex.slice(5, 7), 16) / 255;
    function lin(c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }

  function verdict(pass) {
    return pass
      ? '<span style="color:#2e7d32;font-weight:bold;">PASS</span>'
      : '<span style="color:#c62828;font-weight:bold;">FAIL</span>';
  }

  function update() {
    TN.clearErr(ERR);
    try {
      var fg = TN.el('contrast-checker-fg').value;
      var bg = TN.el('contrast-checker-bg').value;
      var l1 = lum(fg), l2 = lum(bg);
      var lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
      var ratio = (lighter + 0.05) / (darker + 0.05);

      var aaN = ratio >= 4.5, aaL = ratio >= 3, aaaN = ratio >= 7, aaaL = ratio >= 4.5;
      TN.el('contrast-checker-ratio').textContent = ratio.toFixed(2) + ':1';
      TN.el('contrast-checker-grade').textContent = aaaN ? 'AAA' : (aaN ? 'AA' : (aaL ? 'AA large only' : 'Fail'));
      TN.el('contrast-checker-aa-n').innerHTML = verdict(aaN);
      TN.el('contrast-checker-aa-l').innerHTML = verdict(aaL);
      TN.el('contrast-checker-aaa-n').innerHTML = verdict(aaaN);
      TN.el('contrast-checker-aaa-l').innerHTML = verdict(aaaL);

      var prev = TN.el('contrast-checker-preview');
      prev.style.background = bg;
      prev.style.color = fg;
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid color.');
    }
  }

  try {
    TN.on('contrast-checker-fg', 'input', update);
    TN.on('contrast-checker-bg', 'input', update);
    update();
  } catch (e) { /* never throw on load */ }
})();
