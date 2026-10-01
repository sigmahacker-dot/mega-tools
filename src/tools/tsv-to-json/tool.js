/* TSV to JSON — tab-separated values → JSON, header-row option, quoted-field parsing. */
(function () {
  'use strict';
  var SLUG = 'tsv-to-json';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function parseTSV(text) {
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
      } else if (c === '\t') {
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

  function update() {
    clear();
    var raw = el(SLUG + '-input').value;
    if (!raw.trim()) { el(SLUG + '-output').value = ''; return; }
    var rows;
    try { rows = parseTSV(raw); }
    catch (e) { fail('TSV parse error: ' + e.message); return; }
    if (!rows.length) { el(SLUG + '-output').value = ''; return; }
    var ncols = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    rows = rows.map(function (r) {
      while (r.length < ncols) r.push('');
      return r.slice(0, ncols).map(function (c) { return c.trim(); });
    });
    var data;
    if (el(SLUG + '-header').checked) {
      var headers = [], seen = {};
      rows[0].forEach(function (h, i) {
        var name = h || ('column' + (i + 1));
        if (seen[name]) { seen[name]++; name = name + '_' + seen[name]; }
        else seen[name] = 1;
        headers.push(name);
      });
      data = rows.slice(1).map(function (r) {
        var o = {};
        headers.forEach(function (h, i) { o[h] = r[i]; });
        return o;
      });
    } else {
      data = rows;
    }
    el(SLUG + '-output').value = el(SLUG + '-pretty').checked
      ? JSON.stringify(data, null, 2) + '\n'
      : JSON.stringify(data) + '\n';
  }

  try {
    if (!el(SLUG + '-input')) return;
    TN.on(SLUG + '-input', 'input', TN.debounce(update, 300));
    TN.on(SLUG + '-header', 'change', update);
    TN.on(SLUG + '-pretty', 'change', update);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'data.json', 'application/json');
    });
    update();
  } catch (e) { /* never throw on load */ }
})();
