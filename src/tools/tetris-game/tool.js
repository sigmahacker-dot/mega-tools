/* Tetris — 7 tetrominoes, rotation, line clears, levels, next piece, game over. */
(function () {
  'use strict';
  var SLUG = 'tetris-game';
  var COLS = 10, ROWS = 20, CELL = 24;
  var SHAPES = {
    I: { m: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], c: '#00bcd4' },
    J: { m: [[1,0,0],[1,1,1],[0,0,0]], c: '#3f51b5' },
    L: { m: [[0,0,1],[1,1,1],[0,0,0]], c: '#ff9800' },
    O: { m: [[1,1],[1,1]], c: '#ffeb3b' },
    S: { m: [[0,1,1],[1,1,0],[0,0,0]], c: '#4caf50' },
    T: { m: [[0,1,0],[1,1,1],[0,0,0]], c: '#9c27b0' },
    Z: { m: [[1,1,0],[0,1,1],[0,0,0]], c: '#f44336' }
  };
  var KEYS = Object.keys(SHAPES);
  var grid = [], cur = null, next = null;
  var score = 0, lines = 0, level = 1, timerId = null, running = false, paused = false;

  function $(id) { return document.getElementById(id); }
  function canvas() { return $(SLUG + '-canvas'); }

  function emptyGrid() {
    var g = [];
    for (var r = 0; r < ROWS; r++) { g.push([]); for (var c = 0; c < COLS; c++) g[r].push(null); }
    return g;
  }

  function randPiece() {
    var k = KEYS[Math.floor(Math.random() * KEYS.length)];
    var s = SHAPES[k];
    return { m: s.m.map(function (row) { return row.slice(); }), c: s.c, x: 3, y: 0 };
  }

  function rotate(m) {
    var n = m.length, out = [];
    for (var r = 0; r < n; r++) { out.push([]); for (var c = 0; c < n; c++) out[r].push(m[n - 1 - c][r]); }
    return out;
  }

  function collides(m, px, py) {
    for (var r = 0; r < m.length; r++) for (var c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      var x = px + c, y = py + r;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && grid[y][x]) return true;
    }
    return false;
  }

  function merge() {
    var m = cur.m;
    for (var r = 0; r < m.length; r++) for (var c = 0; c < m[r].length; c++) {
      if (m[r][c]) {
        var y = cur.y + r;
        if (y >= 0) grid[y][cur.x + c] = cur.c;
      }
    }
  }

  function clearLines() {
    var cleared = 0;
    for (var r = ROWS - 1; r >= 0; r--) {
      var full = true;
      for (var c = 0; c < COLS; c++) if (!grid[r][c]) { full = false; break; }
      if (full) {
        grid.splice(r, 1);
        var row = [];
        for (var k = 0; k < COLS; k++) row.push(null);
        grid.unshift(row);
        cleared++;
        r++;
      }
    }
    if (cleared) {
      var pts = [0, 40, 100, 300, 1200][cleared] * level;
      score += pts;
      lines += cleared;
      var nl = 1 + Math.floor(lines / 10);
      if (nl !== level) {
        level = nl;
        restartTimer();
        $('tetris-game-msg').textContent = '⬆ Level ' + level + ' — faster!';
      }
      $('tetris-game-score').textContent = score;
      $('tetris-game-lines').textContent = lines;
      $('tetris-game-level').textContent = level;
    }
  }

  function spawn() {
    cur = next || randPiece();
    next = randPiece();
    cur.x = 3; cur.y = 0;
    if (collides(cur.m, cur.x, cur.y)) {
      gameOver();
      return false;
    }
    drawNext();
    return true;
  }

  function step() {
    if (!running || paused || !cur) return;
    if (!collides(cur.m, cur.x, cur.y + 1)) {
      cur.y++;
    } else {
      merge();
      clearLines();
      if (!spawn()) return;
    }
    draw();
  }

  function dropInterval() { return Math.max(60, 800 - (level - 1) * 70); }

  function restartTimer() {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(step, dropInterval());
  }

  function drawBlock(ctx, x, y, color, size) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
    ctx.strokeStyle = 'rgba(0,0,0,.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x * size + 0.5, y * size + 0.5, size - 1, size - 1);
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    ctx.fillRect(x * size + 2, y * size + 2, size - 5, 5);
  }

  function draw() {
    var ctx = canvas().getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      if (grid[r][c]) drawBlock(ctx, c, r, grid[r][c], CELL);
    }
    if (cur) {
      var m = cur.m;
      for (var rr = 0; rr < m.length; rr++) for (var cc = 0; cc < m[rr].length; cc++) {
        if (m[rr][cc] && cur.y + rr >= 0) drawBlock(ctx, cur.x + cc, cur.y + rr, cur.c, CELL);
      }
    }
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', COLS * CELL / 2, ROWS * CELL / 2);
    }
  }

  function drawNext() {
    var cv = $(SLUG + '-next'), ctx = cv.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, cv.width, cv.height);
    if (!next) return;
    var m = next.m, size = 20;
    var ox = (cv.width - m[0].length * size) / 2, oy = (cv.height - m.length * size) / 2;
    for (var r = 0; r < m.length; r++) for (var c = 0; c < m[r].length; c++) {
      if (m[r][c]) {
        ctx.fillStyle = next.c;
        ctx.fillRect(ox + c * size, oy + r * size, size, size);
        ctx.strokeStyle = 'rgba(0,0,0,.35)';
        ctx.strokeRect(ox + c * size + 0.5, oy + r * size + 0.5, size - 1, size - 1);
      }
    }
  }

  function gameOver() {
    running = false;
    if (timerId) { clearInterval(timerId); timerId = null; }
    $('tetris-game-msg').textContent = '💀 Game over! Score: ' + score + ' — press Start for a new game.';
    $('tetris-game-start').textContent = '▶ Start';
    $('tetris-game-pause').disabled = true;
    draw();
  }

  function start() {
    grid = emptyGrid();
    score = 0; lines = 0; level = 1;
    next = null; cur = null;
    paused = false; running = true;
    $('tetris-game-score').textContent = '0';
    $('tetris-game-lines').textContent = '0';
    $('tetris-game-level').textContent = '1';
    $('tetris-game-msg').textContent = 'Good luck!';
    $('tetris-game-start').textContent = '↻ Restart';
    $('tetris-game-pause').disabled = false;
    $('tetris-game-pause').textContent = '⏸ Pause';
    spawn();
    draw();
    restartTimer();
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    $('tetris-game-pause').textContent = paused ? '▶ Resume' : '⏸ Pause';
    draw();
  }

  function movePiece(dx) {
    if (!running || paused || !cur) return;
    if (!collides(cur.m, cur.x + dx, cur.y)) { cur.x += dx; draw(); }
  }
  function softDrop() {
    if (!running || paused || !cur) return;
    if (!collides(cur.m, cur.x, cur.y + 1)) { cur.y++; score += 1; $('tetris-game-score').textContent = score; draw(); }
    else step();
  }
  function rotatePiece() {
    if (!running || paused || !cur) return;
    var rm = rotate(cur.m);
    if (!collides(rm, cur.x, cur.y)) { cur.m = rm; draw(); return; }
    // simple wall kicks
    if (!collides(rm, cur.x - 1, cur.y)) { cur.m = rm; cur.x -= 1; draw(); }
    else if (!collides(rm, cur.x + 1, cur.y)) { cur.m = rm; cur.x += 1; draw(); }
  }
  function hardDrop() {
    if (!running || paused || !cur) return;
    while (!collides(cur.m, cur.x, cur.y + 1)) { cur.y++; score += 2; }
    $('tetris-game-score').textContent = score;
    merge();
    clearLines();
    spawn();
    draw();
  }

  try {
    TN.on('tetris-game-start', 'click', start);
    TN.on('tetris-game-pause', 'click', togglePause);
    TN.on('tetris-game-left', 'click', function () { movePiece(-1); });
    TN.on('tetris-game-right', 'click', function () { movePiece(1); });
    TN.on('tetris-game-down', 'click', softDrop);
    TN.on('tetris-game-rotate', 'click', rotatePiece);
    TN.on('tetris-game-drop', 'click', hardDrop);
    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      var k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') { e.preventDefault(); movePiece(-1); }
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') { e.preventDefault(); movePiece(1); }
      else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); softDrop(); }
      else if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); rotatePiece(); }
      else if (k === ' ') { e.preventDefault(); hardDrop(); }
      else if (k === 'p' || k === 'P') togglePause();
    });
    draw();
  } catch (e) { /* never throw on load */ }
})();
