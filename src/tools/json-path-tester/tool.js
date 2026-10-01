/* JSONPath Tester — implements $.dot, [0]/['k'], [*], .* evaluation. */
(function () {
  'use strict';
  var SLUG = 'json-path-tester';
  var SAMPLE = JSON.stringify({
    store: {
      book: [
        { title: 'The Hobbit', price: 10 },
        { title: 'Dune', price: 15 }
      ],
      bicycle: { color: 'red', price: 20 }
    }
  }, null, 2);

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  // Tokenize a JSONPath expression into segments.
  function tokenize(expr) {
    var tokens = [], i = 0, n = expr.length;
    function err(m) { throw new Error(m + ' at position ' + i); }
    if (expr[i] !== '$') err('Expression must start with $');
    i++;
    while (i < n) {
      var c = expr[i];
      if (c === '.') {
        i++;
        if (expr[i] === '*') { tokens.push({ t: 'wild' }); i++; continue; }
        var name = '';
        while (i < n && /[A-Za-z0-9_$]/.test(expr[i])) name += expr[i++];
        if (!name) err('Expected a name after .');
        tokens.push({ t: 'child', name: name });
      } else if (c === '[') {
        i++;
        while (i < n && /\s/.test(expr[i])) i++;
        if (expr[i] === '*') {
          tokens.push({ t: 'wild' }); i++;
          while (i < n && /\s/.test(expr[i])) i++;
          if (expr[i] !== ']') err('Expected ]');
          i++;
        } else if (expr[i] === "'" || expr[i] === '"') {
          var q = expr[i++];
          var key = '';
          while (i < n && expr[i] !== q) {
            if (expr[i] === '\\' && i + 1 < n) { key += expr[i + 1]; i += 2; }
            else key += expr[i++];
          }
          if (expr[i] !== q) err('Unterminated string');
          i++;
          while (i < n && /\s/.test(expr[i])) i++;
          if (expr[i] !== ']') err('Expected ]');
          i++;
          tokens.push({ t: 'child', name: key });
        } else {
          var num = '';
          if (expr[i] === '-') num += expr[i++];
          while (i < n && /\d/.test(expr[i])) num += expr[i++];
          if (!num || num === '-') err('Expected an index');
          while (i < n && /\s/.test(expr[i])) i++;
          if (expr[i] !== ']') err('Expected ]');
          i++;
          tokens.push({ t: 'index', index: parseInt(num, 10) });
        }
      } else {
        err('Unexpected character "' + c + '"');
      }
    }
    return tokens;
  }

  function pathStr(path) {
    return '$' + path.map(function (p) {
      return typeof p === 'number' ? '[' + p + ']' :
        (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(p) ? '.' + p : "['" + p.replace(/'/g, "\\'") + "']");
    }).join('');
  }

  function evaluate(root, tokens) {
    var nodes = [{ value: root, path: [] }];
    tokens.forEach(function (tok) {
      var next = [];
      nodes.forEach(function (nd) {
        var v = nd.value;
        if (tok.t === 'child') {
          if (v !== null && typeof v === 'object' && tok.name in v)
            next.push({ value: v[tok.name], path: nd.path.concat([tok.name]) });
        } else if (tok.t === 'index') {
          if (Array.isArray(v)) {
            var idx = tok.index < 0 ? v.length + tok.index : tok.index;
            if (idx >= 0 && idx < v.length)
              next.push({ value: v[idx], path: nd.path.concat([idx]) });
          }
        } else if (tok.t === 'wild') {
          if (Array.isArray(v)) {
            v.forEach(function (item, i) { next.push({ value: item, path: nd.path.concat([i]) }); });
          } else if (v !== null && typeof v === 'object') {
            Object.keys(v).forEach(function (k) { next.push({ value: v[k], path: nd.path.concat([k]) }); });
          }
        }
      });
      nodes = next;
    });
    return nodes;
  }

  function evaluateNow() {
    clear();
    TN.hide(SLUG + '-result');
    var doc;
    try { doc = JSON.parse(el(SLUG + '-json').value); }
    catch (e) { fail('Invalid JSON: ' + e.message); return; }
    var expr = el(SLUG + '-path').value.trim();
    if (!expr) { fail('Enter a JSONPath expression.'); return; }
    var tokens;
    try { tokens = tokenize(expr); }
    catch (e) { fail('Bad expression: ' + e.message); return; }
    var matches = evaluate(doc, tokens);
    el(SLUG + '-count').textContent = matches.length;
    el(SLUG + '-output').value = matches.map(function (m) {
      return JSON.stringify(m.value) + '   ← ' + pathStr(m.path);
    }).join('\n');
    TN.show(SLUG + '-result');
  }

  try {
    TN.on(SLUG + '-eval', 'click', evaluateNow);
    TN.on(SLUG + '-sample', 'click', function () {
      el(SLUG + '-json').value = SAMPLE;
      el(SLUG + '-path').value = '$.store.book[*].title';
      clear();
      evaluateNow();
    });
  } catch (e) { /* never throw on load */ }
})();
