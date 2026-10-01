/* Connect Four — 7x6, two players or vs minimax AI (depth 4, alpha-beta). */
(function () {
  'use strict';
  var SLUG = 'connect-four-game';
  var ROWS = 6, COLS = 7, DEPTH = 4;
  var board = [], turn = 1, over = false, mode = 'ai', thinking = false;

  function $(id) { return document.getElementById(id); }
  function newBoard() { return new Array(ROWS * COLS).fill(0); }
  function at(b, r, c) { return b[r * COLS + c]; }
  function validCols(b) {
    var out = [];
    for (var c = 0; c < COLS; c++) if (at(b, 0, c) === 0) out.push(c);
    return out;
  }
  function dropRow(b, c) {
    for (var r = ROWS - 1; r >= 0; r--) if (at(b, r, c) === 0) return r;
    return -1;
  }
  function playOn(b, c, p) {
    var r = dropRow(b, c);
    if (r < 0) return -1;
    b[r * COLS + c] = p;
    return r;
  }

  function checkWin(b, p) {
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      if (at(b, r, c) !== p) continue;
      if (c + 3 < COLS && at(b, r, c + 1) === p && at(b, r, c + 2) === p && at(b, r, c + 3) === p) return true;
      if (r + 3 < ROWS && at(b, r + 1, c) === p && at(b, r + 2, c) === p && at(b, r + 3, c) === p) return true;
      if (r + 3 < ROWS && c + 3 < COLS && at(b, r + 1, c + 1) === p && at(b, r + 2, c + 2) === p && at(b, r + 3, c + 3) === p) return true;
      if (r - 3 >= 0 && c + 3 < COLS && at(b, r - 1, c + 1) === p && at(b, r - 2, c + 2) === p && at(b, r - 3, c + 3) === p) return true;
    }
    return false;
  }

  function scoreWindow(win, p) {
    var opp = p === 1 ? 2 : 1, pc = 0, oc = 0, ec = 0;
    for (var i = 0; i < win.length; i++) {
      if (win[i] === p) pc++;
      else if (win[i] === opp) oc++;
      else ec++;
    }
    if (pc === 4) return 100000;
    if (pc === 3 && ec === 1) return 50;
    if (pc === 2 && ec === 2) return 10;
    if (oc === 3 && ec === 1) return -80;
    if (oc === 4) return -100000;
    return 0;
  }

  function evaluate(b) {
    var s = 0, r, c;
    // center preference
    for (r = 0; r < ROWS; r++) if (at(b, r, 3) === 2) s += 6;
    for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {
      if (c + 3 < COLS) s += scoreWindow([at(b, r, c), at(b, r, c + 1), at(b, r, c + 2), at(b, r, c + 3)], 2);
      if (r + 3 < ROWS) s += scoreWindow([at(b, r, c), at(b, r + 1, c), at(b, r + 2, c), at(b, r + 3, c)], 2);
      if (r + 3 < ROWS && c + 3 < COLS) s += scoreWindow([at(b, r, c), at(b, r + 1, c + 1), at(b, r + 2, c + 2), at(b, r + 3, c + 3)], 2);
      if (r - 3 >= 0 && c + 3 < COLS) s += scoreWindow([at(b, r, c), at(b, r - 1, c + 1), at(b, r - 2, c + 2), at(b, r - 3, c + 3)], 2);
    }
    return s;
  }

  function orderCols(cols) {
    var pref = [3, 2, 4, 1, 5, 0, 6];
    return pref.filter(function (c) { return cols.indexOf(c) !== -1; });
  }

  function minimax(b, depth, alpha, beta, maxing) {
    var cols = validCols(b);
    if (checkWin(b, 2)) return { s: 1000000 + depth, c: -1 };
    if (checkWin(b, 1)) return { s: -1000000 - depth, c: -1 };
    if (depth === 0 || !cols.length) return { s: evaluate(b), c: cols[0] };
    var ordered = orderCols(cols), best = null, i, nb, r;
    if (maxing) {
      best = { s: -Infinity, c: ordered[0] };
      for (i = 0; i < ordered.length; i++) {
        nb = b.slice(); playOn(nb, ordered[i], 2);
        r = minimax(nb, depth - 1, alpha, beta, false);
        if (r.s > best.s) best = { s: r.s, c: ordered[i] };
        alpha = Math.max(alpha, best.s);
        if (beta <= alpha) break;
      }
    } else {
      best = { s: Infinity, c: ordered[0] };
      for (i = 0; i < ordered.length; i++) {
        nb = b.slice(); playOn(nb, ordered[i], 1);
        r = minimax(nb, depth - 1, alpha, beta, true);
        if (r.s < best.s) best = { s: r.s, c: ordered[i] };
        beta = Math.min(beta, best.s);
        if (beta <= alpha) break;
      }
    }
    return best;
  }

  function cellEl(r, c) { return $(SLUG + '-cell-' + r + '-' + c); }

  function render() {
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var el = cellEl(r, c);
      if (!el) continue;
      var v = at(board, r, c);
      el.style.background = v === 1 ? '#ef5350' : (v === 2 ? '#ffee58' : '#e3f2fd');
    }
  }

  function status() {
    if (over) return;
    if (mode === 'ai') $('connect-four-game-msg').textContent = turn === 1 ? 'Your turn — drop a red disc!' : 'Computer is thinking…';
    else $('connect-four-game-msg').textContent = (turn === 1 ? '🔴 Red' : '🟡 Yellow') + ' to move.';
  }

  function drop(c) {
    if (over || thinking) return;
    if (mode === 'ai' && turn !== 1) return;
    var r = playOn(board, c, turn);
    if (r < 0) return;
    afterMove();
  }

  function afterMove() {
    render();
    if (checkWin(board, turn)) {
      over = true;
      var who = mode === 'ai' ? (turn === 1 ? '🎉 You win!' : '🤖 Computer wins!') : (turn === 1 ? '🔴 Red wins!' : '🟡 Yellow wins!');
      $('connect-four-game-msg').textContent = who + ' Press New game to play again.';
      return;
    }
    if (!validCols(board).length) {
      over = true;
      $('connect-four-game-msg').textContent = "It's a draw! Press New game.";
      return;
    }
    turn = turn === 1 ? 2 : 1;
    status();
    if (mode === 'ai' && turn === 2 && !over) {
      thinking = true;
      setTimeout(function () {
        var mv = minimax(board.slice(), DEPTH, -Infinity, Infinity, true);
        playOn(board, mv.c, 2);
        thinking = false;
        afterMove();
      }, 350);
    }
  }

  function newGame() {
    board = newBoard();
    turn = 1; over = false; thinking = false;
    mode = $('connect-four-game-mode').value;
    var d = $('connect-four-game-drop');
    d.innerHTML = '';
    for (var c = 0; c < COLS; c++) {
      (function (cc) {
        var b = document.createElement('button');
        b.className = 'btn btn-outline';
        b.style.cssText = 'width:44px;height:36px;padding:0;font-size:16px';
        b.textContent = '▼';
        b.setAttribute('aria-label', 'Drop in column ' + (cc + 1));
        b.addEventListener('click', function () { drop(cc); });
        d.appendChild(b);
      })(c);
    }
    var bd = $('connect-four-game-board');
    bd.innerHTML = '';
    for (var r = 0; r < ROWS; r++) for (var c2 = 0; c2 < COLS; c2++) {
      (function (rr, cc) {
        var cell = document.createElement('div');
        cell.id = SLUG + '-cell-' + rr + '-' + cc;
        cell.style.cssText = 'width:44px;height:44px;border-radius:50%;background:#e3f2fd;cursor:pointer';
        cell.addEventListener('click', function () { drop(cc); });
        bd.appendChild(cell);
      })(r, c2);
    }
    render();
    status();
  }

  try {
    TN.on('connect-four-game-new', 'click', newGame);
    TN.on('connect-four-game-mode', 'change', newGame);
    newGame();
  } catch (e) { /* never throw on load */ }
})();
