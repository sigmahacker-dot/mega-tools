(function () {
  'use strict';
  var P = 'reversi-game-';
  function g(id) { return document.getElementById(P + id); }
  var N = 8, board = [], turn = 1, over = false, moveCount = 0;
  var DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  function inB(r, c) { return r >= 0 && r < N && c >= 0 && c < N; }
  function setup() {
    board = [];
    for (var r = 0; r < N; r++) { board.push([]); for (var c = 0; c < N; c++) board[r].push(0); }
    board[3][3] = -1; board[3][4] = 1; board[4][3] = 1; board[4][4] = -1;
    turn = 1; over = false; moveCount = 0;
  }
  function mode() { var el = g('mode'); return el ? el.value : 'ai'; }
  function status(t) { var el = g('status'); if (el) el.textContent = t; }
  function flipsFor(b, r, c, p) {
    if (b[r][c] !== 0) return [];
    var out = [];
    for (var d = 0; d < DIRS.length; d++) {
      var dr = DIRS[d][0], dc = DIRS[d][1], rr = r + dr, cc = c + dc, line = [];
      while (inB(rr, cc) && b[rr][cc] === -p) { line.push([rr, cc]); rr += dr; cc += dc; }
      if (line.length && inB(rr, cc) && b[rr][cc] === p) out = out.concat(line);
    }
    return out;
  }
  function legalMoves(b, p) {
    var out = [];
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++)
      if (flipsFor(b, r, c, p).length) out.push([r, c]);
    return out;
  }
  function applyMove(b, r, c, p) {
    var f = flipsFor(b, r, c, p);
    b[r][c] = p;
    for (var i = 0; i < f.length; i++) b[f[i][0]][f[i][1]] = p;
    return f.length;
  }
  function counts() {
    var b = 0, w = 0;
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) { if (board[r][c] === 1) b++; else if (board[r][c] === -1) w++; }
    return [b, w];
  }
  function nameOf(p) {
    if (mode() === '2p') return p === 1 ? 'Black' : 'White';
    return p === 1 ? 'You (black)' : 'Computer (white)';
  }
  function aiPick(moves) {
    var best = moves[0], bestS = -1e9;
    for (var i = 0; i < moves.length; i++) {
      var r = moves[i][0], c = moves[i][1];
      var s = flipsFor(board, r, c, -1).length + Math.random() * 0.5;
      var corner = (r === 0 || r === 7) && (c === 0 || c === 7);
      var edge = (r === 0 || r === 7 || c === 0 || c === 7);
      if (corner) s += 50;
      else if (edge) s += 5;
      // avoid giving corner-adjacent squares early
      var adj = (r <= 1 || r >= 6) && (c <= 1 || c >= 6) && !corner;
      if (adj) s -= 8;
      if (s > bestS) { bestS = s; best = moves[i]; }
    }
    return best;
  }
  function render(legal) {
    var bd = g('board'); if (!bd) return;
    bd.innerHTML = '';
    var legalSet = {};
    for (var i = 0; i < (legal || []).length; i++) legalSet[legal[i][0] + ',' + legal[i][1]] = 1;
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      (function (rr, cc) {
        var b = document.createElement('button');
        b.type = 'button';
        b.style.cssText = 'width:100%;aspect-ratio:1;border:0;padding:0;background:#15803d;border-radius:4px;position:relative;cursor:' + (legalSet[rr + ',' + cc] ? 'pointer' : 'default') + ';';
        var v = board[rr][cc];
        if (v) {
          b.innerHTML = '<span style="position:absolute;left:10%;top:10%;width:80%;height:80%;border-radius:50%;background:' + (v === 1 ? '#1c1917' : '#fafaf9') + ';box-shadow:0 2px 4px rgba(0,0,0,.5)"></span>';
        } else if (legalSet[rr + ',' + cc]) {
          b.innerHTML = '<span style="position:absolute;left:38%;top:38%;width:24%;height:24%;border-radius:50%;background:#fde047;opacity:.9"></span>';
          b.addEventListener('click', function () { onPlay(rr, cc); });
        }
        bd.appendChild(b);
      })(r, c);
    }
    var ct = counts(), sb = g('sb'), sw = g('sw'), mv = g('moves');
    if (sb) sb.textContent = String(ct[0]);
    if (sw) sw.textContent = String(ct[1]);
    if (mv) mv.textContent = String(moveCount);
  }
  function onPlay(r, c) {
    if (over) return;
    if (mode() === 'ai' && turn !== 1) return;
    if (!flipsFor(board, r, c, turn).length) return;
    doMove(r, c);
  }
  function doMove(r, c) {
    applyMove(board, r, c, turn);
    moveCount++;
    advance();
  }
  function advance() {
    var other = -turn;
    var myMoves = legalMoves(board, other);
    if (myMoves.length) {
      turn = other;
      render(myMoves);
      if (mode() === 'ai' && turn === -1) { status('Computer is thinking…'); setTimeout(aiTurn, 450); }
      else status(nameOf(turn) + ' to move.');
      return;
    }
    // other must pass — can current player move?
    var stillMine = legalMoves(board, turn);
    if (stillMine.length) {
      render(stillMine);
      status(nameOf(other) + ' has no legal move and passes. ' + nameOf(turn) + ' moves again.');
      if (mode() === 'ai' && turn === -1) setTimeout(aiTurn, 450);
      return;
    }
    over = true;
    render([]);
    var ct = counts();
    var msg = ct[0] > ct[1] ? '🎉 Black wins ' + ct[0] + '–' + ct[1] + '!' :
      (ct[1] > ct[0] ? '🎉 White wins ' + ct[1] + '–' + ct[0] + '!' : '🤝 Draw, ' + ct[0] + '–' + ct[1] + '!');
    if (mode() === 'ai') msg = (ct[0] > ct[1] ? '🎉 You win ' : (ct[1] > ct[0] ? '🤖 Computer wins ' : '🤝 Draw, ')) + ct[0] + '–' + ct[1] + '!';
    status(msg);
  }
  function aiTurn() {
    if (over || turn !== -1) return;
    var moves = legalMoves(board, -1);
    if (!moves.length) { advance(); return; }
    var m = aiPick(moves);
    doMove(m[0], m[1]);
  }
  function reset() {
    setup();
    TN.clearErr(P + 'error');
    var moves = legalMoves(board, 1);
    render(moves);
    status('Your move (black). Black squares are legal moves.');
  }
  try {
    if (!g('board')) return;
    TN.on(P + 'new', 'click', reset);
    TN.on(P + 'mode', 'change', reset);
    reset();
  } catch (e) { /* never throw on load */ }
})();
