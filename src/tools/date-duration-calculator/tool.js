(function () {
  'use strict';
  var ERR = 'date-duration-calculator-error';

  function fmt(n) {
    try { return n.toLocaleString('en-US'); } catch (e) { return String(n); }
  }

  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

  function clampAdd(date, years, months) {
    var y = date.getFullYear() + years;
    var m = date.getMonth() + months;
    y += Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;
    var d = Math.min(date.getDate(), daysInMonth(y, m));
    return new Date(y, m, d, 0, 0, 0, 0);
  }

  function parse(d) {
    if (!d) return null;
    var dt = new Date(d + 'T00:00:00');
    return isNaN(dt.getTime()) ? null : dt;
  }

  function businessDays(from, to) {
    // Count Mon–Fri in [from, to)
    var total = Math.floor((to - from) / 86400000);
    var fullWeeks = Math.floor(total / 7);
    var count = fullWeeks * 5;
    var startDow = from.getDay(); // 0=Sun
    for (var i = 0; i < total % 7; i++) {
      var dow = (startDow + i) % 7;
      if (dow !== 0 && dow !== 6) count++;
    }
    return count;
  }

  function calc() {
    TN.clearErr(ERR);
    try {
      var from = parse(TN.el('date-duration-calculator-from').value);
      var to = parse(TN.el('date-duration-calculator-to').value);
      if (!from || !to) throw new Error('Please pick both dates.');
      var start = from < to ? from : to;
      var end = from < to ? to : from;

      var y = 0;
      while (clampAdd(start, y + 1, 0) <= end) y++;
      var m = 0;
      while (clampAdd(start, y, m + 1) <= end) m++;
      var rest = clampAdd(start, y, m);
      var d = Math.round((end - rest) / 86400000);

      var totalDays = Math.round((end - start) / 86400000);
      var weeks = Math.floor(totalDays / 7);
      var remDays = totalDays % 7;

      TN.el('date-duration-calculator-ymd').textContent = y + 'y ' + m + 'm ' + d + 'd';
      TN.el('date-duration-calculator-days').textContent = fmt(totalDays);
      var bizEl = TN.el('date-duration-calculator-business');
      TN.el('date-duration-calculator-bdays').textContent =
        (bizEl && bizEl.checked) ? fmt(businessDays(start, end)) : '–';
      TN.el('date-duration-calculator-weeks').textContent = fmt(weeks) + ' weeks' + (remDays ? ' + ' + remDays + ' day' + (remDays === 1 ? '' : 's') : '');
      TN.el('date-duration-calculator-hours').textContent = fmt(totalDays * 24);
      TN.el('date-duration-calculator-minutes').textContent = fmt(totalDays * 24 * 60);
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  try {
    TN.on('date-duration-calculator-go', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
