(function () {
  'use strict';
  var P = 'smog-index-calculator-', ERR = P + 'error';
  function syl(w) {
    w = String(w).toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]e|ed|[^laeiouy]es)$/, '').replace(/^y/, '');
    var m = w.match(/[aeiouy]{1,2}/g);
    return m ? m.length : 1;
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var t = (TN.el(P + 'input').value || '').trim();
      var sents = (t.match(/[^.!?…]+[.!?…]+["'”’)\\]]*/g) || []).filter(function (s) { return /[A-Za-z0-9]/.test(s); });
      var S = sents.length, poly = 0, i;
      for (i = 0; i < sents.length; i++) {
        var words = sents[i].match(/[A-Za-z][A-Za-z']*/g) || [];
        for (var j = 0; j < words.length; j++) if (syl(words[j]) >= 3) poly++;
      }
      TN.el(P + 'poly').textContent = poly.toLocaleString('en-US');
      TN.el(P + 'sentences').textContent = S.toLocaleString('en-US');
      var idxEl = TN.el(P + 'index'), note = TN.el(P + 'note');
      if (S < 3) {
        idxEl.textContent = '–';
        note.textContent = 'Enter at least 3 sentences to get a SMOG estimate (30+ sentences is the calibrated sample size).';
        return;
      }
      var smog = 1.0430 * Math.sqrt(poly * (30 / S)) + 3.1291;
      idxEl.textContent = smog.toFixed(1);
      note.textContent = S >= 30
        ? 'SMOG grade ' + smog.toFixed(1) + ' — full 30+ sentence sample, fully calibrated result.'
        : 'SMOG grade ' + smog.toFixed(1) + ' — estimate only: SMOG is calibrated for 30+ sentences; you entered ' + S + '.';
    } catch (e) { TN.setErr(ERR, 'Could not compute the SMOG index. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 150));
    update();
  } catch (e) { /* never throw on load */ }
})();
