(function () {
  'use strict';
  var P = 'recurring-date-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtD(d) { return DAYS[d.getDay()] + ' ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }
  function addMonthsClamped(d, n) {
    var day = d.getDate();
    var r = new Date(d.getFullYear(), d.getMonth() + n, 1);
    var last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(day, last));
    return r;
  }
  function blank() {
    set('first', '–'); set('last', '–'); set('span', '–');
    g('body').innerHTML = '<tr><td colspan="3" class="muted">Pick a start date to generate the series.</td></tr>';
  }
  function calc() {
    if (!g('start')) return;
    TN.clearErr(ERR);
    var freq = g('freq').value;
    g('nwrap').style.display = freq === 'ndays' ? '' : 'none';
    var v = g('start').value;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) { blank(); return; }
    var start = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    var count = parseInt(g('count').value, 10);
    if (isNaN(count) || count < 1 || count > 60) { TN.setErr(ERR, 'Occurrences must be between 1 and 60.'); blank(); return; }
    var stepDays = freq === 'daily' ? 1 : freq === 'weekly' ? 7 : freq === 'biweekly' ? 14 : 0;
    var stepMonths = freq === 'monthly' ? 1 : freq === 'quarterly' ? 3 : freq === 'yearly' ? 12 : 0;
    if (freq === 'ndays') {
      var n = parseInt(g('n').value, 10);
      if (isNaN(n) || n < 1 || n > 3650) { TN.setErr(ERR, 'N must be between 1 and 3650 days.'); blank(); return; }
      stepDays = n;
    }
    var dates = [], d = new Date(start.getTime());
    for (var i = 0; i < count; i++) {
      dates.push(new Date(d.getTime()));
      d = stepMonths ? addMonthsClamped(d, stepMonths) : new Date(d.getTime() + stepDays * 86400000);
    }
    set('first', MONTHS[dates[0].getMonth()] + ' ' + dates[0].getDate() + ', ' + dates[0].getFullYear());
    var last = dates[dates.length - 1];
    set('last', MONTHS[last.getMonth()] + ' ' + last.getDate() + ', ' + last.getFullYear());
    set('span', String(Math.round((last - dates[0]) / 86400000)));
    var html = '';
    dates.forEach(function (dt, i) {
      html += '<tr><td>' + (i + 1) + '</td><td>' + TN.esc(fmtD(dt)) + '</td><td>' +
        TN.esc(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dt.getDay()]) + '</td></tr>';
    });
    g('body').innerHTML = html;
  }
  try {
    var t = new Date();
    g('start').value = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    TN.on(P + 'start', 'input', calc);
    TN.on(P + 'start', 'change', calc);
    TN.on(P + 'freq', 'change', calc);
    TN.on(P + 'n', 'input', calc);
    TN.on(P + 'count', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
