(function () {
  'use strict';
  var ERR = 'week-number-calculator-error';

  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }

  // ISO-8601 week via the Thursday rule (all in UTC to avoid DST issues)
  function isoWeek(date) {
    var t = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var day = (t.getUTCDay() + 6) % 7; // Monday = 0
    t.setUTCDate(t.getUTCDate() - day + 3); // shift to Thursday
    var weekYear = t.getUTCFullYear();
    var firstThu = new Date(Date.UTC(weekYear, 0, 4));
    var fday = (firstThu.getUTCDay() + 6) % 7;
    firstThu.setUTCDate(firstThu.getUTCDate() - fday + 3);
    var week = 1 + Math.round((t.getTime() - firstThu.getTime()) / 6048e5);
    return { week: week, year: weekYear };
  }

  function calc() {
    TN.clearErr(ERR);
    try {
      var el = TN.el('week-number-calculator-date');
      var v = el ? el.value : '';
      if (!v) throw new Error('Pick a date.');
      var d = new Date(v + 'T00:00:00');
      if (isNaN(d.getTime())) throw new Error('That date is not valid.');
      var iso = isoWeek(d);
      var startOfYear = new Date(d.getFullYear(), 0, 1);
      var doy = Math.round((d - startOfYear) / 86400000) + 1;
      var totalDays = isLeap(d.getFullYear()) ? 366 : 365;
      var q = Math.floor(d.getMonth() / 3) + 1;
      var weekday = '';
      try { weekday = d.toLocaleDateString('en-US', { weekday: 'long' }); } catch (e) { weekday = ''; }

      TN.el('week-number-calculator-week').textContent = 'W' + ('0' + iso.week).slice(-2);
      TN.el('week-number-calculator-doy').textContent = String(doy);
      TN.el('week-number-calculator-q').textContent = 'Q' + q;
      TN.el('week-number-calculator-wy').textContent = String(iso.year);
      TN.el('week-number-calculator-wd').textContent = weekday || '–';
      TN.el('week-number-calculator-rem').textContent = String(totalDays - doy);
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  try {
    var el = TN.el('week-number-calculator-date');
    if (el && !el.value) {
      var now = new Date();
      el.value = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
    }
    TN.on('week-number-calculator-go', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
