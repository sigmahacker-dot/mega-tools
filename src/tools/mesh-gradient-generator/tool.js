/* Mesh Gradient Generator — 4 layered radial gradients, live preview. */
(function () {
  'use strict';
  var SLUG = 'mesh-gradient-generator';
  var ERR = SLUG + '-error';
  var POS = ['0% 0%', '100% 0%', '100% 100%', '0% 100%'];

  function $(id) { return document.getElementById(SLUG + '-' + id); }

  function buildCss() {
    var colors = [$('c1').value, $('c2').value, $('c3').value, $('c4').value];
    var spread = parseInt($('spread').value, 10);
    var bg = $('bg').value;
    var layers = colors.map(function (c, i) {
      return 'radial-gradient(at ' + POS[i] + ', ' + c + ' 0px, transparent ' + spread + '%)';
    });
    return { layers: layers, bg: bg };
  }

  function render() {
    TN.clearErr(ERR);
    try {
      $('spread-v').textContent = $('spread').value + '%';
      var g = buildCss();
      var bg = g.layers.join(', ') + ',\n  ' + g.bg;
      $('stage').style.background = bg;
      $('code').textContent = '.mesh-gradient {\n  background:\n    ' + g.layers.join(',\n    ') + ',\n    ' + g.bg + ';\n}';
    } catch (e) {
      TN.setErr(ERR, 'Could not render the mesh gradient.');
    }
  }

  function shuffle() {
    ['c1', 'c2', 'c3', 'c4'].forEach(function (k) {
      var v = Math.floor(Math.random() * 0xffffff).toString(16);
      $(k).value = '#' + ('000000' + v).slice(-6);
    });
    render();
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['c1', 'c2', 'c3', 'c4', 'spread', 'bg'].forEach(function (k) {
        TN.on(SLUG + '-' + k, 'input', render);
        TN.on(SLUG + '-' + k, 'change', render);
      });
      TN.on(SLUG + '-shuffle', 'click', shuffle);
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
