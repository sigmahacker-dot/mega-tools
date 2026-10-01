(function () {
  'use strict';
  var P = 'vaporwave-text-generator-', ERR = P + 'error';
  function toFullwidth(s) {
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c === 32) out += '　';
      else if (c >= 33 && c <= 126) out += String.fromCharCode(c + 0xFEE0);
      else out += s[i];
    }
    return out;
  }
  function update() {
    try {
      TN.clearErr(ERR);
      TN.el(P + 'output').value = toFullwidth(TN.el(P + 'input').value || '');
    } catch (e) { TN.setErr(ERR, 'Could not convert the text. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 80));
    TN.on(P + 'copy', 'click', function () {
      var v = TN.el(P + 'output').value;
      if (!v) { TN.setErr(ERR, 'Nothing to copy yet.'); return; }
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
