/* HMAC Generator — HMAC-SHA1/256/384/512 via WebCrypto, hex/base64/base64url output. */
(function () {
  'use strict';
  var SLUG = 'hmac-generator';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function toHex(bytes) {
    var arr = new Uint8Array(bytes), out = '';
    for (var i = 0; i < arr.length; i++) {
      var h = arr[i].toString(16);
      out += h.length === 1 ? '0' + h : h;
    }
    return out;
  }
  function toB64(bytes, urlsafe) {
    var arr = new Uint8Array(bytes), bin = '';
    for (var i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
    var b = btoa(bin);
    return urlsafe ? b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b;
  }

  function generate() {
    clear();
    var msg = el(SLUG + '-message').value;
    var key = el(SLUG + '-key').value;
    if (!msg) { fail('Enter a message first.'); return; }
    if (!key) { fail('Enter a secret key first.'); return; }
    var algo = el(SLUG + '-algo').value;
    var fmt = el(SLUG + '-format').value;
    var enc = new TextEncoder();
    crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: algo }, false, ['sign'])
      .then(function (ck) { return crypto.subtle.sign('HMAC', ck, enc.encode(msg)); })
      .then(function (sig) {
        el(SLUG + '-output').textContent = fmt === 'hex' ? toHex(sig) : toB64(sig, fmt === 'base64url');
      })
      .catch(function (e) { fail('HMAC failed: ' + e.message); });
  }

  try {
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').textContent;
      if (!v) { fail('Generate an HMAC first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
  } catch (e) { /* never throw on load */ }
})();
