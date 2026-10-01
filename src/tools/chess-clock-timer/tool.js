/* Chess Clock Timer — two clocks, tap-to-switch, increment, flag detection. */
(function () {
  'use strict';
  var SLUG = 'chess-clock-timer';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  var t = [600000, 600000];   // ms remaining per player
  var active = -1;            // index of running clock, -1 = none
  var running = false;
  var over = false;
  var timerId = null, lastTick = 0;
  var actx = null;

  function beep(freq, dur, delay) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      var at = actx.currentTime + (delay || 0);
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'square'; o.frequency.value = freq || 660;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.25, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + (dur || 0.3));
      o.connect(g); g.connect(actx.destination);
      o.start(at); o.stop(at + (dur || 0.3) + 0.05);
    } catch (e) {}
  }

  function fmt(ms) {
    var s = Math.max(0, ms) / 1000;
    var m = Math.floor(s / 60), sec = Math.floor(s % 60);
    var str = m + ':' + (sec < 10 ? '0' : '') + sec;
    if (s < 20) str += '.' + Math.floor((s % 1) * 10);
    return str;
  }

  function render() {
    $('p1').textContent = fmt(t[0]);
    $('p2').textContent = fmt(t[1]);
    ['p1', 'p2'].forEach(function (pid, i) {
      var el = $(pid);
      if (over && t[i] <= 0) {
        el.style.background = '#ef5350'; el.style.color = '#fff'; el.style.borderColor = '#c62828';
      } else if (running && active === i) {
        el.style.background = '#e8f5e9'; el.style.borderColor = '#2e7d32'; el.style.color = '#1b5e20';
      } else {
        el.style.background = '#f5f5f5'; el.style.color = '#222'; el.style.borderColor = '#ccc';
      }
    });
  }

  function stopTick() { if (timerId) { clearInterval(timerId); timerId = null; } }

  function tick() {
    var now = Date.now();
    var dt = now - lastTick;
    lastTick = now;
    if (active < 0) return;
    t[active] -= dt;
    if (t[active] <= 0) {
      t[active] = 0;
      over = true; running = false;
      stopTick();
      $('msg').textContent = '🏁 Flag! Player ' + (active + 1) + ' ran out of time.';
      beep(440, 0.5); beep(440, 0.5, 0.6); beep(330, 0.9, 1.2);
    }
    render();
  }

  function startTick() {
    stopTick();
    lastTick = Date.now();
    timerId = setInterval(tick, 100);
  }

  function press(i) {
    if (over) return;
    beep(880, 0.06); // unlock audio on gesture
    if (!running) {
      // first press: start the OTHER clock
      active = 1 - i;
      running = true;
      $('msg').textContent = "Player " + (active + 1) + "'s clock is running.";
      startTick(); render();
      return;
    }
    if (i === active) {
      var inc = Math.max(0, parseInt($('inc').value, 10) || 0);
      t[i] += inc * 1000;
      active = 1 - i;
      $('msg').textContent = "Player " + (active + 1) + "'s clock is running.";
      render();
    }
    // pressing the non-running side while running: ignore
  }

  function pause() {
    if (over || !running) return;
    running = false;
    stopTick();
    $('msg').textContent = 'Paused.';
    render();
  }

  function reset() {
    stopTick();
    var mins = Math.min(180, Math.max(1, parseInt($('mins').value, 10) || 10));
    $('mins').value = mins;
    t = [mins * 60000, mins * 60000];
    active = -1; running = false; over = false;
    $('msg').textContent = 'Tap a side to start. Tap your own side after your move.';
    render();
  }

  try {
    TN.on(SLUG + '-p1', 'click', function () { press(0); });
    TN.on(SLUG + '-p2', 'click', function () { press(1); });
    TN.on(SLUG + '-pause', 'click', pause);
    TN.on(SLUG + '-reset', 'click', reset);
    TN.on(SLUG + '-mins', 'change', reset);
    reset();
  } catch (e) { /* never throw on load */ }
})();
