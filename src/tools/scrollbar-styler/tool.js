/* Scrollbar Styler — custom scrollbar CSS with live scrollable demo. */
(function () {
  'use strict';
  var SLUG = 'scrollbar-styler';
  var ERR = SLUG + '-error';

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function buildCss(track, thumb, hover, width, radius, border, cls) {
    var c = '.' + cls;
    var css = '/* Firefox */\n' + c + ' {\n  scrollbar-width: thin;\n  scrollbar-color: ' + thumb + ' ' + track + ';\n}\n\n'
      + '/* Chrome, Edge, Safari */\n' + c + '::-webkit-scrollbar {\n  width: ' + width + 'px;\n}\n\n'
      + c + '::-webkit-scrollbar-track {\n  background: ' + track + ';\n  border-radius: ' + radius + 'px;\n}\n\n'
      + c + '::-webkit-scrollbar-thumb {\n  background: ' + thumb + ';\n  border-radius: ' + radius + 'px;\n';
    if (border === 'track') css += '  border: 2px solid ' + track + ';\n';
    css += '}\n\n' + c + '::-webkit-scrollbar-thumb:hover {\n  background: ' + hover + ';\n}';
    return css;
  }

  function render() {
    TN.clearErr(ERR);
    try {
      var track = $('track').value, thumb = $('thumb').value, hover = $('hover').value;
      var width = parseInt($('width').value, 10);
      var radius = parseInt($('radius').value, 10);
      var border = $('border').value;
      $('width-v').textContent = width + 'px';
      $('radius-v').textContent = radius + 'px';
      /* demo: inject equivalent styles under a demo class */
      var old = document.getElementById(SLUG + '-style');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var st = document.createElement('style');
      st.id = SLUG + '-style';
      st.textContent = buildCss(track, thumb, hover, width, radius, border, 'demo-scroll')
        .replace(/\.demo-scroll\{/g, '.demo-scroll {');
      document.head.appendChild(st);
      var demo = $('demo');
      demo.className = 'demo-scroll';
      demo.style.scrollbarWidth = 'thin';
      demo.style.scrollbarColor = thumb + ' ' + track;
      $('code').textContent = buildCss(track, thumb, hover, width, radius, border, 'custom-scroll');
    } catch (e) {
      TN.setErr(ERR, 'Could not render the scrollbar demo.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['track', 'thumb', 'hover', 'width', 'radius', 'border'].forEach(function (k) {
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
