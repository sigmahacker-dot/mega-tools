(function () {
  'use strict';
  var P = 'road-trip-time-calculator-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function fmtDur(mins) {
    mins = Math.round(mins);
    var h = Math.floor(mins / 60), m = mins % 60;
    if (h === 0) return m + ' min';
    return h + ' h ' + (m ? m + ' min' : '');
  }
  function fmtDT(d) {
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()] + ' ' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') +
      ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function calc() {
    try {
      TN.clearErr(ERR);
      var dist = parseFloat(g('dist').value), speed = parseFloat(g('speed').value);
      var stops = parseInt(g('stops').value, 10), stopMin = parseFloat(g('stopmin').value);
      var depV = g('dep').value;
      if (isNaN(dist) || dist <= 0) { TN.setErr(ERR, 'Distance must be a positive number.'); return; }
      if (isNaN(speed) || speed <= 0) { TN.setErr(ERR, 'Average speed must be positive.'); return; }
      if (isNaN(stops) || stops < 0) { TN.setErr(ERR, 'Number of stops cannot be negative.'); return; }
      if (isNaN(stopMin) || stopMin < 0) { TN.setErr(ERR, 'Minutes per stop cannot be negative.'); return; }
      if (!depV) { TN.setErr(ERR, 'Pick a departure date and time.'); return; }
      var driveMin = dist / speed * 60;
      var stopTotal = stops * stopMin;
      var totalMin = driveMin + stopTotal;
      var dep = new Date(depV);
      var arr = new Date(dep.getTime() + totalMin * 60000);
      TN.show(P + 'out');
      g('drive').textContent = fmtDur(driveMin);
      g('stopt').textContent = fmtDur(stopTotal);
      g('total').textContent = fmtDur(totalMin);
      g('arr').textContent = fmtDT(arr);
      g('steps').innerHTML = '<ol>' +
        '<li>Driving time = distance ÷ speed = ' + dist + ' ÷ ' + speed + ' = <b>' + fmtDur(driveMin) + '</b>.</li>' +
        '<li>Stop time = ' + stops + ' stops × ' + stopMin + ' min = <b>' + fmtDur(stopTotal) + '</b>.</li>' +
        '<li>Total = <b>' + fmtDur(totalMin) + '</b>. Departing ' + fmtDT(dep) + ' → arrive <b>' + fmtDT(arr) + '</b>.</li>' +
        '</ol><p class="note">Estimate only — traffic, weather and road conditions can change the real arrival.</p>';
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
