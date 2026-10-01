/* CSS Pattern Generator — seamless gradient-based patterns with live preview. */
(function () {
  'use strict';
  var SLUG = 'pattern-generator';
  var ERR = SLUG + '-error';

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function build(pattern, size, fg, bg, density, angle) {
    var css = '';
    if (pattern === 'dots') {
      var r = Math.round(size * density / 100 / 2);
      css = 'background-color: ' + bg + ';\n'
        + '  background-image: radial-gradient(circle, ' + fg + ' ' + r + 'px, transparent ' + (r + 1) + 'px);\n'
        + '  background-size: ' + size + 'px ' + size + 'px;';
    } else if (pattern === 'stripes') {
      var d2 = density;
      css = 'background-color: ' + bg + ';\n'
        + '  background-image: repeating-linear-gradient(' + angle + 'deg, ' + fg + ' 0, ' + fg + ' ' + d2 + '%, transparent ' + d2 + '%, transparent 100%);\n'
        + '  background-size: ' + size + 'px ' + size + 'px;';
    } else if (pattern === 'checker') {
      var h = size / 2;
      css = 'background-color: ' + bg + ';\n'
        + '  background-image:\n'
        + '    linear-gradient(45deg, ' + fg + ' 25%, transparent 25%, transparent 75%, ' + fg + ' 75%),\n'
        + '    linear-gradient(45deg, ' + fg + ' 25%, transparent 25%, transparent 75%, ' + fg + ' 75%);\n'
        + '  background-size: ' + size + 'px ' + size + 'px;\n'
        + '  background-position: 0 0, ' + h + 'px ' + h + 'px;';
    } else if (pattern === 'zigzag') {
      var zz = Math.round(size * density / 100);
      css = 'background-color: ' + bg + ';\n'
        + '  background-image:\n'
        + '    linear-gradient(135deg, ' + fg + ' 25%, transparent 25%),\n'
        + '    linear-gradient(225deg, ' + fg + ' 25%, transparent 25%),\n'
        + '    linear-gradient(45deg, ' + fg + ' 25%, transparent 25%),\n'
        + '    linear-gradient(315deg, ' + fg + ' 25%, transparent 25%);\n'
        + '  background-size: ' + size + 'px ' + size + 'px;\n'
        + '  background-position: 0 0, 0 0, ' + zz + 'px ' + zz + 'px, ' + zz + 'px ' + zz + 'px;';
    } else { /* grid */
      var t = Math.max(1, Math.round(size * density / 100 / 8));
      css = 'background-color: ' + bg + ';\n'
        + '  background-image:\n'
        + '    linear-gradient(' + fg + ' ' + t + 'px, transparent ' + t + 'px),\n'
        + '    linear-gradient(90deg, ' + fg + ' ' + t + 'px, transparent ' + t + 'px);\n'
        + '  background-size: ' + size + 'px ' + size + 'px;';
    }
    return css;
  }

  function render() {
    TN.clearErr(ERR);
    try {
      var pattern = $('pattern').value;
      var size = parseInt($('size').value, 10);
      var fg = $('fg').value, bg = $('bg').value;
      var density = parseInt($('density').value, 10);
      var angle = parseInt($('angle').value, 10);
      $('size-v').textContent = size + 'px';
      $('density-v').textContent = density + '%';
      $('angle-v').textContent = angle + '°';
      var inner = build(pattern, size, fg, bg, density, angle);
      var stage = $('stage');
      var decls = inner.split('\n').map(function (l) { return l.trim(); });
      stage.style.cssText = '';
      stage.className = 'preview';
      decls.forEach(function (d) {
        if (!d) return;
        var i = d.indexOf(':');
        if (i < 0) return;
        var prop = d.slice(0, i).trim().replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); });
        var val = d.slice(i + 1).trim().replace(/;$/, '');
        stage.style[prop] = val;
      });
      stage.style.minHeight = '220px';
      $('code').textContent = '.pattern {\n  ' + inner + '\n}';
    } catch (e) {
      TN.setErr(ERR, 'Could not render the pattern.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['pattern', 'size', 'fg', 'bg', 'density', 'angle'].forEach(function (k) {
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
