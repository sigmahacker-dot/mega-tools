/* Online Guitar Tuner — getUserMedia + autocorrelation pitch detection. */
(function () {
  'use strict';
  var SLUG = 'online-guitar-tuner';
  var ERR = SLUG + '-error';
  var STRINGS = [
    { name: 'E2', f: 82.41 }, { name: 'A2', f: 110.00 }, { name: 'D3', f: 146.83 },
    { name: 'G3', f: 196.00 }, { name: 'B3', f: 246.94 }, { name: 'E4', f: 329.63 }
  ];
  var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var sel = 0;
  var actx = null, analyser = null, stream = null, rafId = null;
  var buf = null;

  function $(id) { return document.getElementById(id); }

  function noteName(freq) {
    var n = 12 * (Math.log(freq / 440) / Math.log(2));
    var midi = Math.round(n) + 69;
    var name = NOTE_NAMES[((midi % 12) + 12) % 12];
    var oct = Math.floor(midi / 12) - 1;
    var ideal = 440 * Math.pow(2, (midi - 69) / 12);
    var cents = Math.round(1200 * (Math.log(freq / ideal) / Math.log(2)));
    return { name: name + oct, cents: cents };
  }

  // autocorrelation pitch detection
  function detectPitch(data, sampleRate) {
    var SIZE = data.length;
    var rms = 0;
    for (var i = 0; i < SIZE; i++) rms += data[i] * data[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.012) return -1; // too quiet
    var r1 = 0, r2 = SIZE - 1;
    var th = 0.2;
    for (i = 0; i < SIZE / 2; i++) { if (Math.abs(data[i]) >= th) { r1 = i; break; } }
    for (i = 1; i < SIZE / 2; i++) { if (Math.abs(data[SIZE - i]) >= th) { r2 = SIZE - i; break; } }
    var trimmed = data.slice(r1, r2);
    var N = trimmed.length;
    if (N < 8) return -1;
    var corr = new Array(N).fill(0);
    for (var lag = 0; lag < N; lag++) {
      var s = 0;
      for (var j = 0; j < N - lag; j++) s += trimmed[j] * trimmed[j + lag];
      corr[lag] = s;
    }
    var d = 0;
    while (d < N - 1 && corr[d] > corr[d + 1]) d++;
    var maxV = -1, maxP = -1;
    for (var k = d; k < N; k++) { if (corr[k] > maxV) { maxV = corr[k]; maxP = k; } }
    if (maxP <= 0) return -1;
    // parabolic interpolation
    var x1 = corr[maxP - 1] || 0, x2 = corr[maxP], x3 = corr[maxP + 1] || 0;
    var a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
    var shift = a !== 0 ? -b / (2 * a) : 0;
    return sampleRate / (maxP + shift);
  }

  function loop() {
    if (!analyser) return;
    analyser.getFloatTimeDomainData(buf);
    var freq = detectPitch(buf, actx.sampleRate);
    if (freq > 40 && freq < 1200) {
      var nn = noteName(freq);
      $('online-guitar-tuner-note').textContent = nn.name;
      $('online-guitar-tuner-note').style.color = Math.abs(nn.cents) <= 5 ? '#2e7d32' : '#212121';
      $('online-guitar-tuner-hz').textContent = freq.toFixed(1) + ' Hz';
      var c = Math.max(-50, Math.min(50, nn.cents));
      $('online-guitar-tuner-cents').textContent = (nn.cents > 0 ? '+' : '') + nn.cents + '¢';
      $('online-guitar-tuner-needle').style.left = 'calc(' + (50 + c) + '% - 2px)';
    } else {
      $('online-guitar-tuner-note').textContent = '–';
      $('online-guitar-tuner-note').style.color = '#212121';
      $('online-guitar-tuner-hz').textContent = '–';
      $('online-guitar-tuner-cents').textContent = '–';
    }
    rafId = requestAnimationFrame(loop);
  }

  function selectString(i) {
    sel = i;
    var btns = $('online-guitar-tuner-strings').querySelectorAll('button');
    for (var k = 0; k < btns.length; k++) {
      btns[k].className = 'btn btn-sm ' + (k === i ? '' : 'btn-outline');
    }
    $('online-guitar-tuner-target').textContent = STRINGS[i].name + ' · ' + STRINGS[i].f.toFixed(2) + ' Hz';
  }

  function start() {
    TN.clearErr(ERR);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      TN.setErr(ERR, 'Microphone access is not available in this browser.');
      return;
    }
    $('online-guitar-tuner-status').textContent = 'Requesting microphone…';
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      .then(function (s) {
        stream = s;
        try { actx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (e) { TN.setErr(ERR, 'Web Audio is not supported in this browser.'); return; }
        var src = actx.createMediaStreamSource(stream);
        analyser = actx.createAnalyser();
        analyser.fftSize = 4096;
        buf = new Float32Array(analyser.fftSize);
        src.connect(analyser);
        $('online-guitar-tuner-start').disabled = true;
        $('online-guitar-tuner-start').textContent = '🎤 Listening…';
        $('online-guitar-tuner-status').textContent = 'Listening — play a string. Tune until the needle centers (green).';
        loop();
      })
      .catch(function (err) {
        var msg = 'Microphone access was denied.';
        if (err && err.name === 'NotFoundError') msg = 'No microphone found on this device.';
        else if (err && err.name === 'NotAllowedError') msg = 'Microphone blocked. Click the lock/camera icon in the address bar to allow it, then try again.';
        TN.setErr(ERR, msg);
        $('online-guitar-tuner-status').textContent = 'Microphone unavailable.';
      });
  }

  try {
    var btns = $('online-guitar-tuner-strings').querySelectorAll('button');
    for (var k = 0; k < btns.length; k++) {
      (function (i) { btns[i].addEventListener('click', function () { selectString(i); }); })(k);
    }
    selectString(0);
    TN.on('online-guitar-tuner-start', 'click', start);
    window.addEventListener('beforeunload', function () {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    });
  } catch (e) { /* never throw on load */ }
})();
