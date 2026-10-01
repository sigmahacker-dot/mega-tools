(function () {
  'use strict';
  var P = 'anniversary-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function fmtD(d) { return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  function blank() {
    set('until', '–'); set('num', '–'); set('total', '–');
    g('body').innerHTML = '<tr><td colspan="2" class="muted">Enter the original date to track the anniversary.</td></tr>';
  }
  function calc() {
    if (!g('date')) return;
    TN.clearErr(ERR);
    var v = g('date').value;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) { blank(); return; }
    var orig = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    var today = new Date(); today.setHours(0, 0, 0, 0);
    if (orig > today) { TN.setErr(ERR, 'The original date must be in the past.'); blank(); return; }
    var feb29 = orig.getMonth() === 1 && orig.getDate() === 29;
    var yr = today.getFullYear();
    function annivFor(y) {
      if (feb29 && !isLeap(y)) return new Date(y, 1, 28);
      return new Date(y, orig.getMonth(), orig.getDate());
    }
    var next = annivFor(yr);
    if (next < today) next = annivFor(yr + 1);
    var num = next.getFullYear() - orig.getFullYear();
    var until = Math.round((next - today) / 86400000);
    var total = Math.round((today - orig) / 86400000);
    set('until', until === 0 ? 'Today! 🎉' : String(until));
    set('num', ordinal(num));
    set('total', total.toLocaleString('en-US'));
    var rows = [
      ['Original date', fmtD(orig)],
      ['Next anniversary', fmtD(next) + (until === 0 ? ' — today!' : '')],
      ['Anniversary number', ordinal(num) + ' anniversary'],
      ['Days until', until === 0 ? 'Today' : until + ' days'],
      ['Total time together', Math.floor(total / 365.25) + ' years, ' + total.toLocaleString('en-US') + ' days'],
      ['Weekday of next', DAYS[next.getDay()]]
    ];
    if (feb29) rows.push(['Feb 29 note', isLeap(next.getFullYear()) ? 'Falls on Feb 29 this time.' : 'Observed on Feb 28 in this non-leap year.']);
    var html = '';
    rows.forEach(function (r) {
      html += '<tr><td>' + TN.esc(r[0]) + '</td><td>' + TN.esc(r[1]) + '</td></tr>';
    });
    g('body').innerHTML = html;
  }
  try {
    TN.on(P + 'date', 'input', calc);
    TN.on(P + 'date', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
