(function () {
  'use strict';
  var P = 'birthday-countdown-';
  function g(id) { return document.getElementById(P + id); }

  var dateInput = g('date');
  if (!dateInput) return;
  // Don't allow picking a future birth date.
  try { dateInput.max = new Date().toISOString().slice(0, 10); } catch (e) {}

  var timer = null, target = null, birthYear = 0, leapNote = '';

  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0); }

  function nextBirthday(month, day, year) {
    var now = new Date(), y = now.getFullYear();
    leapNote = '';
    var mm = month, dd = day;
    if (mm === 1 && dd === 29 && !isLeap(y)) { dd = 28; leapNote = ' (Feb 29 birthdays are celebrated on Feb 28 in non-leap years)'; }
    var cand = new Date(y, mm, dd, 0, 0, 0);
    if (cand.getTime() < now.getTime() - 1000) {
      y++;
      dd = day; mm = month;
      if (mm === 1 && dd === 29 && !isLeap(y)) { dd = 28; leapNote = ' (Feb 29 birthdays are celebrated on Feb 28 in non-leap years)'; }
      cand = new Date(y, mm, dd, 0, 0, 0);
    }
    return cand;
  }

  function funMessage(daysLeft) {
    if (daysLeft <= 0) return 'Happy Birthday! Cake, candles and zero responsibilities today — enjoy every minute of it.';
    if (daysLeft === 1) return 'Just one more sleep! Try to act surprised when everyone sings.';
    if (daysLeft <= 7) return 'Less than a week to go! Time to drop heavy hints about the perfect gift.';
    if (daysLeft <= 30) return 'Under a month away — close enough to start the official countdown dance.';
    if (daysLeft <= 100) return 'Double digits of days left. The anticipation is the best part (mostly).';
    return 'A while to wait yet — plenty of time to plan something legendary.';
  }

  function tick() {
    if (!target) return;
    var now = new Date();
    var diff = target.getTime() - now.getTime();
    if (diff < 0) diff = 0;
    var totalSec = Math.floor(diff / 1000);
    var d = Math.floor(totalSec / 86400);
    var h = Math.floor((totalSec % 86400) / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    var el;
    el = g('d'); if (el) el.textContent = d;
    el = g('h'); if (el) el.textContent = h;
    el = g('m'); if (el) el.textContent = m;
    el = g('s'); if (el) el.textContent = s;
    var age = target.getFullYear() - birthYear;
    el = g('turns'); if (el) el.textContent = 'You turn ' + age + leapNote;
    el = g('msg'); if (el) el.textContent = funMessage(d);
  }

  function start() {
    if (timer) { clearInterval(timer); timer = null; }
    TN.clearErr(P + 'error');
    var val = dateInput.value;
    if (!val) { TN.hide(P + 'out'); return; }
    var parts = val.split('-');
    if (parts.length !== 3) { TN.setErr(P + 'error', 'Please enter a valid date.'); return; }
    var y = parseInt(parts[0], 10), mo = parseInt(parts[1], 10) - 1, da = parseInt(parts[2], 10);
    var birth = new Date(y, mo, da);
    if (isNaN(birth.getTime()) || birth.getFullYear() !== y || birth.getMonth() !== mo || birth.getDate() !== da) {
      TN.setErr(P + 'error', 'That date doesn\u2019t look valid — please check it and try again.');
      TN.hide(P + 'out');
      return;
    }
    if (birth.getTime() > Date.now()) {
      TN.setErr(P + 'error', 'Your birthday can\u2019t be in the future.');
      TN.hide(P + 'out');
      return;
    }
    birthYear = y;
    target = nextBirthday(mo, da, y);
    TN.show(P + 'out');
    tick();
    timer = setInterval(tick, 1000);
  }

  TN.on(dateInput, 'change', start);
  TN.on(dateInput, 'input', function () { if (dateInput.value) start(); });
})();
