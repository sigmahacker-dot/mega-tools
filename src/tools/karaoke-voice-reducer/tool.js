/* Karaoke Voice Reducer — center-channel cancellation via L−R. Honest limits noted. */
(function () {
  'use strict';
  var SLUG = 'karaoke-voice-reducer';
  var ERR = SLUG + '-error';
  var audioBuf = null, fileName = 'karaoke';
  var outBuf = null;
  var actx = null, playSrc = null;

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function process() {
    TN.clearErr(ERR);
    if (!audioBuf) { TN.setErr(ERR, 'Choose an audio file first.'); return; }
    if (audioBuf.numberOfChannels < 2) {
      TN.setErr(ERR, 'This file is mono — vocal reduction needs a stereo file with separate left/right channels.');
      return;
    }
    var strength = (parseFloat(document.getElementById(SLUG + '-level').value) || 100) / 100;
    var sr = audioBuf.sampleRate, len = audioBuf.length;
    var Ctor = AC();
    if (!Ctor) { TN.setErr(ERR, 'Your browser does not support Web Audio.'); return; }
    var tmp = new Ctor();
    try {
      outBuf = tmp.createBuffer(2, len, sr);
      var L = audioBuf.getChannelData(0), R = audioBuf.getChannelData(1);
      var oL = outBuf.getChannelData(0), oR = outBuf.getChannelData(1);
      // center = (L+R)/2; remove 'strength' fraction of the center from each channel
      for (var i = 0; i < len; i++) {
        var center = (L[i] + R[i]) / 2;
        oL[i] = (L[i] - center * strength) * 0.9;
        oR[i] = (R[i] - center * strength) * 0.9;
      }
      document.getElementById(SLUG + '-play').classList.remove('hidden');
      document.getElementById(SLUG + '-download').classList.remove('hidden');
      TN.clearErr(ERR);
    } finally {
      try { tmp.close(); } catch (e) {}
    }
  }

  function encodeWav(ab) {
    var ch = 2, sr = ab.sampleRate, len = ab.length;
    var bytes = 44 + len * ch * 2;
    var buf = new ArrayBuffer(bytes), v = new DataView(buf);
    function ws(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    ws(0, 'RIFF'); v.setUint32(4, bytes - 8, true); ws(8, 'WAVE'); ws(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true);
    v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, len * ch * 2, true);
    var l = ab.getChannelData(0), r = ab.getChannelData(1);
    var off = 44;
    for (var i = 0; i < len; i++) {
      var a = Math.max(-1, Math.min(1, l[i]));
      var b = Math.max(-1, Math.min(1, r[i]));
      v.setInt16(off, a < 0 ? a * 0x8000 : a * 0x7FFF, true); off += 2;
      v.setInt16(off, b < 0 ? b * 0x8000 : b * 0x7FFF, true); off += 2;
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
      document.getElementById(SLUG + '-play').classList.add('hidden');
      document.getElementById(SLUG + '-download').classList.add('hidden');
      if (!f) return;
      TN.clearErr(ERR);
      fileName = (f.name || 'karaoke').replace(/\.[^.]+$/, '') || 'karaoke';
      var Ctor = AC();
      if (!Ctor) { TN.setErr(ERR, 'Your browser does not support Web Audio.'); return; }
      var tmp = new Ctor();
      TN.readAsArrayBuffer(f).then(function (b) { return tmp.decodeAudioData(b); }).then(function (ab) {
        audioBuf = ab;
        try { tmp.close(); } catch (e) {}
        document.getElementById(SLUG + '-info').textContent =
          'Loaded: ' + ab.duration.toFixed(1) + 's · ' + ab.numberOfChannels + ' channel' + (ab.numberOfChannels === 1 ? '' : 's');
        if (ab.numberOfChannels < 2) {
          TN.setErr(ERR, 'This file is mono — vocal reduction needs stereo. Pick a stereo file.');
        }
      }).catch(function () {
        try { tmp.close(); } catch (e2) {}
        TN.setErr(ERR, 'Could not decode this file. It may use a format your browser cannot read.');
      });
    });
    TN.on(SLUG + '-level', 'input', function () {
      document.getElementById(SLUG + '-level-val').textContent = this.value;
    });
    TN.on(SLUG + '-go', 'click', process);
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
      TN.download(encodeWav(outBuf), fileName + '-karaoke.wav');
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
