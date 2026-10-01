/* JSON to TypeScript — sample JSON → interfaces with nesting, unions, optional nulls. */
(function () {
  'use strict';
  var SLUG = 'json-to-typescript';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function pascal(s) {
    return s.replace(/[^a-zA-Z0-9]+(.)/g, function (m, c) { return c.toUpperCase(); })
      .replace(/^./, function (c) { return c.toUpperCase(); }).replace(/[^a-zA-Z0-9]/g, '') || 'Item';
  }
  function safeKey(k) { return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k); }

  function generate() {
    clear();
    var raw = el(SLUG + '-input').value.trim();
    if (!raw) { fail('Paste JSON first.'); return; }
    var data;
    try { data = JSON.parse(raw); }
    catch (e) { fail('Invalid JSON: ' + e.message); return; }
    var rootName = pascal(el(SLUG + '-root').value.trim() || 'Root');
    var exp = el(SLUG + '-export').checked ? 'export ' : '';
    var optNull = el(SLUG + '-optionalnull').checked;
    var defs = [];
    var used = {};

    function uniqueName(base) {
      var n = base, i = 2;
      while (used[n]) n = base + (i++);
      used[n] = 1;
      return n;
    }
    function typeOf(v, hint) {
      if (v === null) return optNull ? null : 'null';
      var t = typeof v;
      if (t === 'string') return 'string';
      if (t === 'number') return Number.isInteger(v) ? 'number' : 'number';
      if (t === 'boolean') return 'boolean';
      if (Array.isArray(v)) {
        if (!v.length) return 'unknown[]';
        var seen = {}, items = [];
        v.forEach(function (x) {
          var tt = typeOf(x, hint + 'Item');
          if (tt && !seen[tt]) { seen[tt] = 1; items.push(tt); }
        });
        if (!items.length) return 'unknown[]';
        var u = items.length === 1 ? items[0] : '(' + items.join(' | ') + ')';
        return u + '[]';
      }
      if (t === 'object') return iface(v, hint);
      return 'unknown';
    }
    function iface(obj, nameHint) {
      var name = uniqueName(pascal(nameHint));
      var lines = [];
      Object.keys(obj).forEach(function (k) {
        var v = obj[k];
        var optional = false;
        var tt = typeOf(v, name + pascal(k));
        if (tt === null) { tt = 'unknown'; optional = optNull; }
        if (v === null && optNull) tt += ' | null';
        lines.push('  ' + safeKey(k) + (optional ? '?' : '') + ': ' + tt + ';');
      });
      defs.push(exp + 'interface ' + name + ' {\n' + lines.join('\n') + '\n}');
      return name;
    }
    var rootType;
    if (Array.isArray(data)) rootType = typeOf(data, rootName);
    else if (data !== null && typeof data === 'object') rootType = iface(data, rootName);
    else { fail('Top-level JSON must be an object or array.'); return; }
    if (Array.isArray(data)) defs.push(exp + 'type ' + rootName + ' = ' + rootType + ';');
    el(SLUG + '-output').value = defs.join('\n\n') + '\n';
  }

  try {
    if (!el(SLUG + '-generate')) return;
    TN.on(SLUG + '-generate', 'click', generate);
    ['root', 'export', 'optionalnull'].forEach(function (k) {
      TN.on(SLUG + '-' + k, (k === 'root') ? 'input' : 'change', generate);
    });
    TN.on(SLUG + '-input', 'input', TN.debounce(generate, 400));
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate interfaces first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate interfaces first.'); return; }
      TN.downloadText(v, 'types.ts', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
