(function () {
  'use strict';
  var P = 'data-transfer-time-calculator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function f2(n) { return String(Number(n.toFixed(2))); }
  function breakdown(sec) {
    sec = Math.round(sec);
    var d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600),
        m = Math.floor(sec % 3600 / 60), s = sec % 60;
    var parts = [];
    if (d) parts.push(d + 'd');
    if (h) parts.push(h + 'h');
    if (m) parts.push(m + 'm');
    parts.push(s + 's');
    return parts.join(' ');
  }
  function blank() {
    set('time', '–'); set('mins', '–'); set('hours', '–');
    set('steps', 'Enter a file size and a transfer speed.');
  }
  function calc() {
    if (!g('size')) return;
    TN.clearErr(ERR);
    var sr = g('size').value, pr = g('speed').value;
    if (sr === '' || pr === '') { blank(); return; }
    var size = parseFloat(sr), speed = parseFloat(pr);
    if (isNaN(size) || size < 0 || isNaN(speed) || speed < 0) {
      TN.setErr(ERR, 'Enter non-negative numbers for size and speed.'); blank(); return;
    }
    if (speed === 0) { TN.setErr(ERR, 'Transfer speed must be greater than zero.'); blank(); return; }
    var bytes = size * parseFloat(g('sizeu').value);
    var bps = speed * parseFloat(g('speedu').value);
    var sec = bytes * 8 / bps;
    set('time', breakdown(sec));
    set('mins', f2(sec / 60));
    set('hours', f2(sec / 3600));
    set('steps', 'Time = file bits ÷ speed = ' + TN.esc(f2(bytes * 8 / 1e6)) + ' megabits ÷ ' +
      TN.esc(f2(bps / 1e6)) + ' Mbps = ' + TN.esc(f2(sec)) + ' seconds. Theoretical minimum — real transfers add ~5–10% protocol overhead.');
  }
  try {
    ['size', 'speed'].forEach(function (k) { TN.on(P + k, 'input', calc); });
    TN.on(P + 'sizeu', 'change', calc);
    TN.on(P + 'speedu', 'change', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
