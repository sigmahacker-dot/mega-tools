/* Sentence Counter — sentence count, avg words/sentence, longest sentence. */
(function () {
  'use strict';
  var SLUG = 'sentence-counter';

  function sentencesOf(text) {
    var m = text.replace(/\b(Mr|Mrs|Ms|Dr|St|Jr|Sr|vs|etc|i\.e|e\.g)\./gi, '$1@DOT@')
      .match(/[^.!?]+[.!?]+["'”’)]?\s*|[^.!?]+$/g);
    if (!m) return [];
    return m.map(function (s) { return s.replace(/@DOT@/g, '.').trim(); })
      .filter(function (s) { return s.length > 0; });
  }
  function wordsOf(s) {
    var m = s.match(/[A-Za-z0-9\u00C0-\u024F']+/g);
    return m ? m : [];
  }

  function update() {
    TN.clearErr(SLUG + '-error');
    var text = TN.el(SLUG + '-input').value;
    var sents = sentencesOf(text);
    var total = 0, longest = null, longestN = 0;
    sents.forEach(function (s) {
      var n = wordsOf(s).length;
      total += n;
      if (n > longestN) { longestN = n; longest = s; }
    });
    TN.el(SLUG + '-count').textContent = sents.length;
    TN.el(SLUG + '-avg').textContent = sents.length ? (total / sents.length).toFixed(1) : '0';
    TN.el(SLUG + '-longest').textContent = longestN;
    TN.el(SLUG + '-longesttext').textContent = longest || '—';
  }

  try {
    TN.on(SLUG + '-input', 'input', update);
    update();
  } catch (e) { /* never throw on load */ }
})();
