(function () {
  'use strict';
  var P = 'unix-timestamp-converter-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function render(ms) {
    var d = new Date(ms);
    if (isNaN(d.getTime())) { TN.setErr(ERR, 'That value is out of range for a date.'); return; }
    var local;
    try {
      local = d.toLocaleString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
    } catch (e) { local = d.toString(); }
    set('utc', d.toUTCString());
    set('local', local);
    set('iso', d.toISOString());
    set('sec', String(Math.floor(ms / 1000)));
    set('ms', String(ms));
  }
  function fromTs() {
    TN.clearErr(ERR);
    var el = g('ts');
    if (!el || el.value.trim() === '') return;
    var raw = el.value.trim();
    if (!/^\d+$/.test(raw)) { TN.setErr(ERR, 'Enter digits only — no decimals, signs or spaces.'); return; }
    var n = Number(raw);
    if (!isFinite(n)) { TN.setErr(ERR, 'That value is too large.'); return; }
    render(n >= 1e12 ? n : n * 1000);
  }
  function fromDt() {
    TN.clearErr(ERR);
    var el = g('dt');
    if (!el || !el.value) return;
    var d = new Date(el.value);
    if (isNaN(d.getTime())) { TN.setErr(ERR, 'Please pick a valid date and time.'); return; }
    var ms = d.getTime();
    var tsEl = g('ts');
    if (tsEl) tsEl.value = String(Math.floor(ms / 1000));
    render(ms);
  }
  try {
    TN.on(P + 'ts', 'input', fromTs);
    TN.on(P + 'dt', 'change', fromDt);
    TN.on(P + 'now', 'click', function () {
      var el = g('ts');
      if (el) el.value = String(Math.floor(Date.now() / 1000));
      fromTs();
    });
  } catch (e) { /* never throw on load */ }
})();
