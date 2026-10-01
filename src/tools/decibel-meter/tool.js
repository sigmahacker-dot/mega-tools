/* Decibel Meter — mic RMS to relative dB, live meter + peak hold. Uncalibrated by design. */
(function () {
  'use strict';
  var SLUG = 'decibel-meter';
  var ctx = null, stream = null, analyser = null, proc = null, running = false;
  var peakDb = -Infinity, peakTime = 0;

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function setDb(db) {
    var dbEl = TN.el(SLUG + '-db'), bar = TN.el(SLUG + '-bar');
    var txt = isFinite(db) ? db.toFixed(1) : '—';
    if (dbEl) dbEl.textContent = txt;
    if (bar) {
      // map -60..0 dB to 0..100%
      var p = isFinite(db) ? Math.max(0, Math.min(100, (db + 60) / 60 * 100)) : 0;
      bar.style.width = p + '%';
    }
  }
  function setPeak(db) {
    var p = TN.el(SLUG + '-peak');
    if (p) p.textContent = isFinite(db) ? db.toFixed(1) : '—';
  }

  function start() {
    TN.clearErr(SLUG + '-error');
    stop();
    var Ctor = AC();
    if (!Ctor) { TN.setErr(SLUG + '-error', 'Your browser does not support Web Audio.'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      TN.setErr(SLUG + '-error', 'Microphone access is not available in this browser.');
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } }).then(function (s) {
      stream = s;
      ctx = new Ctor();
      if (ctx.resume) ctx.resume();
      var src = ctx.createMediaStreamSource(s);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      src.connect(analyser);
      var buf = new Float32Array(analyser.fftSize);
      peakDb = -Infinity;
      peakTime = Date.now();
      setPeak(peakDb);
      running = true;
      proc = setInterval(function () {
        if (!running || !analyser) return;
        analyser.getFloatTimeDomainData(buf);
        var sum = 0;
        for (var i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        var rms = Math.sqrt(sum / buf.length);
        var db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
        setDb(db);
        var now = Date.now();
        if (isFinite(db) && db > peakDb) { peakDb = db; peakTime = now; setPeak(peakDb); }
        else if (now - peakTime > 4000) { peakDb = isFinite(db) ? db : -Infinity; peakTime = now; setPeak(peakDb); }
      }, 100);
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Microphone access was denied or unavailable.');
    });
  }

  function stop() {
    running = false;
    if (proc) { clearInterval(proc); proc = null; }
    if (stream) { stream.getTracks().forEach(function (tr) { try { tr.stop(); } catch (e) {} }); stream = null; }
    if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; }
    analyser = null;
    setDb(-Infinity);
  }

  TN.on(SLUG + '-start', 'click', start);
  TN.on(SLUG + '-stop', 'click', stop);
})();
