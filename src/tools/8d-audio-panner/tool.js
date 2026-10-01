/* 8D Audio Panner — rotating stereo-pan LFO, live play + offline download. */
(function () {
  'use strict';
  var SLUG = '8d-audio-panner';
  var ERR = SLUG + '-error';
  var audioBuf = null, fileName = 'audio';
  var actx = null, playNodes = null;

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function speedHz() {
    var el = document.getElementById(SLUG + '-speed');
    return el ? parseFloat(el.value) || 0.15 : 0.15;
  }

  // builds source → panner graph with LFO on the given BaseAudioContext; returns {src, stop}
  function buildGraph(Ctx, buf, hz) {
    var src = Ctx.createBufferSource();
    src.buffer = buf;
    src.loop = false;
    var panner = Ctx.createStereoPanner ? Ctx.createStereoPanner() : null;
    var lfo = Ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = hz;
    var depth = Ctx.createGain();
    depth.gain.value = 1; // full L/R sweep
    lfo.connect(depth);
    var t0 = Ctx.currentTime || 0;
    if (panner) {
      depth.connect(panner.pan);
      panner.pan.setValueAtTime(0, t0);
      src.connect(panner);
      panner.connect(Ctx.destination);
    } else {
      // fallback: manual gain LFO on two gains
      var gL = Ctx.createGain(), gR = Ctx.createGain();
      src.connect(gL); src.connect(gR);
      gL.connect(Ctx.destination); gR.connect(Ctx.destination);
      // approximate orbit with gain LFOs (not used in modern browsers)
      depth.disconnect();
      var lfo2 = Ctx.createOscillator();
      lfo2.frequency.value = hz;
      var d2 = Ctx.createGain(); d2.gain.value = 0.5;
      lfo2.connect(d2);
      d2.connect(gL.gain); d2.connect(gR.gain);
      gL.gain.value = 0.5; gR.gain.value = 0.5;
      lfo2.start(t0);
      lfo.stop = lfo2.stop.bind(lfo2);
    }
    src.start(t0);
    lfo.start(t0);
    return {
      src: src,
      stop: function () { try { src.stop(); } catch (e) {} try { lfo.stop(); } catch (e2) {} }
    };
  }

  function stopPlay() {
    if (playNodes) { playNodes.stop(); playNodes = null; }
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
    var l = ab.getChannelData(0), r = ch > 1 ? ab.getChannelData(1) : ab.getChannelData(0);
    var off = 44;
    for (var i = 0; i < len; i++) {
      var a = Math.max(-1, Math.min(1, l[i]));
      var b = Math.max(-1, Math.min(1, r[i]));
      v.setInt16(off, a < 0 ? a * 0x8000 : a * 0x7FFF, true); off += 2;
      v.setInt16(off, b < 0 ? b * 0x8000 : b * 0x7FFF, true); off += 2;
    }
    return new Blob([buf], { type: 'audio/wav' });
  }

  try {
    if (!document.getElementById(SLUG + '-play')) return;
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      stopPlay();
      audioBuf = null;
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
    TN.on(SLUG + '-speed', 'input', function () {
      var hz = parseFloat(this.value) || 0.15;
      document.getElementById(SLUG + '-speed-val').textContent = hz.toFixed(2);
      document.getElementById(SLUG + '-period').textContent = (1 / hz).toFixed(1);
      if (playNodes) { // rebuild live with new speed
        stopPlay();
        var Ctor = AC();
        actx = actx || new Ctor();
        playNodes = buildGraph(actx, audioBuf, hz);
      }
    });
    TN.on(SLUG + '-play', 'click', function () {
      TN.clearErr(ERR);
      if (!audioBuf) { TN.setErr(ERR, 'Choose an audio file first.'); return; }
      stopPlay();
      var Ctor = AC();
      if (!Ctor) { TN.setErr(ERR, 'Your browser does not support Web Audio.'); return; }
      actx = actx || new Ctor();
      if (actx.state === 'suspended') actx.resume();
      playNodes = buildGraph(actx, audioBuf, speedHz());
    });
    TN.on(SLUG + '-stop', 'click', stopPlay);
    TN.on(SLUG + '-download', 'click', function () {
      TN.clearErr(ERR);
      if (!audioBuf) { TN.setErr(ERR, 'Choose an audio file first.'); return; }
      var Ctor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!Ctor) { TN.setErr(ERR, 'Offline rendering is not supported in this browser.'); return; }
      var hz = speedHz();
      var btn = document.getElementById(SLUG + '-download');
      if (btn) btn.disabled = true;
      try {
        var off = new Ctor(2, audioBuf.length, audioBuf.sampleRate);
        var nodes = buildGraph(off, audioBuf, hz);
        void nodes;
        off.startRendering().then(function (rendered) {
          TN.download(encodeWav(rendered), fileName + '-8d.wav');
          if (btn) btn.disabled = false;
        }).catch(function () {
          TN.setErr(ERR, 'Rendering failed.');
          if (btn) btn.disabled = false;
        });
      } catch (e) {
        TN.setErr(ERR, 'Rendering failed: ' + (e && e.message || e));
        if (btn) btn.disabled = false;
      }
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
