/* Audio Normalizer — peak normalize to target dB via OfflineAudioContext gain. */
(function () {
  'use strict';
  var SLUG = 'audio-normalizer';
  var ERR = SLUG + '-error';
  var audioBuf = null, fileName = 'audio';
  var outBuf = null;
  var busy = false;

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function db(v) { return 20 * Math.log10(Math.max(1e-9, v)); }

  function go() {
    if (busy) return;
    TN.clearErr(ERR);
    if (!audioBuf) { TN.setErr(ERR, 'Choose an audio file first.'); return; }
    var targetDb = parseFloat(document.getElementById(SLUG + '-target').value);
    if (isNaN(targetDb)) targetDb = -1;
    var Ctor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Ctor) { TN.setErr(ERR, 'Offline rendering is not supported in this browser.'); return; }

    // measure true peak
    var peak = 0;
    for (var c = 0; c < audioBuf.numberOfChannels; c++) {
      var d = audioBuf.getChannelData(c);
      for (var i = 0; i < d.length; i++) {
        var a = Math.abs(d[i]);
        if (a > peak) peak = a;
      }
    }
    if (peak < 1e-9) { TN.setErr(ERR, 'This file is completely silent — there is nothing to normalize.'); return; }
    var targetLin = Math.pow(10, targetDb / 20);
    var gain = targetLin / peak;

    busy = true;
    var btn = document.getElementById(SLUG + '-go');
    if (btn) btn.disabled = true;
    var res = document.getElementById(SLUG + '-result');
    if (res) res.classList.add('hidden');
    outBuf = null;

    try {
      var ch = Math.min(audioBuf.numberOfChannels, 2);
      var off = new Ctor(ch, audioBuf.length, audioBuf.sampleRate);
      var src = off.createBufferSource();
      src.buffer = audioBuf;
      var g = off.createGain();
      g.gain.value = gain; // the normalization stage
      src.connect(g); g.connect(off.destination);
      src.start(0);
      off.startRendering().then(function (rendered) {
        outBuf = rendered;
        document.getElementById(SLUG + '-before').textContent = db(peak).toFixed(1) + ' dB';
        document.getElementById(SLUG + '-gain').textContent = (gain >= 1 ? '+' : '') + db(gain).toFixed(1) + ' dB';
        document.getElementById(SLUG + '-after').textContent = targetDb.toFixed(1) + ' dB';
        res.classList.remove('hidden');
        busy = false;
        if (btn) btn.disabled = false;
      }).catch(function () {
        TN.setErr(ERR, 'Normalization failed.');
        busy = false;
        if (btn) btn.disabled = false;
      });
    } catch (e) {
      TN.setErr(ERR, 'Normalization failed: ' + (e && e.message || e));
      busy = false;
      if (btn) btn.disabled = false;
    }
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

  try {
    if (!document.getElementById(SLUG + '-go')) return;
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      outBuf = null;
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
    TN.on(SLUG + '-target', 'input', function () {
      document.getElementById(SLUG + '-target-val').textContent = '−' + Math.abs(parseFloat(this.value)).toFixed(1);
    });
    TN.on(SLUG + '-go', 'click', go);
    TN.on(SLUG + '-download', 'click', function () {
      if (!outBuf) return;
      TN.download(encodeWav(outBuf), fileName + '-normalized.wav');
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
