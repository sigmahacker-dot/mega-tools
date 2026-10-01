/* Glassmorphism Generator — frosted glass card CSS with live preview. */
(function () {
  'use strict';
  var SLUG = 'glassmorphism-generator';
  var ERR = SLUG + '-error';

  function $(id) { return document.getElementById(SLUG + '-' + id); }
  function rgba(white, alpha) {
    var v = white ? '255, 255, 255' : '17, 24, 39';
    return 'rgba(' + v + ', ' + alpha.toFixed(2) + ')';
  }

  function render() {
    TN.clearErr(ERR);
    try {
      var blur = parseInt($('blur').value, 10);
      var op = parseFloat($('opacity').value);
      var sat = parseInt($('saturate').value, 10);
      var rad = parseInt($('radius').value, 10);
      var bord = parseFloat($('border').value);
      var txt = $('text').value;
      $('blur-v').textContent = blur + 'px';
      $('opacity-v').textContent = op.toFixed(2);
      $('saturate-v').textContent = sat + '%';
      $('radius-v').textContent = rad + 'px';
      $('border-v').textContent = bord.toFixed(2);
      var card = $('card');
      card.style.backdropFilter = 'blur(' + blur + 'px) saturate(' + sat + '%)';
      card.style.webkitBackdropFilter = card.style.backdropFilter;
      card.style.background = rgba(true, op);
      card.style.border = '1px solid ' + rgba(true, bord);
      card.style.borderRadius = rad + 'px';
      card.style.color = txt;
      card.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.25)';
      var css = '.glass-card {\n'
        + '  background: ' + rgba(true, op) + ';\n'
        + '  border-radius: ' + rad + 'px;\n'
        + '  border: 1px solid ' + rgba(true, bord) + ';\n'
        + '  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);\n'
        + '  backdrop-filter: blur(' + blur + 'px) saturate(' + sat + '%);\n'
        + '  -webkit-backdrop-filter: blur(' + blur + 'px) saturate(' + sat + '%); /* Safari */\n'
        + '  color: ' + txt + ';\n'
        + '}';
      $('code').textContent = css;
    } catch (e) {
      TN.setErr(ERR, 'Could not render the glass card.');
    }
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      ['blur', 'opacity', 'saturate', 'radius', 'border', 'text'].forEach(function (k) {
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
