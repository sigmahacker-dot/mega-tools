(function () {
  'use strict';
  var P = 'flight-time-calculator-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function fmtUTC(ms) {
    var d = new Date(ms);
    function p(x) { return String(x).padStart(2, '0'); }
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getUTCDay()] + ' ' + d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) + ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ' UTC';
  }
  function fmtOff(off) { return 'UTC' + (off >= 0 ? '+' : '−') + Math.abs(off); }
  function calc() {
    try {
      TN.clearErr(ERR);
      var depV = g('dep').value;
      if (!depV) { TN.setErr(ERR, 'Enter the departure date and time.'); return; }
      var dh = parseInt(g('durh').value, 10), dm = parseInt(g('durm').value, 10);
      if (isNaN(dh) || dh < 0 || isNaN(dm) || dm < 0 || dm > 59) { TN.setErr(ERR, 'Duration must be valid hours and 0–59 minutes.'); return; }
      var o1 = parseFloat(g('off1').value), o2 = parseFloat(g('off2').value);
      if (isNaN(o1) || o1 < -12 || o1 > 14 || isNaN(o2) || o2 < -12 || o2 > 14) { TN.setErr(ERR, 'UTC offsets must be between −12 and +14.'); return; }
      var durMin = dh * 60 + dm;
      if (durMin === 0) { TN.setErr(ERR, 'Flight duration must be more than zero.'); return; }
      // treat depV as wall-clock at origin: convert "YYYY-MM-DDTHH:MM" to UTC ms
      var m = depV.match(/(\d+)-(\d+)-(\d+)T(\d+):(\d+)/);
      var depUTCms = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) - o1 * 3600000;
      var arrUTCms = depUTCms + durMin * 60000;
      var arrDestMs = arrUTCms + o2 * 3600000;
      var ad = new Date(arrDestMs);
      function p(x) { return String(x).padStart(2, '0'); }
      var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var arrLocal = days[ad.getUTCDay()] + ' ' + ad.getUTCFullYear() + '-' + p(ad.getUTCMonth() + 1) + '-' + p(ad.getUTCDate()) + ' ' + p(ad.getUTCHours()) + ':' + p(ad.getUTCMinutes());
      TN.show(P + 'out');
      g('arr').textContent = arrLocal + ' (' + fmtOff(o2) + ')';
      g('utc').textContent = fmtUTC(arrUTCms);
      g('steps').innerHTML = '<ol>' +
        '<li>Departure ' + TN.esc(depV.replace('T', ' ')) + ' at origin (' + fmtOff(o1) + ') = <b>' + fmtUTC(depUTCms) + '</b>.</li>' +
        '<li>Add flight duration ' + dh + ' h ' + dm + ' min → arrival <b>' + fmtUTC(arrUTCms) + '</b>.</li>' +
        '<li>Convert to destination time (' + fmtOff(o2) + '): <b>' + arrLocal + '</b>.</li>' +
        '</ol><p class="note">Uses the offsets you enter — check daylight saving for your travel dates.</p>';
    } catch (e) { TN.setErr(ERR, e.message || 'Could not calculate.'); }
  }
  try {
    if (!TN.el(P + 'calc')) return;
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    g('dep').value = now.toISOString().slice(0, 16);
    TN.on(P + 'calc', 'click', calc);
  } catch (e) { /* never throw on load */ }
})();
