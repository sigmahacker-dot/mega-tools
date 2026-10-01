(function () {
  'use strict';
  var ERR = 'five-k-pace-calculator-error';
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtPace(sec) { sec = Math.round(sec); return Math.floor(sec / 60) + ':' + pad(sec % 60); }
  function fmtTime(sec) { sec = Math.round(sec); return Math.floor(sec / 60) + ':' + pad(sec % 60); }
  function calc() {
    if (!TN.el('fk-m')) return;
    TN.clearErr(ERR);
    var m = parseInt(TN.el('fk-m').value, 10) || 0;
    var s = parseInt(TN.el('fk-s').value, 10) || 0;
    var total = m * 60 + s;
    if (!(total > 0)) { TN.setErr(ERR, 'Enter a goal time greater than 0.'); return; }
    if (total > 7200) { TN.setErr(ERR, 'That goal time is over 2 hours — check your entry.'); return; }
    var paceKm = total / 5;
    var paceMi = total / 3.10686;
    TN.el('fk-pacekm').textContent = fmtPace(paceKm) + ' /km';
    TN.el('fk-pacemi').textContent = fmtPace(paceMi) + ' /mi';
    TN.el('fk-400').textContent = fmtPace(paceKm * 0.4);
    var rows = '';
    for (var k = 1; k <= 5; k++) rows += '<tr><td>' + k + ' km</td><td>' + fmtTime(paceKm * k) + '</td></tr>';
    rows += '<tr><td>1 mile</td><td>' + fmtTime(paceMi) + '</td></tr>';
    rows += '<tr><td>2 miles</td><td>' + fmtTime(paceMi * 2) + '</td></tr>';
    rows += '<tr><td>3 miles</td><td>' + fmtTime(paceMi * 3) + '</td></tr>';
    TN.el('fk-body').innerHTML = rows;
  }
  try {
    TN.on('fk-m', 'input', calc);
    TN.on('fk-s', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();