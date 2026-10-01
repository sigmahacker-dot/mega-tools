/* CSS Triangle Generator — border-based CSS triangles with live preview. */
(function () {
  'use strict';
  var SLUG = 'css-triangle-generator';
  var ERR = SLUG + '-error';

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function buildCss(dir, size, color, cls) {
    var h = Math.round(size / 2);
    var lines = [
      '.' + cls + ' {',
      '  width: 0;',
      '  height: 0;',
      '  border-style: solid;'
    ];
    if (dir === 'up') {
      lines.push('  border-width: 0 ' + h + 'px ' + size + 'px ' + h + 'px;');
      lines.push('  border-color: transparent transparent ' + color + ' transparent;');
    } else if (dir === 'down') {
      lines.push('  border-width: ' + size + 'px ' + h + 'px 0 ' + h + 'px;');
      lines.push('  border-color: ' + color + ' transparent transparent transparent;');
    } else if (dir === 'left') {
      lines.push('  border-width: ' + h + 'px ' + size + 'px ' + h + 'px 0;');
      lines.push('  border-color: transparent ' + color + ' transparent transparent;');
    } else {
      lines.push('  border-width: ' + h + 'px 0 ' + h + 'px ' + size + 'px;');
      lines.push('  border-color: transparent transparent transparent ' + color + ';');
    }
    lines.push('}');
    return lines.join('\n');
  }

  function render() {
    TN.clearErr(ERR);
    try {
      var dir = $('direction').value;
      var size = parseInt($('size').value, 10);
      var color = $('color').value;
      var cls = ($('class').value || 'my-triangle').replace(/[^a-zA-Z0-9-_]/g, '-') || 'my-triangle';
      $('size-v').textContent = size + 'px';
      var css = buildCss(dir, size, color, cls);
      $('code').textContent = css;
      var stage = $('stage');
      stage.style.width = '0';
      stage.style.height = '0';
      stage.style.borderStyle = 'solid';
      stage.style.borderWidth = '';
      var h = Math.round(size / 2);
      var transparent = 'transparent';
      if (dir === 'up') {
        stage.style.borderWidth = '0 ' + h + 'px ' + size + 'px ' + h + 'px';
        stage.style.borderColor = transparent + ' ' + transparent + ' ' + color + ' ' + transparent;
      } else if (dir === 'down') {
        stage.style.borderWidth = size + 'px ' + h + 'px 0 ' + h + 'px';
        stage.style.borderColor = color + ' ' + transparent + ' ' + transparent + ' ' + transparent;
      } else if (dir === 'left') {
        stage.style.borderWidth = h + 'px ' + size + 'px ' + h + 'px 0';
        stage.style.borderColor = transparent + ' ' + color + ' ' + transparent + ' ' + transparent;
      } else {
        stage.style.borderWidth = h + 'px 0 ' + h + 'px ' + size + 'px';
        stage.style.borderColor = transparent + ' ' + transparent + ' ' + transparent + ' ' + color;
      }
    } catch (e) {
      TN.setErr(ERR, 'Could not render the triangle.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['direction', 'color', 'size', 'class'].forEach(function (k) {
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
