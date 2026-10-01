/* JSON Schema Generator — infers draft-07 schema from sample JSON. */
(function () {
  'use strict';
  var SLUG = 'json-schema-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function strFormat(s) {
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s)) return 'uuid';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'email';
    if (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?)?$/.test(s)) return 'date-time';
    if (/^https?:\/\/\S+$/.test(s)) return 'uri';
    return null;
  }
  function mergeSchemas(list) {
    var seen = {}, out = [];
    list.forEach(function (s) {
      var k = JSON.stringify(s);
      if (!seen[k]) { seen[k] = 1; out.push(s); }
    });
    return out.length === 1 ? out[0] : { anyOf: out };
  }
  function infer(v) {
    if (v === null) return { type: 'null' };
    var t = typeof v;
    if (t === 'string') {
      var s = { type: 'string' };
      var f = strFormat(v);
      if (f) s.format = f;
      return s;
    }
    if (t === 'number') return { type: Number.isInteger(v) ? 'integer' : 'number' };
    if (t === 'boolean') return { type: 'boolean' };
    if (Array.isArray(v)) {
      var s = { type: 'array' };
      if (v.length) s.items = mergeSchemas(v.map(infer));
      return s;
    }
    if (t === 'object') {
      var props = {}, req = [];
      Object.keys(v).forEach(function (k) {
        props[k] = infer(v[k]);
        req.push(k);
      });
      var o = { type: 'object', properties: props };
      if (req.length) o.required = req;
      return o;
    }
    return {};
  }

  function generate() {
    clear();
    var raw = el(SLUG + '-input').value.trim();
    if (!raw) { fail('Paste sample JSON first.'); return; }
    var data;
    try { data = JSON.parse(raw); }
    catch (e) { fail('Invalid JSON: ' + e.message); return; }
    var schema = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      title: 'GeneratedSchema'
    };
    var inferred = infer(data);
    Object.keys(inferred).forEach(function (k) { schema[k] = inferred[k]; });
    el(SLUG + '-output').value = JSON.stringify(schema, null, 2) + '\n';
  }

  try {
    if (!el(SLUG + '-generate')) return;
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a schema first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a schema first.'); return; }
      TN.downloadText(v, 'schema.json', 'application/json');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
