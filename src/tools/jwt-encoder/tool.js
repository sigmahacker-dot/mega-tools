/* JWT Encoder/Decoder — real HS256 signing via WebCrypto SubtleCrypto. All client-side. */
(function () {
  'use strict';
  var SLUG = 'jwt-encoder';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function b64urlEncode(bytes) {
    var bin = '';
    var arr = new Uint8Array(bytes);
    for (var i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64urlDecode(str) {
    var s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(arr);
  }
  function utf8(str) { return new TextEncoder().encode(str); }

  function hmacKey(secret) {
    return crypto.subtle.importKey('raw', utf8(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  }

  function parseJSONField(id, label) {
    try { return JSON.parse(el(id).value); }
    catch (e) { throw new Error('Invalid ' + label + ' JSON: ' + e.message); }
  }

  function sign() {
    clear();
    var header, payload;
    try {
      header = parseJSONField(SLUG + '-header', 'header');
      payload = parseJSONField(SLUG + '-payload', 'payload');
    } catch (e) { fail(e.message); return; }
    var secret = el(SLUG + '-secret').value;
    if (!secret) { fail('Enter a secret to sign with.'); return; }
    var data = b64urlEncode(utf8(JSON.stringify(header))) + '.' + b64urlEncode(utf8(JSON.stringify(payload)));
    hmacKey(secret).then(function (key) {
      return crypto.subtle.sign('HMAC', key, utf8(data));
    }).then(function (sig) {
      el(SLUG + '-output').textContent = data + '.' + b64urlEncode(sig);
    }).catch(function (e) { fail('Signing failed: ' + e.message); });
  }

  function expiryNote(payload) {
    if (!payload || typeof payload.exp !== 'number') return 'no exp claim';
    var now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return 'EXPIRED';
    var s = payload.exp - now;
    if (s < 3600) return Math.floor(s / 60) + 'm left';
    if (s < 86400) return Math.floor(s / 3600) + 'h left';
    return Math.floor(s / 86400) + 'd left';
  }

  function decode() {
    clear();
    TN.hide(SLUG + '-result');
    var token = el(SLUG + '-token').value.trim();
    var parts = token.split('.');
    if (parts.length !== 3) { fail('Not a JWT — expected three base64url segments.'); return; }
    var header, payload;
    try {
      header = JSON.parse(b64urlDecode(parts[0]));
      payload = JSON.parse(b64urlDecode(parts[1]));
    } catch (e) { fail('Could not decode token: ' + e.message); return; }
    el(SLUG + '-dheader').textContent = JSON.stringify(header, null, 2);
    el(SLUG + '-dpayload').textContent = JSON.stringify(payload, null, 2);
    el(SLUG + '-exp').textContent = expiryNote(payload);
    var secret = el(SLUG + '-secret').value;
    if (!secret) {
      el(SLUG + '-valid').textContent = 'not checked';
      TN.show(SLUG + '-result');
      return;
    }
    var data = parts[0] + '.' + parts[1];
    var sigBytes;
    try { sigBytes = (function () {
      var s = parts[2].replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      var bin = atob(s), arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return arr;
    })(); } catch (e) { fail('Bad signature encoding: ' + e.message); return; }
    hmacKey(secret).then(function (key) {
      return crypto.subtle.verify('HMAC', key, sigBytes, utf8(data));
    }).then(function (ok) {
      el(SLUG + '-valid').textContent = ok ? 'VALID ✓' : 'INVALID ✗';
      TN.show(SLUG + '-result');
    }).catch(function (e) { fail('Verification failed: ' + e.message); });
  }

  try {
    TN.on(SLUG + '-sign', 'click', sign);
    TN.on(SLUG + '-decode', 'click', decode);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').textContent;
      if (!v) { fail('Sign a token first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
  } catch (e) { /* never throw on load */ }
})();
