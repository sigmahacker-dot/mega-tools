/* Minesweeper — real mines, flood fill, flags, win/lose, 3 difficulties. */
(function () {
  'use strict';
  var SLUG = 'minesweeper-game';
  var rows = 9, cols = 9, mineTotal = 10;
  var mines = [], revealed = [], flagged = [];
  var over = false, won = false, started = false;
  var flagsPlaced = 0, revealedCount = 0;
  var timerId = null, elapsed = 0;
  var NUMC = ['', '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#ff8f00', '#00838f', '#5d4037', '#000'];

  function $(id) { return document.getElementById(id); }
  function idx(r, c) { return r * cols + c; }
  function inB(r, c) { return r >= 0 && r < rows && c >= 0 && c < cols; }

  function neighbors(r, c) {
    var out = [];
    for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      if (inB(r + dr, c + dc)) out.push([r + dr, c + dc]);
    }
    return out;
  }

  function placeMines(safeR, safeC) {
    mines = new Array(rows * cols).fill(false);
    var safe = {};
    safe[idx(safeR, safeC)] = true;
    neighbors(safeR, safeC).forEach(function (p) { safe[idx(p[0], p[1])] = true; });
    var placed = 0, guard = 0;
    while (placed < mineTotal && guard < 100000) {
      guard++;
      var i = Math.floor(Math.random() * rows * cols);
      if (mines[i] || safe[i]) continue;
      mines[i] = true;
      placed++;
    }
  }

  function adjCount(r, c) {
    var n = 0;
    neighbors(r, c).forEach(function (p) { if (mines[idx(p[0], p[1])]) n++; });
    return n;
  }

  function startTimer() {
    stopTimer();
    elapsed = 0;
    $('minesweeper-game-time').textContent = '0';
    timerId = setInterval(function () {
      elapsed++;
      $('minesweeper-game-time').textContent = elapsed;
    }, 1000);
  }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  function build() {
    revealed = new Array(rows * cols).fill(false);
    flagged = new Array(rows * cols).fill(false);
    over = false; won = false; started = false;
    flagsPlaced = 0; revealedCount = 0;
    stopTimer();
    $('minesweeper-game-time').textContent = '0';
    $('minesweeper-game-mines').textContent = mineTotal;
    $('minesweeper-game-msg').textContent = 'Right-click (or 🚩 mode) to flag.';
    var b = $('minesweeper-game-board');
    b.innerHTML = '';
    b.style.gridTemplateColumns = 'repeat(' + cols + ', 26px)';
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        (function (rr, cc) {
          var d = document.createElement('button');
          d.id = SLUG + '-cell-' + rr + '-' + cc;
          d.style.cssText = 'width:26px;height:26px;font-size:14px;font-weight:bold;border:none;border-radius:3px;background:#bdbdbd;cursor:pointer;line-height:1;padding:0';
          d.addEventListener('click', function (e) { e.preventDefault(); tap(rr, cc); });
          d.addEventListener('contextmenu', function (e) { e.preventDefault(); toggleFlag(rr, cc); });
          b.appendChild(d);
        })(r, c);
      }
    }
  }

  function cellEl(r, c) { return $(SLUG + '-cell-' + r + '-' + c); }

  function tap(r, c) {
    if (over || won) return;
    var i = idx(r, c);
    if (revealed[i]) { chord(r, c); return; }
    if ($('minesweeper-game-flagmode').value === 'flag') { toggleFlag(r, c); return; }
    if (flagged[i]) return;
    if (!started) { placeMines(r, c); started = true; startTimer(); }
    reveal(r, c);
    checkWin();
  }

  function chord(r, c) {
    // reveal neighbors when flags match number
    var n = adjCount(r, c);
    var fl = 0;
    neighbors(r, c).forEach(function (p) { if (flagged[idx(p[0], p[1])]) fl++; });
    if (fl !== n) return;
    neighbors(r, c).forEach(function (p) {
      var i = idx(p[0], p[1]);
      if (!revealed[i] && !flagged[i]) reveal(p[0], p[1]);
    });
    checkWin();
  }

  function reveal(r, c) {
    var stack = [[r, c]];
    while (stack.length) {
      var p = stack.pop();
      var rr = p[0], cc = p[1], i = idx(rr, cc);
      if (!inB(rr, cc) || revealed[i] || flagged[i]) continue;
      if (mines[i]) { explode(rr, cc); return; }
      revealed[i] = true;
      revealedCount++;
      var n = adjCount(rr, cc);
      var el = cellEl(rr, cc);
      el.style.background = '#e0e0e0';
      el.style.cursor = 'default';
      if (n > 0) { el.textContent = n; el.style.color = NUMC[n] || '#000'; }
      else neighbors(rr, cc).forEach(function (q) { stack.push(q); });
    }
  }

  function explode(r, c) {
    over = true;
    stopTimer();
    for (var i = 0; i < rows * cols; i++) {
      if (mines[i]) {
        var rr = Math.floor(i / cols), cc = i % cols;
        var el = cellEl(rr, cc);
        el.textContent = '💣';
        el.style.background = i === idx(r, c) ? '#ef5350' : '#e0e0e0';
      } else if (flagged[i]) {
        var rr2 = Math.floor(i / cols), cc2 = i % cols;
        cellEl(rr2, cc2).textContent = '❌';
      }
    }
    $('minesweeper-game-msg').textContent = '💥 Boom! You hit a mine. Press New game to retry.';
  }

  function toggleFlag(r, c) {
    if (over || won) return;
    var i = idx(r, c);
    if (revealed[i]) return;
    flagged[i] = !flagged[i];
    flagsPlaced += flagged[i] ? 1 : -1;
    var el = cellEl(r, c);
    el.textContent = flagged[i] ? '🚩' : '';
    $('minesweeper-game-mines').textContent = mineTotal - flagsPlaced;
  }

  function checkWin() {
    if (over || won) return;
    if (revealedCount === rows * cols - mineTotal) {
      won = true;
      stopTimer();
      // auto-flag remaining mines
      for (var i = 0; i < rows * cols; i++) {
        if (mines[i] && !flagged[i]) {
          flagged[i] = true;
          cellEl(Math.floor(i / cols), i % cols).textContent = '🚩';
        }
      }
      $('minesweeper-game-mines').textContent = '0';
      $('minesweeper-game-msg').textContent = '🏆 You win! Cleared in ' + elapsed + ' seconds.';
    }
  }

  function newGame() {
    var parts = $('minesweeper-game-diff').value.split(',');
    rows = parseInt(parts[0], 10); cols = parseInt(parts[1], 10); mineTotal = parseInt(parts[2], 10);
    build();
  }

  try {
    TN.on('minesweeper-game-new', 'click', newGame);
    TN.on('minesweeper-game-diff', 'change', newGame);
    newGame();
  } catch (e) { /* never throw on load */ }
})();
