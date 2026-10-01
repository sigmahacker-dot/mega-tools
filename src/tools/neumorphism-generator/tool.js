/* Neumorphism Generator — soft-UI box-shadow recipes with live preview. */
(function () {
  'use strict';
  var SLUG = 'neumorphism-generator';
  var ERR = SLUG + '-error';

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return [224, 229, 236];
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  }
  function shift(rgb, amt) {
    return 'rgb(' + Math.max(0, Math.min(255, rgb[0] + amt)) + ', '
      + Math.max(0, Math.min(255, rgb[1] + amt)) + ', '
      + Math.max(0, Math.min(255, rgb[2] + amt)) + ')';
  }
  function rgba(hex, amt, alpha) {
    var rgb = hexToRgb(hex);
    var c = shift(rgb, amt);
    var inner = c.replace(/^rgb\(/, '').replace(/\)$/, '');
    return 'rgba(' + inner + ', ' + alpha.toFixed(2) + ')';
  }

  function render() {
    TN.clearErr(ERR);
    try {
      var mode = $('mode').value;
      var inset = $('depth').value === 'inset';
      var bg = $('bg').value;
      var dist = parseInt($('distance').value, 10);
      var blur = parseInt($('blur').value, 10);
      var inten = parseFloat($('intensity').value);
      var rad = parseInt($('radius').value, 10);
      var cls = ($('class').value || 'neu-card').replace(/[^a-zA-Z0-9-_]/g, '-') || 'neu-card';
      $('distance-v').textContent = dist + 'px';
      $('blur-v').textContent = blur + 'px';
      $('intensity-v').textContent = inten.toFixed(2);
      $('radius-v').textContent = rad + 'px';
      var dark = mode === 'dark';
      var lightAmt = dark ? -40 : 60;
      var darkAmt = dark ? 40 : -60;
      var pre = inset ? 'inset ' : '';
      var light = rgba(bg, lightAmt, inten);
      var darkC = rgba(bg, darkAmt, inten);
      var shadow = pre + dist + 'px ' + dist + 'px ' + blur + 'px ' + darkC + ', '
        + pre + (-dist) + 'px ' + (-dist) + 'px ' + blur + 'px ' + light;
      var stage = $('stage');
      var card = $('card');
      var btn = $('btn');
      stage.style.background = bg;
      stage.style.color = dark ? '#e5e7eb' : '#4b5563';
      [card, btn].forEach(function (el) {
        el.style.background = bg;
        el.style.borderRadius = rad + 'px';
        el.style.boxShadow = shadow;
        el.style.color = stage.style.color;
      });
      var css = '.' + cls + ' {\n'
        + '  background: ' + bg + ';\n'
        + '  border-radius: ' + rad + 'px;\n'
        + '  box-shadow: ' + shadow + ';\n'
        + '}';
      $('code').textContent = css;
    } catch (e) {
      TN.setErr(ERR, 'Could not render the preview.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['mode', 'depth', 'bg', 'distance', 'blur', 'intensity', 'radius', 'class'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', render);
        TN.on(SLUG + '-' + k, 'change', render);
      });
      TN.on(SLUG + '-copy', 'click', function () {
        var txt = $('code').textContent;
        if (!txt) { TN.setErr(ERR, 'Nothing to copy yet.'); return; }
        TN.copy(txt).then(function (ok) {
          if (ok) TN.clearErr(ERR);
          else TN.setErr(ERR, 'Copy failed — select the code and copy manually.');
        });
      });
      render();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
