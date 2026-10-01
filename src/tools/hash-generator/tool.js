/* Hash Generator — SHA-256/384/512 via WebCrypto, MD5 + SHA-1 via embedded pure JS. */
(function () {
  'use strict';

  var SLUG = 'hash-generator';

  function errId() { return SLUG + '-error'; }
  function set(id, v) { var e = TN.el(id); if (e) e.textContent = v; }

  function add32(x, y) {
    var l = (x & 0xffff) + (y & 0xffff);
    var m = (x >> 16) + (y >> 16) + (l >> 16);
    return (m << 16) | (l & 0xffff);
  }
  function rotl(v, n) { return (v << n) | (v >>> (32 - n)); }
  function hx(v) { return ('00000000' + (v >>> 0).toString(16)).slice(-8); }

  // MD5 (RFC 1321) over a Uint8Array. T[i] computed from the sine definition.
  function md5bytes(msg) {
    var s0 = 0x67452301, s1 = 0xefcdab89, s2 = 0x98badcfe, s3 = 0x10325476;
    var ml = msg.length;
    var newLen = ml + 1;
    while (newLen % 64 !== 56) newLen++;
    var buf = new Uint8Array(newLen + 8);
    buf.set(msg);
    buf[ml] = 0x80;
    var dv = new DataView(buf.buffer);
    dv.setUint32(newLen, (ml * 8) >>> 0, true);
    dv.setUint32(newLen + 4, Math.floor((ml * 8) / 4294967296) >>> 0, true);
    var SHIFTS = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    var x = new Array(16);
    for (var off = 0; off < newLen + 8; off += 64) {
      for (var i = 0; i < 16; i++) x[i] = dv.getUint32(off + i * 4, true);
      var a = s0, b = s1, c = s2, d = s3;
      for (i = 0; i < 64; i++) {
        var r = i >> 4, f, k;
        if (r === 0) { f = (b & c) | (~b & d); k = i; }
        else if (r === 1) { f = (b & d) | (c & ~d); k = (1 + 5 * i) % 16; }
        else if (r === 2) { f = b ^ c ^ d; k = (5 + 3 * i) % 16; }
        else { f = c ^ (b | ~d); k = (7 * i) % 16; }
        var t = add32(add32(a, f), add32(x[k], Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296)));
        var nb = add32(b, rotl(t, SHIFTS[(r << 2) + (i & 3)]));
        a = d; d = c; c = b; b = nb;
      }
      s0 = add32(s0, a); s1 = add32(s1, b); s2 = add32(s2, c); s3 = add32(s3, d);
    }
    // MD5 digest = state words serialized little-endian, then hex.
    function lehex(v) {
      v = v >>> 0;
      var s = '';
      for (var j = 0; j < 4; j++) s += ('0' + ((v >>> (j * 8)) & 0xff).toString(16)).slice(-2);
      return s;
    }
    return lehex(s0) + lehex(s1) + lehex(s2) + lehex(s3);
  }

  // SHA-1 (FIPS 180-4) over a Uint8Array.
  function sha1bytes(msg) {
    var h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
    var ml = msg.length;
    var newLen = ml + 1;
    while (newLen % 64 !== 56) newLen++;
    var buf = new Uint8Array(newLen + 8);
    buf.set(msg);
    buf[ml] = 0x80;
    var dv = new DataView(buf.buffer);
    dv.setUint32(newLen, Math.floor((ml * 8) / 4294967296) >>> 0, false);
    dv.setUint32(newLen + 4, (ml * 8) >>> 0, false);
    var w = new Array(80);
    for (var off = 0; off < newLen + 8; off += 64) {
      for (var i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
      for (i = 16; i < 80; i++) w[i] = rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
      var a = h0, b = h1, c = h2, d = h3, e = h4;
      for (i = 0; i < 80; i++) {
        var f, k;
        if (i < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
        else if (i < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
        else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
        else { f = b ^ c ^ d; k = 0xca62c1d6; }
        var t = (rotl(a, 5) + f + e + k + w[i]) >>> 0;
        e = d; d = c; c = rotl(b, 30); b = a; a = t;
      }
      h0 = add32(h0, a); h1 = add32(h1, b); h2 = add32(h2, c); h3 = add32(h3, d); h4 = add32(h4, e);
    }
    return hx(h0) + hx(h1) + hx(h2) + hx(h3) + hx(h4);
  }

  function subtleDigest(bytes, algo) {
    return window.crypto.subtle.digest(algo, bytes).then(function (d) {
      var u8 = new Uint8Array(d);
      var s = '';
      for (var i = 0; i < u8.length; i++) s += ('0' + u8[i].toString(16)).slice(-2);
      return s;
    });
  }

  function setBusy(busy) {
    var b = TN.el(SLUG + '-run');
    if (b) b.disabled = busy;
  }

  function run() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-text');
    var fileEl = TN.el(SLUG + '-file');
    var text = ta ? ta.value : '';
    var file = fileEl && fileEl.files && fileEl.files.length ? fileEl.files[0] : null;
    if (!file && !text) {
      TN.setErr(errId(), 'Type some text or choose a file to hash.');
      return;
    }
    if (!window.crypto || !window.crypto.subtle) {
      TN.setErr(errId(), 'WebCrypto is not available in this browser. Use a modern browser over HTTPS or localhost.');
      return;
    }
    setBusy(true);
    var getBytes = file
      ? TN.readAsArrayBuffer(file).then(function (ab) { return new Uint8Array(ab); })
      : Promise.resolve(new TextEncoder().encode(text));
    getBytes.then(function (bytes) {
      return Promise.all([
        subtleDigest(bytes, 'SHA-256'),
        subtleDigest(bytes, 'SHA-384'),
        subtleDigest(bytes, 'SHA-512')
      ]).then(function (r) {
        set(SLUG + '-sha256', r[0]);
        set(SLUG + '-sha384', r[1]);
        set(SLUG + '-sha512', r[2]);
        set(SLUG + '-md5', md5bytes(bytes));
        set(SLUG + '-sha1', sha1bytes(bytes));
      });
    }).catch(function (e) {
      TN.setErr(errId(), 'Hashing failed: ' + (e && e.message ? e.message : 'could not read input.'));
    }).then(function () { setBusy(false); });
  }

  function onCopyBtn(btn) {
    var target = TN.el(btn.getAttribute('data-copy'));
    var val = target ? target.textContent : '';
    if (!val || val === '–') { TN.setErr(errId(), 'Generate hashes first.'); return; }
    TN.clearErr(errId());
    TN.copy(val).then(function (ok) {
      if (!ok) TN.setErr(errId(), 'Copy failed — select the hash manually and press Ctrl+C.');
    });
  }

  function clear() {
    TN.clearErr(errId());
    var ta = TN.el(SLUG + '-text');
    if (ta) ta.value = '';
    var f = TN.el(SLUG + '-file');
    if (f) f.value = '';
    var fn = TN.el(SLUG + '-filename');
    if (fn) fn.textContent = '';
    ['md5', 'sha1', 'sha256', 'sha384', 'sha512'].forEach(function (k) { set(SLUG + '-' + k, '–'); });
  }

  function init() {
    try {
      if (typeof TN === 'undefined') return;
      var r = TN.el(SLUG + '-run');
      if (r) TN.on(r, 'click', run);
      var c = TN.el(SLUG + '-clear');
      if (c) TN.on(c, 'click', clear);
      var f = TN.el(SLUG + '-file');
      if (f) TN.on(f, 'change', function () {
        var fn = TN.el(SLUG + '-filename');
        if (fn) fn.textContent = (f.files && f.files.length) ? f.files[0].name + ' (' + TN.fmtBytes(f.files[0].size) + ')' : '';
      });
      var btns = document.querySelectorAll('#' + SLUG + '-result button[data-copy]');
      Array.prototype.forEach.call(btns, function (b) {
        TN.on(b, 'click', function () { onCopyBtn(b); });
      });
    } catch (e) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();