/* CSS Tooltip Generator — pure-CSS tooltips with live hover preview. */
(function () {
  'use strict';
  var SLUG = 'css-tooltip-generator';
  var ERR = SLUG + '-error';

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function posCss(pos, radius, bg, fg, fsize) {
    var base = '  content: attr(data-tip);\n'
      + '  position: absolute;\n  z-index: 50;\n  max-width: 220px;\n  padding: 8px 12px;\n'
      + '  background: ' + bg + ';\n  color: ' + fg + ';\n  font-size: ' + fsize + 'px;\n  line-height: 1.4;\n'
      + '  border-radius: ' + radius + 'px;\n  white-space: normal;\n  pointer-events: none;\n'
      + '  opacity: 0;\n  transition: opacity 0.2s ease, transform 0.2s ease;\n';
    var arrow = '';
    var off = '10px';
    if (pos === 'top') {
      base += '  bottom: calc(100% + ' + off + ');\n  left: 50%;\n  transform: translateX(-50%) translateY(4px);\n';
      arrow = '  border-left: 6px solid transparent;\n  border-right: 6px solid transparent;\n'
        + '  border-top: 6px solid ' + bg + ';\n  bottom: calc(100% + ' + (parseInt(off, 10) - 6) + 'px);\n  left: 50%;\n  transform: translateX(-50%);\n';
    } else if (pos === 'bottom') {
      base += '  top: calc(100% + ' + off + ');\n  left: 50%;\n  transform: translateX(-50%) translateY(-4px);\n';
      arrow = '  border-left: 6px solid transparent;\n  border-right: 6px solid transparent;\n'
        + '  border-bottom: 6px solid ' + bg + ';\n  top: calc(100% + ' + (parseInt(off, 10) - 6) + 'px);\n  left: 50%;\n  transform: translateX(-50%);\n';
    } else if (pos === 'left') {
      base += '  right: calc(100% + ' + off + ');\n  top: 50%;\n  transform: translateY(-50%) translateX(4px);\n';
      arrow = '  border-top: 6px solid transparent;\n  border-bottom: 6px solid transparent;\n'
        + '  border-left: 6px solid ' + bg + ';\n  right: calc(100% + ' + (parseInt(off, 10) - 6) + 'px);\n  top: 50%;\n  transform: translateY(-50%);\n';
    } else {
      base += '  left: calc(100% + ' + off + ');\n  top: 50%;\n  transform: translateY(-50%) translateX(-4px);\n';
      arrow = '  border-top: 6px solid transparent;\n  border-bottom: 6px solid transparent;\n'
        + '  border-right: 6px solid ' + bg + ';\n  left: calc(100% + ' + (parseInt(off, 10) - 6) + 'px);\n  top: 50%;\n  transform: translateY(-50%);\n';
    }
    return { base: base, arrow: arrow };
  }

  function buildCode(pfx) {
    var pos = $('position').value;
    var bg = $('bg').value, fg = $('fg').value;
    var radius = $('radius').value, fsize = $('fsize').value;
    var txt = $('text').value || 'Tooltip text';
    var parts = posCss(pos, radius, bg, fg, fsize);
    var c = '.' + pfx;
    var css = c + ' {\n  position: relative;\n  cursor: help;\n}\n\n'
      + c + '::after {\n' + parts.base + '}\n\n'
      + c + '::before {\n  content: "";\n  position: absolute;\n  z-index: 50;\n  opacity: 0;\n  transition: opacity 0.2s ease;\n'
      + parts.arrow + '}\n\n'
      + c + ':hover::after,\n' + c + ':hover::before {\n  opacity: 1;\n}\n\n'
      + c + ':hover::after {\n  transform: ' + (pos === 'top' || pos === 'bottom'
        ? 'translateX(-50%) translateY(0)' : 'translateY(-50%) translateX(0)') + ';\n}';
    var html = '<button class="' + pfx + '" data-tip="' + txt.replace(/"/g, '&quot;') + '">Hover me</button>';
    return { html: html, css: css };
  }

  function render() {
    TN.clearErr(ERR);
    try {
      $('radius-v').textContent = $('radius').value + 'px';
      $('fsize-v').textContent = $('fsize').value + 'px';
      var demo = buildCode('demo-tip');
      var demoBtn = $('demo');
      demoBtn.setAttribute('data-tip', $('text').value || 'Tooltip text');
      var old = document.getElementById(SLUG + '-style');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var st = document.createElement('style');
      st.id = SLUG + '-style';
      st.textContent = demo.css;
      document.head.appendChild(st);
      demoBtn.className = 'btn btn-primary demo-tip';
      var prod = buildCode('has-tooltip');
      $('code').textContent = '<!-- HTML: add the class + data-tip to any element -->\n'
        + prod.html + '\n\n<!-- CSS -->\n<style>\n' + prod.css + '\n</style>';
    } catch (e) {
      TN.setErr(ERR, 'Could not render the tooltip.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['text', 'position', 'bg', 'fg', 'radius', 'fsize'].forEach(function (k) {
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
