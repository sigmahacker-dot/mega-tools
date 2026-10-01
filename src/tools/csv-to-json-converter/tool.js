(function () {
  'use strict';
  var P = 'csv-to-json-converter-';
  var ERR = P + 'error';
  var lastJson = '';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function parseCSV(text) {
    text = String(text).replace(/^﻿/, '');
    var rows = [], row = [], field = '', inQ = false, i = 0, n = text.length;
    function endRow() { row.push(field); field = ''; rows.push(row); row = []; }
    while (i < n) {
      var c = text.charAt(i);
      if (inQ) {
        if (c === '"') {
          if (text.charAt(i + 1) === '"') { field += '"'; i += 2; }
          else { inQ = false; i++; }
        } else { field += c; i++; }
      } else if (c === '"') { inQ = true; i++; }
      else if (c === ',') { row.push(field); field = ''; i++; }
      else if (c === '\r') { if (text.charAt(i + 1) === '\n') i += 2; else i++; endRow(); }
      else if (c === '\n') { i++; endRow(); }
      else { field += c; i++; }
    }
    if (inQ) throw new Error('Unterminated quoted field — a closing quote is missing.');
    endRow();
    while (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop();
    return rows;
  }
  function convert() {
    var inEl = g('in'), outEl = g('out');
    if (!inEl || !outEl) return;
    TN.clearErr(ERR);
    lastJson = '';
    outEl.value = '';
    set('stats', 'Waiting for valid CSV…');
    var text = inEl.value;
    if (!text.trim()) return;
    var rows;
    try { rows = parseCSV(text); }
    catch (e) { TN.setErr(ERR, 'Could not parse CSV: ' + (e && e.message ? e.message : e)); return; }
    if (!rows.length) { TN.setErr(ERR, 'No rows found.'); return; }
    var headers = rows[0], i, j;
    var objs = [];
    for (i = 1; i < rows.length; i++) {
      var obj = {};
      for (j = 0; j < headers.length; j++) obj[headers[j]] = j < rows[i].length ? rows[i][j] : '';
      objs.push(obj);
    }
    lastJson = JSON.stringify(objs, null, 2);
    outEl.value = lastJson;
    set('stats', objs.length + ' object' + (objs.length === 1 ? '' : 's') + ' × ' + headers.length + ' field' + (headers.length === 1 ? '' : 's'));
  }
  try {
    TN.on(P + 'in', 'input', convert);
    TN.on(P + 'download', 'click', function () {
      if (!lastJson) { TN.setErr(ERR, 'Nothing to download yet — enter valid CSV first.'); return; }
      TN.downloadText(lastJson, 'data.json', 'application/json;charset=utf-8');
    });
    TN.on(P + 'copy', 'click', function () { if (lastJson) TN.copy(lastJson); });
  } catch (e) { /* never throw on load */ }
})();
