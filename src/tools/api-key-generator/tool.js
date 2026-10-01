/* API Key Generator — crypto.getRandomValues keys in hex/base64/base64url/uuid formats. */
(function () {
  'use strict';
  var SLUG = 'api-key-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function randBytes(n) {
    var b = new Uint8Array(n);
    crypto.getRandomValues(b);
    return b;
  }
  function toHex(b) {
    var s = '';
    for (var i = 0; i < b.length; i++) s += ('0' + b[i].toString(16)).slice(-2);
    return s;
  }
  function toB64(b, urlsafe) {
    var bin = '';
    for (var i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]);
    var s = btoa(bin);
    if (urlsafe) s = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return s;
  }
  function uuid() {
    var b = randBytes(16);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    var h = toHex(b);
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }

  function generate() {
    clear();
    var format = el(SLUG + '-format').value;
    var n = Math.max(8, Math.min(128, parseInt(el(SLUG + '-bytes').value, 10) || 32));
    var count = Math.max(1, Math.min(20, parseInt(el(SLUG + '-count').value, 10) || 1));
    var prefix = el(SLUG + '-prefix').value;
    var out = [];
    for (var i = 0; i < count; i++) {
      var k = format === 'uuid' ? uuid()
        : format === 'base64' ? toB64(randBytes(n), false)
        : format === 'base64url' ? toB64(randBytes(n), true)
        : toHex(randBytes(n));
      out.push(prefix + k);
    }
    el(SLUG + '-output').value = out.join('\n') + '\n';
  }

  try {
    if (!el(SLUG + '-generate')) return;
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate keys first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate keys first.'); return; }
      TN.downloadText(v, 'api-keys.txt', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
