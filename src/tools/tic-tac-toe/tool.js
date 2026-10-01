(function () {
  'use strict';
  var P = 'tic-tac-toe-';
  var ERR = P + 'error';
  var LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  var board = [], turn = 'X', over = false, cells = [];
  var scores = { X: 0, O: 0, D: 0 };
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function mode() { var el = g('mode'); return el ? el.value : 'ai'; }
  function winnerOf(b) {
    for (var i = 0; i < LINES.length; i++) {
      var L = LINES[i];
      if (b[L[0]] && b[L[0]] === b[L[1]] && b[L[0]] === b[L[2]]) return { who: b[L[0]], line: L };
    }
    return null;
  }
  function empties(b) {
    var out = [];
    for (var i = 0; i < 9; i++) if (!b[i]) out.push(i);
    return out;
  }
  function minimax(b, isMax, depth) {
    var w = winnerOf(b);
    if (w) return w.who === 'O' ? 10 - depth : depth - 10;
    var free = empties(b);
    if (!free.length) return 0;
    var best = isMax ? -Infinity : Infinity, i, s;
    for (i = 0; i < free.length; i++) {
      b[free[i]] = isMax ? 'O' : 'X';
      s = minimax(b, !isMax, depth + 1);
      b[free[i]] = '';
      best = isMax ? Math.max(best, s) : Math.min(best, s);
    }
    return best;
  }
  function aiMove() {
    if (over || turn !== 'O' || mode() !== 'ai') return;
    var free = empties(board), best = -Infinity, mv = -1, i, s;
    for (i = 0; i < free.length; i++) {
      board[free[i]] = 'O';
      s = minimax(board, false, 0);
      board[free[i]] = '';
      if (s > best) { best = s; mv = free[i]; }
    }
    if (mv !== -1) place(mv);
  }
  function drawCells() {
    for (var i = 0; i < 9; i++) {
      if (!cells[i]) continue;
      cells[i].textContent = board[i] || '';
      cells[i].disabled = over || !!board[i];
      cells[i].classList.remove('win');
    }
  }
  function updateStatus() {
    var el = g('status');
    if (!el) return;
    if (over) { el.textContent = 'Game over'; return; }
    if (mode() === 'ai') el.textContent = turn === 'X' ? 'Your turn (X)' : 'Computer is thinking…';
    else el.textContent = turn === 'X' ? "Player X's turn" : "Player O's turn";
  }
  function renderScores() {
    set('sx', String(scores.X)); set('so', String(scores.O)); set('sd', String(scores.D));
  }
  function place(i) {
    if (over || board[i]) return;
    board[i] = turn;
    var w = winnerOf(board), full = !empties(board).length;
    if (w) {
      over = true;
      drawCells();
      for (var k = 0; k < w.line.length; k++) cells[w.line[k]].classList.add('win');
      scores[w.who]++;
      renderScores();
      updateStatus();
      var res = g('result');
      var msg = w.who === 'X' ? (mode() === 'ai' ? '🎉 You win! You beat the unbeatable AI.' : '🎉 Player X wins!') : (mode() === 'ai' ? '🤖 The AI wins. Rematch?' : '🎉 Player O wins!');
      if (res) { res.innerHTML = '<p>' + msg + '</p>'; res.classList.remove('hidden'); }
      return;
    }
    if (full) {
      over = true;
      scores.D++;
      renderScores();
      drawCells();
      updateStatus();
      var r2 = g('result');
      if (r2) { r2.innerHTML = '<p>It\'s a draw — against this AI, that\'s a victory.</p>'; r2.classList.remove('hidden'); }
      return;
    }
    turn = turn === 'X' ? 'O' : 'X';
    drawCells();
    updateStatus();
    if (mode() === 'ai' && turn === 'O') setTimeout(aiMove, 220);
  }
  function reset() {
    board = ['', '', '', '', '', '', '', '', ''];
    turn = 'X'; over = false;
    TN.clearErr(ERR);
    var res = g('result');
    if (res) { res.innerHTML = ''; res.classList.add('hidden'); }
    drawCells();
    updateStatus();
  }
  function build() {
    var grid = g('grid');
    if (!grid) return;
    grid.innerHTML = '';
    cells = [];
    for (var i = 0; i < 9; i++) {
      (function (idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'ttt-cell';
        b.setAttribute('aria-label', 'Cell ' + (idx + 1));
        b.addEventListener('click', function () { place(idx); });
        grid.appendChild(b);
        cells.push(b);
      })(i);
    }
  }
  try {
    build();
    reset();
    TN.on(P + 'reset', 'click', reset);
    TN.on(P + 'mode', 'change', reset);
  } catch (e) { /* never throw on load */ }
})();
