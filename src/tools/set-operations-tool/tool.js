(function () {
  'use strict';
  var P = 'set-operations-tool-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function parseSet(raw) {
    var seen = {}, out = [];
    String(raw).split(/[,;\n]+/).forEach(function (t) {
      t = t.trim().replace(/\s+/g, ' ');
      if (t !== '' && !seen.hasOwnProperty(t)) { seen[t] = 1; out.push(t); }
    });
    return out;
  }
  function fmtSet(arr) {
    return arr.length ? '{ ' + arr.map(function (x) { return TN.esc(x); }).join(', ') + ' }' : '<span class="muted">∅ (empty set)</span>';
  }
  function row(name, arr) {
    return '<tr><td>' + name + '</td><td>' + fmtSet(arr) + '</td><td>' + arr.length + '</td></tr>';
  }
  function blank() {
    set('ca', '–'); set('cb', '–'); set('sub', '–');
    g('body').innerHTML = '<tr><td colspan="3" class="muted">Enter both sets to see all operations.</td></tr>';
  }
  function calc() {
    if (!g('a')) return;
    TN.clearErr(ERR);
    var A = parseSet(g('a').value), B = parseSet(g('b').value);
    if (!A.length && !B.length) { blank(); return; }
    var inB = {}, inA = {};
    B.forEach(function (x) { inB[x] = 1; });
    A.forEach(function (x) { inA[x] = 1; });
    var union = A.concat(B.filter(function (x) { return !inA[x]; }));
    var inter = A.filter(function (x) { return inB[x]; });
    var diffAB = A.filter(function (x) { return !inB[x]; });
    var diffBA = B.filter(function (x) { return !inA[x]; });
    var sym = diffAB.concat(diffBA);
    set('ca', String(A.length));
    set('cb', String(B.length));
    var aSubB = diffAB.length === 0, bSubA = diffBA.length === 0;
    set('sub', (aSubB && bSubA) ? 'A = B' : (aSubB ? 'A ⊆ B' : (bSubA ? 'B ⊆ A' : 'Neither ⊆')));
    g('body').innerHTML =
      row('A ∪ B (union)', union) +
      row('A ∩ B (intersection)', inter) +
      row('A − B (difference)', diffAB) +
      row('B − A (difference)', diffBA) +
      row('A △ B (symmetric difference)', sym);
  }
  try {
    TN.on(P + 'a', 'input', calc);
    TN.on(P + 'b', 'input', calc);
    calc();
  } catch (e) { /* never throw on load */ }
})();
