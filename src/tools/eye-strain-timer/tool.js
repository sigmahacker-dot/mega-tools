(function () {
  'use strict';
  var ERR = 'eye-strain-timer-error';
  var KEY = 'tn-eye-strain-timer';
  var timer = null, phase = 'idle', left = 0, total = 1, paused = false;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(s) { s = Math.max(0, Math.ceil(s)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }
  function beep(n) {
    try {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      var ctx = new C();
      for (var i = 0; i < n; i++) {
        (function (i) {
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          var t = ctx.currentTime + i * 0.28;
          o.frequency.value = i % 2 ? 660 : 880;
          g.gain.setValueAtTime(0.001, t);
          g.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          o.start(t); o.stop(t + 0.24);
        })(i);
      }
      setTimeout(function () { try { ctx.close(); } catch (e) {} }, n * 300 + 200);
    } catch (e) {}
  }
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function getCount() { try { var s = localStorage.getItem(KEY); if (!s) return 0; var o = JSON.parse(s); return o.day === todayKey() ? (o.n || 0) : 0; } catch (e) { return 0; } }
  function bumpCount() { try { var n = getCount() + 1; localStorage.setItem(KEY, JSON.stringify({ day: todayKey(), n: n })); } catch (e) {} }
  function render() {
    TN.el('eye-phase').textContent = phase === 'idle' ? 'Ready' : (phase === 'focus' ? 'FOCUS' : 'REST EYES');
    TN.el('eye-time').textContent = phase === 'idle' ? '–' : fmt(left);
    TN.el('eye-count').textContent = getCount();
    TN.el('eye-bar').value = total > 0 ? Math.min(100, Math.max(0, (total - left) / total * 100)) : 0;
  }
  function tick() {
    if (paused) return;
    left -= 1;
    if (left <= 0) {
      if (phase === 'focus') {
        phase = 'rest'; left = 20; total = 20; beep(3);
        TN.el('eye-detail').textContent = 'Look at something 20 feet away for 20 seconds. Blink!';
      } else {
        bumpCount();
        var mins = parseInt(TN.el('eye-focus').value, 10) || 20;
        phase = 'focus'; left = mins * 60; total = mins * 60; beep(1);
        TN.el('eye-detail').textContent = 'Break logged. Back to focus for ' + mins + ' minutes.';
      }
    }
    render();
  }
  function start() {
    TN.clearErr(ERR);
    var mins = parseInt(TN.el('eye-focus').value, 10);
    if (!(mins >= 1 && mins <= 120)) { TN.setErr(ERR, 'Focus block must be 1–120 minutes.'); return; }
    if (timer) clearInterval(timer);
    paused = false; phase = 'focus'; left = mins * 60; total = mins * 60;
    TN.el('eye-detail').textContent = 'Focusing for ' + mins + ' minutes…';
    timer = setInterval(tick, 1000);
    render();
  }
  function pause() { paused = !paused; TN.el('eye-detail').textContent = paused ? 'Paused.' : 'Resumed.'; }
  function reset() { if (timer) { clearInterval(timer); timer = null; } phase = 'idle'; paused = false; TN.el('eye-detail').textContent = 'Press Start to begin a focus block.'; render(); }
  try {
    TN.on('eye-start', 'click', start);
    TN.on('eye-pause', 'click', pause);
    TN.on('eye-reset', 'click', reset);
    render();
  } catch (e) { /* never throw on load */ }
})();