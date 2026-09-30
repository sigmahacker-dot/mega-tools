(function () {
  'use strict';
  var P = 'stopwatch-';
  function g(id) { return document.getElementById(P + id); }

  var display = g('display'), startBtn = g('start');
  if (!display || !startBtn) return;

  var startStamp = 0;      // performance.now() when (re)started
  var accumulated = 0;     // ms accumulated before current run
  var running = false;
  var timerId = null;
  var laps = [];
  var lastLapMark = 0;

  function pad(n, len) {
    n = String(n);
    while (n.length < len) n = '0' + n;
    return n;
  }

  function fmt(ms) {
    ms = Math.max(0, Math.floor(ms));
    var cs = Math.floor((ms % 1000) / 10);
    var s = Math.floor(ms / 1000) % 60;
    var m = Math.floor(ms / 60000);
    return pad(m, 2) + ':' + pad(s, 2) + '.' + pad(cs, 2);
  }

  function now() {
    return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  }

  function elapsed() {
    return accumulated + (running ? now() - startStamp : 0);
  }

  function tick() {
    display.textContent = fmt(elapsed());
  }

  function start() {
    if (running) {
      // Pause
      accumulated = elapsed();
      running = false;
      if (timerId !== null) { clearInterval(timerId); timerId = null; }
      startBtn.textContent = 'Start';
      return;
    }
    startStamp = now();
    running = true;
    timerId = setInterval(tick, 31);
    startBtn.textContent = 'Pause';
    tick();
  }

  function reset() {
    if (timerId !== null) { clearInterval(timerId); timerId = null; }
    running = false;
    accumulated = 0;
    laps = [];
    lastLapMark = 0;
    startBtn.textContent = 'Start';
    display.textContent = fmt(0);
    renderLaps();
    TN.clearErr(P + 'error');
  }

  function lap() {
    if (!running) {
      TN.setErr(P + 'error', 'Start the stopwatch before recording a lap.');
      return;
    }
    TN.clearErr(P + 'error');
    var total = elapsed();
    laps.push({ n: laps.length + 1, lap: total - lastLapMark, total: total });
    lastLapMark = total;
    renderLaps();
  }

  function renderLaps() {
    var list = g('laps'), empty = g('laps-empty');
    if (!list) return;
    var html = '';
    for (var i = laps.length - 1; i >= 0; i--) {
      var l = laps[i];
      html += '<li><span class="tag">Lap ' + l.n + '</span> ' + TN.esc(fmt(l.lap)) +
        ' <span class="muted">(' + TN.esc(fmt(l.total)) + ' total)</span></li>';
    }
    list.innerHTML = html;
    if (empty) empty.style.display = laps.length ? 'none' : '';
  }

  TN.on(startBtn, 'click', start);
  TN.on(g('lap'), 'click', lap);
  TN.on(g('reset'), 'click', reset);
  renderLaps();
})();
