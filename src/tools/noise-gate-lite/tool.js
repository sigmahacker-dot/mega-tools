/* Noise Gate Lite — offline threshold gate with attack/release smoothing. */
(function () {
  'use strict';
  var SLUG = 'noise-gate-lite';
  var ERR = SLUG + '-error';
  var audioBuf = null, fileName = 'audio';
  var outBuf = null;
  var actx = null, playSrc = null;
  var busy = false;

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function go() {
    if (busy) return;
    TN.clearErr(ERR);
    if (!audioBuf) { TN.setErr(ERR, 'Choose an audio file first.'); return; }
    var thrDb = parseFloat(document.getElementById(SLUG + '-thr').value);
    var atkMs = parseFloat(document.getElementById(SLUG + '-attack').value);
    var relMs = parseFloat(document.getElementById(SLUG + '-release').value);
    var thr = Math.pow(10, thrDb / 20);
    var sr = audioBuf.sampleRate;
    // smoothing coefficients: one-pole, per-sample
    var atkC = Math.exp(-1 / (atkMs * sr / 1000));
    var relC = Math.exp(-1 / (relMs * sr / 1000));

    busy = true;
    var btn = document.getElementById(SLUG + '-go');
    if (btn) btn.disabled = true;
    var res = document.getElementById(SLUG + '-result');
    if (res) res.classList.add('hidden');
    outBuf = null;

    setTimeout(function () {
      try {
        var Ctor = AC();
        var tmp = new Ctor();
        var ch = Math.min(audioBuf.numberOfChannels, 2);
        var len = audioBuf.length;
        outBuf = tmp.createBuffer(ch, len, sr);
        var gated = 0, total = len * ch;
        var noiseAcc = 0, noiseN = 0;
        for (var c = 0; c < ch; c++) {
          var src = audioBuf.getChannelData(c);
          var dst = outBuf.getChannelData(c);
          var env = 0, gain = 0;
          for (var i = 0; i < len; i++) {
            var x = Math.abs(src[i]);
            // envelope follower
            var coef = x > env ? atkC : relC;
            env = coef * env + (1 - coef) * x;
            // gate target with a little hysteresis
            var target = env > thr ? 1 : 0;
            var gcoef = target > gain ? atkC : relC;
            gain = gcoef * gain + (1 - gcoef) * target;
            dst[i] = src[i] * gain;
            if (gain < 0.5) gated++;
            if (env < thr && env > 1e-6) { noiseAcc += env; noiseN++; }
          }
        }
        try { tmp.close(); } catch (e) {}
        document.getElementById(SLUG + '-gated').textContent = (gated / total * 100).toFixed(1) + '%';
        document.getElementById(SLUG + '-noise').textContent =
          noiseN ? (20 * Math.log10(noiseAcc / noiseN)).toFixed(1) + ' dB' : '—';
        res.classList.remove('hidden');
      } catch (e) {
        TN.setErr(ERR, 'Gating failed: ' + (e && e.message || e));
      }
      busy = false;
      if (btn) btn.disabled = false;
    }, 30);
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

  function stopPlay() {
    try { if (playSrc) playSrc.stop(); } catch (e) {}
    playSrc = null;
  }

  try {
    if (!document.getElementById(SLUG + '-go')) return;
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      stopPlay();
      audioBuf = null; outBuf = null;
      document.getElementById(SLUG + '-result').classList.add('hidden');
      if (!f) return;
      TN.clearErr(ERR);
      fileName = (f.name || 'audio').replace(/\.[^.]+$/, '') || 'audio';
      var Ctor = AC();
      if (!Ctor) { TN.setErr(ERR, 'Your browser does not support Web Audio.'); return; }
      var tmp = new Ctor();
      TN.readAsArrayBuffer(f).then(function (b) { return tmp.decodeAudioData(b); }).then(function (ab) {
        audioBuf = ab;
        try { tmp.close(); } catch (e) {}
      }).catch(function () {
        try { tmp.close(); } catch (e2) {}
        TN.setErr(ERR, 'Could not decode this file. It may use a format your browser cannot read.');
      });
    });
    [['thr', ' dB', true], ['attack', ' ms'], ['release', ' ms']].forEach(function (k) {
      TN.on(SLUG + '-' + k[0], 'input', function () {
        var el = document.getElementById(SLUG + '-' + k[0] + '-val');
        if (el) el.textContent = (k[2] ? '−' + Math.abs(parseFloat(this.value)) : this.value);
      });
    });
    TN.on(SLUG + '-go', 'click', go);
    TN.on(SLUG + '-play', 'click', function () {
      if (!outBuf) return;
      stopPlay();
      var Ctor = AC();
      actx = actx || new Ctor();
      if (actx.state === 'suspended') actx.resume();
      playSrc = actx.createBufferSource();
      playSrc.buffer = outBuf;
      playSrc.connect(actx.destination);
      playSrc.start();
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!outBuf) return;
      TN.download(encodeWav(outBuf), fileName + '-gated.wav');
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
