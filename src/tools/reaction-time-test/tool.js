(function () {
  'use strict';
  var P = 'reaction-time-test-';
  var ERR = P + 'error';
  var BEST_KEY = 'tn-reaction-best';
  var ROUNDS = 5;
  var phase = 'idle', times = [], t0 = 0, waitTimer = null, best = null;
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function loadBest() {
    best = null;
    try {
      var v = localStorage.getItem(BEST_KEY);
      best = v === null ? null : parseInt(v, 10);
      if (isNaN(best)) best = null;
    } catch (e) { best = null; }
    set('best', best === null ? '–' : String(best));
  }
  function setBox(cls, msg) {
    var box = g('box'), m = g('msg');
    if (box) box.className = 'rtt-box ' + cls;
    if (m) m.textContent = msg;
  }
  function clearWait() { if (waitTimer) { clearTimeout(waitTimer); waitTimer = null; } }
  function startRound() {
    phase = 'waiting';
    setBox('rtt-wait', 'Wait for green…');
    clearWait();
    waitTimer = setTimeout(function () {
      phase = 'ready';
      t0 = performance.now();
      setBox('rtt-ready', 'CLICK!');
    }, 1500 + Math.random() * 3000);
  }
  function rating(avg) {
    if (avg < 200) return 'Excellent — pro-level reflexes!';
    if (avg < 250) return 'Great — faster than most people.';
    if (avg < 300) return 'Good — a solid average.';
    if (avg < 400) return 'Average — room to improve.';
    return 'Warming up — try again!';
  }
  function clickBox() {
    TN.clearErr(ERR);
    if (phase === 'idle') {
      startRound();
    } else if (phase === 'waiting') {
      clearWait();
      phase = 'idle';
      setBox('rtt-idle', 'Too soon! That round is void — click to retry round ' + (times.length + 1));
    } else if (phase === 'ready') {
      var rt = Math.round(performance.now() - t0);
      times.push(rt);
      set('last', String(rt));
      if (times.length >= ROUNDS) {
        phase = 'done';
        var sum = 0, i;
        for (i = 0; i < times.length; i++) sum += times[i];
        var avg = Math.round(sum / times.length);
        var isBest = best === null || avg < best;
        if (isBest) {
          best = avg;
          try { localStorage.setItem(BEST_KEY, String(avg)); } catch (e) { /* ignore */ }
          set('best', String(avg));
        }
        set('round', ROUNDS + '/' + ROUNDS);
        setBox('rtt-idle', 'Done! Click to try again');
        var res = g('result');
        if (res) {
          res.innerHTML = '<p>⚡ <strong>Average: ' + avg + ' ms</strong><br>' + rating(avg) +
            (isBest ? '<br>🏆 New best average!' : '') +
            '<br><span class="muted">Rounds: ' + times.join(' ms, ') + ' ms</span></p>';
          res.classList.remove('hidden');
        }
        times = [];
      } else {
        phase = 'idle';
        set('round', times.length + '/' + ROUNDS);
        setBox('rtt-idle', 'Round ' + (times.length + 1) + ' of ' + ROUNDS + ' — click to start');
      }
    } else if (phase === 'done') {
      reset();
      startRound();
    }
  }
  function reset() {
    clearWait();
    phase = 'idle';
    times = [];
    set('round', '0/' + ROUNDS);
    set('last', '–');
    setBox('rtt-idle', 'Click to start');
    var res = g('result');
    if (res) { res.innerHTML = ''; res.classList.add('hidden'); }
    TN.clearErr(ERR);
  }
  try {
    loadBest();
    TN.on(P + 'box', 'click', clickBox);
    TN.on(P + 'box', 'keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickBox(); }
    });
    TN.on(P + 'reset', 'click', reset);
  } catch (e) { /* never throw on load */ }
})();
