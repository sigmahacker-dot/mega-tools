/* Spoonerism Generator — real algorithm: swap initial consonant clusters of two words. */
(function () {
  'use strict';
  var SLUG = 'spoonerism-generator';

  var PAIRS = [
    ['blushing', 'crow'], ['light', 'fire'], ['queer', 'old'], ['deer', 'park'], ['lack', 'of'],
    ['fighting', 'a'], ['roaring', 'lion'], ['bed', 'time'], ['crushing', 'blow'],
    ['shaking', 'hands'], ['teaspoon', 'reader'], ['jelly', 'beans'], ['smart', 'fella'],
    ['well', 'boiled'], ['dental', 'plan'], ['flat', 'battery'], ['bottle', 'of'],
    ['sick', 'joke'], ['cold', 'shoulder'], ['bright', 'idea'], ['sweet', 'dreams'],
    ['crazy', 'train'], ['happy', 'hour'], ['fast', 'food'], ['hot', 'potato'],
    ['big', 'bang'], ['night', 'owl'], ['early', 'bird'], ['silver', 'lining']
  ];

  /* split a word into [onset, rest]; onset = leading consonants before first vowel (qu counts as one) */
  function splitOnset(word) {
    var w = word, i = 0, n = w.length;
    while (i < n) {
      var ch = w[i].toLowerCase();
      if ('aeiou'.indexOf(ch) !== -1) break;
      if (ch === 'y' && i > 0) break; /* y after first letter acts as vowel */
      i++;
      if (ch === 'q' && w[i] && w[i].toLowerCase() === 'u') i++; /* qu together */
    }
    return [w.slice(0, i), w.slice(i)];
  }
  function matchCase(src, tpl) {
    if (!src) return tpl;
    if (src[0] === src[0].toUpperCase()) return tpl.charAt(0).toUpperCase() + tpl.slice(1);
    return tpl;
  }
  function spoonerize(w1, w2) {
    var a = splitOnset(w1), b = splitOnset(w2);
    return matchCase(w1, b[0] + a[1]) + ' ' + matchCase(w2, a[0] + b[1]);
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    function make(w1, w2) {
      try {
        TN.clearErr(SLUG + '-error');
        w1 = (w1 || '').trim(); w2 = (w2 || '').trim();
        if (!w1 || !w2) { TN.setErr(SLUG + '-error', 'Please enter both words.'); return; }
        if (!/^[a-zA-Z'-]+$/.test(w1) || !/^[a-zA-Z'-]+$/.test(w2)) {
          TN.setErr(SLUG + '-error', 'Letters only, please (apostrophes and hyphens OK).'); return;
        }
        var a = splitOnset(w1), b = splitOnset(w2);
        if (!a[0] && !b[0]) { TN.setErr(SLUG + '-error', 'Both words start with vowels — nothing to swap.'); return; }
        TN.el(SLUG + '-output').textContent = '\u201C' + w1 + ' ' + w2 + '\u201D \u2192 \u201C' + spoonerize(w1, w2) + '\u201D';
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not make a spoonerism. Please try again.'); }
    }
    TN.on(SLUG + '-go', 'click', function () {
      make(TN.el(SLUG + '-w1').value, TN.el(SLUG + '-w2').value);
    });
    TN.on(SLUG + '-random', 'click', function () {
      var p = PAIRS[Math.floor(Math.random() * PAIRS.length)];
      TN.el(SLUG + '-w1').value = p[0];
      TN.el(SLUG + '-w2').value = p[1];
      make(p[0], p[1]);
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
