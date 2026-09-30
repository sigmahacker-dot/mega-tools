(function () {
  'use strict';
  var P = 'base64-encoder-decoder-';
  var mode = 'encode';
  var lastOutput = '';

  function setMode(m) {
    mode = m;
    var eBtn = TN.el(P + 'encode-mode');
    var dBtn = TN.el(P + 'decode-mode');
    if (m === 'encode') {
      eBtn.className = 'btn btn-primary btn-sm';
      dBtn.className = 'btn btn-outline btn-sm';
    } else {
      eBtn.className = 'btn btn-outline btn-sm';
      dBtn.className = 'btn btn-primary btn-sm';
    }
    TN.clearErr(P + 'error');
  }

  // UTF-8 safe base64 encode (chunked to avoid call-stack limits on large input).
  function utf8ToB64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    var CHUNK = 8192;
    for (var i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin);
  }

  // UTF-8 safe base64 decode.
  function b64ToUtf8(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); }
    return new TextDecoder().decode(bytes);
  }

  function show(text) {
    lastOutput = text;
    TN.el(P + 'output').textContent = text;
    TN.show(P + 'result');
  }

  TN.on(P + 'encode-mode', 'click', function () { setMode('encode'); });
  TN.on(P + 'decode-mode', 'click', function () { setMode('decode'); });

  TN.on(P + 'run', 'click', function () {
    var input = TN.el(P + 'input').value;
    if (!input) { TN.setErr(P + 'error', 'Enter some text first.'); return; }
    TN.clearErr(P + 'error');
    try {
      if (mode === 'encode') {
        show(utf8ToB64(input));
      } else {
        var clean = input.replace(/\s+/g, '');
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 !== 0) {
          throw new Error('Input is not valid Base64 (bad characters or length).');
        }
        show(b64ToUtf8(clean));
      }
    } catch (e) {
      TN.hide(P + 'result');
      TN.setErr(P + 'error', (mode === 'encode' ? 'Encode failed: ' : 'Decode failed: ') + (e && e.message ? e.message : e));
    }
  });

  TN.on(P + 'copy', 'click', function () {
    if (!lastOutput) { TN.setErr(P + 'error', 'Nothing to copy yet — convert first.'); return; }
    TN.clearErr(P + 'error');
    TN.copy(lastOutput).then(null, function () {
      TN.setErr(P + 'error', 'Copy failed — select the text manually.');
    });
  });

  TN.on(P + 'file', 'change', function () {
    var f = TN.el(P + 'file').files && TN.el(P + 'file').files[0];
    if (!f) return;
    TN.clearErr(P + 'error');
    TN.readAsDataURL(f).then(function (url) {
      TN.el(P + 'fileinfo').textContent = f.name + ' (' + TN.fmtBytes(f.size) + ') converted below.';
      show(url);
    }, function (e) {
      TN.setErr(P + 'error', 'Could not read file: ' + (e && e.message ? e.message : e));
    });
  });
})();
