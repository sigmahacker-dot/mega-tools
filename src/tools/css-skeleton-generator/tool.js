/* CSS Skeleton Loader Generator — skeleton blocks with optional shimmer sweep. */
(function () {
  'use strict';
  var SLUG = 'css-skeleton-generator';
  var ERR = SLUG + '-error';
  var widths = [88, 100, 94, 100, 72];

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function randWidths(n) {
    widths = [];
    for (var i = 0; i < n; i++) {
      widths.push(i === n - 1 ? 55 + Math.floor(Math.random() * 25) : 85 + Math.floor(Math.random() * 16));
    }
  }

  function build(pfx, w) {
    var lines = parseInt($('lines').value, 10);
    var h = $('height').value, gap = $('gap').value, rad = $('radius').value;
    var base = $('base').value, shim = $('shimmer').value;
    var anim = $('anim').value === 'on';
    var speed = parseFloat($('speed').value).toFixed(1);
    var c = pfx;
    var html = '<div class="' + c + '">\n';
    for (var i = 0; i < lines; i++) {
      html += '  <div class="' + c + '-line" style="width:' + w[i] + '%"></div>\n';
    }
    html += '</div>';
    var css = '.' + c + ' {\n  display: flex;\n  flex-direction: column;\n  gap: ' + gap + 'px;\n}\n\n'
      + '.' + c + '-line {\n  height: ' + h + 'px;\n  border-radius: ' + rad + 'px;\n  background: ' + base + ';\n';
    if (anim) {
      css += '  background-image: linear-gradient(90deg, ' + base + ' 25%, ' + shim + ' 50%, ' + base + ' 75%);\n'
        + '  background-size: 200% 100%;\n  animation: ' + c + '-shimmer ' + speed + 's linear infinite;\n';
    }
    css += '}\n';
    if (anim) {
      css += '\n@keyframes ' + c + '-shimmer {\n  from { background-position: 200% 0; }\n  to { background-position: -200% 0; }\n}';
    }
    return { html: html, css: css };
  }

  function render() {
    TN.clearErr(ERR);
    try {
      $('lines-v').textContent = $('lines').value;
      $('height-v').textContent = $('height').value + 'px';
      $('gap-v').textContent = $('gap').value + 'px';
      $('radius-v').textContent = $('radius').value + 'px';
      $('speed-v').textContent = parseFloat($('speed').value).toFixed(1) + 's';
      var lines = parseInt($('lines').value, 10);
      while (widths.length < lines) randWidths(lines);
      widths = widths.slice(0, lines);
      var demo = build('demo-skel', widths);
      $('stage').innerHTML = demo.html;
      var old = document.getElementById(SLUG + '-style');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var st = document.createElement('style');
      st.id = SLUG + '-style';
      st.textContent = demo.css;
      document.head.appendChild(st);
      var prod = build('skeleton', widths);
      $('code').textContent = '<!-- HTML -->\n' + prod.html + '\n\n<!-- CSS -->\n<style>\n' + prod.css + '\n</style>';
    } catch (e) {
      TN.setErr(ERR, 'Could not render the skeleton.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['lines', 'height', 'gap', 'radius', 'base', 'shimmer', 'anim', 'speed'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', render);
        TN.on(SLUG + '-' + k, 'change', render);
      });
      TN.on(SLUG + '-regen', 'click', function () {
        randWidths(parseInt($('lines').value, 10));
        render();
      });
      TN.on(SLUG + '-copy', 'click', function () {
        var txt = $('code').textContent;
        if (!txt) { TN.setErr(ERR, 'Nothing to copy yet.'); return; }
        TN.copy(txt).then(function (ok) {
          if (ok) TN.clearErr(ERR);
          else TN.setErr(ERR, 'Copy failed — select the code and copy manually.');
        });
      });
      randWidths(5);
      render();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
