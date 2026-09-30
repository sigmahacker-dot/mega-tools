/* Video to MP3 Converter — decode with Web Audio, encode real MP3 with lamejs (128 kbps) */
(function () {
  'use strict';
  var SLUG = 'video-to-mp3';
  var file = null;
  var busy = false;

  function setStatus(t) {
    var s = TN.el(SLUG + '-status');
    if (s) s.textContent = t;
  }
  function setProg(p) {
    var bar = TN.el(SLUG + '-bar');
    if (bar) bar.style.width = Math.max(0, Math.min(100, Math.round(p * 100))) + '%';
    var pr = TN.el(SLUG + '-progress');
    if (pr) pr.classList.toggle('hidden', !(p > 0 && p < 1));
  }

  function encodeMp3(audioBuf, onTick) {
    return new Promise(function (resolve, reject) {
      try {
        var ch = Math.min(audioBuf.numberOfChannels, 2);
        var enc = new lamejs.Mp3Encoder(ch, audioBuf.sampleRate, 128);
        var len = audioBuf.length;
        var left = audioBuf.getChannelData(0);
        var right = ch > 1 ? audioBuf.getChannelData(1) : null;
        var parts = [];
        var CHUNK = 1152 * 64;
        var i = 0;
        (function step() {
          try {
            var n = Math.min(CHUNK, len - i);
            var l16 = new Int16Array(n);
            for (var k = 0; k < n; k++) {
              var s = Math.max(-1, Math.min(1, left[i + k]));
              l16[k] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            var data;
            if (right) {
              var r16 = new Int16Array(n);
              for (var k2 = 0; k2 < n; k2++) {
                var s2 = Math.max(-1, Math.min(1, right[i + k2]));
                r16[k2] = s2 < 0 ? s2 * 0x8000 : s2 * 0x7FFF;
              }
              data = enc.encodeBuffer(l16, r16);
            } else {
              data = enc.encodeBuffer(l16);
            }
            if (data.length) parts.push(new Uint8Array(data));
            i += n;
            if (onTick) onTick(i / len);
            if (i < len) {
              setTimeout(step, 0);
            } else {
              var end = enc.flush();
              if (end.length) parts.push(new Uint8Array(end));
              resolve(new Blob(parts, { type: 'audio/mpeg' }));
            }
          } catch (e) { reject(e); }
        })();
      } catch (e) { reject(e); }
    });
  }

  TN.on(SLUG + '-file', 'change', function () {
    var el = TN.el(SLUG + '-file');
    file = el && el.files && el.files[0] ? el.files[0] : null;
    TN.clearErr(SLUG + '-error');
    var btn = TN.el(SLUG + '-convert');
    if (btn) btn.disabled = !file;
    setStatus(file ? 'Selected: ' + file.name + ' (' + TN.fmtBytes(file.size) + ')' : '');
  });

  TN.on(SLUG + '-convert', 'click', function () {
    if (busy || !file) return;
    TN.clearErr(SLUG + '-error');
    if (typeof lamejs === 'undefined') {
      TN.setErr(SLUG + '-error', 'The MP3 encoder library failed to load. Check your internet connection and reload the page.');
      return;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      TN.setErr(SLUG + '-error', 'Your browser does not support Web Audio, which is needed to read the video\u2019s audio track.');
      return;
    }
    busy = true;
    var btn = TN.el(SLUG + '-convert');
    if (btn) btn.disabled = true;
    setProg(0.02);
    setStatus('Reading file\u2026');

    var actx = new AC();
    TN.readAsArrayBuffer(file).then(function (buf) {
      setStatus('Decoding audio\u2026');
      setProg(0.08);
      return actx.decodeAudioData(buf);
    }).then(function (audioBuf) {
      return encodeMp3(audioBuf, function (frac) {
        setProg(0.08 + frac * 0.9);
        setStatus('Encoding MP3\u2026 ' + Math.round(frac * 100) + '%');
      });
    }).then(function (blob) {
      try { actx.close(); } catch (e) {}
      setProg(1);
      setStatus('Done — MP3 is ' + TN.fmtBytes(blob.size) + '.');
      var name = (file.name.replace(/\.[^.]+$/, '') || 'audio') + '.mp3';
      TN.download(blob, name);
    }).catch(function (err) {
      try { actx.close(); } catch (e2) {}
      var msg = (err && err.message) || String(err);
      if (/decode/i.test(msg) || msg === '[object Object]') {
        TN.setErr(SLUG + '-error', 'Could not decode audio from this file. It may be corrupt, have no audio track, or use a format your browser cannot read.');
      } else {
        TN.setErr(SLUG + '-error', 'Conversion failed: ' + msg);
      }
      setStatus('');
    }).then(function () {
      busy = false;
      var b2 = TN.el(SLUG + '-convert');
      if (b2) b2.disabled = !file;
      setProg(0);
    });
  });
})();
