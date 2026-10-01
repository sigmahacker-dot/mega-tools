(function () {
  'use strict';
  var P = '24-game-solver-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function frac(n, d) {
    if (d === 0) return null;
    if (d < 0) { n = -n; d = -d; }
    var x = gcd(n, d);
    return { n: n / x, d: d / x };
  }
  function fadd(a, b) { return frac(a.n * b.d + b.n * a.d, a.d * b.d); }
  function fsub(a, b) { return frac(a.n * b.d - b.n * a.d, a.d * b.d); }
  function fmul(a, b) { return frac(a.n * b.n, a.d * b.d); }
  function fdiv(a, b) { return b.n === 0 ? null : frac(a.n * b.d, a.d * b.n); }
  function is24(f) { return f.d !== 0 && f.n === 24 * f.d; }
  function fmtNum(x) { return String(parseFloat(x.toPrecision(10))); }
  function solve() {
    try {
      TN.clearErr(ERR);
      var nums = [];
      for (var i = 0; i < 4; i++) {
        var v = parseFloat(g('n' + i).value);
        if (isNaN(v)) { TN.setErr(ERR, 'Number ' + (i + 1) + ' must be numeric.'); return; }
        if (!isFinite(v)) { TN.setErr(ERR, 'Number ' + (i + 1) + ' must be finite.'); return; }
        nums.push(v);
      }
      var items = nums.map(function (v) {
        var f = frac(Math.round(v * 1e9), 1e9); // exact for integers/decimals
        if (!f) f = { n: v, d: 1 };
        return { v: f, e: fmtNum(v), exact: Number.isInteger(v) };
      });
      var solutions = {}, solList = [], combos = 0;
      var OPS = [
        { s: '+', f: fadd, both: false },
        { s: '−', f: fsub, both: true },
        { s: '×', f: fmul, both: false },
        { s: '÷', f: fdiv, both: true }
      ];
      function rec(list) {
        if (solList.length >= 50) return;
        if (list.length === 1) {
          if (is24(list[0].v) && !solutions[list[0].e]) {
            solutions[list[0].e] = 1;
            solList.push(list[0].e);
          }
          return;
        }
        for (var i = 0; i < list.length; i++) {
          for (var j = i + 1; j < list.length; j++) {
            var rest = [];
            for (var k = 0; k < list.length; k++) if (k !== i && k !== j) rest.push(list[k]);
            for (var o = 0; o < OPS.length; o++) {
              var op = OPS[o];
              var orders = op.both ? [[list[i], list[j]], [list[j], list[i]]] : [[list[i], list[j]]];
              for (var q = 0; q < orders.length; q++) {
                combos++;
                var nv = op.f(orders[q][0].v, orders[q][1].v);
                if (!nv) continue;
                var ne = '(' + orders[q][0].e + ' ' + op.s + ' ' + orders[q][1].e + ')';
                rec(rest.concat([{ v: nv, e: ne }]));
                if (solList.length >= 50) return;
              }
            }
          }
        }
      }
      rec(items);
      TN.show(P + 'out');
      var list = g('list');
      if (solList.length) {
        g('title').textContent = solList.length + (solList.length === 1 ? ' solution' : ' distinct solutions') + (solList.length >= 50 ? ' (first 50)' : '');
        list.innerHTML = solList.map(function (s) { return '<li>' + TN.esc(s) + ' = 24</li>'; }).join('');
      } else {
        g('title').textContent = 'No solution';
        list.innerHTML = '<li class="muted">Exhaustive search found no way to make 24 from ' + nums.map(fmtNum).join(', ') + '.</li>';
      }
      g('stats').textContent = 'Searched ' + combos.toLocaleString() + ' operation applications across all pair orders and parenthesizations, with exact fraction arithmetic.';
    } catch (e) { TN.setErr(ERR, e.message || 'Could not solve.'); }
  }
  try {
    if (!TN.el(P + 'solve')) return;
    TN.on(P + 'solve', 'click', solve);
    TN.on(P + 'random', 'click', function () {
      for (var i = 0; i < 4; i++) g('n' + i).value = String(1 + Math.floor(Math.random() * 9));
      TN.hide(P + 'out'); TN.clearErr(ERR);
    });
  } catch (e) { /* never throw on load */ }
})();
