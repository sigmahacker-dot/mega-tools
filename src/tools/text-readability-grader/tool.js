/* Text Readability Grader — Flesch Reading Ease + Flesch-Kincaid Grade. */
(function () {
  'use strict';
  var SLUG = 'text-readability-grader';

  function sentencesOf(text) {
    var m = text.replace(/\b(Mr|Mrs|Ms|Dr|St|Jr|Sr|vs|etc|i\.e|e\.g)\./gi, '$1@DOT@')
      .match(/[^.!?]+[.!?]+["'”’)]?\s*|[^.!?]+$/g);
    if (!m) return [];
    return m.filter(function (s) { return s.replace(/@DOT@/g, '.').trim().length > 0; });
  }
  function wordsOf(text) {
    var m = text.match(/[A-Za-z\u00C0-\u024F']+/g);
    return m ? m : [];
  }
  function syllables(word) {
    var w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeouy]e|ed|es)$/, '').replace(/^y/, '');
    var m = w.match(/[aeiouy]{1,2}/g);
    return m ? Math.max(1, m.length) : 1;
  }

  function interpFre(score) {
    if (score >= 90) return 'Very easy — a 5th grader could read this with ease.';
    if (score >= 80) return 'Easy — conversational English, enjoyable to read.';
    if (score >= 70) return 'Fairly easy — plain English, understood by most adults.';
    if (score >= 60) return 'Standard — typical adult reading level.';
    if (score >= 50) return 'Fairly difficult — needs some focus.';
    if (score >= 30) return 'Difficult — best for college-level readers.';
    return 'Very difficult — graduate-level or technical prose.';
  }

  function update() {
    TN.clearErr(SLUG + '-error');
    var text = TN.el(SLUG + '-input').value;
    var sents = sentencesOf(text), words = wordsOf(text);
    if (sents.length === 0 || words.length === 0) {
      TN.el(SLUG + '-fre').textContent = '–';
      TN.el(SLUG + '-fk').textContent = '–';
      TN.el(SLUG + '-interp').textContent = 'Paste at least one full sentence to grade.';
      return;
    }
    var syl = 0;
    words.forEach(function (w) { syl += syllables(w); });
    var wps = words.length / sents.length, spw = syl / words.length;
    var fre = 206.835 - 1.015 * wps - 84.6 * spw;
    var fk = 0.39 * wps + 11.8 * spw - 15.59;
    TN.el(SLUG + '-fre').textContent = fre.toFixed(1);
    TN.el(SLUG + '-fk').textContent = fk.toFixed(1);
    TN.el(SLUG + '-interp').textContent =
      'Reading Ease ' + fre.toFixed(1) + '/100: ' + interpFre(fre) +
      '\nGrade Level ' + fk.toFixed(1) + ': roughly a US grade-' + Math.max(1, Math.round(fk)) + ' reading level.' +
      '\n(' + words.length + ' words, ' + sents.length + ' sentences, ' + syl + ' syllables)';
  }

  try {
    TN.on(SLUG + '-input', 'input', update);
    update();
  } catch (e) { /* never throw on load */ }
})();
