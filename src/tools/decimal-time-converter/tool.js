(function () {
  'use strict';
  var P = 'decimal-time-converter-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var updating = false;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function decToHms(d) {
    var h = Math.floor(d), m = Math.floor((d - h) * 60), s = Math.round(((d - h) * 60 - m) * 60);
    if (s === 60) { s = 0; m++; }
    if (m === 60) { m = 0; h++; }
    return h + ':' + pad(m) + ':' + pad(s);
  }
  function hmsToDec(str) {
    var m = String(str).trim().match(/^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/);
    if (!m) return NaN;
    return parseInt(m[1], 10) + parseInt(m[2], 10) / 60 + (m[3] ? parseInt(m[3], 10) / 3600 : 0);
  }
  function stats(d) {
    set('mins', String(Number((d * 60).toFixed(4))));
    set('secs', String(Number((d * 3600).toFixed(2))));
    set('day', (d / 24).toFixed(6));
  }
  function blankStats() { set('mins', '–'); set('secs', '–'); set('day', '–'); }
  function fromDec() {
    if (updating) return;
    TN.clearErr(ERR);
    var raw = g('dec').value;
    if (raw === '') { blankStats(); return; }
    var d = parseFloat(raw);
    if (isNaN(d) || d < 0) { TN.setErr(ERR, 'Enter a non-negative number of decimal hours.'); blankStats(); return; }
    updating = true;
    g('hms').value = decToHms(d);
    updating = false;
    stats(d);
  }
  function fromHms() {
    if (updating) return;
    TN.clearErr(ERR);
    var raw = g('hms').value;
    if (raw.trim() === '') { blankStats(); return; }
    var d = hmsToDec(raw);
    if (isNaN(d)) { TN.setErr(ERR, 'Use the format H:MM or H:MM:SS, e.g. 8:45 or 8:45:30.'); blankStats(); return; }
    updating = true;
    g('dec').value = String(Number(d.toFixed(6)));
    updating = false;
    stats(d);
  }
  try {
    TN.on(P + 'dec', 'input', fromDec);
    TN.on(P + 'hms', 'input', fromHms);
  } catch (e) { /* never throw on load */ }
})();
