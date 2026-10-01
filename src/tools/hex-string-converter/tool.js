(function () {
  'use strict';
  var S = 'hex-string-converter';
  function byteToHex(b, upper) {
    var h = b.toString(16);
    if (h.length < 2) h = '0' + h;
    return upper ? h.toUpperCase() : h;
  }
  function textToHex(text) {
    var upper = TN.el(S + '-case').value === 'upper';
    var enc;
    try { enc = new TextEncoder().encode(text); }
    catch (e) { return null; }
    var parts = [];
    for (var i = 0; i < enc.length; i++) {
      var h = byteToHex(enc[i], upper);
      if (TN.el(S + '-prefix').value === 'all') h = '0x' + h;
      parts.push(h);
    }
    var sep = TN.el(S + '-sep').value === 'space' ? ' ' : (TN.el(S + '-sep').value === 'colon' ? ':' : '');
    var out = parts.join(sep);
    if (TN.el(S + '-prefix').value === 'single' && out.length) out = '0x' + out;
    return out;
  }
  function hexToText(hex) {
    var clean = hex.replace(/0x/gi, '').replace(/[\s:\-_,]/g, '');
    if (!/^[0-9a-fA-F]*$/.test(clean)) return { err: 'Invalid hex: only 0–9 and a–f are allowed.' };
    if (clean.length % 2 !== 0) return { err: 'Invalid hex: odd number of digits.' };
    var bytes = new Uint8Array(clean.length / 2);
    for (var i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
    try {
      return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
    } catch (e) {
      return { err: 'Invalid UTF-8 byte sequence — cannot decode.' };
    }
  }
  function convert() {
    try {
      TN.clearErr(S + '-error');
      var out = TN.el(S + '-out');
      if (!out) return;
      var input = TN.el(S + '-in').value;
      if (input === '') { out.value = ''; return; }
      if (TN.el(S + '-dir').value === 't2h') {
        var h = textToHex(input);
        out.value = h === null ? '' : h;
      } else {
        var r = hexToText(input);
        if (r.err) { TN.setErr(S + '-error', r.err); out.value = ''; }
        else out.value = r.text;
      }
    } catch (e) { /* never throw on input */ }
  }
  function init() {
    ['in', 'dir', 'prefix', 'sep', 'case'].forEach(function (k) {
      TN.on(S + '-' + k, 'input', convert);
      TN.on(S + '-' + k, 'change', convert);
    });
    TN.on(S + '-copy', 'click', function () {
      var v = TN.el(S + '-out').value;
      if (!v) return;
      TN.copy(v).then(function (ok) {
        if (ok) TN.clearErr(S + '-error');
      });
    });
    TN.on(S + '-swap', 'click', function () {
      var dir = TN.el(S + '-dir');
      dir.value = dir.value === 't2h' ? 'h2t' : 't2h';
      var inEl = TN.el(S + '-in'), outEl = TN.el(S + '-out');
      inEl.value = outEl.value;
      outEl.value = '';
      convert();
    });
    convert();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
