(function () {
  'use strict';
  var P = 'work-break-timer-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var onWork = true, cycles = 0;
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
      o.type = 'sine'; o.frequency.value = onWork ? 660 : 880;
      gn.gain.setValueAtTime(0.001, ctx.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.03);
      gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      o.start(); o.stop(ctx.currentTime + 0.65);
    } catch (e) { /* audio unavailable */ }
  }
  function readSettings() {
    var w = parseInt(g('work').value, 10), b = parseInt(g('break').value, 10);
    if ([w, b].some(isNaN) || w < 1 || w > 480 || b < 1 || b > 180) {
      TN.setErr(ERR, 'Check the settings: work 1–480 min, break 1–180 min.');
      return null;
    }
    TN.clearErr(ERR);
    return { w: w, b: b };
  }
  function render() {
    set('phase', onWork ? '💼 Work' : '☕ Break');
    set('display', fmtMs(remainingMs));
    set('cycles', 'Completed cycles: ' + cycles);
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
    if (!onWork) cycles++;
    onWork = !onWork;
    var st = readSettings() || { w: 90, b: 20 };
    remainingMs = (onWork ? st.w : st.b) * 60000;
    if (running) endStamp = Date.now() + remainingMs;
    render();
  }
  function stopTimer() {
    if (timerId !== null) { clearInterval(timerId); timerId = null; }
    running = false;
  }
  function startPause() {
    var st = readSettings();
    if (!st) return;
    if (running) {
      remainingMs = Math.max(0, endStamp - Date.now());
      stopTimer(); render(); return;
    }
    endStamp = Date.now() + remainingMs;
    running = true;
    timerId = setInterval(tick, 250);
    render();
  }
  function reset() {
    stopTimer();
    var st = readSettings();
    if (!st) return;
    onWork = true; cycles = 0;
    remainingMs = st.w * 60000;
    set('phase', 'Ready');
    render();
  }
  try {
    remainingMs = 90 * 60000;
    render();
    TN.on(P + 'start', 'click', startPause);
    TN.on(P + 'reset', 'click', reset);
    TN.on(P + 'work', 'change', reset);
    TN.on(P + 'break', 'change', reset);
  } catch (e) { /* never throw on load */ }
})();
