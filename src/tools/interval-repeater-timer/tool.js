/* Interval Repeater Timer — looping work/rest phases with rounds, beeps, progress. */
(function () {
  'use strict';
  var SLUG = 'interval-repeater-timer';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  var timerId = null, lastTick = 0;
  var phases = [];      // [{label, ms}]
  var pIdx = 0, remain = 0, totalMs = 0, elapsedTotal = 0;
  var lastWholeSec = -1;
  var actx = null;

  function beep(freq, dur) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      var at = actx.currentTime;
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.5, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(at); o.stop(at + dur + 0.05);
    } catch (e) {}
  }

  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  function buildPhases() {
    var work = Math.min(3600, Math.max(1, parseInt($('work').value, 10) || 30));
    var rest = Math.min(3600, Math.max(1, parseInt($('rest').value, 10) || 10));
    var rounds = Math.min(99, Math.max(1, parseInt($('rounds').value, 10) || 5));
    $('work').value = work; $('rest').value = rest; $('rounds').value = rounds;
    phases = [];
    for (var r = 0; r < rounds; r++) {
      phases.push({ label: 'WORK', ms: work * 1000, round: r + 1, rounds: rounds, work: true });
      if (r < rounds - 1) phases.push({ label: 'REST', ms: rest * 1000, round: r + 1, rounds: rounds, work: false });
    }
    totalMs = phases.reduce(function (a, p) { return a + p.ms; }, 0);
  }

  function render() {
    var p = phases[pIdx];
    if (!p) return;
    $('phase').textContent = p.label;
    $('phase').style.color = p.work ? '#c62828' : '#2e7d32';
    $('clock').textContent = fmt(remain);
    $('round').textContent = 'Round ' + p.round + ' of ' + p.rounds + ' · ' + phases.length + ' phases total';
    var done = Math.min(100, elapsedTotal / totalMs * 100);
    $('bar').style.width = done + '%';
  }

  function phaseChange() {
    var p = phases[pIdx];
    remain = p.ms;
    lastWholeSec = -1;
    beep(p.work ? 880 : 520, 0.5);
    render();
  }

  function finish() {
    stop();
    $('phase').textContent = 'DONE 🎉';
    $('phase').style.color = '#2e7d32';
    $('clock').textContent = '0:00';
    $('bar').style.width = '100%';
    beep(660, 0.3); setTimeout(function () { beep(660, 0.3); }, 350);
    setTimeout(function () { beep(990, 0.7); }, 700);
  }

  function tick() {
    var now = Date.now();
    var dt = now - lastTick;
    lastTick = now;
    remain -= dt;
    elapsedTotal += dt;
    var whole = Math.ceil(remain / 1000);
    if (whole !== lastWholeSec) {
      lastWholeSec = whole;
      if (whole <= 3 && whole > 0) beep(1000, 0.12); // 3-2-1 countdown
    }
    if (remain <= 0) {
      pIdx++;
      if (pIdx >= phases.length) { finish(); return; }
      phaseChange();
      return;
    }
    render();
  }

  function start() {
    TN.clearErr(SLUG + '-error');
    stop();
    buildPhases();
    beep(700, 0.1); // unlock audio on gesture
    pIdx = 0; elapsedTotal = 0;
    $('phase').textContent = 'Get ready…';
    $('phase').style.color = '#555';
    setTimeout(function () {
      if (!phases.length) return;
      phaseChange();
      lastTick = Date.now();
      timerId = setInterval(tick, 100);
    }, 600);
  }

  function stop() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  function stopBtn() {
    stop();
    phases = [];
    $('phase').textContent = 'Ready';
    $('phase').style.color = '';
    $('clock').textContent = '0:00';
    $('round').textContent = 'Round — of —';
    $('bar').style.width = '0%';
  }

  try {
    TN.on(SLUG + '-start', 'click', start);
    TN.on(SLUG + '-stop', 'click', stopBtn);
  } catch (e) { /* never throw on load */ }
})();
