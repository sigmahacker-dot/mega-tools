(function () {
  'use strict';
  var P = 'tabata-timer-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var phases = [], idx = 0;
  var running = false, remainingMs = 0, endStamp = 0, timerId = null, done = false;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtMs(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + pad(s % 60);
  }
  function beep(hi) {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = new AC(), o = ctx.createOscillator(), gn = ctx.createGain();
      o.connect(gn); gn.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = hi ? 1046 : 660;
      gn.gain.setValueAtTime(0.001, ctx.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.03);
      gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (hi ? 0.9 : 0.5));
      o.start(); o.stop(ctx.currentTime + 1);
    } catch (e) { /* audio unavailable */ }
  }
  function readSettings() {
    var r = parseInt(g('rounds').value, 10), w = parseInt(g('work').value, 10),
        re = parseInt(g('rest').value, 10), pr = parseInt(g('prep').value, 10);
    if ([r, w, re, pr].some(isNaN) || r < 1 || r > 50 || w < 1 || w > 600 || re < 0 || re > 600 || pr < 0 || pr > 120) {
      TN.setErr(ERR, 'Check the settings: rounds 1–50, work 1–600s, rest 0–600s, prep 0–120s.');
      return null;
    }
    TN.clearErr(ERR);
    return { r: r, w: w, re: re, pr: pr };
  }
  function build() {
    var st = readSettings();
    if (!st) return false;
    phases = [];
    if (st.pr > 0) phases.push({ label: 'Get ready…', secs: st.pr, round: 0 });
    for (var i = 1; i <= st.r; i++) {
      phases.push({ label: 'WORK', secs: st.w, round: i, work: true });
      if (i < st.r && st.re > 0) phases.push({ label: 'Rest', secs: st.re, round: i });
    }
    return true;
  }
  function render() {
    if (!phases.length) return;
    set('phase', done ? 'Complete!' : phases[idx].label);
    set('display', done ? '0:00' : fmtMs(remainingMs));
    var total = parseInt(g('rounds').value, 10) || 0;
    set('round', 'Round ' + (done ? total : phases[idx].round) + ' / ' + total);
    g('start').textContent = running ? 'Pause' : (done ? 'Restart' : 'Start');
  }
  function tick() {
    var rem = endStamp - Date.now();
    if (rem <= 0) { advance(); return; }
    remainingMs = rem;
    set('display', fmtMs(rem));
  }
  function advance() {
    idx++;
    if (idx >= phases.length) {
      stopTimer(); done = true; beep(true); render(); return;
    }
    beep(phases[idx].work === true);
    remainingMs = phases[idx].secs * 1000;
    if (running) endStamp = Date.now() + remainingMs;
    render();
  }
  function stopTimer() {
    if (timerId !== null) { clearInterval(timerId); timerId = null; }
    running = false;
  }
  function startPause() {
    if (done) { reset(); }
    if (!phases.length && !build()) return;
    if (running) {
      remainingMs = Math.max(0, endStamp - Date.now());
      stopTimer(); render(); return;
    }
    if (!readSettings()) return;
    endStamp = Date.now() + remainingMs;
    running = true;
    timerId = setInterval(tick, 250);
    render();
  }
  function reset() {
    stopTimer();
    if (!build()) return;
    idx = 0; done = false;
    remainingMs = phases[0].secs * 1000;
    set('phase', 'Ready');
    render();
  }
  try {
    if (!build()) phases = [{ label: 'Get ready…', secs: 10, round: 0 }];
    idx = 0; done = false;
    remainingMs = phases[0].secs * 1000;
    render();
    TN.on(P + 'start', 'click', startPause);
    TN.on(P + 'reset', 'click', reset);
    ['rounds', 'work', 'rest', 'prep'].forEach(function (k) {
      TN.on(P + k, 'change', reset);
    });
  } catch (e) { /* never throw on load */ }
})();
