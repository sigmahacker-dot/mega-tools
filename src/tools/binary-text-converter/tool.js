(function () {
  'use strict';
  var P = 'binary-text-converter-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function bytesFromStr(s, chunk, radix) {
    var arr = new Uint8Array(s.length / chunk);
    for (var i = 0; i < arr.length; i++) arr[i] = parseInt(s.substr(i * chunk, chunk), radix);
    return arr;
  }
  function decodeBytes(arr) {
    try { return new TextDecoder('utf-8', { fatal: true }).decode(arr); }
    catch (e) { throw new Error('Those bytes are not valid UTF-8 text.'); }
  }
  function convert() {
    var modeEl = g('mode'), inEl = g('in'), outEl = g('out');
    if (!modeEl || !inEl || !outEl) return;
    TN.clearErr(ERR);
    var mode = modeEl.value, inp = inEl.value, out = '';
    try {
      if (mode === 't2b' || mode === 't2h') {
        var bytes = new TextEncoder().encode(inp), parts = [];
        for (var i = 0; i < bytes.length; i++) {
          parts.push(mode === 't2b'
            ? ('0000000' + bytes[i].toString(2)).slice(-8)
            : ('0' + bytes[i].toString(16)).slice(-2));
        }
        out = parts.join(' ');
      } else if (mode === 'b2t') {
        var bits = inp.replace(/\s+/g, '');
        if (bits && !/^[01]+$/.test(bits)) throw new Error('Binary input may only contain the digits 0 and 1.');
        if (bits.length % 8 !== 0) throw new Error('Binary length must be a multiple of 8 — found ' + bits.length + ' bits.');
        out = decodeBytes(bytesFromStr(bits, 8, 2));
      } else {
        var hex = inp.replace(/\s+/g, '');
        if (hex && !/^[0-9a-fA-F]+$/.test(hex)) throw new Error('Hex input may only contain digits 0–9 and letters A–F.');
        if (hex.length % 2 !== 0) throw new Error('Hex length must be even — found ' + hex.length + ' characters.');
        out = decodeBytes(bytesFromStr(hex, 2, 16));
      }
      outEl.value = out;
    } catch (e) {
      outEl.value = '';
      TN.setErr(ERR, e && e.message ? e.message : 'Conversion failed.');
    }
  }
  function swap() {
    var modeEl = g('mode'), inEl = g('in'), outEl = g('out');
    if (!modeEl || !inEl) return;
    var map = { t2b: 'b2t', b2t: 't2b', t2h: 'h2t', h2t: 't2h' };
    modeEl.value = map[modeEl.value] || 't2b';
    inEl.value = outEl ? outEl.value : '';
    convert();
  }
  try {
    TN.on(P + 'mode', 'change', convert);
    TN.on(P + 'in', 'input', convert);
    TN.on(P + 'copy', 'click', function () { var o = g('out'); if (o && o.value) TN.copy(o.value); });
    TN.on(P + 'swap', 'click', swap);
  } catch (e) { /* never throw on load */ }
})();
