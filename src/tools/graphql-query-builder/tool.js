/* GraphQL Query Builder — indented field tree → GraphQL query string. */
(function () {
  'use strict';
  var SLUG = 'graphql-query-builder';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function build() {
    clear();
    var lines = el(SLUG + '-fields').value.split('\n');
    var nodes = [];
    lines.forEach(function (raw) {
      if (!raw.trim()) return;
      var indent = raw.match(/^ */)[0].length;
      if (indent % 2 !== 0) throw new Error('Indent each level with exactly 2 spaces.');
      nodes.push({ level: indent / 2, field: raw.trim() });
    });
    if (!nodes.length) { fail('Enter at least one field.'); return; }
    var out = [];
    var stack = [];
    nodes.forEach(function (n, idx) {
      while (stack.length > n.level) {
        var closed = stack.pop();
        out.push('  '.repeat(closed + 1) + '}');
      }
      var hasChild = idx + 1 < nodes.length && nodes[idx + 1].level > n.level;
      out.push('  '.repeat(n.level + 1) + n.field + (hasChild ? ' {' : ''));
      if (hasChild) stack.push(n.level);
    });
    while (stack.length) out.push('  '.repeat(stack.pop() + 1) + '}');
    var type = el(SLUG + '-type').value;
    var name = el(SLUG + '-name').value.trim();
    var vars = el(SLUG + '-vars').value.trim();
    var sig = type + (name ? ' ' + name : '') + (vars ? '(' + vars + ')' : '');
    el(SLUG + '-output').value = sig + ' {\n' + out.join('\n') + '\n}\n';
  }

  try {
    if (!el(SLUG + '-fields')) return;
    ['type', 'name', 'vars', 'fields'].forEach(function (k) {
      TN.on(SLUG + '-' + k, (k === 'type') ? 'change' : 'input', function () {
        try { build(); } catch (e) { fail(e.message); }
      });
    });
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to copy yet.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Nothing to download yet.'); return; }
      TN.downloadText(v, 'query.graphql', 'text/plain');
    });
    build();
  } catch (e) { /* never throw on load */ }
})();
