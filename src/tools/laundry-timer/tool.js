/* Laundry Timer — two independent washer/dryer countdowns with alarms. */
(function () {
  'use strict';
  var SLUG = 'laundry-timer';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };
  var actx = null;

  function beep(freq, dur, delay) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      var at = actx.currentTime + (delay || 0);
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.5, at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(at); o.stop(at + dur + 0.05);
    } catch (e) {}
  }

  function alarm() {
    for (var i = 0; i < 4; i++) { beep(784, 0.3, i * 0.45); }
  }

  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h ? h + ':' + ('0' + m).slice(-2) : m) + ':' + ('0' + sec).slice(-2);
  }

  function makeMachine(prefix, label) {
    var st = { timerId: null, endAt: 0, pausedMs: 0 };
    function clockEl() { return $(prefix + '-clock'); }
    function stopTick() { if (st.timerId) { clearInterval(st.timerId); st.timerId = null; } }

    function tick() {
      var remain = st.endAt - Date.now();
      if (remain <= 0) {
        stopTick();
        clockEl().textContent = '0:00';
        alarm();
        $(prefix + '-start').textContent = 'Start';
        return;
      }
      clockEl().textContent = fmt(remain);
    }

    function startPause() {
      TN.clearErr(SLUG + '-error');
      if (st.timerId) {
        // pause
        st.pausedMs = st.endAt - Date.now();
        stopTick();
        $(prefix + '-start').textContent = 'Resume';
        return;
      }
      beep(660, 0.08); // unlock audio
      var remain;
      if (st.pausedMs > 0) {
        remain = st.pausedMs;
        st.pausedMs = 0;
      } else {
        var custom = parseInt($(prefix + '-custom').value, 10);
        var mins = custom > 0 ? custom : parseInt($(prefix + '-preset').value, 10);
        if (!mins || mins < 1 || mins > 300) { TN.setErr(SLUG + '-error', label + ': enter 1–300 minutes.'); return; }
        remain = mins * 60000;
      }
      st.endAt = Date.now() + remain;
      $(prefix + '-start').textContent = 'Pause';
      st.timerId = setInterval(tick, 250);
      tick();
    }

    function reset() {
      stopTick();
      st.pausedMs = 0;
      clockEl().textContent = '0:00';
      $(prefix + '-start').textContent = 'Start';
    }

    TN.on(SLUG + '-' + prefix + '-start', 'click', startPause);
    TN.on(SLUG + '-' + prefix + '-reset', 'click', reset);
  }

  try {
    makeMachine('w', 'Washer');
    makeMachine('d', 'Dryer');
  } catch (e) { /* never throw on load */ }
})();
