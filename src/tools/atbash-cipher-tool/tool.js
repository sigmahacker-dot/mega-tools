/* Atbash Cipher Tool — A<->Z mirror; same operation encodes and decodes. */
(function () {
  'use strict';
  var SLUG = 'atbash-cipher-tool';

  function atbash(text) {
    return text.replace(/[A-Za-z]/g, function (ch) {
      var base = ch <= 'Z' ? 65 : 97;
      return String.fromCharCode((25 - (ch.charCodeAt(0) - base)) + base);
    });
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
    TN.el(SLUG + '-output').textContent = atbash(input);
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
