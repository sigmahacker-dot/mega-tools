(function () {
  'use strict';
  var ERR = 'file-hash-checker-error';
  var lastHex = '';
  function fmtSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    if (n < 1073741824) return (n / 1048576).toFixed(2) + ' MB';
    return (n / 1073741824).toFixed(2) + ' GB';
  }
  function toHex(buf) {
    var bytes = new Uint8Array(buf), out = '';
    for (var i = 0; i < bytes.length; i++) {
      out += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
    }
    return out;
  }
  function checkMatch() {
    var exp = TN.el('fh-expect').value.trim().toLowerCase().replace(/[\s:]/g, '');
    var mEl = TN.el('fh-match');
    if (!lastHex) { mEl.textContent = '–'; return; }
    if (!exp) { mEl.textContent = '–'; return; }
    if (exp === lastHex.toLowerCase()) {
      mEl.textContent = '✓ MATCH';
      mEl.style.color = '#4ade80';
    } else {
      mEl.textContent = '✕ MISMATCH';
      mEl.style.color = '#f87171';
    }
  }
  function hashFile() {
    TN.clearErr(ERR);
    var files = TN.el('fh-file').files;
    if (!files || !files[0]) return;
    var file = files[0];
    if (!window.crypto || !crypto.subtle) {
      TN.setErr(ERR, 'Web Crypto is not available — use a secure (HTTPS) context.');
      return;
    }
    var algo = TN.el('fh-algo').value;
    TN.el('fh-out').value = 'Hashing...';
    TN.el('fh-size').textContent = fmtSize(file.size);
    var t0 = performance.now();
    file.arrayBuffer().then(function (buf) {
      return crypto.subtle.digest(algo, buf);
    }).then(function (digest) {
      lastHex = toHex(digest);
      TN.el('fh-out').value = lastHex;
      TN.el('fh-time').textContent = Math.round(performance.now() - t0) + ' ms';
      checkMatch();
    }).catch(function () {
      TN.el('fh-out').value = '';
      TN.setErr(ERR, 'Hashing failed for this file.');
    });
  }
  try {
    TN.on('fh-file', 'change', hashFile);
    TN.on('fh-algo', 'change', hashFile);
    TN.on('fh-expect', 'input', function () { TN.clearErr(ERR); checkMatch(); });
    TN.on('fh-copy', 'click', function () {
      if (!lastHex) { TN.setErr(ERR, 'Choose a file first.'); return; }
      TN.clearErr(ERR);
      if (TN.copy) TN.copy(lastHex);
    });
  } catch (e) { /* never throw on load */ }
})();