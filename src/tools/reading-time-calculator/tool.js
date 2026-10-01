/* Reading Time Calculator — stats + Flesch Reading Ease (estimate). */
(function () {
  'use strict';

  var SLUG = 'reading-time-calculator';

  function errId() { return SLUG + '-error'; }
  function set(id, v) { var e = TN.el(id); if (e) e.textContent = v; }

  function countSyllables(word) {
    var w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    if (w.length <= 3) return 1;
    var groups = w.replace(/[^aeiouy]+/g, ' ').trim().split(/\s+/);
    var n = groups.length;
    if (/e$/.test(w) && !/(le|oe)$/.test(w)) n--; // silent e
    if (/^y/.test(w)) n++; // leading y acts as consonant
    return Math.max(n, 1);
  }

  function fmtMinutes(mins) {
    if (mins < 1) {
      var s = Math.max(1, Math.round(mins * 60));
      return s + ' sec';
    }
    var m = Math.floor(mins);
    var sec = Math.round((mins - m) * 60);
    if (sec === 60) { m++; sec = 0; }
    return sec ? m + ' min ' + sec + ' sec' : m + ' min';
  }

  function fleschLabel(score) {
    if (score >= 90) return 'Very easy — 5th grade';
    if (score >= 80) return 'Easy — 6th grade';
    if (score >= 70) return 'Fairly easy — 7th grade';
    if (score >= 60) return 'Standard — 8th–9th grade';
    if (score >= 50) return 'Fairly difficult — 10th–12th grade';
    if (score >= 30) return 'Difficult — college';
    return 'Very difficult — college graduate';
  }

  function calc() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-text');
    var text = ta ? ta.value : '';
    if (!text || !text.trim()) {
      TN.setErr(errId(), 'Please enter some text to analyze.');
      return;
    }
    var words = text.trim().split(/\s+/).filter(function (w) { return w.length; });
    var wordCount = words.length;
    var chars = text.length;
    var charsNoSpace = text.replace(/\s/g, '').length;
    var sentences = text.split(/[.!?…]+/).filter(function (s) { return s.trim().length; }).length;
    if (sentences === 0) sentences = 1;
    var syllables = 0;
    for (var i = 0; i < words.length; i++) syllables += countSyllables(words[i]);
    if (syllables === 0) syllables = wordCount;

    var reading = wordCount / 200;
    var speaking = wordCount / 130;
    var flesch = 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount);

    set(SLUG + '-words', wordCount.toLocaleString('en-US'));
    set(SLUG + '-chars', chars.toLocaleString('en-US'));
    set(SLUG + '-chars-nospace', charsNoSpace.toLocaleString('en-US'));
    set(SLUG + '-sentences', sentences.toLocaleString('en-US'));
    set(SLUG + '-syllables', syllables.toLocaleString('en-US'));
    set(SLUG + '-reading', fmtMinutes(reading));
    set(SLUG + '-speaking', fmtMinutes(speaking));
    set(SLUG + '-flesch', flesch.toFixed(1));
    set(SLUG + '-grade', fleschLabel(flesch));
  }

  function clear() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-text');
    if (ta) ta.value = '';
    ['words', 'chars', 'chars-nospace', 'sentences', 'syllables', 'reading', 'speaking', 'flesch', 'grade']
      .forEach(function (k) { set(SLUG + '-' + k, '–'); });
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var c = TN.el(SLUG + '-calc');
      if (c) TN.on(c, 'click', calc);
      var x = TN.el(SLUG + '-clear');
      if (x) TN.on(x, 'click', clear);
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();