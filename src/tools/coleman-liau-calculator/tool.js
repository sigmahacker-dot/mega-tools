(function () {
  'use strict';
  var P = 'coleman-liau-calculator-', ERR = P + 'error';
  function update() {
    try {
      TN.clearErr(ERR);
      var t = (TN.el(P + 'input').value || '').trim();
      var words = t.match(/[A-Za-z0-9']+/g) || [];
      var sents = (t.match(/[^.!?…]+[.!?…]+["'”’)\\]]*/g) || []).filter(function (s) { return /[A-Za-z0-9]/.test(s); });
      var letters = (t.match(/[A-Za-z]/g) || []).length;
      var W = words.length;
      TN.el(P + 'letters').textContent = letters.toLocaleString('en-US');
      TN.el(P + 'words').textContent = W.toLocaleString('en-US');
      TN.el(P + 'sentences').textContent = sents.length.toLocaleString('en-US');
      if (W < 10) {
        TN.el(P + 'index').textContent = '–';
        TN.el(P + 'l').textContent = '0';
        TN.el(P + 's').textContent = '0';
        return;
      }
      var L = letters / W * 100, S = sents.length / W * 100;
      var cli = 0.0588 * L - 0.296 * S - 15.8;
      TN.el(P + 'index').textContent = cli.toFixed(1);
      TN.el(P + 'l').textContent = L.toFixed(1);
      TN.el(P + 's').textContent = S.toFixed(2);
    } catch (e) { TN.setErr(ERR, 'Could not compute the index. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 150));
    update();
  } catch (e) { /* never throw on load */ }
})();
