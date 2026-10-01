(function () {
  'use strict';
  var P = 'jet-lag-recovery-planner-', ERR = P + 'error';
  var DAY = 86400000;
  function g(id) { return TN.el(P + id); }
  function fmtD(d) {
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()] + ' ' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function shiftTime(t, mins) {
    var p = t.split(':');
    var m = (parseInt(p[0], 10) * 60 + parseInt(p[1], 10) + mins) % 1440;
    if (m < 0) m += 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }
  function plan() {
    try {
      TN.clearErr(ERR);
      var zones = parseInt(g('zones').value, 10);
      if (isNaN(zones) || zones < 1 || zones > 12) { TN.setErr(ERR, 'Time zones crossed must be 1–12.'); return; }
      var dir = g('dir').value;
      var arrV = g('arr').value;
      if (!arrV) { TN.setErr(ERR, 'Enter your arrival date.'); return; }
      var bed = g('bed').value || '23:00';
      var days = dir === 'east' ? Math.ceil(zones * 1.5) : zones;
      var ap = arrV.split('-');
      var arr = new Date(ap[0], ap[1] - 1, ap[2]);
      var rows = '';
      for (var d = 1; d <= days; d++) {
        var date = new Date(arr.getTime() + (d - 1) * DAY);
        var remaining = zones - (d - 1) * (dir === 'east' ? 2 / 3 : 1);
        var shiftMin = dir === 'east' ? -60 : 60; // move bedtime earlier (east) or later (west)
        var target = shiftTime(bed, shiftMin * d);
        var tip = dir === 'east'
          ? 'Seek bright light in the <b>morning</b>, avoid it in the evening. ' + (d <= 2 ? 'A 20-min nap before 15:00 is OK; no caffeine after 14:00.' : 'Keep meals on local time.')
          : 'Seek bright light in the <b>late afternoon/evening</b>, dim mornings. ' + (d <= 2 ? 'If sleepy early, a 20-min nap before 16:00 helps.' : 'Exercise in the afternoon to stay awake.');
        rows += '<tr><td><b>Day ' + d + '</b></td><td>' + fmtD(date) + '</td><td>' + target + '</td><td>' + tip + '</td></tr>';
      }
      TN.show(P + 'out');
      g('days').textContent = String(days);
      g('done').textContent = fmtD(new Date(arr.getTime() + (days - 1) * DAY));
      g('rows').innerHTML = rows;
    } catch (e) { TN.setErr(ERR, e.message || 'Could not build the plan.'); }
  }
  try {
    if (!TN.el(P + 'plan')) return;
    var now = new Date();
    g('arr').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    TN.on(P + 'plan', 'click', plan);
  } catch (e) { /* never throw on load */ }
})();
