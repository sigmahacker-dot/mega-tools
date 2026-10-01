/* Nap Timer — presets + custom countdown with a gentle wake-up chime. */
(function () {
  'use strict';
  var SLUG = 'nap-timer';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  var timerId = null, endAt = 0, totalMs = 0, lastWhole = -1;
  var actx = null;

  function tone(freq, dur, delay) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      var at = actx.currentTime + (delay || 0);
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.4, at + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(at); o.stop(at + dur + 0.1);
    } catch (e) {}
  }

  function chime() {
    // gentle wake-up: soft ascending arpeggio, twice
    var notes = [523.25, 659.25, 783.99];
    notes.forEach(function (f, i) { tone(f, 1.4, i * 0.55); });
    notes.forEach(function (f, i) { tone(f, 1.4, 2.2 + i * 0.55); });
  }

  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h + ':' + ('0' + m).slice(-2) + ':' + ('0' + sec).slice(-2);
  }

  function tick() {
    var remain = endAt - Date.now();
    if (remain <= 0) {
      stopTick();
      $('clock').textContent = '0:00:00';
      $('status').textContent = '⏰ Time to wake up — hope you feel refreshed!';
      chime();
      return;
    }
    $('clock').textContent = fmt(remain);
    var whole = Math.ceil(remain / 1000);
    if (whole !== lastWhole) {
      lastWhole = whole;
      $('status').textContent = 'Nap in progress… ' + fmt(remain) + ' remaining.';
    }
  }

  function stopTick() { if (timerId) { clearInterval(timerId); timerId = null; } }

  function start(mins) {
    TN.clearErr(SLUG + '-error');
    if (!mins || mins < 1 || mins > 480) { TN.setErr(SLUG + '-error', 'Please choose a length between 1 and 480 minutes.'); return; }
    tone(660, 0.12); // unlock audio on gesture
    stopTick();
    totalMs = mins * 60000;
    endAt = Date.now() + totalMs;
    lastWhole = -1;
    $('status').textContent = 'Nap in progress… sweet dreams. 😴';
    timerId = setInterval(tick, 250);
    tick();
  }

  function stop() {
    stopTick();
    $('clock').textContent = '0:00:00';
    $('status').textContent = 'Nap cancelled.';
  }

  try {
    TN.qsa('[data-nap]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $('custom').value = '';
        start(parseInt(btn.getAttribute('data-nap'), 10));
      });
    });
    TN.on(SLUG + '-start', 'click', function () {
      start(parseInt($('custom').value, 10));
    });
    TN.on(SLUG + '-stop', 'click', stop);
  } catch (e) { /* never throw on load */ }
})();
