/* Caesar Cipher Tool — shift encode/decode plus a brute-force cracker. */
(function () {
  'use strict';
  var SLUG = 'caesar-cipher-tool';

  function shift(text, n) {
    n = ((n % 26) + 26) % 26;
    return text.replace(/[A-Za-z]/g, function (ch) {
      var base = ch <= 'Z' ? 65 : 97;
      return String.fromCharCode(((ch.charCodeAt(0) - base + n) % 26) + base);
    });
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some text first.'); return; }
    var mode = TN.el(SLUG + '-mode').value;
    var out;
    if (mode === 'crack') {
      var lines = [];
      for (var s = 1; s <= 25; s++) {
        lines.push('Shift ' + (s < 10 ? ' ' + s : s) + ':  ' + shift(input, 26 - s));
      }
      out = lines.join('\n');
    } else {
      var n = parseInt(TN.el(SLUG + '-shift').value, 10);
      if (isNaN(n) || n < 1 || n > 25) { TN.setErr(SLUG + '-error', 'Shift must be between 1 and 25.'); return; }
      out = mode === 'encode' ? shift(input, n) : shift(input, -n);
    }
    TN.el(SLUG + '-output').textContent = out;
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
