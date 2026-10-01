/* Markdown Table Generator — comma/tab rows to a Markdown table. */
(function () {
  'use strict';
  var SLUG = 'markdown-table-generator';

  function splitRow(line, useTabs) {
    if (useTabs) return line.split('\t');
    // split on commas, honoring double-quoted fields
    var cells = [], cur = '', inQ = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cells.push(cur); cur = ''; continue; }
      cur += ch;
    }
    cells.push(cur);
    return cells;
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value;
    if (!input.trim()) { TN.setErr(SLUG + '-error', 'Please enter some rows first.'); return; }
    var useTabs = /\t/.test(input);
    var rows = input.split('\n')
      .map(function (l) { return l.replace(/\r$/, ''); })
      .filter(function (l) { return l.trim().length > 0; })
      .map(function (l) { return splitRow(l, useTabs).map(function (c) { return c.trim(); }); });
    if (!rows.length) { TN.setErr(SLUG + '-error', 'No rows found.'); return; }
    var cols = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    rows = rows.map(function (r) {
      while (r.length < cols) r.push('');
      return r;
    });
    var hasHeader = TN.el(SLUG + '-header').value === 'yes';
    var align = TN.el(SLUG + '-align').value;
    var sepCell = align === 'center' ? ':---:' : (align === 'right' ? '---:' : '---');
    function esc(c) { return c.replace(/\|/g, '\\|'); }
    function rowToMd(r) { return '| ' + r.map(esc).join(' | ') + ' |'; }
    var out = [];
    if (hasHeader) {
      out.push(rowToMd(rows[0]));
      var seps = [];
      for (var i = 0; i < cols; i++) seps.push(sepCell);
      out.push('| ' + seps.join(' | ') + ' |');
      for (var j = 1; j < rows.length; j++) out.push(rowToMd(rows[j]));
    } else {
      var hdrs = [];
      for (var k = 0; k < cols; k++) hdrs.push('Column ' + (k + 1));
      out.push(rowToMd(hdrs));
      var seps2 = [];
      for (var m = 0; m < cols; m++) seps2.push(sepCell);
      out.push('| ' + seps2.join(' | ') + ' |');
      rows.forEach(function (r) { out.push(rowToMd(r)); });
    }
    TN.el(SLUG + '-output').textContent = out.join('\n');
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-copy', 'click', function () {
      TN.copy(TN.el(SLUG + '-output').textContent);
    });
  } catch (e) { /* never throw on load */ }
})();
