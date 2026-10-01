(function () {
  'use strict';
  var P = 'pomodoro-timer-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var phases = [], idx = 0, cycle = 1;
  var running = false, remainingMs = 0, endStamp = 0, timerId = null;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtMs(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
  }
  function beep() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = new AC(), o = ctx.createOscillator(), gn = ctx.createGain();
      o.connect(gn); gn.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = 880;
      gn.gain.setValueAtTime(0.001, ctx.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.03);
      gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      o.start(); o.stop(ctx.currentTime + 0.75);
    } catch (e) { /* audio unavailable */ }
  }
  function readSettings() {
    var f = parseInt(g('focus').value, 10), s = parseInt(g('short').value, 10),
        l = parseInt(g('long').value, 10), r = parseInt(g('rounds').value, 10);
    if ([f, s, l, r].some(isNaN) || f < 1 || f > 180 || s < 1 || s > 60 || l < 1 || l > 90 || r < 1 || r > 12) {
      TN.setErr(ERR, 'Check the settings: focus 1–180, short break 1–60, long break 1–90, sessions 1–12.');
      return null;
    }
    TN.clearErr(ERR);
    return { f: f, s: s, l: l, r: r };
  }
  function build() {
    var st = readSettings();
    if (!st) return false;
    phases = [];
    for (var i = 1; i <= st.r; i++) {
      phases.push({ label: 'Focus ' + i + ' of ' + st.r, secs: st.f * 60, focus: true, n: i });
      if (i < st.r) phases.push({ label: 'Short break', secs: st.s * 60, focus: false });
    }
    phases.push({ label: 'Long break', secs: st.l * 60, focus: false, long: true });
    return true;
  }
  function dots() {
    var r = parseInt(g('rounds').value, 10) || 4;
    var done = 0;
    for (var i = 0; i <= idx && i < phases.length; i++) if (phases[i].focus) done = phases[i].n;
    if (phases[idx] && phases[idx].long) done = r;
    var s = '';
    for (var j = 1; j <= r; j++) s += j <= done ? '●' : '○';
    return s;
  }
  function render() {
    if (!phases.length) return;
    set('phase', phases[idx].label);
    set('display', fmtMs(remainingMs));
    set('dots', dots());
    set('cycle', 'Cycle ' + cycle);
    g('start').textContent = running ? 'Pause' : 'Start';
  }
  function tick() {
    var rem = endStamp - Date.now();
    if (rem <= 0) { advance(); return; }
    remainingMs = rem;
    set('display', fmtMs(rem));
  }
  function advance() {
    beep();
    idx++;
    if (idx >= phases.length) { idx = 0; cycle++; }
    remainingMs = phases[idx].secs * 1000;
    if (running) endStamp = Date.now() + remainingMs;
    render();
  }
  function stopTimer() {
    if (timerId !== null) { clearInterval(timerId); timerId = null; }
    running = false;
  }
  function startPause() {
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
    idx = 0; cycle = 1;
    remainingMs = phases[0].secs * 1000;
    set('phase', 'Ready');
    render();
  }
  try {
    if (!build()) { phases = [{ label: 'Focus 1 of 4', secs: 1500, focus: true, n: 1 }]; }
    idx = 0; cycle = 1;
    remainingMs = phases[0].secs * 1000;
    render();
    TN.on(P + 'start', 'click', startPause);
    TN.on(P + 'skip', 'click', function () { if (!phases.length && !build()) return; advance(); });
    TN.on(P + 'reset', 'click', reset);
    ['focus', 'short', 'long', 'rounds'].forEach(function (k) {
      TN.on(P + k, 'change', function () { reset(); });
    });
  } catch (e) { /* never throw on load */ }
})();
