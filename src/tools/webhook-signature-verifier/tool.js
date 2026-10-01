/* Webhook Signature Verifier — HMAC-SHA256 via SubtleCrypto, constant-time compare. */
(function () {
  'use strict';
  var SLUG = 'webhook-signature-verifier';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function hexToBytes(hex) {
    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2) throw new Error('bad hex');
    var b = new Uint8Array(hex.length / 2);
    for (var i = 0; i < b.length; i++) b[i] = parseInt(hex.substr(i * 2, 2), 16);
    return b;
  }
  function b64ToBytes(s) {
    var bin = atob(s.replace(/\s/g, ''));
    var b = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    return b;
  }
  function bytesToHex(b) {
    var s = '';
    for (var i = 0; i < b.length; i++) s += ('0' + b[i].toString(16)).slice(-2);
    return s;
  }
  function constantTimeEqual(a, b) {
    if (a.length !== b.length) return false;
    var d = 0;
    for (var i = 0; i < a.length; i++) d |= a[i] ^ b[i];
    return d === 0;
  }

  function verify() {
    clear();
    TN.hide(SLUG + '-result');
    var payload = el(SLUG + '-payload').value;
    var secret = el(SLUG + '-secret').value;
    var sigRaw = el(SLUG + '-sig').value.trim();
    var format = el(SLUG + '-format').value;
    if (!payload) { fail('Paste the raw payload.'); return; }
    if (!secret) { fail('Enter the webhook secret.'); return; }
    if (!sigRaw) { fail('Paste the signature.'); return; }
    var sigText = sigRaw;
    try {
      if (format === 'sha256hex') {
        if (sigText.toLowerCase().indexOf('sha256=') === 0) sigText = sigText.slice(7);
      } else if (format === 'stripe') {
        var m = sigText.match(/v1=([0-9a-fA-F]+)/);
        if (!m) { fail('Could not find v1= in the Stripe-style header.'); return; }
        sigText = m[1];
      }
      var sigBytes = format === 'base64' ? b64ToBytes(sigText) : hexToBytes(sigText);
      var enc = new TextEncoder();
      crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
        .then(function (key) { return crypto.subtle.sign('HMAC', key, enc.encode(payload)); })
        .then(function (mac) {
          var macBytes = new Uint8Array(mac);
          el(SLUG + '-expected').value = bytesToHex(macBytes);
          var ok = constantTimeEqual(macBytes, sigBytes);
          el(SLUG + '-verdict').textContent = ok ? '✓ VALID' : '✗ INVALID';
          el(SLUG + '-verdict').style.color = ok ? '#4ade80' : '#f87171';
          TN.show(SLUG + '-result');
        })
        .catch(function () { fail('Verification failed — check the inputs and try again.'); });
    } catch (e) {
      fail('Could not parse the signature — check the format selection.');
    }
  }

  try {
    if (!el(SLUG + '-verify')) return;
    TN.on(SLUG + '-verify', 'click', verify);
  } catch (e) { /* never throw on load */ }
})();
