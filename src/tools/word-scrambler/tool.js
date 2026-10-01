/* Word Scrambler — jumble interior letters, keep first/last. */
(function () {
  'use strict';
  var SLUG = 'word-scrambler';

  function scrambleWord(word) {
    var m = word.match(/^([^A-Za-z]*)([A-Za-z]+)([^A-Za-z]*)$/);
    if (!m || m[2].length <= 3) return word;
    var core = m[2];
    var mid = core.slice(1, -1).split('');
    // Fisher-Yates on the middle; retry a few times to avoid identity
    var best = mid.join(''), tries = 0;
    do {
      for (var i = mid.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = mid[i]; mid[i] = mid[j]; mid[j] = t;
      }
      best = mid.join('');
      tries++;
    } while (best === core.slice(1, -1) && tries < 10 && mid.length > 1);
    return m[1] + core[0] + best + core[core.length - 1] + m[3];
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
    TN.el(SLUG + '-output').textContent = input.split(/(\s+)/).map(function (tok) {
      return /^\s+$/.test(tok) ? tok : scrambleWord(tok);
    }).join('');
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
