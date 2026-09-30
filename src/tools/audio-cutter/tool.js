/* Audio Cutter — decode, slice an AudioBuffer, preview, encode selection to MP3 with lamejs */
(function () {
  'use strict';
  var SLUG = 'audio-cutter';
  var file = null;
  var audioBuf = null;
  var busy = false;
  var previewNodes = null;

  function AC() { return window.AudioContext || window.webkitAudioContext; }

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
  function fmtTime(s) {
    s = Math.max(0, s);
    var m = Math.floor(s / 60), sec = s - m * 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec.toFixed(1);
  }

  function stopPreview() {
    if (previewNodes) {
      try { previewNodes.src.stop(); } catch (e) {}
      try { previewNodes.ctx.close(); } catch (e2) {}
      previewNodes = null;
    }
  }

  function sliceBuffer(ab, start, end) {
    var Ctor = AC();
    var tmp = new Ctor();
    try {
      var sr = ab.sampleRate, ch = ab.numberOfChannels;
      var s0 = Math.max(0, Math.floor(start * sr));
      var s1 = Math.min(ab.length, Math.ceil(end * sr));
      var out = tmp.createBuffer(ch, Math.max(1, s1 - s0), sr);
      for (var c = 0; c < ch; c++) {
        out.getChannelData(c).set(ab.getChannelData(c).subarray(s0, s1));
      }
      return out;
    } finally {
      try { tmp.close(); } catch (e) {}
    }
  }

  function encodeMp3(ab, onTick) {
    return new Promise(function (resolve, reject) {
      try {
        var ch = Math.min(ab.numberOfChannels, 2);
        var enc = new lamejs.Mp3Encoder(ch, ab.sampleRate, 128);
        var len = ab.length;
        var left = ab.getChannelData(0);
        var right = ch > 1 ? ab.getChannelData(1) : null;
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
            if (i < len) { setTimeout(step, 0); }
            else {
              var end = enc.flush();
              if (end.length) parts.push(new Uint8Array(end));
              resolve(new Blob(parts, { type: 'audio/mpeg' }));
            }
          } catch (e) { reject(e); }
        })();
      } catch (e) { reject(e); }
    });
  }

  function readTimes() {
    var startEl = TN.el(SLUG + '-start'), endEl = TN.el(SLUG + '-end');
    var start = parseFloat(startEl && startEl.value);
    var end = parseFloat(endEl && endEl.value);
    if (isNaN(start)) start = 0;
    if (isNaN(end)) end = 0;
    return { start: start, end: end };
  }

  function validate() {
    if (!audioBuf) { TN.setErr(SLUG + '-error', 'Choose an audio file first.'); return null; }
    var t = readTimes();
    var dur = audioBuf.duration;
    if (t.start < 0 || t.end < 0) { TN.setErr(SLUG + '-error', 'Start and end times cannot be negative.'); return null; }
    if (!(t.start < t.end)) { TN.setErr(SLUG + '-error', 'Start time must be before the end time.'); return null; }
    if (t.end > dur) { TN.setErr(SLUG + '-error', 'End time is past the end of the audio (' + fmtTime(dur) + ').'); return null; }
    TN.clearErr(SLUG + '-error');
    return t;
  }

  TN.on(SLUG + '-file', 'change', function () {
    var el = TN.el(SLUG + '-file');
    file = el && el.files && el.files[0] ? el.files[0] : null;
    audioBuf = null;
    stopPreview();
    TN.clearErr(SLUG + '-error');
    TN.hide(SLUG + '-times');
    setStatus('');
    if (!file) return;
    var Ctor = AC();
    if (!Ctor) {
      TN.setErr(SLUG + '-error', 'Your browser does not support Web Audio, which is needed to process audio files.');
      return;
    }
    if (typeof lamejs === 'undefined') {
      TN.setErr(SLUG + '-error', 'The MP3 encoder library failed to load. Check your internet connection and reload the page.');
      return;
    }
    setStatus('Decoding audio\u2026');
    var actx = new Ctor();
    TN.readAsArrayBuffer(file).then(function (buf) {
      return actx.decodeAudioData(buf);
    }).then(function (ab) {
      audioBuf = ab;
      var durEl = TN.el(SLUG + '-duration');
      if (durEl) durEl.textContent = fmtTime(ab.duration) + ' (' + ab.duration.toFixed(1) + ' s)';
      var sEl = TN.el(SLUG + '-start'), eEl = TN.el(SLUG + '-end');
      if (sEl) sEl.value = 0;
      if (eEl) { eEl.value = ab.duration.toFixed(1); eEl.max = ab.duration.toFixed(1); }
      TN.show(SLUG + '-times');
      setStatus('Ready — set your start and end times.');
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Could not decode this file. It may be corrupt or use an audio format your browser cannot read.');
      setStatus('');
    }).then(function () {
      try { actx.close(); } catch (e) {}
    });
  });

  TN.on(SLUG + '-preview', 'click', function () {
    var t = validate();
    if (!t) return;
    stopPreview();
    var Ctor = AC();
    if (!Ctor) return;
    try {
      var ctx = new Ctor();
      var sliced = sliceBuffer(audioBuf, t.start, t.end);
      var src = ctx.createBufferSource();
      src.buffer = sliced;
      src.connect(ctx.destination);
      src.onended = function () { stopPreview(); };
      if (ctx.resume) ctx.resume();
      src.start();
      previewNodes = { src: src, ctx: ctx };
      setStatus('Previewing ' + fmtTime(t.start) + ' \u2192 ' + fmtTime(t.end) + '\u2026');
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Preview failed: ' + (e && e.message || e));
    }
  });

  TN.on(SLUG + '-cut', 'click', function () {
    if (busy) return;
    var t = validate();
    if (!t) return;
    if (typeof lamejs === 'undefined') {
      TN.setErr(SLUG + '-error', 'The MP3 encoder library failed to load. Check your internet connection and reload the page.');
      return;
    }
    stopPreview();
    busy = true;
    setProg(0.02);
    setStatus('Cutting selection\u2026');
    var sliced;
    try {
      sliced = sliceBuffer(audioBuf, t.start, t.end);
    } catch (e) {
      busy = false; setProg(0);
      TN.setErr(SLUG + '-error', 'Could not cut the audio: ' + (e && e.message || e));
      return;
    }
    encodeMp3(sliced, function (frac) {
      setProg(0.05 + frac * 0.93);
      setStatus('Encoding MP3\u2026 ' + Math.round(frac * 100) + '%');
    }).then(function (blob) {
      setProg(1);
      setStatus('Done — cut MP3 is ' + TN.fmtBytes(blob.size) + '.');
      var name = (file.name.replace(/\.[^.]+$/, '') || 'cut') + '-cut.mp3';
      TN.download(blob, name);
    }).catch(function (err) {
      TN.setErr(SLUG + '-error', 'Encoding failed: ' + ((err && err.message) || err));
      setStatus('');
    }).then(function () {
      busy = false;
      setProg(0);
    });
  });
})();
