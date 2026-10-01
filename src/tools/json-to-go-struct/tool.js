/* JSON to Go Struct — sample JSON → Go structs with json tags. */
(function () {
  'use strict';
  var SLUG = 'json-to-go-struct';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function pascal(s) {
    return s.replace(/[^a-zA-Z0-9]+(.)/g, function (m, c) { return c.toUpperCase(); })
      .replace(/^./, function (c) { return c.toUpperCase(); }).replace(/[^a-zA-Z0-9]/g, '') || 'Item';
  }

  function generate() {
    clear();
    var raw = el(SLUG + '-input').value.trim();
    if (!raw) { fail('Paste JSON first.'); return; }
    var data;
    try { data = JSON.parse(raw); }
    catch (e) { fail('Invalid JSON: ' + e.message); return; }
    var rootName = pascal(el(SLUG + '-root').value.trim() || 'Root');
    var defs = [];
    var used = {};

    function uniqueName(base) {
      var n = base, i = 2;
      while (used[n]) n = base + (i++);
      used[n] = 1;
      return n;
    }
    function typeOf(v, hint) {
      if (v === null) return '*interface{}';
      var t = typeof v;
      if (t === 'string') return 'string';
      if (t === 'number') return Number.isInteger(v) ? 'int' : 'float64';
      if (t === 'boolean') return 'bool';
      if (Array.isArray(v)) {
        if (!v.length) return '[]interface{}';
        var seen = {}, items = [];
        v.forEach(function (x) {
          var tt = typeOf(x, hint + 'Item');
          if (!seen[tt]) { seen[tt] = 1; items.push(tt); }
        });
        return '[]' + (items.length === 1 ? items[0] : 'interface{}');
      }
      if (t === 'object') return strukt(v, hint);
      return 'interface{}';
    }
    function strukt(obj, nameHint) {
      var name = uniqueName(pascal(nameHint));
      var lines = [];
      Object.keys(obj).forEach(function (k) {
        var v = obj[k];
        var tt = typeOf(v, name + pascal(k));
        var tag = 'json:"' + k + (v === null ? ',omitempty' : '') + '"';
        lines.push('\t' + pascal(k) + ' ' + tt + ' `' + tag + '`');
      });
      defs.push('type ' + name + ' struct {\n' + (lines.length ? lines.join('\n') + '\n' : '') + '}');
      return name;
    }
    if (Array.isArray(data)) {
      var itemT = data.length ? typeOf(data[0], rootName + 'Item') : 'interface{}';
      defs.push('type ' + rootName + ' []' + itemT);
    } else if (data !== null && typeof data === 'object') {
      strukt(data, rootName);
    } else { fail('Top-level JSON must be an object or array.'); return; }
    el(SLUG + '-output').value = defs.reverse().join('\n\n') + '\n';
  }

  try {
    if (!el(SLUG + '-generate')) return;
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-root', 'input', generate);
    TN.on(SLUG + '-input', 'input', TN.debounce(generate, 400));
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the struct first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the struct first.'); return; }
      TN.downloadText(v, 'types.go', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
