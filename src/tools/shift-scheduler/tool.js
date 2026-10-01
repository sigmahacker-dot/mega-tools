(function () {
  'use strict';
  var P = 'shift-scheduler-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtD(d) { return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }
  function blank() {
    set('ondays', '–'); set('offdays', '–'); set('cycles', '–');
    g('body').innerHTML = '<tr><td colspan="4" class="muted">Set the rotation to generate the schedule.</td></tr>';
  }
  function calc() {
    if (!g('start')) return;
    TN.clearErr(ERR);
    var v = g('start').value;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) { blank(); return; }
    var start = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    var on = parseInt(g('on').value, 10), off = parseInt(g('off').value, 10),
        total = parseInt(g('total').value, 10);
    if ([on, off, total].some(isNaN) || on < 1 || on > 30 || off < 1 || off > 30 || total < 1 || total > 120) {
      TN.setErr(ERR, 'Check the ranges: days on/off 1–30, days to show 1–120.');
      blank(); return;
    }
    var pattern = g('pattern').value;
    var cycleLen = on + off;
    var html = '', onCount = 0, offCount = 0, onIdx = 0;
    for (var i = 0; i < total; i++) {
      var d = new Date(start.getTime() + i * 86400000);
      var pos = i % cycleLen;
      var isOn = pos < on;
      var shift;
      if (!isOn) { shift = '—'; offCount++; }
      else {
        onCount++;
        shift = pattern === 'day' ? '☀️ Day' : pattern === 'night' ? '🌙 Night' : (onIdx % 2 === 0 ? '☀️ Day' : '🌙 Night');
        onIdx++;
      }
      html += '<tr' + (isOn ? ' style="background:rgba(255,90,90,.06);"' : '') + '><td>' + TN.esc(fmtD(d)) + '</td><td>' +
        TN.esc(DAYS[d.getDay()]) + '</td><td>' + (isOn ? '<b>ON</b>' : '<span class="muted">OFF</span>') + '</td><td>' +
        TN.esc(shift) + '</td></tr>';
    }
    g('body').innerHTML = html;
    set('ondays', String(onCount));
    set('offdays', String(offCount));
    set('cycles', (total / cycleLen).toFixed(1));
  }
  try {
    var t = new Date();
    g('start').value = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    TN.on(P + 'start', 'input', calc);
    TN.on(P + 'start', 'change', calc);
    ['on', 'off', 'total'].forEach(function (k) { TN.on(P + k, 'input', calc); });
    TN.on(P + 'pattern', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
