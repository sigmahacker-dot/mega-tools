/* CSV to Markdown — real CSV parsing (quotes, escapes, multiline) → markdown table. */
(function () {
  'use strict';
  var SLUG = 'csv-to-markdown';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function parseCSV(text) {
    var rows = [], row = [], field = '', inQ = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQ) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQ = false;
        } else field += c;
      } else if (c === '"') {
        inQ = true;
      } else if (c === ',') {
        row.push(field); field = '';
      } else if (c === '\r') {
        /* skip */
      } else if (c === '\n') {
        row.push(field); field = '';
        rows.push(row); row = [];
      } else field += c;
    }
    if (inQ) throw new Error('Unterminated quoted field.');
    row.push(field);
    if (!(row.length === 1 && row[0] === '')) rows.push(row);
    return rows;
  }

  function escCell(s) {
    return s.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
  }

  function update() {
    clear();
    var raw = el(SLUG + '-input').value;
    if (!raw.trim()) { el(SLUG + '-output').value = ''; return; }
    var rows;
    try { rows = parseCSV(raw); }
    catch (e) { fail('CSV parse error: ' + e.message); return; }
    if (!rows.length) { el(SLUG + '-output').value = ''; return; }
    var trim = el(SLUG + '-trim').checked;
    rows = rows.map(function (r) { return r.map(function (c) { return trim ? c.trim() : c; }); });
    var ncols = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    rows = rows.map(function (r) {
      while (r.length < ncols) r.push('');
      return r.slice(0, ncols);
    });
    var hasHeader = el(SLUG + '-header').checked;
    var align = el(SLUG + '-align').value;
    var sepCell = align === 'center' ? ':---:' : (align === 'right' ? '---:' : '---');
    var head = hasHeader ? rows[0] : rows[0].map(function (_, i) { return 'Column ' + (i + 1); });
    var bodyRows = hasHeader ? rows.slice(1) : rows;
    var lines = [
      '| ' + head.map(escCell).join(' | ') + ' |',
      '|' + head.map(function () { return sepCell; }).join('|') + '|'
    ];
    bodyRows.forEach(function (r) { lines.push('| ' + r.map(escCell).join(' | ') + ' |'); });
    el(SLUG + '-output').value = lines.join('\n') + '\n';
  }

  try {
    if (!el(SLUG + '-input')) return;
    TN.on(SLUG + '-input', 'input', TN.debounce(update, 300));
    TN.on(SLUG + '-align', 'change', update);
    TN.on(SLUG + '-header', 'change', update);
    TN.on(SLUG + '-trim', 'change', update);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'table.md', 'text/markdown');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
