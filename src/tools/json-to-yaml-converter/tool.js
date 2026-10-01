/* JSON → YAML emitter. Nested objects/arrays, "- " list items, quoting only when needed. */
(function () {
  'use strict';
  var SLUG = 'json-to-yaml-converter';
  var SAMPLE = '{"server":{"host":"localhost","port":8080,"ssl":true},"database":{"urls":["postgres://db1:5432/app","postgres://db2:5432/app"],"pool":10},"features":["auth","billing","dark mode"],"empty_value":null}';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }
  function sp(n) { var o = ''; for (var i = 0; i < n; i++) o += ' '; return o; }

  function yamlStr(s) {
    if (s === '' || /^\s|\s$/.test(s) || s.indexOf('\n') >= 0 ||
        /[:#\[\]{}&,*!|>'"%@`?]/.test(s) || /^-/.test(s) || /: /.test(s) || / #/.test(s) ||
        /^(true|false|null|~|yes|no|on|off)$/i.test(s) ||
        /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) {
      return JSON.stringify(s); // valid double-quoted YAML scalar
    }
    return s;
  }

  function scalar(v) {
    if (v === null) return 'null';
    if (typeof v === 'string') return yamlStr(v);
    return String(v);
  }

  function emit(v, depth, step) {
    var pad = sp(depth * step);
    if (v === null || typeof v !== 'object') return scalar(v);
    if (Array.isArray(v)) {
      if (!v.length) return '[]';
      return v.map(function (item) {
        if (item !== null && typeof item === 'object') {
          var lines = emit(item, depth + 1, step).split('\n');
          var first = lines[0].slice(step); // align after "- "
          var rest = lines.slice(1).join('\n');
          return pad + '- ' + first + (rest ? '\n' + rest : '');
        }
        return pad + '- ' + scalar(item);
      }).join('\n');
    }
    var keys = Object.keys(v);
    if (!keys.length) return '{}';
    return keys.map(function (k) {
      var val = v[k], key = yamlStr(k);
      if (val !== null && typeof val === 'object') return pad + key + ':\n' + emit(val, depth + 1, step);
      return pad + key + ': ' + scalar(val);
    }).join('\n');
  }

  function convert() {
    clear();
    var src = el(SLUG + '-input').value;
    if (!src.trim()) { fail('Paste some JSON first.'); return; }
    var obj;
    try { obj = JSON.parse(src); }
    catch (e) { fail('Invalid JSON: ' + e.message); return; }
    var step = parseInt(el(SLUG + '-indent').value, 10);
    el(SLUG + '-output').value = emit(obj, 0, step) + '\n';
  }

  try {
    TN.on(SLUG + '-convert', 'click', convert);
    TN.on(SLUG + '-sample', 'click', function () { el(SLUG + '-input').value = SAMPLE; clear(); convert(); });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'data.yaml', 'text/yaml');
    });
  } catch (e) { /* never throw on load */ }
})();
