(function () {
  'use strict';
  var ERR = 'event-countdown-error';
  var timer = null;
  var target = null;
  var label = '';

  function pad(n) { return ('0' + n).slice(-2); }

  function tick() {
    if (!target) return;
    var diff = target - Date.now();
    var msg = TN.el('event-countdown-msg');
    if (diff <= 0) {
      stop();
      TN.el('event-countdown-d').textContent = '0';
      TN.el('event-countdown-h').textContent = '00';
      TN.el('event-countdown-m').textContent = '00';
      TN.el('event-countdown-s').textContent = '00';
      if (msg) msg.textContent = 'That date has passed' + (label ? ' — ' + label + ' is over!' : '.');
      return;
    }
    var s = Math.floor(diff / 1000);
    TN.el('event-countdown-d').textContent = String(Math.floor(s / 86400));
    TN.el('event-countdown-h').textContent = pad(Math.floor(s % 86400 / 3600));
    TN.el('event-countdown-m').textContent = pad(Math.floor(s % 3600 / 60));
    TN.el('event-countdown-s').textContent = pad(s % 60);
    if (msg) msg.textContent = '';
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    target = null;
  }

  function start() {
    TN.clearErr(ERR);
    stop();
    var dtEl = TN.el('event-countdown-dt');
    var nameEl = TN.el('event-countdown-name');
    var v = dtEl ? dtEl.value : '';
    if (!v) { TN.setErr(ERR, 'Pick a date and time first.'); return; }
    var t = new Date(v);
    if (isNaN(t.getTime())) { TN.setErr(ERR, 'That date and time is not valid.'); return; }
    if (t.getTime() <= Date.now()) { TN.setErr(ERR, 'Pick a future date and time.'); return; }
    target = t.getTime();
    label = nameEl ? nameEl.value.trim() : '';
    var title = TN.el('event-countdown-title');
    if (title) title.textContent = label ? 'Countdown to ' + label : 'Countdown';
    tick();
    timer = setInterval(tick, 1000);
  }

  try {
    TN.on('event-countdown-start', 'click', start);
    TN.on('event-countdown-stop', 'click', function () {
      stop();
      TN.clearErr(ERR);
      var msg = TN.el('event-countdown-msg');
      if (msg) msg.textContent = 'Countdown stopped.';
    });
    window.addEventListener('beforeunload', stop);
  } catch (e) { /* never throw on load */ }
})();
