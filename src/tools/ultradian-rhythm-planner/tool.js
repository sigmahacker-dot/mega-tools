(function () {
  'use strict';
  var P = 'ultradian-rhythm-planner-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function toMin(t) { var p = t.split(':'); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }
  function fmtT(m) {
    m = ((m % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }
  function plan() {
    try {
      TN.clearErr(ERR);
      var wake = toMin(g('wake').value), bed = toMin(g('bed').value);
      var focus = parseInt(g('focus').value, 10), brk = parseInt(g('break').value, 10);
      var warm = parseInt(g('warmup').value, 10);
      if (isNaN(wake) || isNaN(bed)) { TN.setErr(ERR, 'Enter wake-up and bedtime.'); return; }
      if (bed <= wake) bed += 1440;
      if (isNaN(focus) || focus < 25 || focus > 180) { TN.setErr(ERR, 'Focus block must be 25–180 minutes.'); return; }
      if (isNaN(brk) || brk < 5 || brk > 60) { TN.setErr(ERR, 'Break must be 5–60 minutes.'); return; }
      if (isNaN(warm) || warm < 0 || warm > 180) { TN.setErr(ERR, 'Warm-up must be 0–180 minutes.'); return; }
      var t = wake + warm, rows = '', nBlocks = 0, focusTotal = 0, i = 1;
      if (warm > 0) rows += '<tr><td>' + fmtT(wake) + ' – ' + fmtT(t) + '</td><td>Warm-up</td><td class="muted">Light tasks, email, planning — ease in.</td></tr>';
      while (t + 30 <= bed) {
        var fLen = Math.min(focus, bed - t);
        var fEnd = t + fLen;
        rows += '<tr style="background:#16653422"><td><b>' + fmtT(t) + ' – ' + fmtT(fEnd) + '</b></td><td><b>Focus ' + i + '</b> (' + fLen + ' min)</td><td>Deep work — phone away, single task.</td></tr>';
        nBlocks++; focusTotal += fLen; t = fEnd;
        if (t + brk <= bed && t + 30 <= bed) {
          rows += '<tr><td>' + fmtT(t) + ' – ' + fmtT(t + brk) + '</td><td>Break</td><td class="muted">Walk, water, daylight — no screens.</td></tr>';
          t += brk;
        }
        i++;
        if (i > 20) break;
      }
      if (t < bed) rows += '<tr><td>' + fmtT(t) + ' – ' + fmtT(bed) + '</td><td>Wind down</td><td class="muted">Light admin, review tomorrow, relax.</td></tr>';
      rows += '<tr><td>' + fmtT(bed) + '</td><td>Sleep</td><td class="muted">Screens off.</td></tr>';
      TN.show(P + 'out');
      g('nblocks').textContent = String(nBlocks);
      g('focus-t').textContent = Math.floor(focusTotal / 60) + 'h ' + (focusTotal % 60) + 'm';
      g('rows').innerHTML = rows;
    } catch (e) { TN.setErr(ERR, e.message || 'Could not plan the day.'); }
  }
  try {
    if (!TN.el(P + 'plan')) return;
    TN.on(P + 'plan', 'click', plan);
  } catch (e) { /* never throw on load */ }
})();
