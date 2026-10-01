(function () {
  'use strict';
  var P = 'sudoku-solver-', ERR = P + 'error';
  var SAMPLE = [
    5, 3, 0, 0, 7, 0, 0, 0, 0,
    6, 0, 0, 1, 9, 5, 0, 0, 0,
    0, 9, 8, 0, 0, 0, 0, 6, 0,
    8, 0, 0, 0, 6, 0, 0, 0, 3,
    4, 0, 0, 8, 0, 3, 0, 0, 1,
    7, 0, 0, 0, 2, 0, 0, 0, 6,
    0, 6, 0, 0, 0, 0, 2, 8, 0,
    0, 0, 0, 4, 1, 9, 0, 0, 5,
    0, 0, 0, 0, 8, 0, 0, 7, 9
  ];
  function g(id) { return TN.el(P + id); }
  function buildGrid() {
    var wrap = g('grid'), h = '';
    for (var i = 0; i < 81; i++) {
      var r = Math.floor(i / 9), c = i % 9;
      var extra = '';
      if (c === 2 || c === 5) extra += 'margin-right:6px;';
      if (r === 2 || r === 5) extra += 'margin-bottom:6px;';
      h += '<input class="input" id="' + P + 'c' + i + '" type="text" inputmode="numeric" maxlength="1" ' +
        'style="text-align:center;padding:6px 2px;font-size:1.05em;' + extra + '" aria-label="row ' + (r + 1) + ' column ' + (c + 1) + '">';
    }
    wrap.innerHTML = h;
    for (var j = 0; j < 81; j++) {
      (function (idx) {
        TN.on(P + 'c' + idx, 'input', function () {
          var el = TN.el(P + 'c' + idx);
          el.value = el.value.replace(/[^1-9]/g, '').slice(0, 1);
          el.style.fontWeight = el.value ? 'bold' : 'normal';
          el.style.color = '';
          TN.hide(P + 'out');
        });
      })(j);
    }
  }
  function readGrid() {
    var vals = [];
    for (var i = 0; i < 81; i++) {
      var v = TN.el(P + 'c' + i).value.trim();
      if (v === '') { vals.push(0); continue; }
      var n = parseInt(v, 10);
      if (isNaN(n) || n < 1 || n > 9) throw new Error('Cell ' + (i + 1) + ' must be a digit 1–9 or blank.');
      vals.push(n);
    }
    return vals;
  }
  function validInitial(grid) {
    function hasDup(cells) {
      var seen = {};
      for (var i = 0; i < 9; i++) {
        var v = grid[cells[i]];
        if (v && seen[v]) return true;
        seen[v] = 1;
      }
      return false;
    }
    for (var r = 0; r < 9; r++) {
      var row = []; for (var c = 0; c < 9; c++) row.push(r * 9 + c);
      if (hasDup(row)) return false;
    }
    for (var c2 = 0; c2 < 9; c2++) {
      var col = []; for (var r2 = 0; r2 < 9; r2++) col.push(r2 * 9 + c2);
      if (hasDup(col)) return false;
    }
    for (var br = 0; br < 3; br++) for (var bc = 0; bc < 3; bc++) {
      var box = [];
      for (var dr = 0; dr < 3; dr++) for (var dc = 0; dc < 3; dc++) box.push((br * 3 + dr) * 9 + bc * 3 + dc);
      if (hasDup(box)) return false;
    }
    return true;
  }
  function candidates(grid, idx) {
    var r = Math.floor(idx / 9), c = idx % 9, used = {}, i;
    for (i = 0; i < 9; i++) { used[grid[r * 9 + i]] = 1; used[grid[i * 9 + c]] = 1; }
    var br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (var dr = 0; dr < 3; dr++) for (var dc = 0; dc < 3; dc++) used[grid[(br + dr) * 9 + bc + dc]] = 1;
    var out = [];
    for (i = 1; i <= 9; i++) if (!used[i]) out.push(i);
    return out;
  }
  function solve() {
    try {
      TN.clearErr(ERR);
      var grid = readGrid();
      if (!validInitial(grid)) { TN.setErr(ERR, 'The givens contradict Sudoku rules (a duplicate in a row, column or box). Fix the highlighted conflict.'); return; }
      var givens = grid.slice();
      var steps = 0, backtracks = 0;
      var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      function bt() {
        // MRV: empty cell with fewest candidates
        var best = -1, bestC = null, i;
        for (i = 0; i < 81; i++) {
          if (grid[i] === 0) {
            var cs = candidates(grid, i);
            if (!cs.length) return false;
            if (!bestC || cs.length < bestC.length) { best = i; bestC = cs; if (cs.length === 1) break; }
          }
        }
        if (best === -1) return true;
        for (var k = 0; k < bestC.length; k++) {
          steps++;
          grid[best] = bestC[k];
          if (bt()) return true;
          backtracks++;
          grid[best] = 0;
        }
        return false;
      }
      var solved = bt();
      var t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      if (!solved) { TN.setErr(ERR, 'No solution exists for this puzzle (search exhausted all ' + steps + ' placements).'); return; }
      for (var i2 = 0; i2 < 81; i2++) {
        var el = TN.el(P + 'c' + i2);
        el.value = String(grid[i2]);
        if (givens[i2]) { el.style.fontWeight = 'bold'; el.style.color = '#4ade80'; }
        else { el.style.fontWeight = 'normal'; el.style.color = '#e2e8f0'; }
      }
      TN.show(P + 'out');
      g('steps').textContent = String(steps);
      g('backs').textContent = String(backtracks);
      g('time').textContent = (t1 - t0).toFixed(1) + ' ms';
    } catch (e) { TN.setErr(ERR, e.message || 'Could not solve.'); }
  }
  try {
    if (!TN.el(P + 'solve')) return;
    buildGrid();
    TN.on(P + 'solve', 'click', solve);
    TN.on(P + 'sample', 'click', function () {
      for (var i = 0; i < 81; i++) {
        var el = TN.el(P + 'c' + i);
        el.value = SAMPLE[i] ? String(SAMPLE[i]) : '';
        el.style.fontWeight = SAMPLE[i] ? 'bold' : 'normal';
        el.style.color = '';
      }
      TN.hide(P + 'out'); TN.clearErr(ERR);
    });
    TN.on(P + 'clear', 'click', function () {
      for (var i = 0; i < 81; i++) {
        var el = TN.el(P + 'c' + i);
        el.value = ''; el.style.fontWeight = 'normal'; el.style.color = '';
      }
      TN.hide(P + 'out'); TN.clearErr(ERR);
    });
    // preload sample
    for (var s = 0; s < 81; s++) {
      if (SAMPLE[s]) { var e2 = TN.el(P + 'c' + s); e2.value = String(SAMPLE[s]); e2.style.fontWeight = 'bold'; }
    }
  } catch (e) { /* never throw on load */ }
})();
