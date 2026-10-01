(function () {
  'use strict';
  var ERR = 'posture-break-timer-error';
  var KEY = 'tn-posture-break-timer';
  var timer = null, left = 0, total = 1, paused = false, running = false;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(s) { s = Math.max(0, Math.ceil(s)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function getCount() { try { var s = localStorage.getItem(KEY); if (!s) return 0; var o = JSON.parse(s); return o.day === todayKey() ? (o.n || 0) : 0; } catch (e) { return 0; } }
  function bump() { try { localStorage.setItem(KEY, JSON.stringify({ day: todayKey(), n: getCount() + 1 })); } catch (e) {} }
  function beep() {
    try {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      var ctx = new C(), o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 740;
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      o.start(); o.stop(ctx.currentTime + 0.65);
      setTimeout(function () { try { ctx.close(); } catch (e) {} }, 800);
    } catch (e) {}
  }
  function render() {
    TN.el('pb-time').textContent = running ? fmt(left) : '–';
    TN.el('pb-count').textContent = getCount();
    TN.el('pb-bar').value = total > 0 && running ? Math.min(100, Math.max(0, (total - left) / total * 100)) : 0;
  }
  function tick() {
    if (paused || !running) return;
    left -= 1;
    if (left <= 0) {
      bump(); beep();
      TN.el('pb-detail').textContent = 'Break time! Stand up, stretch your chest and shoulders, roll your neck, then sit tall.';
      var mins = parseInt(TN.el('pb-every').value, 10) || 30;
      left = mins * 60; total = mins * 60;
    }
    render();
  }
  function start() {
    TN.clearErr(ERR);
    var mins = parseInt(TN.el('pb-every').value, 10);
    if (!(mins >= 1)) { TN.setErr(ERR, 'Pick a break interval.'); return; }
    if (timer) clearInterval(timer);
    left = mins * 60; total = mins * 60; paused = false; running = true;
    TN.el('pb-detail').textContent = 'Countdown running. Next break in ' + mins + ' minutes.';
    timer = setInterval(tick, 1000);
    render();
  }
  function pause() { paused = !paused; TN.el('pb-detail').textContent = paused ? 'Paused.' : 'Resumed.'; }
  function reset() { if (timer) { clearInterval(timer); timer = null; } running = false; paused = false; TN.el('pb-detail').textContent = 'Press Start to begin the countdown.'; render(); }
  try {
    TN.on('pb-start', 'click', start);
    TN.on('pb-pause', 'click', pause);
    TN.on('pb-reset', 'click', reset);
    TN.on('pb-every', 'change', function () { if (running) start(); });
    render();
  } catch (e) { /* never throw on load */ }
})();