/* CSS Loader Generator — pure-CSS spinner snippets with live preview. */
(function () {
  'use strict';
  var SLUG = 'css-loader-generator';
  var ERR = SLUG + '-error';

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function build(style, size, color, speed, pfx) {
    var c = pfx + '-loader';
    var html = '<div class="' + c + '"></div>';
    var css = '';
    if (style === 'ring') {
      css = '.' + c + ' {\n  width: ' + size + 'px;\n  height: ' + size + 'px;\n  border: ' + Math.max(2, Math.round(size / 8)) + 'px solid ' + color + '22;\n  border-top-color: ' + color + ';\n  border-radius: 50%;\n  animation: ' + c + '-spin ' + speed + 's linear infinite;\n}\n'
        + '@keyframes ' + c + '-spin {\n  to { transform: rotate(360deg); }\n}';
    } else if (style === 'dual-ring') {
      css = '.' + c + ' {\n  width: ' + size + 'px;\n  height: ' + size + 'px;\n  border-radius: 50%;\n  border: ' + Math.max(2, Math.round(size / 10)) + 'px solid transparent;\n  border-top-color: ' + color + ';\n  border-bottom-color: ' + color + ';\n  animation: ' + c + '-spin ' + speed + 's linear infinite;\n}\n'
        + '@keyframes ' + c + '-spin {\n  to { transform: rotate(360deg); }\n}';
    } else if (style === 'dots') {
      var d = Math.round(size / 4);
      var gap = Math.round(size / 12);
      css = '.' + c + ' {\n  display: inline-flex;\n  gap: ' + gap + 'px;\n}\n'
        + '.' + c + ' span {\n  width: ' + d + 'px;\n  height: ' + d + 'px;\n  border-radius: 50%;\n  background: ' + color + ';\n  animation: ' + c + '-bounce ' + speed + 's ease-in-out infinite;\n}\n'
        + '.' + c + ' span:nth-child(2) { animation-delay: ' + (speed / 3).toFixed(2) + 's; }\n'
        + '.' + c + ' span:nth-child(3) { animation-delay: ' + (2 * speed / 3).toFixed(2) + 's; }\n'
        + '@keyframes ' + c + '-bounce {\n  0%, 100% { transform: translateY(0); opacity: 0.5; }\n  50% { transform: translateY(-' + Math.round(size / 3) + 'px); opacity: 1; }\n}';
      html = '<div class="' + c + '"><span></span><span></span><span></span></div>';
    } else { /* bars */
      var bw = Math.max(4, Math.round(size / 8));
      var bh = Math.round(size * 0.8);
      css = '.' + c + ' {\n  display: inline-flex;\n  align-items: flex-end;\n  gap: ' + Math.max(2, Math.round(size / 14)) + 'px;\n  height: ' + bh + 'px;\n}\n'
        + '.' + c + ' span {\n  width: ' + bw + 'px;\n  height: 30%;\n  background: ' + color + ';\n  border-radius: ' + Math.round(bw / 2) + 'px;\n  animation: ' + c + '-grow ' + speed + 's ease-in-out infinite;\n}\n'
        + '.' + c + ' span:nth-child(2) { animation-delay: ' + (speed / 4).toFixed(2) + 's; }\n'
        + '.' + c + ' span:nth-child(3) { animation-delay: ' + (speed / 2).toFixed(2) + 's; }\n'
        + '.' + c + ' span:nth-child(4) { animation-delay: ' + (3 * speed / 4).toFixed(2) + 's; }\n'
        + '@keyframes ' + c + '-grow {\n  0%, 100% { height: 30%; }\n  50% { height: 100%; }\n}';
      html = '<div class="' + c + '"><span></span><span></span><span></span><span></span></div>';
    }
    return { html: html, css: css };
  }

  function render() {
    TN.clearErr(ERR);
    var style = $('style').value;
    var size = parseInt($('size').value, 10);
    var color = $('color').value;
    var speed = parseFloat($('speed').value).toFixed(1);
    $('size-v').textContent = size + 'px';
    $('speed-v').textContent = speed + 's';
    try {
      var out = build(style, size, color, speed, 'demo');
      var stage = $('stage');
      stage.innerHTML = out.html;
      var old = document.getElementById(SLUG + '-style');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var st = document.createElement('style');
      st.id = SLUG + '-style';
      st.textContent = out.css;
      document.head.appendChild(st);
      var prod = build(style, size, color, speed, 'spinner');
      $('code').textContent = '<!-- HTML -->\n' + prod.html + '\n\n<!-- CSS — put in a <style> tag or stylesheet -->\n<style>\n' + prod.css + '\n</style>';
    } catch (e) {
      TN.setErr(ERR, 'Could not render the spinner.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['style', 'color', 'size', 'speed'].forEach(function (k) {
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
