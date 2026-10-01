/* 2048 — real slide/merge/spawn/game-over, keyboard + swipe. */
(function () {
  'use strict';
  var SLUG = 'game-2048';
  var SIZE = 4;
  var grid = [];
  var score = 0, best = 0, over = false, won = false, keepGoing = false;
  var TILEC = { 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e' };

  function $(id) { return document.getElementById(id); }

  function loadBest() {
    try { best = parseInt(localStorage.getItem('t2048-best') || '0', 10) || 0; } catch (e) { best = 0; }
    $('game-2048-best').textContent = best;
  }

  function empty() { grid = []; for (var i = 0; i < SIZE * SIZE; i++) grid.push(0); }

  function empties() {
    var out = [];
    for (var i = 0; i < grid.length; i++) if (!grid[i]) out.push(i);
    return out;
  }

  function spawn() {
    var e = empties();
    if (!e.length) return;
    var i = e[Math.floor(Math.random() * e.length)];
    grid[i] = Math.random() < 0.9 ? 2 : 4;
  }

  function slideRow(row) {
    // returns {cells, gained, moved}
    var cells = row.filter(function (v) { return v; });
    var gained = 0, merged = [], moved = false;
    for (var i = 0; i < cells.length - 1; i++) {
      if (cells[i] === cells[i + 1]) {
        cells[i] *= 2;
        gained += cells[i];
        cells.splice(i + 1, 1);
      }
    }
    while (cells.length < SIZE) cells.push(0);
    for (var j = 0; j < SIZE; j++) if (cells[j] !== row[j]) { moved = true; break; }
    return { cells: cells, gained: gained, moved: moved };
  }

  function move(dir) {
    // dir: 0=left,1=up,2=right,3=down
    if (over) return;
    var moved = false, gained = 0;
    for (var l = 0; l < SIZE; l++) {
      var line = [];
      for (var k = 0; k < SIZE; k++) {
        var r, c;
        if (dir === 0) { r = l; c = k; }
        else if (dir === 2) { r = l; c = SIZE - 1 - k; }
        else if (dir === 1) { r = k; c = l; }
        else { r = SIZE - 1 - k; c = l; }
        line.push(grid[r * SIZE + c]);
      }
      var res = slideRow(line);
      if (res.moved) moved = true;
      gained += res.gained;
      for (var k2 = 0; k2 < SIZE; k2++) {
        var r2, c2;
        if (dir === 0) { r2 = l; c2 = k2; }
        else if (dir === 2) { r2 = l; c2 = SIZE - 1 - k2; }
        else if (dir === 1) { r2 = k2; c2 = l; }
        else { r2 = SIZE - 1 - k2; c2 = l; }
        grid[r2 * SIZE + c2] = res.cells[k2];
      }
    }
    if (!moved) return;
    score += gained;
    spawn();
    render();
    if (!won && grid.indexOf(2048) >= 0) {
      won = true;
      $('game-2048-msg').textContent = '🎉 You made 2048! Keep going for a higher score.';
    }
    if (empties().length === 0 && !canMove()) {
      over = true;
      $('game-2048-msg').textContent = '💀 Game over! Final score: ' + score + '. Press New game.';
    }
    if (score > best) {
      best = score;
      try { localStorage.setItem('t2048-best', String(best)); } catch (e) {}
      $('game-2048-best').textContent = best;
    }
  }

  function canMove() {
    for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) {
      var v = grid[r * SIZE + c];
      if (!v) return true;
      if (c + 1 < SIZE && grid[r * SIZE + c + 1] === v) return true;
      if (r + 1 < SIZE && grid[(r + 1) * SIZE + c] === v) return true;
    }
    return false;
  }

  function render() {
    var b = $('game-2048-board');
    b.innerHTML = '';
    grid.forEach(function (v) {
      var d = document.createElement('div');
      d.style.cssText = 'aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:6px;font-weight:800;' +
        'background:' + (TILEC[v] || '#3c3a32') + ';color:' + (v > 4 ? '#f9f6f2' : '#776e65') + ';' +
        'font-size:' + (v >= 1024 ? '20px' : v >= 128 ? '24px' : '30px');
      d.textContent = v || '';
      if (!v) d.style.background = 'rgba(238,228,218,.35)';
      b.appendChild(d);
    });
    $('game-2048-score').textContent = score;
  }

  function newGame() {
    empty();
    score = 0; over = false; won = false;
    spawn(); spawn();
    $('game-2048-score').textContent = '0';
    $('game-2048-msg').textContent = 'Use arrow keys / WASD or swipe.';
    render();
  }

  try {
    loadBest();
    TN.on('game-2048-new', 'click', newGame);
    document.addEventListener('keydown', function (e) {
      var board = $('game-2048-board');
      if (!board || !board.offsetParent) return; // tool not visible
      var map = { ArrowLeft: 0, a: 0, A: 0, ArrowUp: 1, w: 1, W: 1, ArrowRight: 2, d: 2, D: 2, ArrowDown: 3, s: 3, S: 3 };
      if (e.key in map) { e.preventDefault(); move(map[e.key]); }
    });
    var sx = 0, sy = 0;
    var bd = $('game-2048-board');
    bd.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      sx = t.clientX; sy = t.clientY;
    }, { passive: true });
    bd.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0];
      var dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
      e.preventDefault();
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 2 : 0);
      else move(dy > 0 ? 3 : 1);
    });
    newGame();
  } catch (e) { /* never throw on load */ }
})();
