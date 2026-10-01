(function () {
  'use strict';
  var P = 'add-subtract-days-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return null;
    var d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    return isNaN(d.getTime()) ? null : d;
  }
  function fmtDate(d) {
    return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  function addMonthsClamped(d, n) {
    var day = d.getDate();
    var r = new Date(d.getFullYear(), d.getMonth() + n, 1);
    var last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(day, last));
    return r;
  }
  function blank() {
    set('res', '–'); set('dow', '–'); set('fromtoday', '–');
    set('steps', 'Choose a start date and an amount.');
  }
  function calc() {
    if (!g('start')) return;
    TN.clearErr(ERR);
    var start = parseDate(g('start').value);
    var amtRaw = g('amt').value;
    if (!start) { blank(); return; }
    if (amtRaw === '') { blank(); return; }
    var amt = parseFloat(amtRaw);
    if (isNaN(amt) || Math.floor(amt) !== amt || amt < 0 || amt > 100000) {
      TN.setErr(ERR, 'Enter a whole amount between 0 and 100,000.'); blank(); return;
    }
    var dir = g('op').value === 'add' ? 1 : -1;
    var unit = g('unit').value;
    var biz = g('biz').checked;
    var res;
    if (biz && unit === 'days') {
      res = new Date(start.getTime());
      var left = amt;
      while (left > 0) {
        res.setDate(res.getDate() + dir);
        var dw = res.getDay();
        if (dw !== 0 && dw !== 6) left--;
      }
    } else if (unit === 'days') {
      res = new Date(start.getTime()); res.setDate(res.getDate() + dir * amt);
    } else if (unit === 'weeks') {
      res = new Date(start.getTime()); res.setDate(res.getDate() + dir * amt * 7);
    } else if (unit === 'months') {
      res = addMonthsClamped(start, dir * amt);
    } else {
      res = addMonthsClamped(start, dir * amt * 12);
    }
    set('res', fmtDate(res));
    set('dow', DAYS[res.getDay()]);
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var diff = Math.round((res - today) / 86400000);
    set('fromtoday', diff === 0 ? 'today' : (Math.abs(diff) + (diff > 0 ? ' in the future' : ' in the past')));
    set('steps', fmtDate(start) + ' ' + (dir > 0 ? '+' : '−') + ' ' + amt + ' ' + unit +
      (biz && unit === 'days' ? ' (business days, weekends skipped)' : '') + ' = ' + fmtDate(res) + '.');
  }
  try {
    var t = new Date();
    g('start').value = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    ['start', 'amt'].forEach(function (k) { TN.on(P + k, 'input', calc); });
    TN.on(P + 'start', 'change', calc);
    ['op', 'unit'].forEach(function (k) { TN.on(P + k, 'change', calc); });
    TN.on(P + 'biz', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
