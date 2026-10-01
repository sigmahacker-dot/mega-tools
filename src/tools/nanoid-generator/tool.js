/* NanoID Generator — crypto.getRandomValues with rejection sampling (no modulo bias). */
(function () {
  'use strict';
  var SLUG = 'nanoid-generator';
  var ALPHABETS = {
    urlsafe: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-',
    alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    hex: '0123456789abcdef'
  };

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function nanoid(alphabet, size) {
    var mask = 1, n = alphabet.length;
    while (mask < n) mask = (mask << 1) | 1; // smallest 2^k - 1 >= n
    var step = Math.ceil(1.6 * mask * size / n); // oversample like the reference impl
    var id = '';
    while (id.length < size) {
      var bytes = new Uint8Array(step);
      crypto.getRandomValues(bytes);
      for (var i = 0; i < step && id.length < size; i++) {
        var b = bytes[i] & mask;
        if (b < n) id += alphabet[b]; // rejection sampling: skip out-of-range
      }
    }
    return id;
  }

  function generate() {
    clear();
    var len = parseInt(el(SLUG + '-length').value, 10);
    var count = parseInt(el(SLUG + '-count').value, 10);
    if (!len || len < 1 || len > 128) { fail('Length must be between 1 and 128.'); return; }
    if (!count || count < 1 || count > 500) { fail('Count must be between 1 and 500.'); return; }
    var alphabet = ALPHABETS[el(SLUG + '-alphabet').value];
    var out = [];
    for (var i = 0; i < count; i++) out.push(nanoid(alphabet, len));
    el(SLUG + '-output').value = out.join('\n');
  }

  try {
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate IDs first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate IDs first.'); return; }
      TN.downloadText(v, 'nanoids.txt', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
