(function () {
  'use strict';
  var P = 'timesheet-maker-', ERR = P + 'error';
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  function g(id) { return TN.el(P + id); }
  function toMin(t) {
    if (!t) return null;
    var p = t.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }
  function fmtH(h) { return (Math.round(h * 100) / 100) + ' h'; }
  function build() {
    var h = '';
    DAYS.forEach(function (d, i) {
      h += '<tr><td><b>' + d.slice(0, 3) + '</b></td>' +
        '<td><input class="input" type="time" id="' + P + 's' + i + '" style="width:110px"></td>' +
        '<td><input class="input" type="time" id="' + P + 'e' + i + '" style="width:110px"></td>' +
        '<td><input class="input" type="number" min="0" max="600" id="' + P + 'b' + i + '" value="0" style="width:80px"></td>' +
        '<td id="' + P + 'h' + i + '" class="muted">–</td></tr>';
    });
    g('rows').innerHTML = h;
  }
  function calc() {
    try {
      TN.clearErr(ERR);
      var total = 0, lines = [], i;
      for (i = 0; i < 7; i++) {
        var s = toMin(g('s' + i).value), e = toMin(g('e' + i).value);
        var brk = parseInt(g('b' + i).value, 10) || 0;
        var cell = g('h' + i);
        if (s === null && e === null) { cell.textContent = 'off'; cell.className = 'muted'; lines.push(DAYS[i].slice(0, 3) + ': off'); continue; }
        if (s === null || e === null) { TN.setErr(ERR, DAYS[i] + ': enter both start and end, or leave both blank.'); return; }
        if (brk < 0 || brk > 600) { TN.setErr(ERR, DAYS[i] + ': break must be 0–600 minutes.'); return; }
        var mins = e - s;
        if (mins <= 0) mins += 1440; // overnight
        mins -= brk;
        if (mins < 0) { TN.setErr(ERR, DAYS[i] + ': break is longer than the shift.'); return; }
        var hrs = mins / 60;
        total += hrs;
        cell.textContent = fmtH(hrs);
        cell.className = '';
        lines.push(DAYS[i].slice(0, 3) + ': ' + fmtH(hrs));
      }
      var reg = Math.min(total, 40), ot = Math.max(0, total - 40);
      TN.show(P + 'out');
      g('total').textContent = fmtH(total);
      g('reg').textContent = fmtH(reg);
      g('ot').textContent = fmtH(ot);
      g('copy').setAttribute('data-t', 'Weekly timesheet\n' + lines.join('\n') + '\nTotal: ' + fmtH(total) + ' (regular ' + fmtH(reg) + ', overtime ' + fmtH(ot) + ')');
    } catch (e) { TN.setErr(ERR, e.message || 'Could not calculate.'); }
  }
  try {
    if (!TN.el(P + 'calc')) return;
    build();
    TN.on(P + 'calc', 'click', calc);
    TN.on(P + 'copy', 'click', function () {
      var t = g('copy').getAttribute('data-t');
      if (t) TN.copy(t); else TN.setErr(ERR, 'Calculate first.');
    });
    TN.on(P + 'clear', 'click', function () {
      build(); TN.hide(P + 'out'); TN.clearErr(ERR);
    });
  } catch (e) { /* never throw on load */ }
})();
