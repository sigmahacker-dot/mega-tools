(function () {
  'use strict';
  var ERR = 'matrix-calculator-error';

  function size() {
    var el = TN.el('matrix-calculator-size');
    return el ? parseInt(el.value, 10) : 2;
  }

  function buildGrid(containerId, prefix) {
    var c = TN.el(containerId);
    if (!c) return;
    var n = size();
    c.style.gridTemplateColumns = 'repeat(' + n + ', 1fr)';
    c.innerHTML = '';
    for (var r = 0; r < n; r++) {
      for (var col = 0; col < n; col++) {
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.step = 'any';
        inp.className = 'input';
        inp.id = prefix + '-' + r + '-' + col;
        inp.value = (r === col) ? '1' : '0';
        inp.style.textAlign = 'center';
        c.appendChild(inp);
      }
    }
  }

  function readMatrix(prefix) {
    var n = size();
    var m = [];
    for (var r = 0; r < n; r++) {
      var row = [];
      for (var col = 0; col < n; col++) {
        var el = TN.el(prefix + '-' + r + '-' + col);
        var v = el ? Number(el.value) : 0;
        if (!isFinite(v)) throw new Error('All matrix entries must be numbers.');
        row.push(v);
      }
      m.push(row);
    }
    return m;
  }

  function det(m) {
    if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    var a = m[0][0], b = m[0][1], c = m[0][2];
    var d = m[1][0], e = m[1][1], f = m[1][2];
    var g = m[2][0], h = m[2][1], i = m[2][2];
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  }

  function inverse(m) {
    var d = det(m);
    if (Math.abs(d) < 1e-12) throw new Error('Singular matrix — determinant is zero, no inverse exists.');
    var n = m.length, inv = [];
    if (n === 2) {
      return [[m[1][1] / d, -m[0][1] / d], [-m[1][0] / d, m[0][0] / d]];
    }
    // 3x3 adjugate
    var cof = [];
    for (var r = 0; r < 3; r++) {
      cof[r] = [];
      for (var c = 0; c < 3; c++) {
        var rows = [0, 1, 2].filter(function (x) { return x !== r; });
        var cols = [0, 1, 2].filter(function (x) { return x !== c; });
        var minor = m[rows[0]][cols[0]] * m[rows[1]][cols[1]] - m[rows[0]][cols[1]] * m[rows[1]][cols[0]];
        cof[r][c] = ((r + c) % 2 === 0 ? 1 : -1) * minor;
      }
    }
    for (var i2 = 0; i2 < 3; i2++) {
      inv[i2] = [];
      for (var j2 = 0; j2 < 3; j2++) inv[i2][j2] = cof[j2][i2] / d;
    }
    return inv;
  }

  function fmtNum(v) {
    if (!isFinite(v)) return '–';
    if (Math.abs(v) < 1e-12) v = 0;
    return parseFloat(v.toPrecision(8)).toString();
  }

  function renderMatrix(m, label, note) {
    var n = m.length;
    var out = TN.el('matrix-calculator-out');
    out.style.gridTemplateColumns = 'repeat(' + n + ', 1fr)';
    out.innerHTML = '';
    m.forEach(function (row) {
      row.forEach(function (v) {
        var cell = document.createElement('div');
        cell.className = 'stat-card';
        cell.style.padding = '8px 4px';
        cell.textContent = fmtNum(v);
        out.appendChild(cell);
      });
    });
    TN.el('matrix-calculator-result-label').textContent = label;
    TN.el('matrix-calculator-note').textContent = note || '';
  }

  function run(op) {
    TN.clearErr(ERR);
    try {
      var A = readMatrix('matrix-calculator-a');
      var B = readMatrix('matrix-calculator-b');
      var n = size();
      var C, label = 'Result', note = '';
      if (op === 'add' || op === 'sub') {
        C = A.map(function (row, r) {
          return row.map(function (v, c) { return op === 'add' ? v + B[r][c] : v - B[r][c]; });
        });
        label = op === 'add' ? 'A + B' : 'A − B';
      } else if (op === 'mul') {
        C = [];
        for (var r = 0; r < n; r++) {
          C[r] = [];
          for (var c = 0; c < n; c++) {
            var s = 0;
            for (var k = 0; k < n; k++) s += A[r][k] * B[k][c];
            C[r][c] = s;
          }
        }
        label = 'A × B';
      } else if (op === 'detA' || op === 'detB') {
        var dd = det(op === 'detA' ? A : B);
        renderMatrix([[dd]], op === 'detA' ? 'det(A)' : 'det(B)', '');
        return;
      } else if (op === 'invA' || op === 'invB') {
        C = inverse(op === 'invA' ? A : B);
        label = op === 'invA' ? 'Inverse of A' : 'Inverse of B';
        note = 'Computed via adjugate ÷ determinant.';
      } else if (op === 'trA' || op === 'trB') {
        var M = op === 'trA' ? A : B;
        C = M[0].map(function (_, c) { return M.map(function (row) { return row[c]; }); });
        label = op === 'trA' ? 'Transpose of A' : 'Transpose of B';
      }
      renderMatrix(C, label, note);
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  function rebuild() {
    buildGrid('matrix-calculator-grid-a', 'matrix-calculator-a');
    buildGrid('matrix-calculator-grid-b', 'matrix-calculator-b');
  }

  try {
    rebuild();
    TN.on('matrix-calculator-size', 'change', rebuild);
    var ops = TN.el('matrix-calculator-ops');
    if (ops) {
      TN.qsa('button[data-op]', ops).forEach(function (b) {
        b.addEventListener('click', function () { run(b.getAttribute('data-op')); });
      });
    }
  } catch (e) { /* never throw on load */ }
})();
