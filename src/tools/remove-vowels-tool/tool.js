/* Remove Vowels Tool — disemvoweling with vowel count. */
(function () {
  'use strict';
  var SLUG = 'remove-vowels-tool';
  var last = '';

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var input = TN.el(SLUG + '-input').value;
        if (!input) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
        var removed = 0;
        last = input.replace(/[aeiouAEIOU]/g, function () { removed++; return ''; });
        TN.el(SLUG + '-output').textContent = last || '(everything was a vowel!)';
        TN.el(SLUG + '-count').textContent = removed;
        TN.el(SLUG + '-left').textContent = last.length;
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not process the text. Please try again.'); }
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!last) { TN.setErr(SLUG + '-error', 'Nothing to copy yet.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(last).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy Result';
        setTimeout(function () { btn.textContent = 'Copy Result'; }, 1200);
      });
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
