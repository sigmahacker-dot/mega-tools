/* Audio Reverse — reverse every channel, preview, export 16-bit PCM WAV. */
(function () {
  'use strict';
  var SLUG = 'audio-reverse';
  var file = null, audioBuf = null;
  var previewNodes = null;

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function fmtTime(s) {
    s = Math.max(0, s);
    var m = Math.floor(s / 60), sec = s - m * 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec.toFixed(1);
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
    var chans = [], c;
    for (c = 0; c < ch; c++) chans.push(ab.getChannelData(c));
    var off = 44;
    for (var i = 0; i < len; i++) {
      for (c = 0; c < ch; c++) {
        var s = Math.max(-1, Math.min(1, chans[c][i]));
        v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        off += 2;
      }
    }
    return new Blob([buf], { type: 'audio/wav' });
  }

  function decode(f) {
    var Ctor = AC();
    if (!Ctor) return Promise.reject(new Error('Your browser does not support Web Audio.'));
    var actx = new Ctor();
    return TN.readAsArrayBuffer(f).then(function (b) { return actx.decodeAudioData(b); }).then(
      function (ab) { try { actx.close(); } catch (e) {} return ab; },
      function (e) { try { actx.close(); } catch (e2) {} throw e; }
    );
  }

  function reversed(ab) {
    var Ctor = AC();
    var tmp = new Ctor();
    try {
      var out = tmp.createBuffer(ab.numberOfChannels, ab.length, ab.sampleRate);
      for (var c = 0; c < ab.numberOfChannels; c++) {
        var src = ab.getChannelData(c), dst = out.getChannelData(c);
        var n = ab.length;
        for (var i = 0; i < n; i++) dst[i] = src[n - 1 - i];
      }
      return out;
    } finally {
      try { tmp.close(); } catch (e) {}
    }
  }

  function stopPreview() {
    if (previewNodes) {
      try { previewNodes.src.stop(); } catch (e) {}
      try { previewNodes.ctx.close(); } catch (e2) {}
      previewNodes = null;
    }
  }

  function loadFile(f) {
    file = f || null;
    audioBuf = null;
    stopPreview();
    TN.hide(SLUG + '-stats');
    if (!file) return;
    TN.clearErr(SLUG + '-error');
    decode(file).then(function (ab) {
      audioBuf = ab;
      TN.el(SLUG + '-duration').textContent = fmtTime(ab.duration);
      TN.show(SLUG + '-stats');
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Could not decode this file. It may be corrupt or use an audio format your browser cannot read.');
    });
  }

  function preview() {
    if (!audioBuf) { TN.setErr(SLUG + '-error', 'Choose an audio file first.'); return; }
    TN.clearErr(SLUG + '-error');
    stopPreview();
    var Ctor = AC();
    if (!Ctor) return;
    try {
      var ctx = new Ctor();
      var rev = reversed(audioBuf);
      var src = ctx.createBufferSource();
      src.buffer = rev;
      src.connect(ctx.destination);
      src.onended = function () { stopPreview(); };
      if (ctx.resume) ctx.resume();
      src.start();
      previewNodes = { src: src, ctx: ctx };
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Preview failed: ' + (e && e.message || e));
    }
  }

  function go() {
    if (!audioBuf) { TN.setErr(SLUG + '-error', 'Choose an audio file first.'); return; }
    TN.clearErr(SLUG + '-error');
    stopPreview();
    var rev = reversed(audioBuf);
    var name = (file.name.replace(/\.[^.]+$/, '') || 'audio') + '-reversed.wav';
    TN.download(encodeWav(rev), name);
  }

  var dz = TN.el(SLUG + '-drop'), input = TN.el(SLUG + '-file');
  if (dz && input) {
    dz.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) loadFile(input.files[0]);
      input.value = '';
    });
    ['dragover', 'dragenter'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
    });
  }
  TN.on(SLUG + '-preview', 'click', preview);
  TN.on(SLUG + '-go', 'click', go);
})();
