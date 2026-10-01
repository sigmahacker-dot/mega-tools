/* TOTP Generator — RFC 6238: base32 secret, HMAC-SHA1, 30s step, dynamic truncation.
   Client-side only. Includes verify mode (±1 window). */
(function () {
  'use strict';
  var SLUG = 'totp-generator';
  var B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  var timerId = null;

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function base32Decode(s) {
    s = s.replace(/[\s-]/g, '').toUpperCase().replace(/=+$/, '');
    if (!/^[A-Z2-7]*$/.test(s) || !s.length) throw new Error('Not valid base32.');
    var bits = '', bytes = [];
    for (var i = 0; i < s.length; i++) {
      var v = B32.indexOf(s[i]);
      var b = v.toString(2);
      while (b.length < 5) b = '0' + b;
      bits += b;
    }
    for (var j = 0; j + 8 <= bits.length; j += 8) {
      bytes.push(parseInt(bits.substr(j, 8), 2));
    }
    if (!bytes.length) throw new Error('Secret decodes to nothing.');
    return new Uint8Array(bytes);
  }

  function counterBytes(counter) {
    var b = new Uint8Array(8);
    for (var i = 7; i >= 0; i--) {
      b[i] = counter & 0xff;
      counter = Math.floor(counter / 256);
    }
    return b;
  }

  function hotp(keyBytes, counter, digits) {
    return crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
      .then(function (key) { return crypto.subtle.sign('HMAC', key, counterBytes(counter)); })
      .then(function (sig) {
        var h = new Uint8Array(sig);
        var offset = h[h.length - 1] & 0x0f;
        var code = ((h[offset] & 0x7f) << 24) | (h[offset + 1] << 16) | (h[offset + 2] << 8) | h[offset + 3];
        var s = String(code % Math.pow(10, digits));
        while (s.length < digits) s = '0' + s;
        return s;
      });
  }

  function getKey() {
    var raw = el(SLUG + '-secret').value;
    if (!raw.trim()) throw new Error('Paste a base32 secret first.');
    return base32Decode(raw);
  }

  function tick() {
    var keyBytes;
    try { keyBytes = getKey(); }
    catch (e) { stop(); fail(e.message); return; }
    clear();
    var period = parseInt(el(SLUG + '-period').value, 10);
    var digits = parseInt(el(SLUG + '-digits').value, 10);
    var now = Math.floor(Date.now() / 1000);
    var counter = Math.floor(now / period);
    var left = period - (now % period);
    hotp(keyBytes, counter, digits).then(function (code) {
      el(SLUG + '-code').textContent = code;
      el(SLUG + '-count').textContent = left + 's';
      el(SLUG + '-bar').style.width = (left / period * 100) + '%';
      el(SLUG + '-bar').style.background = left <= 5 ? '#c62828' : '#2e7d32';
      TN.show(SLUG + '-result');
    }).catch(function (e) { fail('TOTP failed: ' + e.message); });
  }

  function stop() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  function verify() {
    clear();
    var verdict = el(SLUG + '-verdict');
    verdict.textContent = '';
    var code = el(SLUG + '-verify').value.trim();
    if (!/^\d+$/.test(code)) { fail('Enter the numeric code to verify.'); return; }
    var keyBytes;
    try { keyBytes = getKey(); } catch (e) { fail(e.message); return; }
    var period = parseInt(el(SLUG + '-period').value, 10);
    var counter = Math.floor(Date.now() / 1000 / period);
    var jobs = [-1, 0, 1].map(function (d) { return hotp(keyBytes, counter + d, code.length); });
    Promise.all(jobs).then(function (codes) {
      var ok = codes.indexOf(code) >= 0;
      verdict.textContent = ok ? '✓ Valid code (within ±1 time step).' : '✗ Code does not match.';
      verdict.style.color = ok ? '#2e7d32' : '#c62828';
    }).catch(function (e) { fail('Verify failed: ' + e.message); });
  }

  try {
    var start = function () {
      stop();
      tick();
      timerId = setInterval(tick, 1000);
    };
    TN.on(SLUG + '-secret', 'input', TN.debounce(start, 400));
    TN.on(SLUG + '-digits', 'change', start);
    TN.on(SLUG + '-period', 'change', start);
    TN.on(SLUG + '-verify-btn', 'click', verify);
  } catch (e) { /* never throw on load */ }
})();
