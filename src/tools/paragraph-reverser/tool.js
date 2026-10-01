(function () {
  'use strict';
  var P = 'paragraph-reverser-', ERR = P + 'error';
  function reverseText(t, mode) {
    if (mode === 'line') return t.split('\n').reverse().join('\n');
    var paras = t.split(/\n\s*\n/);
    if (mode === 'word') {
      return paras.map(function (p) {
        return p.split('\n').map(function (ln) {
          return ln.split(/(\s+)/).reverse().join('');
        }).join('\n');
      }).join('\n\n');
    }
    return paras.reverse().join('\n\n');
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var t = TN.el(P + 'input').value || '';
      var mode = TN.el(P + 'mode').value;
      TN.el(P + 'output').value = t ? reverseText(t, mode) : '';
    } catch (e) { TN.setErr(ERR, 'Could not reverse the text. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 120));
    TN.on(P + 'mode', 'change', update);
    TN.on(P + 'copy', 'click', function () {
      var v = TN.el(P + 'output').value;
      if (!v) { TN.setErr(ERR, 'Nothing to copy yet — type some text first.'); return; }
      TN.clearErr(ERR);
      TN.copy(v).then(function (ok) {
        var b = TN.el(P + 'copy');
        b.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { b.textContent = 'Copy result'; }, 1200);
      });
    });
    TN.on(P + 'clear', 'click', function () {
      TN.el(P + 'input').value = ''; TN.clearErr(ERR); update(); TN.el(P + 'input').focus();
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
