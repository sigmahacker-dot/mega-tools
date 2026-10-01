(function () {
  'use strict';
  var P = 'shift-calendar-maker-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  var DAY = 86400000;
  function parseDate(s) {
    var p = s.split('-');
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function gen() {
    try {
      TN.clearErr(ERR);
      var pat = g('pattern').value.trim().toUpperCase().replace(/[^DNO]/g, '');
      if (pat.length < 2) { TN.setErr(ERR, 'Pattern needs at least 2 letters using D (day), N (night), O (off) — e.g. DDNNOOOO.'); return; }
      var monthV = g('month').value, startV = g('start').value;
      if (!monthV) { TN.setErr(ERR, 'Pick a month.'); return; }
      if (!startV) { TN.setErr(ERR, 'Pick the date your current cycle starts (pattern day 1).'); return; }
      var mp = monthV.split('-'), y = parseInt(mp[0], 10), m = parseInt(mp[1], 10) - 1;
      var cycleStart = parseDate(startV);
      var first = new Date(y, m, 1);
      var daysIn = new Date(y, m + 1, 0).getDate();
      var startDay = (first.getDay() + 6) % 7; // Monday-first
      var names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      var colors = { D: '#4ade80', N: '#60a5fa', O: '#94a3b8' };
      var labels = { D: 'Day', N: 'Night', O: 'Off' };
      var cd = 0, cn = 0, co = 0;
      var h = '<table class="data" style="border-collapse:collapse;width:100%;table-layout:fixed"><thead><tr>';
      names.forEach(function (n) { h += '<th>' + n + '</th>'; });
      h += '</tr></thead><tbody><tr>';
      for (var b = 0; b < startDay; b++) h += '<td></td>';
      var dow = startDay;
      for (var d = 1; d <= daysIn; d++) {
        var dt = new Date(y, m, d);
        var idx = Math.round((dt - cycleStart) / DAY) % pat.length;
        idx = ((idx % pat.length) + pat.length) % pat.length;
        var code = pat.charAt(idx);
        if (code === 'D') cd++; else if (code === 'N') cn++; else co++;
        h += '<td style="height:64px;vertical-align:top;border-left:4px solid ' + colors[code] + '"><b>' + d + '</b><br><small>' + labels[code] + '</small></td>';
        dow++;
        if (dow === 7 && d < daysIn) { h += '</tr><tr>'; dow = 0; }
      }
      while (dow > 0 && dow < 7) { h += '<td></td>'; dow++; }
      h += '</tr></tbody></table>';
      TN.show(P + 'out');
      g('cal').innerHTML = h;
      g('c-days').textContent = String(cd);
      g('c-nights').textContent = String(cn);
      g('c-off').textContent = String(co);
    } catch (e) { TN.setErr(ERR, e.message || 'Could not generate the calendar.'); }
  }
  try {
    if (!TN.el(P + 'gen')) return;
    var now = new Date();
    g('month').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    g('start').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01';
    TN.on(P + 'gen', 'click', gen);
    TN.on(P + 'print', 'click', function () { window.print(); });
  } catch (e) { /* never throw on load */ }
})();
