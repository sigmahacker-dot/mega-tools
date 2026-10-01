(function () {
  'use strict';
  var ERR = 'json-diff-checker-error';
  var lastDiffs = [];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function short(v) {
    var s = JSON.stringify(v);
    if (s === undefined) return 'undefined';
    return s.length > 60 ? s.slice(0, 57) + '...' : s;
  }
  function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function diff(a, b, path, out) {
    if (isObj(a) && isObj(b)) {
      var keys = {};
      Object.keys(a).forEach(function (k) { keys[k] = 1; });
      Object.keys(b).forEach(function (k) { keys[k] = 1; });
      Object.keys(keys).forEach(function (k) {
        var p = path + '.' + k;
        if (!(k in a)) out.push({ path: p, type: 'added', oldV: undefined, newV: b[k] });
        else if (!(k in b)) out.push({ path: p, type: 'removed', oldV: a[k], newV: undefined });
        else diff(a[k], b[k], p, out);
      });
      return;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      var n = Math.max(a.length, b.length);
      for (var i = 0; i < n; i++) {
        var p = path + '[' + i + ']';
        if (i >= a.length) out.push({ path: p, type: 'added', oldV: undefined, newV: b[i] });
        else if (i >= b.length) out.push({ path: p, type: 'removed', oldV: a[i], newV: undefined });
        else diff(a[i], b[i], p, out);
      }
      return;
    }
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      out.push({ path: path || '$', type: 'changed', oldV: a, newV: b });
    }
  }
  var TYPE_STYLE = {
    added: '<span style="color:#4ade80">added</span>',
    removed: '<span style="color:#f87171">removed</span>',
    changed: '<span style="color:#fcd34d">changed</span>'
  };
  function update() {
    if (!TN.el('jd-body')) return;
    TN.clearErr(ERR);
    var ta = TN.el('jd-a').value.trim(), tb = TN.el('jd-b').value.trim();
    if (!ta && !tb) {
      TN.el('jd-body').innerHTML = '<tr><td colspan="4" class="muted">Paste JSON on both sides to compare.</td></tr>';
      TN.el('jd-added').textContent = '0'; TN.el('jd-removed').textContent = '0'; TN.el('jd-changed').textContent = '0';
      lastDiffs = [];
      return;
    }
    var a, b;
    try { a = ta ? JSON.parse(ta) : undefined; }
    catch (e) { TN.setErr(ERR, 'Left side is not valid JSON: ' + e.message); return; }
    try { b = tb ? JSON.parse(tb) : undefined; }
    catch (e) { TN.setErr(ERR, 'Right side is not valid JSON: ' + e.message); return; }
    var out = [];
    if (a === undefined && b !== undefined) out.push({ path: '$', type: 'added', oldV: undefined, newV: b });
    else if (b === undefined && a !== undefined) out.push({ path: '$', type: 'removed', oldV: a, newV: undefined });
    else diff(a, b, '$', out);
    lastDiffs = out;
    var na = 0, nr = 0, nc = 0;
    out.forEach(function (d) { if (d.type === 'added') na++; else if (d.type === 'removed') nr++; else nc++; });
    TN.el('jd-added').textContent = na;
    TN.el('jd-removed').textContent = nr;
    TN.el('jd-changed').textContent = nc;
    if (!out.length) {
      TN.el('jd-body').innerHTML = '<tr><td colspan="4" class="muted">✓ The two documents are identical.</td></tr>';
      return;
    }
    TN.el('jd-body').innerHTML = out.map(function (d) {
      return '<tr><td style="font-family:ui-monospace,monospace">' + esc(d.path) + '</td><td>' + TYPE_STYLE[d.type] + '</td>' +
        '<td style="font-family:ui-monospace,monospace;font-size:.82rem">' + (d.type === 'added' ? '<span class="muted">—</span>' : esc(short(d.oldV))) + '</td>' +
        '<td style="font-family:ui-monospace,monospace;font-size:.82rem">' + (d.type === 'removed' ? '<span class="muted">—</span>' : esc(short(d.newV))) + '</td></tr>';
    }).join('');
  }
  try {
    TN.on('jd-a', 'input', update);
    TN.on('jd-b', 'input', update);
    TN.on('jd-swap', 'click', function () {
      var t = TN.el('jd-a').value;
      TN.el('jd-a').value = TN.el('jd-b').value;
      TN.el('jd-b').value = t;
      update();
    });
    TN.on('jd-copy', 'click', function () {
      if (!lastDiffs.length) { TN.setErr(ERR, 'Nothing to report — run a comparison first.'); return; }
      TN.clearErr(ERR);
      var txt = lastDiffs.map(function (d) {
        return d.type.toUpperCase() + ' ' + d.path +
          (d.type === 'added' ? ' = ' + JSON.stringify(d.newV) :
            d.type === 'removed' ? ' was ' + JSON.stringify(d.oldV) :
              ': ' + JSON.stringify(d.oldV) + ' -> ' + JSON.stringify(d.newV));
      }).join('\n');
      if (TN.copy) TN.copy(txt);
    });
    TN.el('jd-a').value = '{\n  "name": "Ada",\n  "role": "admin",\n  "tags": ["a", "b"],\n  "limits": { "cpu": 2, "ram": 8 }\n}';
    TN.el('jd-b').value = '{\n  "name": "Ada Lovelace",\n  "tags": ["a", "c"],\n  "limits": { "cpu": 4, "ram": 8 },\n  "active": true\n}';
    update();
  } catch (e) { /* never throw on load */ }
})();