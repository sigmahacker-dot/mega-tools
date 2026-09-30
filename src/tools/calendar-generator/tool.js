(function () {
  'use strict';
  var P = 'calendar-generator-';
  function g(id) { return document.getElementById(P + id); }

  var monthSel = g('month'), yearSel = g('year'), grid = g('grid'), title = g('title');
  if (!monthSel || !yearSel || !grid || !title) return;

  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0); }

  function populate() {
    var html = '';
    for (var m = 0; m < 12; m++) html += '<option value="' + m + '">' + MONTHS[m] + '</option>';
    monthSel.innerHTML = html;
    var now = new Date(), y0 = now.getFullYear();
    html = '';
    for (var y = 1900; y <= 2100; y++) html += '<option value="' + y + '">' + y + '</option>';
    yearSel.innerHTML = html;
    monthSel.value = now.getMonth();
    yearSel.value = y0;
  }

  function render() {
    var y = parseInt(yearSel.value, 10), m = parseInt(monthSel.value, 10);
    if (isNaN(y) || isNaN(m)) { TN.setErr(P + 'error', 'Please pick a valid month and year.'); return; }
    TN.clearErr(P + 'error');
    title.textContent = MONTHS[m] + ' ' + y;
    var offset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first
    var days = new Date(y, m + 1, 0).getDate();        // correct incl. leap Feb
    var prevDays = new Date(y, m, 0).getDate();
    var today = new Date();
    var html = '';
    for (var i = 0; i < 7; i++) html += '<div class="cal-dow">' + DOW[i] + '</div>';
    for (var p = offset - 1; p >= 0; p--) html += '<div class="cal-day other">' + (prevDays - p) + '</div>';
    for (var d = 1; d <= days; d++) {
      var cls = 'cal-day';
      if (y === today.getFullYear() && m === today.getMonth() && d === today.getDate()) cls += ' today';
      html += '<div class="' + cls + '">' + d + '</div>';
    }
    var trail = (7 - ((offset + days) % 7)) % 7;
    for (var t = 1; t <= trail; t++) html += '<div class="cal-day other">' + t + '</div>';
    grid.innerHTML = html;
  }

  function step(dir) {
    var y = parseInt(yearSel.value, 10), m = parseInt(monthSel.value, 10) + dir;
    if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
    if (y < 1900 || y > 2100) return;
    yearSel.value = y; monthSel.value = m;
    render();
  }

  TN.on(monthSel, 'change', render);
  TN.on(yearSel, 'change', render);
  TN.on(P + 'prev', 'click', function () { step(-1); });
  TN.on(P + 'next', 'click', function () { step(1); });
  TN.on(P + 'today', 'click', function () {
    var now = new Date();
    monthSel.value = now.getMonth(); yearSel.value = now.getFullYear();
    render();
  });
  TN.on(P + 'print', 'click', function () {
    try { window.print(); } catch (e) { TN.setErr(P + 'error', 'Printing is not available in this browser.'); }
  });

  populate();
  render();
})();
