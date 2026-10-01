(function () {
  'use strict';
  var S = 'uuid-generator';
  var last = [];
  function makeUUID() {
    var b = new Uint8Array(16);
    if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
      throw new Error('This browser does not provide a cryptographic random generator.');
    }
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40; // version 4
    b[8] = (b[8] & 0x3f) | 0x80; // variant 10xx
    var hex = '';
    for (var i = 0; i < 16; i++) hex += ('0' + b[i].toString(16)).slice(-2);
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) +
      '-' + hex.slice(16, 20) + '-' + hex.slice(20, 32);
  }
  function generate() {
    try {
      TN.clearErr(S + '-error');
      var n = parseInt(TN.el(S + '-count').value, 10);
      if (!isFinite(n) || n < 1 || n > 500) {
        TN.setErr(S + '-error', 'Please enter a whole number between 1 and 500.');
        return;
      }
      var upper = TN.el(S + '-uppercase').checked;
      var braces = TN.el(S + '-braces').checked;
      last = [];
      for (var i = 0; i < n; i++) {
        var u = makeUUID();
        if (upper) u = u.toUpperCase();
        if (braces) u = '{' + u + '}';
        last.push(u);
      }
      TN.el(S + '-output').value = last.join('\n');
      TN.el(S + '-status').textContent = n + ' UUID' + (n === 1 ? '' : 's') + ' generated.';
    } catch (e) {
      TN.setErr(S + '-error', 'Could not generate UUIDs: ' + (e && e.message ? e.message : 'unknown error'));
    }
  }
  function copyAll() {
    try {
      if (!last.length) { TN.setErr(S + '-error', 'Generate some UUIDs first.'); return; }
      TN.clearErr(S + '-error');
      TN.copy(last.join('\n')).then(function (ok) {
        TN.el(S + '-status').textContent = ok ? 'Copied ' + last.length + ' UUIDs to the clipboard.' : 'Copy failed — select the text and copy it manually.';
      });
    } catch (e) { TN.setErr(S + '-error', 'Copy failed.'); }
  }
  function download() {
    try {
      if (!last.length) { TN.setErr(S + '-error', 'Generate some UUIDs first.'); return; }
      TN.clearErr(S + '-error');
      TN.downloadText(last.join('\n'), 'uuids.txt', 'text/plain;charset=utf-8');
    } catch (e) { TN.setErr(S + '-error', 'Download failed.'); }
  }
  function init() {
    TN.on(S + '-generate', 'click', generate);
    TN.on(S + '-copy', 'click', copyAll);
    TN.on(S + '-download', 'click', download);
    TN.on(S + '-count', 'change', generate);
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
