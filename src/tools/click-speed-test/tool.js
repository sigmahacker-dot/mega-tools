(function () {
  'use strict';
  var P = 'click-speed-test-';
  function g(id) { return document.getElementById(P + id); }
  var state = 'idle', clicks = 0, dur = 5, timeLeft = 0, timer = null, cdTimer = null;
  function lsKey() { return 'tn-click-speed-test-best-' + dur; }
  function getBest() {
    try { return parseFloat(localStorage.getItem(lsKey()) || '0') || 0; } catch (e) { return 0; }
  }
  function setBest(v) {
    try { localStorage.setItem(lsKey(), String(v)); } catch (e) {}
  }
  function fmtBest() {
    var b = getBest();
    return b > 0 ? b.toFixed(1) + ' cps' : '—';
  }
  function refreshBest() { var el = g('best'); if (el) el.textContent = fmtBest(); }
  function big(t) { var el = g('big'); if (el) el.textContent = t; }
  function sub(t) { var el = g('sub'); if (el) el.textContent = t; }
  function stats() {
    var c = g('clicks'); if (c) c.textContent = String(clicks);
    var t = g('time'); if (t) t.textContent = Math.max(0, timeLeft).toFixed(1) + 's';
    var cps = g('cps'); if (cps) cps.textContent = clicks > 0 && dur ? (clicks / (dur - Math.max(0, timeLeft))).toFixed(1) : '0.0';
  }
  function arenaColor(c) { var el = g('arena'); if (el) el.style.background = c; }
  function start() {
    stopAll();
    dur = g('dur') ? parseInt(g('dur').value, 10) : 5;
    state = 'countdown';
    clicks = 0;
    stats(); refreshBest();
    arenaColor('#44403c');
    var n = 3;
    big(String(n));
    sub('get ready…');
    cdTimer = setInterval(function () {
      n--;
      if (n <= 0) { clearInterval(cdTimer); cdTimer = null; go(); }
      else big(String(n));
    }, 750);
  }
  function go() {
    state = 'run';
    timeLeft = dur;
    clicks = 0;
    arenaColor('#4D7C0F');
    big('GO!');
    sub('click as fast as you can!');
    stats();
    var last = performance.now();
    timer = setInterval(function () {
      var now = performance.now();
      timeLeft -= (now - last) / 1000;
      last = now;
      if (timeLeft <= 0) { finish(); return; }
      stats();
    }, 50);
  }
  function finish() {
    stopAll();
    state = 'done';
    timeLeft = 0;
    var cps = clicks / dur;
    arenaColor('#292524');
    big(cps.toFixed(1) + ' cps');
    var prev = getBest(), isBest = cps > prev && clicks > 0;
    if (isBest) setBest(cps);
    sub(clicks + ' clicks in ' + dur + 's' + (isBest ? ' — new best!' : ''));
    stats();
    var el = g('cps'); if (el) el.textContent = cps.toFixed(1);
    refreshBest();
  }
  function stopAll() {
    if (timer) { clearInterval(timer); timer = null; }
    if (cdTimer) { clearInterval(cdTimer); cdTimer = null; }
  }
  function onArena(e) {
    if (state !== 'run') return;
    if (e && e.preventDefault) e.preventDefault();
    clicks++;
    stats();
  }
  try {
    if (!g('arena')) return;
    TN.on(P + 'start', 'click', start);
    TN.on(P + 'dur', 'change', function () {
      dur = parseInt(g('dur').value, 10);
      refreshBest();
      if (state === 'idle' || state === 'done') { clicks = 0; timeLeft = 0; stats(); }
    });
    var arena = g('arena');
    arena.addEventListener('pointerdown', onArena);
    refreshBest();
    stats();
  } catch (e) { /* never throw on load */ }
})();
