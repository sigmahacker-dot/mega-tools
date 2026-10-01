/* Voice Changer Lite — pitch/speed, robot ring-mod, echo; upload or mic record. */
(function () {
  'use strict';
  var SLUG = 'voice-changer-lite';
  var ERR = SLUG + '-error';
  var audioBuf = null, fileName = 'voice';
  var outBuf = null;
  var actx = null, playSrc = null;
  var mediaRec = null, recChunks = [];

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function decodeFile(f) {
    TN.clearErr(ERR);
    fileName = (f.name || 'voice').replace(/\.[^.]+$/, '') || 'voice';
    var Ctor = AC();
    if (!Ctor) { TN.setErr(ERR, 'Your browser does not support Web Audio.'); return; }
    var tmp = new Ctor();
    TN.readAsArrayBuffer(f).then(function (b) { return tmp.decodeAudioData(b); }).then(function (ab) {
      audioBuf = ab; outBuf = null;
      document.getElementById(SLUG + '-play').classList.add('hidden');
      document.getElementById(SLUG + '-download').classList.add('hidden');
      try { tmp.close(); } catch (e) {}
    }).catch(function () {
      try { tmp.close(); } catch (e2) {}
      TN.setErr(ERR, 'Could not decode this file. It may use a format your browser cannot read.');
    });
  }

  function render() {
    TN.clearErr(ERR);
    if (!audioBuf) { TN.setErr(ERR, 'Upload audio or record something first.'); return; }
    var pitch = parseFloat(document.getElementById(SLUG + '-pitch').value) || 1;
    var robot = document.getElementById(SLUG + '-robot').checked;
    var echo = document.getElementById(SLUG + '-echo').checked;
    if (pitch === 1 && !robot && !echo) { TN.setErr(ERR, 'Turn on at least one effect first.'); return; }

    var btn = document.getElementById(SLUG + '-go');
    if (btn) btn.disabled = true;
    var Ctor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Ctor) { TN.setErr(ERR, 'Offline rendering is not supported in this browser.'); if (btn) btn.disabled = false; return; }

    try {
      var sr = audioBuf.sampleRate;
      var ch = Math.min(audioBuf.numberOfChannels, 2);
      var outLen = Math.ceil(audioBuf.length / pitch) + (echo ? Math.ceil(sr * 1.2) : 0);
      var off = new Ctor(ch, outLen, sr);
      var src = off.createBufferSource();
      src.buffer = audioBuf;
      src.playbackRate.value = pitch; // tape-style: pitch + speed together
      var tail = src;

      if (robot) {
        // ring modulation: multiply signal by 45 Hz sine
        var osc = off.createOscillator();
        osc.type = 'sine'; osc.frequency.value = 45;
        var og = off.createGain(); og.gain.value = 0.5;
        var ring = off.createGain(); ring.gain.value = 0;
        osc.connect(og); og.connect(ring.gain);
        tail.connect(ring);
        osc.start(0);
        tail = ring;
      }
      if (echo) {
        var dry = off.createGain(); dry.gain.value = 0.8;
        var wet = off.createGain(); wet.gain.value = 0.35;
        var dly = off.createDelay(2); dly.delayTime.value = 0.28;
        var fb = off.createGain(); fb.gain.value = 0.38;
        tail.connect(dry);
        tail.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(wet);
        var mix = off.createGain();
        dry.connect(mix); wet.connect(mix);
        tail = mix;
      }
      tail.connect(off.destination);
      src.start(0);
      off.startRendering().then(function (rendered) {
        outBuf = rendered;
        document.getElementById(SLUG + '-play').classList.remove('hidden');
        document.getElementById(SLUG + '-download').classList.remove('hidden');
        if (btn) btn.disabled = false;
      }).catch(function () {
        TN.setErr(ERR, 'Rendering failed.');
        if (btn) btn.disabled = false;
      });
    } catch (e) {
      TN.setErr(ERR, 'Rendering failed: ' + (e && e.message || e));
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

  function stopPlay() {
    try { if (playSrc) playSrc.stop(); } catch (e) {}
    playSrc = null;
  }

  try {
    if (!document.getElementById(SLUG + '-go')) return;
    TN.on(SLUG + '-file', 'change', function () {
      var f = this.files && this.files[0];
      if (f) decodeFile(f);
    });
    TN.on(SLUG + '-pitch', 'input', function () {
      document.getElementById(SLUG + '-pitch-val').textContent = parseFloat(this.value).toFixed(2);
    });
    TN.on(SLUG + '-go', 'click', render);
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
      TN.download(encodeWav(outBuf), fileName + '-voice-fx.wav');
    });

    // mic recording
    TN.on(SLUG + '-rec', 'click', function () {
      TN.clearErr(ERR);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        TN.setErr(ERR, 'Microphone recording is not supported in this browser.');
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        recChunks = [];
        try { mediaRec = new MediaRecorder(stream); }
        catch (e) { TN.setErr(ERR, 'Recording is not supported in this browser.'); return; }
        mediaRec.ondataavailable = function (e) { if (e.data && e.data.size) recChunks.push(e.data); };
        mediaRec.onstop = function () {
          stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e2) {} });
          document.getElementById(SLUG + '-rec').classList.remove('hidden');
          document.getElementById(SLUG + '-stop').classList.add('hidden');
          var blob = new Blob(recChunks, { type: mediaRec.mimeType || 'audio/webm' });
          decodeFile(new File([blob], 'mic-recording.webm', { type: blob.type }));
        };
        mediaRec.start();
        document.getElementById(SLUG + '-rec').classList.add('hidden');
        document.getElementById(SLUG + '-stop').classList.remove('hidden');
        document.getElementById(SLUG + '-rechint').textContent = 'Recording… click Stop when done.';
      }).catch(function () {
        TN.setErr(ERR, 'Microphone access was denied.');
      });
    });
    TN.on(SLUG + '-stop', 'click', function () {
      try { if (mediaRec && mediaRec.state !== 'inactive') mediaRec.stop(); } catch (e) {}
      document.getElementById(SLUG + '-rechint').textContent = 'Mic recording stays in your browser.';
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
