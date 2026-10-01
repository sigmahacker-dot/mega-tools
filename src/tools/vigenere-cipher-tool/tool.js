/* Vigenère Cipher Tool — keyword-based polyalphabetic encode/decode. */
(function () {
  'use strict';
  var SLUG = 'vigenere-cipher-tool';

  function vigenere(text, key, encode) {
    var ki = 0, out = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (/[A-Za-z]/.test(ch)) {
        var base = ch <= 'Z' ? 65 : 97;
        var k = key.charCodeAt(ki % key.length) - 65;
        var c = ch.charCodeAt(0) - base;
        c = encode ? (c + k) % 26 : (c - k + 26) % 26;
        out += String.fromCharCode(c + base);
        ki++;
      } else {
        out += ch;
      }
    }
    return out;
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    var key = TN.el(SLUG + '-key').value.toUpperCase().replace(/[^A-Z]/g, '');
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter a message first.'); return; }
    if (!key) { TN.setErr(SLUG + '-error', 'Please enter a keyword (letters only).'); return; }
    var mode = TN.el(SLUG + '-mode').value;
    TN.el(SLUG + '-output').textContent = vigenere(input, key, mode === 'encode');
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
