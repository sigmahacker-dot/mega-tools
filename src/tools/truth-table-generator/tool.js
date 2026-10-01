(function () {
  'use strict';
  var P = 'truth-table-generator-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var EXPRS = {
    and2:   { n: 2, label: 'A ∧ B (AND)', fn: function (a, b) { return a && b; } },
    or2:    { n: 2, label: 'A ∨ B (OR)', fn: function (a, b) { return a || b; } },
    xor2:   { n: 2, label: 'A ⊕ B (XOR)', fn: function (a, b) { return !!(a ^ b); } },
    nand2:  { n: 2, label: 'A ⊼ B (NAND)', fn: function (a, b) { return !(a && b); } },
    nor2:   { n: 2, label: 'A ⊽ B (NOR)', fn: function (a, b) { return !(a || b); } },
    imp2:   { n: 2, label: 'A → B (IMPLIES)', fn: function (a, b) { return (!a) || b; } },
    xnor2:  { n: 2, label: 'A ↔ B (XNOR)', fn: function (a, b) { return a === b; } },
    nota:   { n: 2, label: '¬A (NOT A)', fn: function (a) { return !a; } },
    andor3: { n: 3, label: '(A ∧ B) ∨ C', fn: function (a, b, c) { return (a && b) || c; } },
    aand3:  { n: 3, label: 'A ∧ (B ∨ C)', fn: function (a, b, c) { return a && (b || c); } },
    orand3: { n: 3, label: '(A ∨ B) ∧ C', fn: function (a, b, c) { return (a || b) && c; } },
    maj3:   { n: 3, label: 'Majority (≥ 2 true)', fn: function (a, b, c) { return (a + b + c) >= 2; } },
    xor3:   { n: 3, label: 'A ⊕ B ⊕ C (odd parity)', fn: function (a, b, c) { return !!((a ^ b) ^ c); } }
  };
  var VARS = ['A', 'B', 'C'];
  function tf(v) { return v ? 'T' : 'F'; }
  function fillExprs() {
    var n = parseInt(g('vars').value, 10);
    var sel = g('expr');
    sel.innerHTML = '';
    Object.keys(EXPRS).forEach(function (k) {
      if (EXPRS[k].n !== n) return;
      var o = document.createElement('option');
      o.value = k; o.textContent = EXPRS[k].label;
      sel.appendChild(o);
    });
  }
  function render() {
    TN.clearErr(ERR);
    var n = parseInt(g('vars').value, 10);
    var key = g('expr').value;
    var e = EXPRS[key];
    if (!e || e.n !== n) { fillExprs(); key = g('expr').value; e = EXPRS[key]; }
    var head = '<tr>';
    for (var i = 0; i < n; i++) head += '<th>' + VARS[i] + '</th>';
    head += '<th>' + TN.esc(e.label) + '</th></tr>';
    g('head').innerHTML = head;
    var rows = 1 << n, trueCount = 0, html = '';
    for (var r = 0; r < rows; r++) {
      var vals = [];
      for (var v = 0; v < n; v++) vals.push(!!(r & (1 << (n - 1 - v))));
      var out = !!e.fn(vals[0], vals[1], vals[2]);
      if (out) trueCount++;
      html += '<tr>';
      vals.forEach(function (x) { html += '<td>' + tf(x) + '</td>'; });
      html += '<td><b>' + tf(out) + '</b></td></tr>';
    }
    g('body').innerHTML = html;
    set('rows', String(rows));
    set('true', String(trueCount));
    set('class', trueCount === rows ? 'Tautology' : (trueCount === 0 ? 'Contradiction' : 'Contingency'));
  }
  try {
    fillExprs();
    TN.on(P + 'vars', 'change', function () { fillExprs(); render(); });
    TN.on(P + 'expr', 'change', render);
    render();
  } catch (e) { /* never throw on load */ }
})();
