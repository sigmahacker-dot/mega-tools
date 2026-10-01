(function () {
  'use strict';
  var P = 'layover-planner-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function fmtDur(mins) {
    mins = Math.round(mins);
    var h = Math.floor(mins / 60), m = mins % 60;
    return h ? h + ' h ' + m + ' min' : m + ' min';
  }
  function check() {
    try {
      TN.clearErr(ERR);
      var arrV = g('arr').value, depV = g('dep').value;
      if (!arrV || !depV) { TN.setErr(ERR, 'Enter both arrival and departure times.'); return; }
      var arr = new Date(arrV), dep = new Date(depV);
      var layMin = (dep - arr) / 60000;
      if (layMin <= 0) { TN.setErr(ERR, 'Departure must be after arrival — check for an overnight date rollover.'); return; }
      var mct = g('airport').value === 'custom' ? parseInt(g('custom').value, 10) : parseInt(g('airport').value, 10);
      if (isNaN(mct) || mct < 15 || mct > 480) { TN.setErr(ERR, 'Custom minimum connect time must be 15–480 minutes.'); return; }
      var need = mct + (g('imm').checked ? 30 : 0) + (g('bag').checked ? 20 : 0);
      var buffer = layMin - need;
      var verdict, color, guidance;
      if (buffer < 0) {
        verdict = 'NOT FEASIBLE'; color = '#f87171';
        guidance = '<li>Your layover is <b>' + fmtDur(-buffer) + ' short</b> of what is needed.</li><li>Do not book this connection — pick a later onward flight.</li><li>If already booked on one ticket, the airline must rebook you free if you misconnect, but expect a long wait.</li>';
      } else if (buffer < 30) {
        verdict = 'TIGHT'; color = '#fbbf24';
        guidance = '<li>Feasible on paper with <b>' + fmtDur(buffer) + '</b> of slack — but any inbound delay breaks it.</li><li>Sit near the front, have your boarding pass ready, and move fast through the terminal.</li><li>Check the airline app for your onward gate before landing.</li>';
      } else if (buffer < 90) {
        verdict = 'COMFORTABLE'; color = '#4ade80';
        guidance = '<li>Solid connection with <b>' + fmtDur(buffer) + '</b> of buffer — you can walk, not run.</li><li>Time for a restroom stop and a quick bite near your gate.</li>';
      } else {
        verdict = 'LONG LAYOVER'; color = '#60a5fa';
        guidance = '<li>Plenty of time (' + fmtDur(buffer) + ' spare). Consider lounge access or, if 5+ hours, a quick city excursion — leave 2 h before departure to get back.</li>';
      }
      TN.show(P + 'out');
      g('lay').textContent = fmtDur(layMin);
      g('need').textContent = fmtDur(need);
      var v = g('verdict');
      v.textContent = verdict;
      v.style.color = color;
      g('steps').innerHTML = '<ol>' +
        '<li>Layover = departure − arrival = <b>' + fmtDur(layMin) + '</b>.</li>' +
        '<li>Needed = MCT ' + mct + ' min' + (g('imm').checked ? ' + 30 immigration' : '') + (g('bag').checked ? ' + 20 bag re-check' : '') + ' = <b>' + fmtDur(need) + '</b>.</li>' +
        guidance + '</ol>';
    } catch (e) { TN.setErr(ERR, e.message || 'Could not check the connection.'); }
  }
  try {
    if (!TN.el(P + 'check')) return;
    TN.on(P + 'airport', 'change', function () {
      g('custom-wrap').style.display = g('airport').value === 'custom' ? '' : 'none';
    });
    TN.on(P + 'check', 'click', check);
  } catch (e) { /* never throw on load */ }
})();
