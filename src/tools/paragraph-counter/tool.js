/* Paragraph Counter — paragraphs, sentences, words, blank lines. */
(function () {
  'use strict';
  var SLUG = 'paragraph-counter';

  function wordsOf(text) {
    var m = text.match(/[A-Za-z0-9\u00C0-\u024F']+/g);
    return m ? m : [];
  }
  function sentencesOf(text) {
    var m = text.replace(/\b(Mr|Mrs|Ms|Dr|St|Jr|Sr|vs|etc|i\.e|e\.g)\./gi, '$1@DOT@')
      .match(/[^.!?]+[.!?]+["'”’)]?\s*|[^.!?]+$/g);
    if (!m) return [];
    return m.map(function (s) { return s.replace(/@DOT@/g, '.').trim(); })
      .filter(function (s) { return s.length > 0; });
  }

  function update() {
    TN.clearErr(SLUG + '-error');
    var text = TN.el(SLUG + '-input').value;
    var lines = text.split('\n');
    var blanks = lines.filter(function (l) { return l.trim() === ''; }).length;
    var paras = text.trim() ? text.trim().split(/\n\s*\n/).filter(function (p) { return p.trim(); }).length : 0;
    TN.el(SLUG + '-paras').textContent = paras;
    TN.el(SLUG + '-sents').textContent = sentencesOf(text).length;
    TN.el(SLUG + '-words').textContent = wordsOf(text).length;
    TN.el(SLUG + '-blanks').textContent = blanks;
  }

  try {
    TN.on(SLUG + '-input', 'input', update);
    update();
  } catch (e) { /* never throw on load */ }
})();
