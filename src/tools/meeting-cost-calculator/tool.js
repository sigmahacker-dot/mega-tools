(function () {
  'use strict';
  var P = 'meeting-cost-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function money(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function f1(n) { return String(Number(n.toFixed(1))); }
  function blank() {
    ['once', 'week', 'year'].forEach(function (k) { set(k, '–'); });
    g('body').innerHTML = '<tr><td colspan="3" class="muted">Enter the meeting details to see its true cost.</td></tr>';
  }
  function calc() {
    if (!g('people')) return;
    TN.clearErr(ERR);
    var keys = ['people', 'rate', 'mins', 'perweek'];
    var vals = {};
    for (var i = 0; i < keys.length; i++) {
      var raw = g(keys[i]).value;
      if (raw === '') { blank(); return; }
      var v = parseFloat(raw);
      if (isNaN(v)) { TN.setErr(ERR, 'Enter valid numbers for all fields.'); blank(); return; }
      vals[keys[i]] = v;
    }
    if (vals.people < 1 || vals.people > 10000 || Math.floor(vals.people) !== vals.people) {
      TN.setErr(ERR, 'Attendees must be a whole number between 1 and 10,000.'); blank(); return;
    }
    if (vals.rate < 0 || vals.mins <= 0 || vals.mins > 1440 || vals.perweek < 1 || vals.perweek > 100) {
      TN.setErr(ERR, 'Check the ranges: rate ≥ 0, duration 1–1440 min, meetings/week 1–100.'); blank(); return;
    }
    var perMeeting = vals.people * vals.rate * vals.mins / 60;
    var hoursEach = vals.mins / 60;
    var rows = [
      ['Per meeting', perMeeting, vals.people * hoursEach],
      ['Per week', perMeeting * vals.perweek, vals.people * hoursEach * vals.perweek],
      ['Per month', perMeeting * vals.perweek * 52 / 12, vals.people * hoursEach * vals.perweek * 52 / 12],
      ['Per year', perMeeting * vals.perweek * 52, vals.people * hoursEach * vals.perweek * 52]
    ];
    set('once', money(perMeeting));
    set('week', money(perMeeting * vals.perweek));
    set('year', money(perMeeting * vals.perweek * 52));
    var html = '';
    rows.forEach(function (r) {
      html += '<tr><td>' + TN.esc(r[0]) + '</td><td>' + TN.esc(money(r[1])) + '</td><td>' + TN.esc(f1(r[2])) + ' h</td></tr>';
    });
    g('body').innerHTML = html;
  }
  try {
    ['people', 'rate', 'mins', 'perweek'].forEach(function (k) { TN.on(P + k, 'input', calc); });
    calc();
  } catch (e) { /* never throw on load */ }
})();
