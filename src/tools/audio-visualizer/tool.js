/* Audio Visualizer — mic or uploaded file, live frequency bars via AnalyserNode. */
(function () {
  'use strict';
  var SLUG = 'audio-visualizer';
  var ctx = null, analyser = null, stream = null, srcNode = null, rafId = null;

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function canvas() { return TN.el(SLUG + '-canvas'); }

  function source() {
    var el = TN.el(SLUG + '-source');
    return el ? el.value : 'mic';
  }

  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (srcNode) { try { srcNode.stop ? srcNode.stop() : srcNode.disconnect(); } catch (e) {} srcNode = null; }
    if (stream) { stream.getTracks().forEach(function (tr) { try { tr.stop(); } catch (e) {} }); stream = null; }
    if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; }
    analyser = null;
    var c = canvas();
    if (c) {
      var x = c.getContext('2d');
      x.fillStyle = '#000';
      x.fillRect(0, 0, c.width, c.height);
    }
  }

  function draw() {
    var c = canvas();
    if (!c || !analyser) return;
    var dpr = window.devicePixelRatio || 1;
    var w = c.clientWidth || 720, h = 220;
    if (c.width !== w * dpr) { c.width = w * dpr; c.height = h * dpr; }
    var x = c.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    var bins = analyser.frequencyBinCount;
    var data = new Uint8Array(bins);
    var N = 48;
    (function frame() {
      if (!analyser) return;
      rafId = requestAnimationFrame(frame);
      analyser.getByteFrequencyData(data);
      x.fillStyle = '#000';
      x.fillRect(0, 0, w, h);
      var bw = w / N;
      for (var i = 0; i < N; i++) {
        // log-ish distribution of bins
        var bi = Math.floor(Math.pow(i / N, 1.6) * bins * 0.7);
        var v = data[bi] / 255;
        var bh = Math.max(2, v * h * 0.95);
        var hue = 120 - v * 120; // green -> red
        x.fillStyle = 'hsl(' + Math.round(hue) + ',90%,55%)';
        x.fillRect(i * bw + 1, h - bh, bw - 2, bh);
      }
    })();
  }

  function start() {
    TN.clearErr(SLUG + '-error');
    stop();
    var Ctor = AC();
    if (!Ctor) { TN.setErr(SLUG + '-error', 'Your browser does not support Web Audio.'); return; }
    try {
      ctx = new Ctor();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      if (ctx.resume) ctx.resume();
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not start audio: ' + (e && e.message || e));
      return;
    }
    if (source() === 'mic') {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        TN.setErr(SLUG + '-error', 'Microphone access is not available in this browser.');
        stop();
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        stream = s;
        srcNode = ctx.createMediaStreamSource(s);
        srcNode.connect(analyser);
        draw();
      }).catch(function () {
        TN.setErr(SLUG + '-error', 'Microphone access was denied or unavailable.');
        stop();
      });
    } else {
      var fi = TN.el(SLUG + '-file');
      var f = fi && fi.files && fi.files[0];
      if (!f) { TN.setErr(SLUG + '-error', 'Choose an audio file first.'); stop(); return; }
      TN.readAsArrayBuffer(f).then(function (b) { return ctx.decodeAudioData(b); }).then(function (ab) {
        srcNode = ctx.createBufferSource();
        srcNode.buffer = ab;
        srcNode.loop = true;
        srcNode.connect(analyser);
        analyser.connect(ctx.destination);
        srcNode.start();
        draw();
      }).catch(function () {
        TN.setErr(SLUG + '-error', 'Could not decode that audio file.');
        stop();
      });
    }
  }

  TN.on(SLUG + '-source', 'change', function () {
    var ff = TN.el(SLUG + '-filefield');
    if (ff) ff.classList.toggle('hidden', source() !== 'file');
  });
  TN.on(SLUG + '-start', 'click', start);
  TN.on(SLUG + '-stop', 'click', stop);
  // init blank canvas
  stop();
})();
