/* Ringtone Maker — trim + fades, preview, WAV (always) / MP3 (lamejs) download. */
(function () {
  'use strict';
  var SLUG = 'ringtone-maker';
  var ERR = SLUG + '-error';
  var audioBuf = null, fileName = 'ringtone';
  var actx = null, previewSrc = null;

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function gv(id) {
    var el = document.getElementById(SLUG + '-' + id);
    return el ? parseFloat(el.value) || 0 : 0;
  }

  function buildRingtone() {
    // returns a new AudioBuffer: trimmed + fades applied
    var Ctor = AC();
    if (!Ctor) throw new Error('Your browser does not support Web Audio.');
    if (!audioBuf) throw new Error('Choose an audio file first.');
    var sr = audioBuf.sampleRate;
    var start = Math.max(0, gv('start'));
    var end = Math.max(start + 0.1, gv('end'));
    end = Math.min(end, audioBuf.duration);
    var fi = Math.min(gv('fadein'), (end - start) / 2);
    var fo = Math.min(gv('fadeout'), (end - start) / 2);
    var len = Math.max(1, Math.floor((end - start) * sr));
    var ch = Math.min(audioBuf.numberOfChannels, 2);
    var tmp = new Ctor();
    var out = tmp.createBuffer(ch, len, sr);
    for (var c = 0; c < ch; c++) {
      var src = audioBuf.getChannelData(c);
      var dst = out.getChannelData(c);
      var off = Math.floor(start * sr);
      for (var i = 0; i < len; i++) {
        var t = i / sr, s = src[off + i] || 0;
        var g = 1;
        if (t < fi) g = t / fi;
        var remain = (end - start) - t;
        if (remain < fo) g = Math.min(g, Math.max(0, remain / fo));
        dst[i] = s * g;
      }
    }
    try { tmp.close(); } catch (e) {}
    return out;
  }

  function encodeWav(ab) {
    var ch = Math.min(ab.numberOfChannels, 2), sr = ab.sampleRate, len = ab.length;
    var bytes = 44 + len * ch * 2;
    var buf = new ArrayBuffer(bytes), v = new DataView(buf);
    function ws(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    ws(0, 'RIFF'); v.setUint32(4, bytes - 8, true); ws(8, 'WAVE'); ws(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true);
    v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, len * ch * 2, true);
    var chans = [];
    for (var c = 0; c < ch; c++) chans.push(ab.getChannelData(c));
    var off = 44;
    for (var i = 0; i < len; i++) {
      for (var cc = 0; cc < ch; cc++) {
        var s = Math.max(-1, Math.min(1, chans[cc][i]));
        v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        off += 2;
      }
    }
    return new Blob([buf], { type: 'audio/wav' });
  }

  function encodeMp3(ab) {
    return new Promise(function (res, rej) {
      try {
        if (typeof lamejs === 'undefined') { rej(new Error('mp3lib')); return; }
        var ch = Math.min(ab.numberOfChannels, 2);
        var enc = new lamejs.Mp3Encoder(ch, ab.sampleRate, 128);
        var left = ab.getChannelData(0);
        var right = ch > 1 ? ab.getChannelData(1) : null;
        var parts = [];
        var CHUNK = 1152 * 64, i = 0, len = ab.length;
        (function step() {
          try {
            if (i >= len) {
              var end = enc.flush();
              if (end.length) parts.push(new Int8Array(end));
              res(new Blob(parts, { type: 'audio/mpeg' }));
              return;
            }
            var n = Math.min(CHUNK, len - i);
            var l16 = new Int16Array(n), r16 = new Int16Array(n);
            for (var k = 0; k < n; k++) {
              var a = Math.max(-1, Math.min(1, left[i + k]));
              l16[k] = a < 0 ? a * 0x8000 : a * 0x7FFF;
              if (right) {
                var b2 = Math.max(-1, Math.min(1, right[i + k]));
                r16[k] = b2 < 0 ? b2 * 0x8000 : b2 * 0x7FFF;
              }
            }
            var data = ch > 1 ? enc.encodeBuffer(l16, r16) : enc.encodeBuffer(l16);
            if (data.length) parts.push(new Int8Array(data));
            i += n;
            setTimeout(step, 0);
          } catch (e) { rej(e); }
        })();
      } catch (e) { rej(e); }
    });
  }

  function stopPreview() {
    try { if (previewSrc) previewSrc.stop(); } catch (e) {}
    previewSrc = null;
  }

  try {
    if (!document.getElementById(SLUG + '-file')) return;
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      stopPreview();
      audioBuf = null;
      if (!f) return;
      TN.clearErr(ERR);
      fileName = (f.name || 'ringtone').replace(/\.[^.]+$/, '') || 'ringtone';
      var Ctor = AC();
      if (!Ctor) { TN.setErr(ERR, 'Your browser does not support Web Audio.'); return; }
      var tmp = new Ctor();
      TN.readAsArrayBuffer(f).then(function (b) { return tmp.decodeAudioData(b); }).then(function (ab) {
        audioBuf = ab;
        try { tmp.close(); } catch (e) {}
        var dur = ab.duration;
        var st = document.getElementById(SLUG + '-start');
        var en = document.getElementById(SLUG + '-end');
        st.max = dur.toFixed(1); st.value = 0;
        en.max = dur.toFixed(1); en.value = Math.min(30, dur).toFixed(1);
        document.getElementById(SLUG + '-start-val').textContent = '0.0';
        document.getElementById(SLUG + '-end-val').textContent = Math.min(30, dur).toFixed(1);
        document.getElementById(SLUG + '-info').textContent =
          'Loaded: ' + dur.toFixed(1) + 's · ' + ab.numberOfChannels + ' ch · ' + ab.sampleRate + ' Hz';
        TN.clearErr(ERR);
      }).catch(function () {
        try { tmp.close(); } catch (e2) {}
        TN.setErr(ERR, 'Could not decode this file. It may use a format your browser cannot read.');
      });
    });

    [['start', 's'], ['end', 's'], ['fadein', 's'], ['fadeout', 's']].forEach(function (k) {
      TN.on(SLUG + '-' + k[0], 'input', function () {
        var v = document.getElementById(SLUG + '-' + k[0] + '-val');
        if (v) v.textContent = parseFloat(this.value).toFixed(1);
        stopPreview();
      });
    });

    TN.on(SLUG + '-preview', 'click', function () {
      TN.clearErr(ERR);
      stopPreview();
      var ring;
      try { ring = buildRingtone(); }
      catch (e) { TN.setErr(ERR, e.message); return; }
      var Ctor = AC();
      actx = actx || new Ctor();
      if (actx.state === 'suspended') actx.resume();
      previewSrc = actx.createBufferSource();
      previewSrc.buffer = ring;
      previewSrc.connect(actx.destination);
      previewSrc.start();
    });

    TN.on(SLUG + '-wav', 'click', function () {
      TN.clearErr(ERR);
      var ring;
      try { ring = buildRingtone(); }
      catch (e) { TN.setErr(ERR, e.message); return; }
      TN.download(encodeWav(ring), fileName + '-ringtone.wav');
    });

    TN.on(SLUG + '-mp3', 'click', function () {
      TN.clearErr(ERR);
      if (typeof lamejs === 'undefined') {
        TN.setErr(ERR, 'The MP3 encoder failed to load from the CDN. Download as WAV instead, or reload the page.');
        return;
      }
      var ring;
      try { ring = buildRingtone(); }
      catch (e) { TN.setErr(ERR, e.message); return; }
      var btn = document.getElementById(SLUG + '-mp3');
      if (btn) btn.disabled = true;
      encodeMp3(ring).then(function (blob) {
        TN.download(blob, fileName + '-ringtone.mp3');
      }).catch(function () {
        TN.setErr(ERR, 'MP3 encoding failed. Try WAV instead.');
      }).then(function () { if (btn) btn.disabled = false; });
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
