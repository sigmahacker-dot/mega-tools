/* Metronome — WebAudio lookahead scheduling, accent, subdivisions, tap tempo. */
(function () {
  'use strict';
  var SLUG = 'metronome-tool';
  var ERR = SLUG + '-error';
  var actx = null, running = false;
  var timerId = null, nextTime = 0, tickIdx = 0;
  var taps = [];

  function $(id) { return document.getElementById(id); }
  function bpm() { return parseInt($('metronome-tool-bpm').value, 10) || 120; }
  function beats() { return parseInt($('metronome-tool-beats').value, 10) || 4; }
  function sub() { return parseInt($('metronome-tool-sub').value, 10) || 1; }

  function ctx() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { TN.setErr(ERR, 'Web Audio is not supported in this browser.'); return null; }
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  function click(when, accent) {
    var c = ctx();
    if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'square';
    o.frequency.value = accent ? 1568 : 1046; // G6 / C6
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.3, when + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
    o.connect(g); g.connect(c.destination);
    o.start(when); o.stop(when + 0.08);
  }

  function flashDot(beatPos) {
    var dots = $('metronome-tool-dots').children;
    for (var i = 0; i < dots.length; i++) {
      dots[i].style.background = i === beatPos ? '#e53935' : '#ddd';
      dots[i].style.transform = i === beatPos ? 'scale(1.35)' : 'scale(1)';
    }
  }

  function buildDots() {
    var wrap = $('metronome-tool-dots');
    wrap.innerHTML = '';
    for (var i = 0; i < beats(); i++) {
      var d = document.createElement('div');
      d.style.cssText = 'width:22px;height:22px;border-radius:50%;background:#ddd;transition:transform .08s, background .08s';
      wrap.appendChild(d);
    }
  }

  function schedule() {
    var c = ctx();
    if (!c) { stop(); return; }
    var ahead = 0.12; // schedule 120ms ahead
    var interval = 25; // check every 25ms
    var spb = 60 / bpm() / sub(); // seconds per sub-tick
    nextTime = c.currentTime + 0.06;
    tickIdx = 0;
    timerId = setInterval(function () {
      while (nextTime < c.currentTime + ahead) {
        var subTick = tickIdx % sub();
        var beatPos = Math.floor(tickIdx / sub()) % beats();
        var isBeat = subTick === 0;
        var accent = isBeat && beatPos === 0;
        if (isBeat || sub() > 1) click(nextTime, accent);
        // flash on beat ticks
        if (isBeat) {
          (function (bp, when) {
            var delay = Math.max(0, (when - c.currentTime) * 1000);
            setTimeout(function () { if (running) flashDot(bp); }, delay);
          })(beatPos, nextTime);
        }
        nextTime += spb;
        tickIdx++;
      }
    }, interval);
  }

  function start() {
    if (!ctx()) return;
    running = true;
    buildDots();
    $('metronome-tool-toggle').textContent = '⏹ Stop';
    schedule();
  }

  function stop() {
    running = false;
    if (timerId) { clearInterval(timerId); timerId = null; }
    $('metronome-tool-toggle').textContent = '▶ Start';
    var dots = $('metronome-tool-dots').children;
    for (var i = 0; i < dots.length; i++) { dots[i].style.background = '#ddd'; dots[i].style.transform = 'scale(1)'; }
  }

  function tap() {
    var now = performance.now();
    if (taps.length && now - taps[taps.length - 1] > 2500) taps = [];
    taps.push(now);
    if (taps.length > 8) taps.shift();
    if (taps.length >= 3) {
      var diffs = [];
      for (var i = 1; i < taps.length; i++) diffs.push(taps[i] - taps[i - 1]);
      var avg = diffs.reduce(function (a, b) { return a + b; }, 0) / diffs.length;
      var b = Math.round(60000 / avg);
      b = Math.max(30, Math.min(240, b));
      $('metronome-tool-bpm').value = b;
      $('metronome-tool-bpm-v').textContent = b;
      $('metronome-tool-tapinfo').textContent = 'Tap tempo: ' + b + ' BPM';
    } else {
      $('metronome-tool-tapinfo').textContent = 'Tap ' + (3 - taps.length) + ' more time(s)…';
    }
  }

  try {
    buildDots();
    TN.on('metronome-tool-bpm', 'input', function () {
      $('metronome-tool-bpm-v').textContent = $('metronome-tool-bpm').value;
    });
    TN.on('metronome-tool-beats', 'change', buildDots);
    TN.on('metronome-tool-toggle', 'click', function () { running ? stop() : start(); });
    TN.on('metronome-tool-tap', 'click', tap);
  } catch (e) { /* never throw on load */ }
})();
