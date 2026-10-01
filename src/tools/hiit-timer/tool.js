(function () {
  'use strict';
  var ERR = 'hiit-timer-error';
  var timer = null, phase = 'idle', timeLeft = 0, phaseTotal = 1, round = 0, rounds = 8, work = 30, rest = 15, paused = false;
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
          o.frequency.value = 880;
          g.gain.setValueAtTime(0.001, t);
          g.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          o.start(t); o.stop(t + 0.24);
        })(i);
      }
      setTimeout(function () { try { ctx.close(); } catch (e) {} }, n * 300 + 200);
    } catch (e) {}
  }
  function render() {
    TN.el('hiit-phase').textContent = phase === 'idle' ? 'Ready' : (phase === 'work' ? 'WORK' : (phase === 'rest' ? 'REST' : 'DONE'));
    TN.el('hiit-time').textContent = phase === 'idle' ? '–' : fmt(timeLeft);
    TN.el('hiit-round').textContent = phase === 'idle' ? '–' : (Math.min(round, rounds) + ' / ' + rounds);
    TN.el('hiit-bar').value = phaseTotal > 0 ? Math.min(100, Math.max(0, (phaseTotal - timeLeft) / phaseTotal * 100)) : 0;
  }
  function setPhase(p) {
    phase = p;
    if (p === 'work') { timeLeft = work; phaseTotal = work; beep(1); }
    else if (p === 'rest') { timeLeft = rest; phaseTotal = rest; beep(2); }
    else if (p === 'done') { beep(3); if (timer) { clearInterval(timer); timer = null; } TN.el('hiit-detail').textContent = 'Workout complete! Great job.'; }
    render();
  }
  function tick() {
    if (paused) return;
    timeLeft -= 1;
    if (timeLeft <= 0) {
      if (phase === 'work') {
        if (round >= rounds) setPhase('done');
        else setPhase('rest');
      } else if (phase === 'rest') {
        round++;
        if (round > rounds) setPhase('done');
        else setPhase('work');
      }
    } else render();
  }
  function start() {
    TN.clearErr(ERR);
    work = parseInt(TN.el('hiit-work').value, 10);
    rest = parseInt(TN.el('hiit-rest').value, 10);
    rounds = parseInt(TN.el('hiit-rounds').value, 10);
    if (!(work >= 5 && work <= 300)) { TN.setErr(ERR, 'Work must be 5–300 seconds.'); return; }
    if (!(rest >= 5 && rest <= 300)) { TN.setErr(ERR, 'Rest must be 5–300 seconds.'); return; }
    if (!(rounds >= 1 && rounds <= 50)) { TN.setErr(ERR, 'Rounds must be 1–50.'); return; }
    if (timer) clearInterval(timer);
    paused = false; round = 1;
    TN.el('hiit-detail').textContent = 'Go! Round 1 of ' + rounds + '.';
    setPhase('work');
    timer = setInterval(tick, 1000);
  }
  function pause() { paused = !paused; TN.el('hiit-detail').textContent = paused ? 'Paused.' : 'Resumed.'; }
  function reset() { if (timer) { clearInterval(timer); timer = null; } phase = 'idle'; paused = false; round = 0; TN.el('hiit-detail').textContent = 'Set your intervals and press Start.'; render(); }
  try {
    TN.on('hiit-start', 'click', start);
    TN.on('hiit-pause', 'click', pause);
    TN.on('hiit-reset', 'click', reset);
    render();
  } catch (e) { /* never throw on load */ }
})();