(function () {
  'use strict';
  var P = 'flesch-kincaid-calculator-', ERR = P + 'error';
  function syl(w) {
    w = String(w).toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]e|ed|[^laeiouy]es)$/, '').replace(/^y/, '');
    var m = w.match(/[aeiouy]{1,2}/g);
    return m ? m.length : 1;
  }
  function levelFor(ease) {
    if (ease >= 90) return 'Very easy';
    if (ease >= 80) return 'Easy';
    if (ease >= 70) return 'Fairly easy';
    if (ease >= 60) return 'Standard';
    if (ease >= 50) return 'Fairly hard';
    if (ease >= 30) return 'Hard';
    return 'Very hard';
  }
  function update() {
    try {
      TN.clearErr(ERR);
      var t = (TN.el(P + 'input').value || '').trim();
      var words = t.match(/[A-Za-z']+/g) || [];
      var sents = t.match(/[^.!?…\n]+[.!?…]+["'”’)\\]]*|\n+/g) || [];
      sents = sents.filter(function (s) { return /[A-Za-z0-9]/.test(s); });
      var W = words.length, S = Math.max(sents.length, 1), SY = 0, i;
      for (i = 0; i < W; i++) SY += syl(words[i]);
      TN.el(P + 'words').textContent = W.toLocaleString('en-US');
      TN.el(P + 'sentences').textContent = sents.length.toLocaleString('en-US');
      TN.el(P + 'syllables').textContent = SY.toLocaleString('en-US');
      var wps = W / S, spw = W ? SY / W : 0;
      TN.el(P + 'wps').textContent = wps.toFixed(1);
      TN.el(P + 'spw').textContent = spw.toFixed(2);
      if (W < 10) {
        TN.el(P + 'ease').textContent = '–';
        TN.el(P + 'grade').textContent = '–';
        TN.el(P + 'level').textContent = '–';
        return;
      }
      var ease = 206.835 - 1.015 * wps - 84.6 * spw;
      var grade = 0.39 * wps + 11.8 * spw - 15.59;
      TN.el(P + 'ease').textContent = ease.toFixed(1);
      TN.el(P + 'grade').textContent = grade.toFixed(1);
      TN.el(P + 'level').textContent = levelFor(ease);
    } catch (e) { TN.setErr(ERR, 'Could not compute the scores. Please try again.'); }
  }
  try {
    TN.on(P + 'input', 'input', TN.debounce(update, 150));
    update();
  } catch (e) { /* never throw on load */ }
})();
