(function () {
  'use strict';
  var P = 'timer-';
  function g(id) { return document.getElementById(P + id); }

  var hIn = g('hours'), mIn = g('minutes'), sIn = g('seconds');
  var display = g('display'), startBtn = g('start');
  if (!hIn || !mIn || !sIn || !display || !startBtn) return;

  var totalMs = 0;        // configured duration
  var remainingMs = 0;    // remaining when paused
  var endAt = 0;          // timestamp when countdown finishes
  var running = false;
  var tickId = null;
  var audioCtx = null;

  function pad(n, len) {
    n = String(n);
    while (n.length < len) n = '0' + n;
    return n;
  }

  function fmt(ms) {
    ms = Math.max(0, Math.ceil(ms / 1000) * 1000);
    var s = Math.floor(ms / 1000) % 60;
    var m = Math.floor(ms / 60000) % 60;
    var h = Math.floor(ms / 3600000);
    return pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2);
  }

  function readInputs() {
    var h = parseInt(hIn.value, 10), m = parseInt(mIn.value, 10), s = parseInt(sIn.value, 10);
    if (isNaN(h)) h = 0; if (isNaN(m)) m = 0; if (isNaN(s)) s = 0;
    h = Math.max(0, Math.min(99, h));
    m = Math.max(0, Math.min(59, m));
    s = Math.max(0, Math.min(59, s));
    return (h * 3600 + m * 60 + s) * 1000;
  }

  function render(ms) {
    display.textContent = fmt(ms);
    var bar = g('progress-bar');
    if (bar && totalMs > 0) {
      var pct = Math.max(0, Math.min(100, (ms / totalMs) * 100));
      bar.style.width = pct + '%';
    }
  }

  function beep() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var times = [0, 0.35, 0.7];
      for (var i = 0; i < times.length; i++) {
        (function (delay) {
          var osc = audioCtx.createOscillator();
          var gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime + delay + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + 0.3);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + delay);
          osc.stop(audioCtx.currentTime + delay + 0.32);
        })(times[i]);
      }
    } catch (e) { /* audio unavailable — visual alarm still shows */ }
  }

  function stopTick() {
    if (tickId !== null) { clearInterval(tickId); tickId = null; }
  }

  function finish() {
    stopTick();
    running = false;
    remainingMs = 0;
    render(0);
    startBtn.textContent = 'Start';
    TN.show(P + 'done');
    beep();
  }

  function tick() {
    var left = endAt - Date.now();
    if (left <= 0) { finish(); return; }
    render(left);
  }

  function start() {
    TN.clearErr(P + 'error');
    TN.hide(P + 'done');
    if (running) {
      // Pause
      stopTick();
      running = false;
      remainingMs = Math.max(0, endAt - Date.now());
      startBtn.textContent = 'Start';
      return;
    }
    var ms = remainingMs > 0 ? remainingMs : readInputs();
    if (ms <= 0) {
      TN.setErr(P + 'error', 'Please set a duration greater than zero.');
      return;
    }
    if (remainingMs <= 0) { totalMs = ms; }
    remainingMs = 0;
    endAt = Date.now() + ms;
    running = true;
    startBtn.textContent = 'Pause';
    tickId = setInterval(tick, 100);
    tick();
  }

  function reset() {
    stopTick();
    running = false;
    remainingMs = 0;
    totalMs = 0;
    startBtn.textContent = 'Start';
    TN.hide(P + 'done');
    TN.clearErr(P + 'error');
    render(readInputs());
  }

  function preset(minutes) {
    if (running) { TN.setErr(P + 'error', 'Pause the timer before changing the duration.'); return; }
    TN.clearErr(P + 'error');
    hIn.value = 0;
    mIn.value = minutes;
    sIn.value = 0;
    totalMs = 0;
    remainingMs = 0;
    render(readInputs());
  }

  TN.on(startBtn, 'click', start);
  TN.on(g('reset'), 'click', reset);
  TN.on(g('preset-1'), 'click', function () { preset(1); });
  TN.on(g('preset-5'), 'click', function () { preset(5); });
  TN.on(g('preset-10'), 'click', function () { preset(10); });
  TN.on(g('preset-25'), 'click', function () { preset(25); });

  function onInputChange() {
    if (!running && remainingMs <= 0) render(readInputs());
  }
  TN.on(hIn, 'change', onInputChange);
  TN.on(mIn, 'change', onInputChange);
  TN.on(sIn, 'change', onInputChange);

  render(readInputs());
})();
