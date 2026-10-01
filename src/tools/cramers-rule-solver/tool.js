(function () {
  'use strict';
  var P = 'cramers-rule-solver-', ERR = P + 'error';
  function g(id) { return TN.el(P + id); }
  function fmt(x) {
    if (!isFinite(x)) return String(x);
    return String(parseFloat(x.toPrecision(10)));
  }
  function det2(m) { return m[0][0] * m[1][1] - m[0][1] * m[1][0]; }
  function det2Steps(m, name) {
    return '<li>' + name + ' = (' + fmt(m[0][0]) + ')(' + fmt(m[1][1]) + ') − (' + fmt(m[0][1]) + ')(' + fmt(m[1][0]) + ') = ' + fmt(m[0][0] * m[1][1]) + ' − ' + fmt(m[0][1] * m[1][0]) + ' = <b>' + fmt(det2(m)) + '</b>.</li>';
  }
  function det3(m) {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
         - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
         + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  }
  function det3Steps(m, name) {
    var t1 = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]);
    var t2 = m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]);
    var t3 = m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    return '<li>' + name + ' = ' + fmt(m[0][0]) + '·(' + fmt(m[1][1] * m[2][2] - m[1][2] * m[2][1]) + ') − ' + fmt(m[0][1]) + '·(' + fmt(m[1][0] * m[2][2] - m[1][2] * m[2][0]) + ') + ' + fmt(m[0][2]) + '·(' + fmt(m[1][0] * m[2][1] - m[1][1] * m[2][0]) + ')' +
      ' = ' + fmt(t1) + ' − ' + fmt(t2) + ' + ' + fmt(t3) + ' = <b>' + fmt(t1 - t2 + t3) + '</b>.</li>';
  }
  function buildGrid() {
    var n = parseInt(g('size').value, 10);
    var vars = ['x', 'y', 'z'];
    var h = '<table class="data"><tbody>';
    for (var i = 0; i < n; i++) {
      h += '<tr>';
      for (var j = 0; j < n; j++) {
        h += '<td><input class="input" style="width:70px" id="' + P + 'a' + i + j + '" type="number" step="any" value="0" aria-label="a' + (i + 1) + (j + 1) + '"></td>' +
             (j < n - 1 ? '<td class="muted">' + vars[j] + ' +</td>' : '<td class="muted">' + vars[j] + ' =</td>');
      }
      h += '<td><input class="input" style="width:70px" id="' + P + 'b' + i + '" type="number" step="any" value="0" aria-label="b' + (i + 1) + '"></td></tr>';
    }
    h += '</tbody></table>';
    g('grid').innerHTML = h;
    TN.hide(P + 'out');
  }
  function val(id) {
    var v = parseFloat(TN.el(id).value);
    if (isNaN(v)) throw new Error('All coefficients must be numbers.');
    return v;
  }
  function solve() {
    try {
      TN.clearErr(ERR);
      var n = parseInt(g('size').value, 10);
      var A = [], B = [], i, j;
      for (i = 0; i < n; i++) {
        A.push([]);
        for (j = 0; j < n; j++) A[i].push(val(P + 'a' + i + j));
        B.push(val(P + 'b' + i));
      }
      var steps = [], names = ['x', 'y', 'z'], cards = '', plain = '';
      var D, Ds = [];
      if (n === 2) {
        D = det2(A);
        steps.push(det2Steps(A, 'D'));
        for (var k = 0; k < 2; k++) {
          var M = [A[0].slice(), A[1].slice()];
          M[0][k] = B[0]; M[1][k] = B[1];
          Ds.push(det2(M));
          steps.push(det2Steps(M, 'D' + names[k] + ' (column ' + (k + 1) + ' replaced by constants)'));
        }
      } else {
        D = det3(A);
        steps.push(det3Steps(A, 'D'));
        for (var k2 = 0; k2 < 3; k2++) {
          var M2 = A.map(function (row, ri) { return row.map(function (v, cj) { return cj === k2 ? B[ri] : v; }); });
          Ds.push(det3(M2));
          steps.push(det3Steps(M2, 'D' + names[k2] + ' (column ' + (k2 + 1) + ' replaced by constants)'));
        }
      }
      if (Math.abs(D) < 1e-12) {
        TN.show(P + 'out');
        g('cards').innerHTML = '<div class="stat-card"><div class="v">D = 0</div><div class="l">No unique solution</div></div>';
        g('steps').innerHTML = '<ol>' + steps.join('') + '</ol><p class="note">D = 0, so Cramer\'s rule does not apply: the system is singular — it has either no solution or infinitely many solutions.</p>';
        return;
      }
      for (var s = 0; s < n; s++) {
        var sol = Ds[s] / D;
        cards += '<div class="stat-card"><div class="v">' + fmt(sol) + '</div><div class="l">' + names[s] + ' = D' + names[s] + '/D = ' + fmt(Ds[s]) + '/' + fmt(D) + '</div></div>';
        plain += names[s] + '=' + fmt(sol) + '\n';
      }
      steps.push('<li>Divide: ' + names.slice(0, n).map(function (nm, ix) { return nm + ' = ' + fmt(Ds[ix]) + ' / ' + fmt(D) + ' = <b>' + fmt(Ds[ix] / D) + '</b>'; }).join('; ') + '.</li>');
      // verification
      var chk = [];
      for (i = 0; i < n; i++) {
        var lhs = 0;
        for (j = 0; j < n; j++) lhs += A[i][j] * (Ds[j] / D);
        chk.push(Math.abs(lhs - B[i]) < 1e-6);
      }
      steps.push('<li>Verification: substituting back gives residuals ≈ 0 for all ' + n + ' equations ' + (chk.every(Boolean) ? '✓' : '(check rounding)') + '.</li>');
      TN.show(P + 'out');
      g('cards').innerHTML = cards;
      g('steps').innerHTML = '<ol>' + steps.join('') + '</ol>';
      g('solve').setAttribute('data-r', plain.trim());
    } catch (e) { TN.setErr(ERR, e.message || 'Could not solve.'); }
  }
  try {
    if (!TN.el(P + 'solve')) return;
    buildGrid();
    TN.on(P + 'size', 'change', buildGrid);
    TN.on(P + 'solve', 'click', solve);
    TN.on(P + 'sample', 'click', function () {
      var n = parseInt(g('size').value, 10);
      var A, B;
      if (n === 2) { A = [[2, 1], [1, -1]]; B = [5, 1]; }
      else { A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]; B = [8, -11, -3]; }
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) TN.el(P + 'a' + i + j).value = A[i][j];
        TN.el(P + 'b' + i).value = B[i];
      }
      TN.clearErr(ERR);
    });
  } catch (e) { /* never throw on load */ }
})();
