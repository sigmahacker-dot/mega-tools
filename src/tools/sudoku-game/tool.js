/* Sudoku — backtracking generator with unique-solution check, 3 difficulties, hints, live validation. */
(function () {
  'use strict';
  var SLUG = 'sudoku-game';
  var puzzle = [], solution = [], user = [], locked = [];
  var sel = -1, mistakes = 0, hintsLeft = 3, done = false;

  function $(id) { return document.getElementById(id); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function candidates(g, i) {
    var r = Math.floor(i / 9), c = i % 9, used = {}, k, v;
    for (k = 0; k < 9; k++) {
      if (g[r * 9 + k]) used[g[r * 9 + k]] = 1;
      if (g[k * 9 + c]) used[g[k * 9 + c]] = 1;
    }
    var br = r - r % 3, bc = c - c % 3;
    for (var dr = 0; dr < 3; dr++) for (var dc = 0; dc < 3; dc++) {
      v = g[(br + dr) * 9 + bc + dc];
      if (v) used[v] = 1;
    }
    var out = [];
    for (var n = 1; n <= 9; n++) if (!used[n]) out.push(n);
    return out;
  }

  function findBest(g) {
    var best = -1, bestOpts = null;
    for (var i = 0; i < 81; i++) {
      if (g[i] === 0) {
        var opts = candidates(g, i);
        if (opts.length === 0) return { i: -2, opts: [] };
        if (!bestOpts || opts.length < bestOpts.length) {
          bestOpts = opts; best = i;
          if (opts.length === 1) break;
        }
      }
    }
    return { i: best, opts: bestOpts };
  }

  function countSolutions(g, limit) {
    var f = findBest(g);
    if (f.i === -2) return 0;
    if (f.i === -1) return 1;
    var count = 0;
    for (var k = 0; k < f.opts.length; k++) {
      g[f.i] = f.opts[k];
      count += countSolutions(g, limit - count);
      g[f.i] = 0;
      if (count >= limit) return count;
    }
    return count;
  }

  function fillGrid(g) {
    var f = findBest(g);
    if (f.i === -2) return false;
    if (f.i === -1) return true;
    var opts = shuffle(f.opts.slice());
    for (var k = 0; k < opts.length; k++) {
      g[f.i] = opts[k];
      if (fillGrid(g)) return true;
      g[f.i] = 0;
    }
    return false;
  }

  function generate(target) {
    var full = new Array(81).fill(0);
    fillGrid(full);
    var p = full.slice();
    var order = [];
    for (var i = 0; i < 81; i++) order.push(i);
    shuffle(order);
    var keep = 81;
    for (var n = 0; n < order.length && keep > target; n++) {
      var c = order[n], bak = p[c];
      p[c] = 0;
      if (countSolutions(p.slice(), 2) !== 1) p[c] = bak;
      else keep--;
    }
    return { puzzle: p, solution: full };
  }

  function cellEl(i) { return $(SLUG + '-cell-' + i); }

  function paint() {
    for (var i = 0; i < 81; i++) {
      var el = cellEl(i);
      if (!el) continue;
      var v = user[i];
      el.textContent = v ? v : '';
      el.style.fontWeight = locked[i] ? 'bold' : 'normal';
      el.style.color = locked[i] ? '#111' : (v && v !== solution[i] ? '#d32f2f' : '#1565c0');
      el.style.background = (i === sel) ? '#fff9c4' : (v && !locked[i] && v !== solution[i] ? '#ffebee' : '#fff');
    }
  }

  function select(i) {
    if (done || locked[i]) { sel = -1; paint(); return; }
    sel = (sel === i) ? -1 : i;
    paint();
  }

  function enterNum(n) {
    if (done || sel < 0 || locked[sel]) return;
    user[sel] = n;
    if (n !== solution[sel]) {
      mistakes++;
      $('sudoku-game-mistakes').textContent = mistakes;
    }
    paint();
    checkWin();
  }

  function erase() {
    if (done || sel < 0 || locked[sel]) return;
    user[sel] = 0;
    paint();
  }

  function useHint() {
    if (done) return;
    if (hintsLeft <= 0) { $('sudoku-game-msg').textContent = 'No hints left!'; return; }
    var open = [];
    for (var i = 0; i < 81; i++) {
      if (!locked[i] && user[i] !== solution[i]) open.push(i);
    }
    if (!open.length) return;
    var i2 = open[Math.floor(Math.random() * open.length)];
    user[i2] = solution[i2];
    locked[i2] = true;
    hintsLeft--;
    $('sudoku-game-hints').textContent = hintsLeft;
    $('sudoku-game-msg').textContent = '💡 Hint placed for you.';
    paint();
    checkWin();
  }

  function checkNow() {
    if (done) return;
    var wrong = 0;
    for (var i = 0; i < 81; i++) {
      if (user[i] && !locked[i] && user[i] !== solution[i]) wrong++;
    }
    $('sudoku-game-msg').textContent = wrong === 0
      ? '✓ No mistakes found — looking good!'
      : '⚠ ' + wrong + ' cell' + (wrong > 1 ? 's' : '') + ' marked red ' + (wrong > 1 ? 'are' : 'is') + ' wrong.';
  }

  function checkWin() {
    if (done) return;
    for (var i = 0; i < 81; i++) {
      if (user[i] !== solution[i]) return;
    }
    done = true;
    $('sudoku-game-msg').textContent = '🏆 You win! Completed with ' + mistakes + ' mistake' + (mistakes === 1 ? '' : 's') + '.';
  }

  function build() {
    user = puzzle.slice();
    locked = puzzle.map(function (v) { return v !== 0; });
    mistakes = 0; hintsLeft = 3; done = false; sel = -1;
    $('sudoku-game-mistakes').textContent = '0';
    $('sudoku-game-hints').textContent = '3';
    $('sudoku-game-msg').textContent = 'Select a cell, then tap a number.';
    var b = $('sudoku-game-board');
    b.innerHTML = '';
    for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) {
      (function (rr, cc) {
        var i = rr * 9 + cc;
        var d = document.createElement('button');
        d.id = SLUG + '-cell-' + i;
        var st = 'width:38px;height:38px;font-size:17px;border:1px solid #bbb;background:#fff;cursor:pointer;padding:0;line-height:1;box-sizing:border-box;touch-action:manipulation';
        if (cc % 3 === 2 && cc < 8) st += ';border-right:2px solid #333';
        if (rr % 3 === 2 && rr < 8) st += ';border-bottom:2px solid #333';
        d.style.cssText = st;
        d.setAttribute('aria-label', 'Sudoku cell row ' + (rr + 1) + ' column ' + (cc + 1));
        d.addEventListener('click', function () { select(i); });
        b.appendChild(d);
      })(r, c);
    }
    var pad = $('sudoku-game-pad');
    pad.innerHTML = '';
    for (var n = 1; n <= 9; n++) {
      (function (num) {
        var btn = document.createElement('button');
        btn.className = 'btn btn-outline';
        btn.style.cssText = 'width:38px;height:44px;padding:0;font-size:18px';
        btn.textContent = num;
        btn.addEventListener('click', function () { enterNum(num); });
        pad.appendChild(btn);
      })(n);
    }
    paint();
  }

  function newGame() {
    var target = parseInt($('sudoku-game-diff').value, 10) || 35;
    $('sudoku-game-msg').textContent = 'Generating a unique puzzle…';
    setTimeout(function () {
      var g = generate(target);
      puzzle = g.puzzle;
      solution = g.solution;
      build();
    }, 60);
  }

  try {
    TN.on('sudoku-game-new', 'click', newGame);
    TN.on('sudoku-game-diff', 'change', newGame);
    TN.on('sudoku-game-erase', 'click', erase);
    TN.on('sudoku-game-hint', 'click', useHint);
    TN.on('sudoku-game-check', 'click', checkNow);
    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      if (e.key >= '1' && e.key <= '9') enterNum(parseInt(e.key, 10));
      else if (e.key === 'Backspace' || e.key === 'Delete') erase();
      else if (e.key.indexOf('Arrow') === 0 && sel >= 0) {
        e.preventDefault();
        var r = Math.floor(sel / 9), c = sel % 9;
        if (e.key === 'ArrowUp') r = (r + 8) % 9;
        if (e.key === 'ArrowDown') r = (r + 1) % 9;
        if (e.key === 'ArrowLeft') c = (c + 8) % 9;
        if (e.key === 'ArrowRight') c = (c + 1) % 9;
        sel = r * 9 + c;
        paint();
      }
    });
    newGame();
  } catch (e) { /* never throw on load */ }
})();
