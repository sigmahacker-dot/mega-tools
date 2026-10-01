/* 2x2 elimination + 3x3 Gaussian elimination with steps. */
(function () {
  'use strict';
  var SLUG = 'system-of-equations-solver';
  function $(id) { return document.getElementById(id); }
  function err(m) { TN.setErr(SLUG + '-error', m); }
  function f(x) { return (Math.round(x * 1e8) / 1e8).toString(); }
  function v(id) { return parseFloat($(SLUG + '-' + id).value); }
  function solve2() {
    var a1 = v('a1'), b1 = v('b1'), c1 = v('c1'), a2 = v('a2'), b2 = v('b2'), c2 = v('c2');
    if ([a1, b1, c1, a2, b2, c2].some(isNaN)) { err('Enter all six coefficients.'); return null; }
    var lines = [];
    lines.push('Eq1: ' + f(a1) + 'x + ' + f(b1) + 'y = ' + f(c1));
    lines.push('Eq2: ' + f(a2) + 'x + ' + f(b2) + 'y = ' + f(c2));
    var det = a1 * b2 - a2 * b1;
    lines.push('\nElimination: multiply Eq1 by ' + f(a2) + ', Eq2 by ' + f(a1) + ' to align x, then subtract.');
    if (Math.abs(det) < 1e-12) {
      var prop = Math.abs(a1 * c2 - a2 * c1) < 1e-9 && Math.abs(b1 * c2 - b2 * c1) < 1e-9;
      lines.push(prop ? '\nDependent system \u2192 infinitely many solutions (same line).' : '\nInconsistent system \u2192 no solution (parallel lines).');
      return { lines: lines, rx: prop ? 'any' : 'none', ry: prop ? 'any' : 'none' };
    }
    var x = (c1 * b2 - c2 * b1) / det, y = (a1 * c2 - a2 * c1) / det;
    lines.push('Determinant D = a\u2081b\u2082 \u2212 a\u2082b\u2081 = ' + f(det));
    lines.push('x = (c\u2081b\u2082 \u2212 c\u2082b\u2081) / D = ' + f(x));
    lines.push('y = (a\u2081c\u2082 \u2212 a\u2082c\u2081) / D = ' + f(y));
    lines.push('Check Eq1: ' + f(a1 * x + b1 * y) + ' \u2248 ' + f(c1) + '   Check Eq2: ' + f(a2 * x + b2 * y) + ' \u2248 ' + f(c2));
    return { lines: lines, rx: f(x), ry: f(y) };
  }
  function solve3() {
    var ids = ['m11', 'm12', 'm13', 'd1', 'm21', 'm22', 'm23', 'd2', 'm31', 'm32', 'm33', 'd3'];
    var vals = ids.map(v);
    if (vals.some(isNaN)) { err('Enter all twelve coefficients.'); return null; }
    var M = [[vals[0], vals[1], vals[2], vals[3]], [vals[4], vals[5], vals[6], vals[7]], [vals[8], vals[9], vals[10], vals[11]]];
    var lines = ['Augmented matrix:'];
    function row(r) { return '[ ' + M[r].slice(0, 3).map(f).join('  ') + ' | ' + f(M[r][3]) + ' ]'; }
    for (var i = 0; i < 3; i++) lines.push('  ' + row(i));
    lines.push('\nForward elimination:');
    for (var col = 0; col < 3; col++) {
      var piv = col;
      for (var r2 = col + 1; r2 < 3; r2++) if (Math.abs(M[r2][col]) > Math.abs(M[piv][col])) piv = r2;
      if (Math.abs(M[piv][col]) < 1e-12) { lines.push('\nZero pivot in column ' + (col + 1) + ' \u2192 no unique solution.'); return { lines: lines, rx: 'none', ry: 'none', rz: 'none' }; }
      if (piv !== col) { var tmp = M[col]; M[col] = M[piv]; M[piv] = tmp; lines.push('Swap R' + (col + 1) + ' \u2194 R' + (piv + 1)); }
      for (var r3 = col + 1; r3 < 3; r3++) {
        var factor = M[r3][col] / M[col][col];
        lines.push('R' + (r3 + 1) + ' \u2190 R' + (r3 + 1) + ' \u2212 (' + f(factor) + ')\u00D7R' + (col + 1));
        for (var k = col; k < 4; k++) M[r3][k] -= factor * M[col][k];
      }
      for (var rr = 0; rr < 3; rr++) lines.push('  ' + row(rr));
    }
    lines.push('\nBack substitution:');
    var sol = [0, 0, 0];
    for (var i2 = 2; i2 >= 0; i2--) {
      var s = M[i2][3];
      for (var j = i2 + 1; j < 3; j++) s -= M[i2][j] * sol[j];
      sol[i2] = s / M[i2][i2];
      lines.push(['x', 'y', 'z'][i2] + ' = ' + f(sol[i2]));
    }
    return { lines: lines, rx: f(sol[0]), ry: f(sol[1]), rz: f(sol[2]) };
  }
  function calc() {
    TN.clearErr(SLUG + '-error');
    var mode = $(SLUG + '-mode').value;
    $(SLUG + '-sys2').classList.toggle('hidden', mode !== '2');
    $(SLUG + '-sys3').classList.toggle('hidden', mode !== '3');
    $(SLUG + '-rzw').classList.toggle('hidden', mode !== '3');
    var r = mode === '2' ? solve2() : solve3();
    if (!r) return;
    $(SLUG + '-rx').textContent = r.rx;
    $(SLUG + '-ry').textContent = r.ry;
    if (r.rz !== undefined) $(SLUG + '-rz').textContent = r.rz;
    $(SLUG + '-steps').textContent = r.lines.join('\n');
  }
  try {
    TN.on(SLUG + '-go', 'click', calc);
    TN.on(SLUG + '-mode', 'change', calc);
    var all = ['a1', 'b1', 'c1', 'a2', 'b2', 'c2', 'm11', 'm12', 'm13', 'd1', 'm21', 'm22', 'm23', 'd2', 'm31', 'm32', 'm33', 'd3'];
    all.forEach(function (id) { TN.on(SLUG + '-' + id, 'input', TN.debounce(calc, 400)); });
    calc();
  } catch (e) {}
})();