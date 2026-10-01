/* Maze Generator — DFS perfect mazes, arrow/WASD/pad navigation, BFS solve overlay. */
(function () {
  'use strict';
  var SLUG = 'maze-generator';
  var n = 21, walls = null; // walls[r][c] = [top,right,bottom,left] booleans
  var pr = 1, pc = 1, moves = 0, won = false, showSol = false, solPath = [];

  function $(id) { return document.getElementById(id); }
  function canvas() { return $(SLUG + '-canvas'); }

  function genMaze() {
    n = parseInt($('maze-generator-size').value, 10) || 21;
    walls = [];
    var visited = [];
    for (var r = 0; r < n; r++) {
      walls.push([]); visited.push([]);
      for (var c = 0; c < n; c++) { walls[r].push([true, true, true, true]); visited[r].push(false); }
    }
    // iterative DFS from (0,0)
    var stack = [[0, 0]];
    visited[0][0] = true;
    while (stack.length) {
      var top = stack[stack.length - 1];
      var cr = top[0], cc = top[1];
      var opts = [];
      if (cr > 0 && !visited[cr - 1][cc]) opts.push([-1, 0, 0, 2]);
      if (cc < n - 1 && !visited[cr][cc + 1]) opts.push([0, 1, 1, 3]);
      if (cr < n - 1 && !visited[cr + 1][cc]) opts.push([1, 0, 2, 0]);
      if (cc > 0 && !visited[cr][cc - 1]) opts.push([0, -1, 3, 1]);
      if (!opts.length) { stack.pop(); continue; }
      var o = opts[Math.floor(Math.random() * opts.length)];
      var nr = cr + o[0], nc = cc + o[1];
      walls[cr][cc][o[2]] = false;
      walls[nr][nc][o[3]] = false;
      visited[nr][nc] = true;
      stack.push([nr, nc]);
    }
    // map logical maze coords: use full n x n cells directly (n odd)
    pr = 1; pc = 1; moves = 0; won = false; showSol = false; solPath = [];
    $('maze-generator-moves').textContent = '0';
    $('maze-generator-msg').textContent = 'Guide the red dot to the green goal!';
    draw();
  }

  function solve() {
    // BFS from (1,1) to (n-2,n-2)
    var prev = {}, q = [[1, 1]], seen = {};
    seen['1,1'] = 1;
    var found = false;
    while (q.length) {
      var cur = q.shift();
      var r = cur[0], c = cur[1];
      if (r === n - 2 && c === n - 2) { found = true; break; }
      var nb = [];
      if (!walls[r][c][0]) nb.push([r - 1, c]);
      if (!walls[r][c][1]) nb.push([r, c + 1]);
      if (!walls[r][c][2]) nb.push([r + 1, c]);
      if (!walls[r][c][3]) nb.push([r, c - 1]);
      for (var i = 0; i < nb.length; i++) {
        var k = nb[i][0] + ',' + nb[i][1];
        if (!seen[k]) { seen[k] = 1; prev[k] = r + ',' + c; q.push(nb[i]); }
      }
    }
    solPath = [];
    if (found) {
      var k2 = (n - 2) + ',' + (n - 2);
      while (k2) { solPath.push(k2.split(',').map(Number)); k2 = prev[k2]; }
    }
  }

  function draw() {
    var cv = canvas(), ctx = cv.getContext('2d');
    var S = cv.width, cell = S / n;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, S, S);
    // solution path
    if (showSol && solPath.length) {
      ctx.strokeStyle = '#ffb300';
      ctx.lineWidth = Math.max(2, cell * 0.35);
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (var i = 0; i < solPath.length; i++) {
        var p = solPath[i];
        var x = (p[1] + 0.5) * cell, y = (p[0] + 0.5) * cell;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // goal
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect((n - 2) * cell + 1, (n - 2) * cell + 1, cell - 2, cell - 2);
    // player
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.arc((pc + 0.5) * cell, (pr + 0.5) * cell, cell * 0.32, 0, Math.PI * 2);
    ctx.fill();
    // walls
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = Math.max(1.5, cell * 0.08);
    ctx.beginPath();
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      var x0 = c * cell, y0 = r * cell;
      if (walls[r][c][0]) { ctx.moveTo(x0, y0); ctx.lineTo(x0 + cell, y0); }
      if (walls[r][c][3]) { ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + cell); }
      if (r === n - 1 && walls[r][c][2]) { ctx.moveTo(x0, y0 + cell); ctx.lineTo(x0 + cell, y0 + cell); }
      if (c === n - 1 && walls[r][c][1]) { ctx.moveTo(x0 + cell, y0); ctx.lineTo(x0 + cell, y0 + cell); }
    }
    ctx.stroke();
  }

  function move(dr, dc) {
    if (won || !walls) return;
    var wIdx = dr === -1 ? 0 : (dc === 1 ? 1 : (dr === 1 ? 2 : 3));
    if (walls[pr][pc][wIdx]) return; // wall blocks
    pr += dr; pc += dc;
    moves++;
    $('maze-generator-moves').textContent = moves;
    if (pr === n - 2 && pc === n - 2) {
      won = true;
      $('maze-generator-msg').textContent = '🏆 You escaped in ' + moves + ' moves! Press New maze to play again.';
    }
    draw();
  }

  try {
    TN.on('maze-generator-new', 'click', genMaze);
    TN.on('maze-generator-size', 'change', genMaze);
    TN.on('maze-generator-up', 'click', function () { move(-1, 0); });
    TN.on('maze-generator-down', 'click', function () { move(1, 0); });
    TN.on('maze-generator-left', 'click', function () { move(0, -1); });
    TN.on('maze-generator-right', 'click', function () { move(0, 1); });
    TN.on('maze-generator-solve', 'click', function () {
      if (!walls) return;
      solve();
      showSol = !showSol;
      $('maze-generator-solve').textContent = showSol ? '🙈 Hide Solution' : '🗺 Show Solution';
      draw();
    });
    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      var k = e.key;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); move(-1, 0); }
      else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); move(1, 0); }
      else if (k === 'ArrowLeft' || k === 'a' || k === 'A') { e.preventDefault(); move(0, -1); }
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') { e.preventDefault(); move(0, 1); }
    });
    // touch swipe on canvas
    var tsx = 0, tsy = 0;
    var cv = canvas();
    cv.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      tsx = t.clientX; tsy = t.clientY;
    }, { passive: true });
    cv.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0];
      var dx = t.clientX - tsx, dy = t.clientY - tsy;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) move(0, dx > 0 ? 1 : -1);
      else move(dy > 0 ? 1 : -1, 0);
    }, { passive: true });
    genMaze();
  } catch (e) { /* never throw on load */ }
})();
