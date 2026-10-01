/* JSON to Python Dataclass — sample JSON → @dataclass models with typing. */
(function () {
  'use strict';
  var SLUG = 'json-to-python-dataclass';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function pascal(s) {
    return s.replace(/[^a-zA-Z0-9]+(.)/g, function (m, c) { return c.toUpperCase(); })
      .replace(/^./, function (c) { return c.toUpperCase(); }).replace(/[^a-zA-Z0-9]/g, '') || 'Item';
  }
  function snake(s) {
    return s.replace(/[^a-zA-Z0-9]+/g, '_').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase().replace(/^_+|_+$/g, '') || 'field';
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
    var needField = false;

    function uniqueName(base) {
      var n = base, i = 2;
      while (used[n]) n = base + (i++);
      used[n] = 1;
      return n;
    }
    function typeOf(v, hint) {
      if (v === null) return 'Optional[Any]';
      var t = typeof v;
      if (t === 'string') return 'str';
      if (t === 'number') return Number.isInteger(v) ? 'int' : 'float';
      if (t === 'boolean') return 'bool';
      if (Array.isArray(v)) {
        if (!v.length) return 'List[Any]';
        var seen = {}, items = [];
        v.forEach(function (x) {
          var tt = typeOf(x, hint + 'Item');
          if (!seen[tt]) { seen[tt] = 1; items.push(tt); }
        });
        return 'List[' + (items.length === 1 ? items[0] : 'Any') + ']';
      }
      if (t === 'object') return klass(v, hint);
      return 'Any';
    }
    function klass(obj, nameHint) {
      var name = uniqueName(pascal(nameHint));
      var lines = [];
      Object.keys(obj).forEach(function (k) {
        var v = obj[k];
        var tt = typeOf(v, name + pascal(k));
        var fname = snake(k);
        var def;
        if (/^List\[/.test(tt)) { needField = true; def = ' = field(default_factory=list)'; }
        else if (v === null || /^Optional\[/.test(tt)) def = ' = None';
        else if (/^Dict|Any$/.test(tt)) { needField = true; def = ' = field(default_factory=dict)'; }
        else def = '';
        lines.push('    ' + fname + ': ' + tt + def);
      });
      defs.push('@dataclass\nclass ' + name + ':\n' + (lines.length ? lines.join('\n') : '    pass'));
      return name;
    }
    if (Array.isArray(data)) {
      var itemT = data.length ? typeOf(data[0], rootName + 'Item') : 'Any';
      defs.push(rootName + 'List = List[' + itemT + ']');
    } else if (data !== null && typeof data === 'object') {
      klass(data, rootName);
    } else { fail('Top-level JSON must be an object or array.'); return; }
    var header = 'from dataclasses import dataclass' + (needField ? ', field' : '') +
      '\nfrom typing import List, Dict, Optional, Any\n';
    el(SLUG + '-output').value = header + '\n\n' + defs.reverse().join('\n\n\n') + '\n';
  }

  try {
    if (!el(SLUG + '-generate')) return;
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-root', 'input', generate);
    TN.on(SLUG + '-input', 'input', TN.debounce(generate, 400));
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the dataclass first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the dataclass first.'); return; }
      TN.downloadText(v, 'models.py', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
