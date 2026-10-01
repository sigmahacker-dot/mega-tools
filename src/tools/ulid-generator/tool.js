/* ULID Generator — real ULIDs: 48-bit ms timestamp + 80-bit crypto randomness,
   Crockford base32. Batch generation supported. */
(function () {
  'use strict';
  var SLUG = 'ulid-generator';
  var CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function encodeTime(now, len) {
    var s = '';
    for (var i = 0; i < len; i++) {
      s = CROCKFORD[now % 32] + s;
      now = Math.floor(now / 32);
    }
    return s;
  }

  function encodeRandom(len) {
    var bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    // pack bytes into 5-bit groups
    var s = '', bits = 0, acc = 0;
    for (var i = 0; i < bytes.length; i++) {
      acc = (acc << 8) | bytes[i];
      bits += 8;
      while (bits >= 5) {
        bits -= 5;
        s += CROCKFORD[(acc >>> bits) & 31];
      }
    }
    if (bits > 0) s += CROCKFORD[(acc << (5 - bits)) & 31];
    return s.slice(0, len);
  }

  function ulid() {
    var now = Date.now();
    if (now > 0xFFFFFFFFFFFF) throw new Error('Timestamp overflow');
    return encodeTime(now, 10) + encodeRandom(16);
  }

  function generate() {
    clear();
    var count = parseInt(el(SLUG + '-count').value, 10);
    if (!count || count < 1 || count > 500) { fail('Enter a count between 1 and 500.'); return; }
    var out = [];
    for (var i = 0; i < count; i++) out.push(ulid());
    el(SLUG + '-output').value = out.join('\n');
  }

  try {
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate ULIDs first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate ULIDs first.'); return; }
      TN.downloadText(v, 'ulids.txt', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
