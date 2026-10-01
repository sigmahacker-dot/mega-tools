/* Egg Timer — soft/medium/hard presets + custom, with alarm. */
(function () {
  'use strict';
  var SLUG = 'egg-timer';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  var timerId = null, endAt = 0;
  var actx = null;

  function beep(freq, dur, delay) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      var at = actx.currentTime + (delay || 0);
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'triangle'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.5, at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(at); o.stop(at + dur + 0.05);
    } catch (e) {}
  }

  function alarm() {
    for (var i = 0; i < 3; i++) { beep(1046, 0.35, i * 0.5); }
  }

  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  function stopTick() { if (timerId) { clearInterval(timerId); timerId = null; } }

  function tick() {
    var remain = endAt - Date.now();
    if (remain <= 0) {
      stopTick();
      $('clock').textContent = '0:00';
      $('status').textContent = '⏰ Done! Move the eggs to ice water now.';
      alarm();
      return;
    }
    $('clock').textContent = fmt(remain);
    $('status').textContent = 'Cooking… ' + fmt(remain) + ' left.';
  }

  function start(mins) {
    TN.clearErr(SLUG + '-error');
    if (!mins || mins < 1 || mins > 60) { TN.setErr(SLUG + '-error', 'Please pick a preset or enter 1–60 minutes.'); return; }
    beep(660, 0.1);
    stopTick();
    endAt = Date.now() + mins * 60000;
    $('status').textContent = 'Cooking…';
    timerId = setInterval(tick, 250);
    tick();
  }

  function stop() {
    stopTick();
    $('clock').textContent = '0:00';
    $('status').textContent = 'Timer stopped.';
  }

  try {
    TN.qsa('[data-egg]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $('custom').value = '';
        start(parseInt(btn.getAttribute('data-egg'), 10));
      });
    });
    TN.on(SLUG + '-start', 'click', function () { start(parseInt($('custom').value, 10)); });
    TN.on(SLUG + '-stop', 'click', stop);
  } catch (e) { /* never throw on load */ }
})();
