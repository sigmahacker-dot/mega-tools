(function () {
  'use strict';
  var P = 'gunning-fog-calculator-', ERR = P + 'error';
  function syl(w) {
    w = String(w).toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]e|ed|[^laeiouy]es)$/, '').replace(/^y/, '');
    var m = w.match(/[aeiouy]{1,2}/g);
    return m ? m.length : 1;
  }
  function levelFor(f) {
    if (f < 10) return 'Easy';
    if (f < 12) return 'Ideal';
    if (f < 14) return 'Fairly hard';
    if (f < 17) return 'Hard';
    return 'Very hard';
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var t = (TN.el(P + 'input').value || '').trim();
      var words = t.match(/[A-Za-z][A-Za-z']*/g) || [];
      var sents = (t.match(/[^.!?…]+[.!?…]+["'”’)\\]]*/g) || []).filter(function (s) { return /[A-Za-z0-9]/.test(s); });
      var W = words.length, S = Math.max(sents.length, 1), C = 0, i;
      for (i = 0; i < W; i++) {
        var w = words[i];
        if (/^[A-Z]/.test(w)) continue; /* skip proper nouns */
        var base = w.replace(/(es|ed|ing)$/i, '');
        if (syl(base) >= 3 && syl(w) >= 3) C++;
      }
      TN.el(P + 'words').textContent = W.toLocaleString('en-US');
      TN.el(P + 'sentences').textContent = sents.length.toLocaleString('en-US');
      TN.el(P + 'complex').textContent = C.toLocaleString('en-US');
      TN.el(P + 'ratio').textContent = W ? (100 * C / W).toFixed(1) + '%' : '0%';
      if (W < 10) { TN.el(P + 'index').textContent = '–'; TN.el(P + 'level').textContent = '–'; return; }
      var fog = 0.4 * ((W / S) + 100 * (C / W));
      TN.el(P + 'index').textContent = fog.toFixed(1);
      TN.el(P + 'level').textContent = levelFor(fog);
    } catch (e) { TN.setErr(ERR, 'Could not compute the Fog Index. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 150));
    update();
  } catch (e) { /* never throw on load */ }
})();
