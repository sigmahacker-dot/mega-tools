/* Text Shuffler — Fisher-Yates shuffle of lines, words or paragraphs. */
(function () {
  'use strict';
  var SLUG = 'text-shuffler';

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
    var mode = TN.el(SLUG + '-mode').value, items, joiner;
    if (mode === 'words') {
      items = input.split(/\s+/).filter(function (w) { return w.length; });
      joiner = ' ';
    } else if (mode === 'paragraphs') {
      items = input.trim().split(/\n\s*\n/).filter(function (p) { return p.trim(); });
      joiner = '\n\n';
    } else {
      items = input.split('\n');
      joiner = '\n';
    }
    TN.el(SLUG + '-output').textContent = shuffle(items).join(joiner);
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
