(function () {
  'use strict';
  var P = 'json-to-csv-converter-';
  var ERR = P + 'error';
  var lastCsv = '';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function csvField(v) {
    var s = v === null || v === undefined ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v));
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function convert() {
    var inEl = g('in'), outEl = g('out');
    if (!inEl || !outEl) return;
    TN.clearErr(ERR);
    lastCsv = '';
    outEl.value = '';
    set('stats', 'Waiting for valid JSON…');
    var text = inEl.value.trim();
    if (!text) return;
    var data;
    try { data = JSON.parse(text); }
    catch (e) { TN.setErr(ERR, 'Invalid JSON: ' + (e && e.message ? e.message : e)); return; }
    if (!Array.isArray(data)) { TN.setErr(ERR, 'Top-level JSON must be an array of objects.'); return; }
    if (data.length === 0) { TN.setErr(ERR, 'The array is empty — nothing to convert.'); return; }
    var i;
    for (i = 0; i < data.length; i++) {
      if (!data[i] || typeof data[i] !== 'object' || Array.isArray(data[i])) {
        TN.setErr(ERR, 'Item ' + (i + 1) + ' is not an object. Every array item must be a plain object.'); return;
      }
    }
    var keys = [];
    data.forEach(function (row) {
      Object.keys(row).forEach(function (k) { if (keys.indexOf(k) === -1) keys.push(k); });
    });
    var lines = [keys.map(csvField).join(',')];
    data.forEach(function (row) {
      lines.push(keys.map(function (k) { return csvField(row[k]); }).join(','));
    });
    lastCsv = lines.join('\r\n');
    outEl.value = lastCsv;
    set('stats', data.length + ' row' + (data.length === 1 ? '' : 's') + ' × ' + keys.length + ' column' + (keys.length === 1 ? '' : 's'));
  }
  try {
    TN.on(P + 'in', 'input', convert);
    TN.on(P + 'download', 'click', function () {
      if (!lastCsv) { TN.setErr(ERR, 'Nothing to download yet — enter a valid JSON array of objects first.'); return; }
      TN.downloadText(lastCsv, 'data.csv', 'text/csv;charset=utf-8');
    });
    TN.on(P + 'copy', 'click', function () { if (lastCsv) TN.copy(lastCsv); });
  } catch (e) { /* never throw on load */ }
})();
