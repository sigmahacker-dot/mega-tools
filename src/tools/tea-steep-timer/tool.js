/* Tea Steep Timer — per-tea steep times, temps and brewing notes with countdown. */
(function () {
  'use strict';
  var SLUG = 'tea-steep-timer';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  var TEAS = {
    green:  { min: 2, temp: '80°C',  note: 'Use water just off the boil — let it sit ~2 minutes after boiling. Steep 1 tsp per cup; over-steeping makes green tea bitter.' },
    white:  { min: 4, temp: '75°C',  note: 'The most delicate tea. Use cooler water and a longer steep; white tea rarely turns bitter and can be re-steeped 2–3 times.' },
    oolong: { min: 3, temp: '90°C',  note: 'Hot but not boiling water. Oolong loves multiple short infusions — add 30 seconds for each re-steep.' },
    black:  { min: 4, temp: '100°C', note: 'Full rolling boil. Steep 3–5 minutes to taste; add milk or lemon after removing the leaves, never while steeping.' },
    herbal: { min: 6, temp: '100°C', note: 'Boiling water and a long steep extract full flavor from roots, flowers and fruit. Most herbals are caffeine-free.' }
  };

  var timerId = null, endAt = 0, totalMs = 0, lastWhole = -1;
  var actx = null;

  function beep(freq, dur, delay) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      var at = actx.currentTime + (delay || 0);
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.45, at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(at); o.stop(at + dur + 0.05);
    } catch (e) {}
  }

  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  function current() { return TEAS[$('type').value] || TEAS.green; }

  function showInfo() {
    var t = current();
    $('temp').textContent = t.temp;
    $('time').textContent = t.min + ':00';
    $('notes').textContent = t.note;
    if (!timerId) $('clock').textContent = t.min + ':00';
  }

  function tick() {
    var remain = endAt - Date.now();
    if (remain <= 0) {
      stopTick();
      $('clock').textContent = '0:00';
      beep(880, 0.4); beep(880, 0.4, 0.5); beep(1174, 0.8, 1.0);
      return;
    }
    $('clock').textContent = fmt(remain);
    lastWhole = Math.ceil(remain / 1000);
  }

  function stopTick() { if (timerId) { clearInterval(timerId); timerId = null; } }

  function start() {
    TN.clearErr(SLUG + '-error');
    beep(660, 0.1);
    stopTick();
    var t = current();
    totalMs = t.min * 60000;
    endAt = Date.now() + totalMs;
    showInfo();
    timerId = setInterval(tick, 250);
    tick();
  }

  function stop() {
    stopTick();
    showInfo();
  }

  try {
    TN.on(SLUG + '-type', 'change', showInfo);
    TN.on(SLUG + '-start', 'click', start);
    TN.on(SLUG + '-stop', 'click', stop);
    showInfo();
  } catch (e) { /* never throw on load */ }
})();
