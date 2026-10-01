/* Countdown Timer Widget — set/start/pause/reset with alarm chime. */
(function () {
  'use strict';
  var SLUG = 'countdown-timer-widget';
  var ERR = SLUG + '-error';
  var remaining = 0; // ms
  var running = false;
  var endAt = 0;
  var rafId = null;
  var actx = null;

  function $(id) { return document.getElementById(id); }

  function fmt(ms) {
    ms = Math.max(0, Math.ceil(ms / 100) * 100);
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60;
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(h) + ':' + p(m) + ':' + p(ss);
  }

  function readInputs() {
    var h = Math.max(0, Math.min(99, parseInt($('countdown-timer-widget-h').value, 10) || 0));
    var m = Math.max(0, Math.min(59, parseInt($('countdown-timer-widget-m').value, 10) || 0));
    var s = Math.max(0, Math.min(59, parseInt($('countdown-timer-widget-s').value, 10) || 0));
    return (h * 3600 + m * 60 + s) * 1000;
  }

  function chime() {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      var notes = [880, 880, 880, 1046.5];
      notes.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        var t = actx.currentTime + i * 0.22;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.connect(g); g.connect(actx.destination);
        o.start(t); o.stop(t + 0.25);
      });
    } catch (e) { /* audio optional */ }
  }

  function tick() {
    if (!running) return;
    remaining = endAt - Date.now();
    if (remaining <= 0) {
      remaining = 0;
      $('countdown-timer-widget-display').textContent = fmt(0);
      stop();
      chime();
      $('countdown-timer-widget-msg').textContent = '⏰ Time is up!';
      // flash the display
      var d = $('countdown-timer-widget-display');
      var n = 0;
      var fl = setInterval(function () {
        d.style.color = n % 2 ? '#e53935' : '';
        if (++n > 7) { clearInterval(fl); d.style.color = ''; }
      }, 400);
      return;
    }
    $('countdown-timer-widget-display').textContent = fmt(remaining);
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    if (remaining <= 0) {
      remaining = readInputs();
      if (remaining <= 0) { TN.setErr(ERR, 'Set a duration greater than zero first.'); return; }
    }
    TN.clearErr(ERR);
    running = true;
    endAt = Date.now() + remaining;
    $('countdown-timer-widget-toggle').textContent = '⏸ Pause';
    $('countdown-timer-widget-msg').textContent = '';
    tick();
  }

  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    $('countdown-timer-widget-toggle').textContent = '▶ Start';
  }

  function reset() {
    stop();
    remaining = 0;
    $('countdown-timer-widget-display').textContent = fmt(readInputs());
    $('countdown-timer-widget-msg').textContent = '';
    TN.clearErr(ERR);
  }

  try {
    TN.on('countdown-timer-widget-toggle', 'click', function () { running ? stop() : start(); });
    TN.on('countdown-timer-widget-reset', 'click', reset);
    ['countdown-timer-widget-h', 'countdown-timer-widget-m', 'countdown-timer-widget-s'].forEach(function (id) {
      TN.on(id, 'input', function () {
        if (!running) { remaining = 0; $('countdown-timer-widget-display').textContent = fmt(readInputs()); }
      });
    });
    TN.on('countdown-timer-widget-preset', 'change', function () {
      var v = parseInt($('countdown-timer-widget-preset').value, 10);
      if (!v) return;
      $('countdown-timer-widget-h').value = Math.floor(v / 3600);
      $('countdown-timer-widget-m').value = Math.floor(v % 3600 / 60);
      $('countdown-timer-widget-s').value = v % 60;
      if (!running) { remaining = 0; $('countdown-timer-widget-display').textContent = fmt(readInputs()); }
    });
    $('countdown-timer-widget-display').textContent = fmt(readInputs());
  } catch (e) { /* never throw on load */ }
})();
