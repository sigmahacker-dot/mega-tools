(function () {
  'use strict';
  var P = 'logic-gate-simulator-', ERR = P + 'error';
  var A = false, B = false;
  function g(id) { return TN.el(P + id); }
  var GATES = {
    AND: { f: function (a, b) { return a && b; }, expr: function (a, b) { return a + ' ∧ ' + b; } },
    OR: { f: function (a, b) { return a || b; }, expr: function (a, b) { return a + ' ∨ ' + b; } },
    NOT: { f: function (a) { return !a; }, expr: function (a) { return '¬' + a; }, unary: true },
    XOR: { f: function (a, b) { return (a !== b); }, expr: function (a, b) { return a + ' ⊕ ' + b; } },
    NAND: { f: function (a, b) { return !(a && b); }, expr: function (a, b) { return '¬(' + a + ' ∧ ' + b + ')'; } },
    NOR: { f: function (a, b) { return !(a || b); }, expr: function (a, b) { return '¬(' + a + ' ∨ ' + b + ')'; } },
    XNOR: { f: function (a, b) { return a === b; }, expr: function (a, b) { return '¬(' + a + ' ⊕ ' + b + ')'; } }
  };
  function render() {
    try {
      TN.clearErr(ERR);
      var name = g('gate').value, gate = GATES[name];
      var a = A ? 1 : 0, b = B ? 1 : 0;
      var out = gate.f(A, B) ? 1 : 0;
      g('a').textContent = 'A = ' + a;
      g('b').textContent = 'B = ' + b;
      g('b').disabled = !!gate.unary;
      g('b').style.opacity = gate.unary ? '0.4' : '1';
      g('out').textContent = String(out);
      g('expr').textContent = name + '(' + (gate.unary ? a : a + ', ' + b) + ') = ' + gate.expr(a, b) + ' = ' + out;
      var lamp = g('lamp');
      lamp.style.background = out ? '#4ade80' : '#1e293b';
      lamp.style.borderColor = out ? '#22c55e' : '#475569';
      lamp.style.boxShadow = out ? '0 0 24px #4ade80' : 'none';
      var rows = '';
      var combos = gate.unary ? [[1], [0]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
      combos.forEach(function (cb) {
        var ca = cb[0] === 1, cbb = cb.length > 1 ? cb[1] === 1 : false;
        var o = gate.f(ca, cbb) ? 1 : 0;
        var cur = (ca === A) && (gate.unary || cbb === B);
        rows += '<tr' + (cur ? ' style="background:#16653433;font-weight:bold"' : '') + '><td>' + cb[0] + '</td><td>' + (cb.length > 1 ? cb[1] : '—') + '</td><td>' + o + '</td></tr>';
      });
      g('table').innerHTML = rows;
    } catch (e) { TN.setErr(ERR, 'Could not update the simulator.'); }
  }
  try {
    if (!TN.el(P + 'gate')) return;
    TN.on(P + 'gate', 'change', render);
    TN.on(P + 'a', 'click', function () { A = !A; render(); });
    TN.on(P + 'b', 'click', function () { B = !B; render(); });
    render();
  } catch (e) { /* never throw on load */ }
})();
