/* Ubbi Dubbi Translator — real encode/decode: insert "ub" before each vowel letter. */
(function () {
  'use strict';
  var SLUG = 'ubbi-dubbi-translator';
  var VOWEL = /[aeiouAEIOU]/;

  function encode(text) {
    return text.replace(/[aeiouAEIOU]/g, function (v) { return 'ub' + v; });
  }
  function decode(text) {
    return text.replace(/ub([aeiouAEIOU])/g, function (m, v) { return v; });
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    var last = '';
    function translate() {
      try {
        TN.clearErr(SLUG + '-error');
        var mode = TN.el(SLUG + '-mode').value;
        var input = TN.el(SLUG + '-input').value;
        if (!input.trim()) {
          TN.setErr(SLUG + '-error', 'Please enter some text first.');
          return;
        }
        last = (mode === 'decode') ? decode(input) : encode(input);
        TN.el(SLUG + '-output').textContent = last;
      } catch (e) {
        TN.setErr(SLUG + '-error', 'Translation failed. Please try again.');
      }
    }
    TN.on(SLUG + '-go', 'click', translate);
    TN.on(SLUG + '-sample', 'click', function () {
      TN.el(SLUG + '-input').value = 'Hello friend, how are you today?';
      translate();
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!last) { TN.setErr(SLUG + '-error', 'Nothing to copy yet — translate first.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(last).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy Result';
        setTimeout(function () { btn.textContent = 'Copy Result'; }, 1200);
      });
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
