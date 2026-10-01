(function () {
  'use strict';
  var ERR = 'marathon-pace-calculator-error';
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtPace(sec) { sec = Math.round(sec); return Math.floor(sec / 60) + ':' + pad(sec % 60); }
  function fmtTime(sec) { sec = Math.round(sec); var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return (h > 0 ? h + ':' + pad(m) : m) + ':' + pad(s); }
  function calc() {
    if (!TN.el('mp-dist')) return;
    TN.clearErr(ERR);
    var dv = TN.el('mp-dist').value;
    var dist = dv === 'custom' ? parseFloat(TN.el('mp-custom').value) : parseFloat(dv);
    var h = parseInt(TN.el('mp-h').value, 10) || 0;
    var m = parseInt(TN.el('mp-m').value, 10) || 0;
    var s = parseInt(TN.el('mp-s').value, 10) || 0;
    if (!(dist > 0)) { TN.setErr(ERR, 'Enter a race distance greater than 0 km.'); return; }
    var total = h * 3600 + m * 60 + s;
    if (!(total > 0)) { TN.setErr(ERR, 'Enter a goal time greater than 0.'); return; }
    var paceKm = total / dist;
    var paceMi = total / (dist / 1.60934);
    var kmh = dist / (total / 3600);
    TN.el('mp-pacekm').textContent = fmtPace(paceKm) + ' /km';
    TN.el('mp-pacemi').textContent = fmtPace(paceMi) + ' /mi';
    TN.el('mp-speed').textContent = kmh.toFixed(1) + ' km/h';
    var marks = [5, 10, 21.0975, 30, 42.195].filter(function (k) { return k < dist; });
    var rows = marks.map(function (k) { return '<tr><td>' + k + ' km</td><td>' + fmtTime(paceKm * k) + '</td></tr>'; });
    rows.push('<tr><td><strong>Finish (' + dist + ' km)</strong></td><td><strong>' + fmtTime(total) + '</strong></td></tr>');
    TN.el('mp-body').innerHTML = rows.join('');
  }
  try {
    TN.on('mp-dist', 'change', calc);
    TN.on('mp-custom', 'input', calc);
    TN.on('mp-h', 'input', calc);
    TN.on('mp-m', 'input', calc);
    TN.on('mp-s', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();