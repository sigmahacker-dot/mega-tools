/* AES Text Encryptor — WebCrypto PBKDF2(100k, SHA-256) -> AES-256-GCM. */
(function () {
  'use strict';

  var SLUG = 'aes-text-encryptor';
  var ITERS = 100000;
  var SALT_LEN = 16;
  var IV_LEN = 12;

  function errId() { return SLUG + '-error'; }

  function b64encode(bytes) {
    var bin = '';
    var u8 = new Uint8Array(bytes);
    for (var i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    return btoa(bin);
  }

  function b64decode(s) {
    var bin = atob(s);
    var u8 = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }

  function cryptoOk() {
    return typeof window !== 'undefined' && window.crypto && window.crypto.subtle
      && typeof TextEncoder !== 'undefined';
  }

  function deriveKey(password, salt) {
    var enc = new TextEncoder();
    return window.crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return window.crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: salt, iterations: ITERS, hash: 'SHA-256' },
          base,
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt', 'decrypt']
        );
      });
  }

  function setBusy(busy) {
    var btn = TN.el(SLUG + '-run');
    if (btn) btn.disabled = busy;
  }

  function run() {
    TN.clearErr(errId());
    if (!cryptoOk()) {
      TN.setErr(errId(), 'WebCrypto is not available in this browser. Use a modern browser over HTTPS or localhost.');
      return;
    }
    var modeEl = TN.el(SLUG + '-mode');
    var mode = modeEl ? modeEl.value : 'encrypt';
    var pwEl = TN.el(SLUG + '-password');
    var inEl = TN.el(SLUG + '-input');
    var outEl = TN.el(SLUG + '-output');
    var password = pwEl ? pwEl.value : '';
    var input = inEl ? inEl.value : '';
    if (!password) { TN.setErr(errId(), 'Please enter a password.'); return; }
    if (!input) { TN.setErr(errId(), mode === 'encrypt' ? 'Please enter text to encrypt.' : 'Please paste the encrypted Base64 string.'); return; }

    setBusy(true);
    (async function () {
      try {
        if (mode === 'encrypt') {
          var salt = window.crypto.getRandomValues(new Uint8Array(SALT_LEN));
          var iv = window.crypto.getRandomValues(new Uint8Array(IV_LEN));
          var key = await deriveKey(password, salt);
          var ct = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            new TextEncoder().encode(input)
          );
          var packed = new Uint8Array(SALT_LEN + IV_LEN + ct.byteLength);
          packed.set(salt, 0);
          packed.set(iv, SALT_LEN);
          packed.set(new Uint8Array(ct), SALT_LEN + IV_LEN);
          if (outEl) outEl.value = b64encode(packed);
        } else {
          var raw;
          try {
            raw = b64decode(input.trim());
          } catch (e) {
            throw new Error('bad-base64');
          }
          if (raw.length < SALT_LEN + IV_LEN + 1) throw new Error('bad-format');
          var salt2 = raw.slice(0, SALT_LEN);
          var iv2 = raw.slice(SALT_LEN, SALT_LEN + IV_LEN);
          var ct2 = raw.slice(SALT_LEN + IV_LEN);
          var key2 = await deriveKey(password, salt2);
          var pt;
          try {
            pt = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv2 }, key2, ct2);
          } catch (e) {
            throw new Error('wrong-password');
          }
          if (outEl) outEl.value = new TextDecoder().decode(pt);
        }
      } catch (e) {
        var msg = e && e.message;
        if (msg === 'wrong-password') TN.setErr(errId(), 'Decryption failed — wrong password or corrupted data.');
        else if (msg === 'bad-base64') TN.setErr(errId(), 'Invalid Base64 input. Paste the exact encrypted string.');
        else if (msg === 'bad-format') TN.setErr(errId(), 'This does not look like output from this tool (too short).');
        else TN.setErr(errId(), 'Operation failed: ' + (msg || 'unknown error.'));
      } finally {
        setBusy(false);
      }
    })();
  }

  function copy() {
    var out = TN.el(SLUG + '-output');
    if (!out || !out.value) { TN.setErr(errId(), 'Nothing to copy yet.'); return; }
    TN.clearErr(errId());
    TN.copy(out.value).then(function (ok) {
      if (!ok) TN.setErr(errId(), 'Copy failed — select the text manually and press Ctrl+C.');
    });
  }

  function clear() {
    TN.clearErr(errId());
    ['password', 'input', 'output'].forEach(function (k) {
      var e = TN.el(SLUG + '-' + k);
      if (e) e.value = '';
    });
  }

  function syncMode() {
    var modeEl = TN.el(SLUG + '-mode');
    var mode = modeEl ? modeEl.value : 'encrypt';
    var runBtn = TN.el(SLUG + '-run');
    var inLabel = TN.el(SLUG + '-input-label');
    var inEl = TN.el(SLUG + '-input');
    if (runBtn) runBtn.textContent = mode === 'encrypt' ? 'Encrypt' : 'Decrypt';
    if (inLabel) inLabel.textContent = mode === 'encrypt' ? 'Plain text' : 'Encrypted Base64';
    if (inEl) inEl.placeholder = mode === 'encrypt' ? 'Text to encrypt...' : 'Paste the encrypted Base64 string...';
    var outEl = TN.el(SLUG + '-output');
    if (outEl) outEl.value = '';
    TN.clearErr(errId());
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var r = TN.el(SLUG + '-run');
      if (r) TN.on(r, 'click', run);
      var c = TN.el(SLUG + '-clear');
      if (c) TN.on(c, 'click', clear);
      var cp = TN.el(SLUG + '-copy');
      if (cp) TN.on(cp, 'click', copy);
      var m = TN.el(SLUG + '-mode');
      if (m) TN.on(m, 'change', syncMode);
      syncMode();
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();