/* Meditation timer: countdown, interval bells, WebAudio chime, start/pause/reset. */
(function () {
  'use strict';
  var SLUG = 'meditation-timer';
  function $(id) { return document.getElementById(id); }
  var timer = null, remain = 0, total = 0, ivMs = 0, nextBell = 0, paused = true;
  function fmt(ms) {
    var s = Math.ceil(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function bell(soft) {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = new AC();
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = soft ? 432 : 528;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 3.1);
    } catch (e) {}
  }
  function draw() { $(SLUG + '-clock').textContent = fmt(remain); }
  function stopTick() { if (timer) { clearInterval(timer); timer = null; } }
  function tick() {
    remain -= 1000;
    if (ivMs > 0 && remain <= nextBell && remain > 0) { bell(true); nextBell -= ivMs; }
    if (remain <= 0) {
      remain = 0; draw(); stopTick(); paused = true;
      $(SLUG + '-state').textContent = 'Complete';
      bell(false); setTimeout(function () { bell(false); }, 1200);
      return;
    }
    draw();
  }
  function reset() {
    stopTick();
    var mins = parseInt($(SLUG + '-mins').value, 10);
    var iv = parseInt($(SLUG + '-interval').value, 10);
    if (isNaN(mins) || mins < 1 || mins > 180) { $(SLUG + '-error').textContent = 'Enter a session length of 1–180 minutes.'; return; }
    if (isNaN(iv) || iv < 0 || iv > 60) { $(SLUG + '-error').textContent = 'Enter an interval of 0–60 minutes.'; return; }
    $(SLUG + '-error').textContent = '';
    total = mins * 60000; remain = total;
    ivMs = (iv > 0 && iv < mins) ? iv * 60000 : 0;
    nextBell = total - ivMs;
    paused = true;
    $(SLUG + '-state').textContent = 'Ready';
    draw();
  }
  function start() {
    if (paused && remain <= 0) reset();
    if (remain <= 0) return;
    paused = false;
    $(SLUG + '-state').textContent = 'Meditating';
    stopTick();
    var last = Date.now();
    timer = setInterval(function () {
      var now = Date.now();
      remain -= (now - last); last = now;
      if (ivMs > 0 && remain <= nextBell && remain > 0) { bell(true); nextBell -= ivMs; }
      if (remain <= 0) {
        remain = 0; draw(); stopTick(); paused = true;
        $(SLUG + '-state').textContent = 'Complete';
        bell(false); setTimeout(function () { bell(false); }, 1200);
        return;
      }
      draw();
    }, 500);
  }
  function pause() {
    if (paused) return;
    paused = true; stopTick();
    $(SLUG + '-state').textContent = 'Paused';
  }
  try {
    $(SLUG + '-start').addEventListener('click', start);
    $(SLUG + '-pause').addEventListener('click', pause);
    $(SLUG + '-reset').addEventListener('click', reset);
    $(SLUG + '-mins').addEventListener('input', reset);
    $(SLUG + '-interval').addEventListener('input', reset);
    reset();
  } catch (e) { /* never throw on load */ }
})();
