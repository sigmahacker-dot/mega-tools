(function () {
  'use strict';
  var P = 'wedding-countdown-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var timerId = null, target = null;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    if (!target) return;
    var diff = target - Date.now();
    if (diff <= 0) {
      var days = Math.floor(-diff / 86400000);
      set('label', '💍 Married!');
      set('display', days === 0 ? 'Just married!' : days.toLocaleString('en-US') + ' days of marriage');
      set('weeks', String(Math.floor(days / 7)));
      set('months', (days / 30.44).toFixed(1));
      return;
    }
    var d = Math.floor(diff / 86400000),
        h = Math.floor(diff % 86400000 / 3600000),
        m = Math.floor(diff % 3600000 / 60000),
        s = Math.floor(diff % 60000 / 1000);
    set('label', 'Time remaining');
    set('display', d + 'd : ' + pad(h) + 'h : ' + pad(m) + 'm : ' + pad(s) + 's');
    set('weeks', (diff / 604800000).toFixed(1));
    set('months', (diff / 2629800000).toFixed(1));
  }
  function calc() {
    if (!g('date')) return;
    TN.clearErr(ERR);
    var v = g('date').value;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) {
      target = null;
      if (timerId !== null) { clearInterval(timerId); timerId = null; }
      set('display', '–'); set('weeks', '–'); set('months', '–'); set('dow', '–');
      set('label', 'Time remaining');
      set('note', 'Enter the wedding date to start the countdown.');
      return;
    }
    var t = /^(\d{2}):(\d{2})$/.exec(g('time').value || '');
    var hh = t ? parseInt(t[1], 10) : 0, mm = t ? parseInt(t[2], 10) : 0;
    target = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), hh, mm, 0).getTime();
    set('dow', DAYS[new Date(target).getDay()]);
    set('note', 'Counting down to ' + DAYS[new Date(target).getDay()] + ', ' +
      MONTHS[new Date(target).getMonth()] + ' ' + new Date(target).getDate() + ', ' + new Date(target).getFullYear() + '.');
    if (timerId === null) timerId = setInterval(tick, 1000);
    tick();
  }
  try {
    TN.on(P + 'date', 'input', calc);
    TN.on(P + 'date', 'change', calc);
    TN.on(P + 'time', 'input', calc);
    TN.on(P + 'time', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
