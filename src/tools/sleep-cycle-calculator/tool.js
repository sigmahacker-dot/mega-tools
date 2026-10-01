(function () {
  'use strict';
  var ERR = 'sleep-cycle-calculator-error';
  function fmtDate(d) {
    try { return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
    catch (e) {
      var h = d.getHours(), m = d.getMinutes();
      return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
    }
  }
  function calc() {
    if (!TN.el('sleep-mode')) return;
    TN.clearErr(ERR);
    var mode = TN.el('sleep-mode').value;
    var wrap = TN.el('sleep-wake-wrap');
    wrap.style.display = mode === 'wake' ? '' : 'none';
    var rows = [];
    if (mode === 'wake') {
      var t = TN.el('sleep-waketime').value;
      if (!/^\d{2}:\d{2}$/.test(t)) { TN.setErr(ERR, 'Enter a valid wake-up time.'); return; }
      var parts = t.split(':');
      var wakeMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      TN.el('sleep-col-label').textContent = 'Go to bed at';
      [6, 5, 4, 3].forEach(function (c) {
        var bedMin = ((wakeMin - c * 90 - 15) % 1440 + 1440) % 1440;
        var d = new Date();
        d.setHours(Math.floor(bedMin / 60), bedMin % 60, 0, 0);
        rows.push('<tr><td>' + c + ' cycles (' + (c * 1.5).toFixed(1) + ' h)</td><td>' + fmtDate(d) + '</td></tr>');
      });
    } else {
      TN.el('sleep-col-label').textContent = 'Set alarm for';
      var now = new Date();
      [6, 5, 4].forEach(function (c) {
        var wake = new Date(now.getTime() + (15 + c * 90) * 60000);
        rows.push('<tr><td>' + c + ' cycles (' + (c * 1.5).toFixed(1) + ' h)</td><td>' + fmtDate(wake) + '</td></tr>');
      });
    }
    TN.el('sleep-table-body').innerHTML = rows.join('');
  }
  try {
    TN.on('sleep-mode', 'change', calc);
    TN.on('sleep-waketime', 'input', calc);
    TN.on('sleep-waketime', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
