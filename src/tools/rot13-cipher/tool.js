/* ROT13 Cipher — rotate letters 13 places; same operation encodes and decodes. */
(function () {
  'use strict';
  var SLUG = 'rot13-cipher';

  function rot13(text) {
    return text.replace(/[A-Za-z]/g, function (ch) {
      var base = ch <= 'Z' ? 65 : 97;
      return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
    });
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
    TN.el(SLUG + '-output').textContent = rot13(input);
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
