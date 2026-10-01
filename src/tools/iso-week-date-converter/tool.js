/* ISO Week Date Converter — date ↔ ISO 8601 week date (YYYY-Www-D), both directions. */
(function () {
  'use strict';
  var SLUG = 'iso-week-date-converter';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  function parseDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return d;
  }

  /* ISO week of a local date. Returns {year, week, day} (day 1=Mon..7=Sun). */
  function isoWeek(d) {
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = (t.getUTCDay() + 6) % 7; // Mon=0
    t.setUTCDate(t.getUTCDate() - day + 3); // shift to Thursday of this week
    var isoYear = t.getUTCFullYear();
    var firstThu = new Date(Date.UTC(isoYear, 0, 4));
    var fday = (firstThu.getUTCDay() + 6) % 7;
    firstThu.setUTCDate(firstThu.getUTCDate() - fday + 3);
    var week = 1 + Math.round((t.getTime() - firstThu.getTime()) / (7 * 86400000));
    return { year: isoYear, week: week, day: day + 1 };
  }

  /* Number of ISO weeks in a year: 53 if Jan 1 is Thursday, or leap year starting Wednesday. */
  function weeksInYear(y) {
    var jan1 = (new Date(y, 0, 1).getDay() + 6) % 7; // Mon=0
    var leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    return (jan1 === 3 || (leap && jan1 === 2)) ? 53 : 52;
  }

  var DAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  function fwd() {
    TN.clearErr(SLUG + '-error');
    var d = parseDate($('date').value);
    if (!d) { TN.setErr(SLUG + '-error', 'Please pick a valid calendar date.'); return; }
    var w = isoWeek(d);
    var ww = ('0' + w.week).slice(-2);
    $('fwdout').innerHTML = '<p>ISO week date: <strong class="code">' + w.year + '-W' + ww + '-' + w.day +
      '</strong></p><p class="muted">' + DAYS[w.day] + ', week ' + w.week + ' of ISO year ' + w.year + '.</p>';
  }

  function rev() {
    TN.clearErr(SLUG + '-error');
    var y = parseInt($('year').value, 10);
    var w = parseInt($('week').value, 10);
    var day = parseInt($('day').value, 10);
    if (!(y >= 1 && y <= 9999)) { TN.setErr(SLUG + '-error', 'ISO year must be 1–9999.'); return; }
    var maxW = weeksInYear(y);
    if (!(w >= 1 && w <= maxW)) { TN.setErr(SLUG + '-error', 'ISO year ' + y + ' has ' + maxW + ' weeks — week must be 1–' + maxW + '.'); return; }
    // Jan 4 is always in week 1; Monday of week 1:
    var jan4 = new Date(y, 0, 4);
    var jan4dow = (jan4.getDay() + 6) % 7; // Mon=0
    var mon1 = new Date(y, 0, 4 - jan4dow);
    var target = new Date(mon1.getFullYear(), mon1.getMonth(), mon1.getDate() + (w - 1) * 7 + (day - 1));
    var ds = target.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    var iso = target.getFullYear() + '-' + ('0' + (target.getMonth() + 1)).slice(-2) + '-' + ('0' + target.getDate()).slice(-2);
    $('revout').innerHTML = '<p><strong>' + ds + '</strong> <span class="code">' + iso + '</span></p>' +
      '<p class="muted">That is ' + DAYS[day] + ' of week ' + w + ', ISO year ' + y +
      (day === 1 ? ' — the Monday of that week.' : '.') + '</p>';
  }

  try {
    TN.on(SLUG + '-fwd', 'click', fwd);
    TN.on(SLUG + '-rev', 'click', rev);
  } catch (e) { /* never throw on load */ }
})();
