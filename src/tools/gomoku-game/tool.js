(function () {
  'use strict';
  var P = 'gomoku-game-';
  function g(id) { return document.getElementById(P + id); }
  var N = 15, board = [], turn = 1, over = false, winLine = [];
  var scores = { w1: 0, w2: 0, wd: 0 };
  var DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
  function inB(r, c) { return r >= 0 && r < N && c >= 0 && c < N; }
  function setup() {
    board = [];
    for (var r = 0; r < N; r++) { board.push([]); for (var c = 0; c < N; c++) board[r].push(0); }
    turn = 1; over = false; winLine = [];
  }
  function mode() { var el = g('mode'); return el ? el.value : 'ai'; }
  function humanColor() { var el = g('color'); return el ? parseInt(el.value, 10) : 1; }
  // longest line through (r,c) for player p, plus open ends
  function lineScore(r, c, p) {
    var total = 0;
    for (var d = 0; d < DIRS.length; d++) {
      var dr = DIRS[d][0], dc = DIRS[d][1], n = 1, open = 0, i, rr, cc;
      for (i = 1; i < 6; i++) {
        rr = r + dr * i; cc = c + dc * i;
        if (!inB(rr, cc) || board[rr][cc] !== p) break;
        n++;
      }
      if (inB(r + dr * i, c + dc * i) && board[r + dr * i][c + dc * i] === 0) open++;
      for (i = 1; i < 6; i++) {
        rr = r - dr * i; cc = c - dc * i;
        if (!inB(rr, cc) || board[rr][cc] !== p) break;
        n++;
      }
      if (inB(r - dr * i, c - dc * i) && board[r - dr * i][c - dc * i] === 0) open++;
      if (n >= 5) return 100000000;
      var s = 0;
      if (n === 4) s = open === 2 ? 1000000 : 100000;
      else if (n === 3) s = open === 2 ? 50000 : 5000;
      else if (n === 2) s = open === 2 ? 1000 : 100;
      else s = open === 2 ? 10 : 1;
      total += s;
    }
    return total;
  }
  function aiMove() {
    if (over) return;
    var me = turn, opp = 3 - me, best = -1, bestCells = [], r, c, sc;
    for (r = 0; r < N; r++) for (c = 0; c < N; c++) {
      if (board[r][c] !== 0) continue;
      var near = false;
      for (var dr = -2; dr <= 2 && !near; dr++) for (var dc = -2; dc <= 2; dc++) {
        if (inB(r + dr, c + dc) && board[r + dr][c + dc] !== 0) { near = true; break; }
      }
      if (!near) continue;
      board[r][c] = me; var mine = lineScore(r, c, me); board[r][c] = 0;
      board[r][c] = opp; var theirs = lineScore(r, c, opp); board[r][c] = 0;
      sc = mine + theirs * 0.92;
      if (sc > best) { best = sc; bestCells = [[r, c]]; }
      else if (sc === best) bestCells.push([r, c]);
    }
    var pick;
    if (!bestCells.length) { pick = [7, 7]; }
    else pick = bestCells[Math.floor(Math.random() * bestCells.length)];
    place(pick[0], pick[1]);
  }
  function checkWin(r, c, p) {
    for (var d = 0; d < DIRS.length; d++) {
      var dr = DIRS[d][0], dc = DIRS[d][1], cells = [[r, c]], i;
      for (i = 1; i < 6; i++) {
        var r1 = r + dr * i, c1 = c + dc * i;
        if (!inB(r1, c1) || board[r1][c1] !== p) break;
        cells.push([r1, c1]);
      }
      for (i = 1; i < 6; i++) {
        var r2 = r - dr * i, c2 = c - dc * i;
        if (!inB(r2, c2) || board[r2][c2] !== p) break;
        cells.push([r2, c2]);
      }
      if (cells.length >= 5) return cells.slice(0, 5);
    }
    return null;
  }
  function full() {
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) if (!board[r][c]) return false;
    return true;
  }
  function status(t) { var el = g('status'); if (el) el.textContent = t; }
  function nameOf(p) {
    if (mode() === '2p') return p === 1 ? 'Black' : 'White';
    return p === humanColor() ? 'You' : 'Computer';
  }
  function renderScores() {
    var a = g('w1'), b = g('w2'), d = g('wd');
    if (a) a.textContent = String(scores.w1);
    if (b) b.textContent = String(scores.w2);
    if (d) d.textContent = String(scores.wd);
  }
  function render() {
    var bd = g('board'); if (!bd) return;
    bd.innerHTML = '';
    var winSet = {};
    for (var i = 0; i < winLine.length; i++) winSet[winLine[i][0] + ',' + winLine[i][1]] = 1;
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      (function (rr, cc) {
        var b = document.createElement('button');
        b.type = 'button';
        b.style.cssText = 'width:100%;aspect-ratio:1;border:0;padding:0;background:transparent;position:relative;cursor:pointer;';
        b.setAttribute('aria-label', 'Play at row ' + (rr + 1) + ' col ' + (cc + 1));
        var inner = '<span style="position:absolute;left:0;top:50%;width:100%;height:1px;background:#8a6d3b"></span>' +
          '<span style="position:absolute;top:0;left:50%;height:100%;width:1px;background:#8a6d3b"></span>' +
          '<span style="position:absolute;left:15%;top:15%;width:70%;height:70%;border-radius:50%;background:#8a6d3b;opacity:.55"></span>';
        var v = board[rr][cc];
        if (v) {
          var isWin = winSet[rr + ',' + cc];
          inner = '<span style="position:absolute;left:8%;top:8%;width:84%;height:84%;border-radius:50%;background:' + (v === 1 ? '#1c1917' : '#fafaf9') + ';box-shadow:0 2px 4px rgba(0,0,0,.45);' + (isWin ? 'outline:3px solid #f43f5e;' : '') + '"></span>';
        }
        b.innerHTML = inner;
        if (!over && !v) b.addEventListener('click', function () { onPlay(rr, cc); });
        bd.appendChild(b);
      })(r, c);
    }
  }
  function onPlay(r, c) {
    if (over || board[r][c]) return;
    if (mode() === 'ai' && turn !== humanColor()) return;
    place(r, c);
  }
  function place(r, c) {
    board[r][c] = turn;
    var w = checkWin(r, c, turn);
    if (w) {
      over = true; winLine = w;
      if (turn === 1) scores.w1++; else scores.w2++;
      renderScores(); render();
      status('🎉 ' + nameOf(turn) + (turn === 1 ? ' (black)' : ' (white)') + ' wins with five in a row!');
      return;
    }
    if (full()) {
      over = true; scores.wd++;
      renderScores(); render();
      status('It\'s a draw — the board is full.');
      return;
    }
    turn = 3 - turn;
    render();
    if (over) return;
    if (mode() === 'ai' && turn !== humanColor()) {
      status('Computer is thinking…');
      setTimeout(aiMove, 350);
    } else status(nameOf(turn) + ' to move (' + (turn === 1 ? 'black' : 'white') + ').');
  }
  function reset() {
    setup();
    TN.clearErr(P + 'error');
    render();
    if (mode() === 'ai' && humanColor() === 2) { status('Computer (black) moves first…'); setTimeout(aiMove, 400); }
    else status(nameOf(turn) + ' to move — black goes first.');
  }
  try {
    if (!g('board')) return;
    TN.on(P + 'new', 'click', reset);
    TN.on(P + 'mode', 'change', reset);
    TN.on(P + 'color', 'change', reset);
    reset();
  } catch (e) { /* never throw on load */ }
})();
