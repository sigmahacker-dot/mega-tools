(function () {
  'use strict';
  var P = 'checkers-game-';
  function g(id) { return document.getElementById(P + id); }
  var N = 8, board = [], turn = 1, over = false, sel = null, selMoves = [], mustContinue = null;
  var DIRS = { '1': [[-1, -1], [-1, 1]], '-1': [[1, -1], [1, 1]] };
  function inB(r, c) { return r >= 0 && r < N && c >= 0 && c < N; }
  function isKing(v) { return Math.abs(v) === 2; }
  function colorOf(v) { return v > 0 ? 1 : (v < 0 ? -1 : 0); }
  function dirsOf(v) {
    if (isKing(v)) return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    return DIRS[String(colorOf(v))];
  }
  function setup() {
    board = [];
    for (var r = 0; r < N; r++) {
      board.push([]);
      for (var c = 0; c < N; c++) {
        var v = 0;
        if ((r + c) % 2 === 1) {
          if (r < 3) v = -1; else if (r > 4) v = 1;
        }
        board[r].push(v);
      }
    }
    turn = 1; over = false; sel = null; selMoves = []; mustContinue = null;
  }
  // all capture sequences for one piece: list of {path:[[r,c]...], caps:[[r,c]...]}
  function capSeqs(b, r, c, v, path, caps, out) {
    var found = false, ds = dirsOf(v);
    for (var i = 0; i < ds.length; i++) {
      var r1 = r + ds[i][0], c1 = c + ds[i][1], r2 = r + 2 * ds[i][0], c2 = c + 2 * ds[i][1];
      if (!inB(r2, c2) || b[r2][c2] !== 0) continue;
      if (!inB(r1, c1)) continue;
      var mid = b[r1][c1];
      if (mid === 0 || colorOf(mid) === colorOf(v)) continue;
      found = true;
      b[r][c] = 0; b[r1][c1] = 0; b[r2][c2] = v;
      path.push([r2, c2]); caps.push([r1, c1]);
      capSeqs(b, r2, c2, v, path, caps, out);
      path.pop(); caps.pop();
      b[r][c] = v; b[r1][c1] = mid; b[r2][c2] = 0;
    }
    if (!found && caps.length) out.push({ path: path.slice(), caps: caps.slice() });
  }
  function quietMoves(b, r, c, v) {
    var out = [], ds = dirsOf(v);
    for (var i = 0; i < ds.length; i++) {
      var r2 = r + ds[i][0], c2 = c + ds[i][1];
      if (inB(r2, c2) && b[r2][c2] === 0) out.push({ path: [[r2, c2]], caps: [] });
    }
    return out;
  }
  function movesFor(b, color, r, c) {
    var v = b[r][c];
    if (colorOf(v) !== color) return [];
    var out = [];
    capSeqs(b, r, c, v, [], [], out);
    if (out.length) return out.map(function (s) { return { from: [r, c], path: s.path, caps: s.caps }; });
    return quietMoves(b, r, c, v).map(function (s) { return { from: [r, c], path: s.path, caps: s.caps }; });
  }
  function allMoves(b, color) {
    var caps = [], quiet = [];
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      if (colorOf(b[r][c]) !== color) continue;
      var ms = movesFor(b, color, r, c);
      for (var i = 0; i < ms.length; i++) (ms[i].caps.length ? caps : quiet).push(ms[i]);
    }
    return caps.length ? caps : quiet; // forced captures
  }
  function applyMove(b, m) {
    var fr = m.from[0], fc = m.from[1], v = b[fr][fc];
    b[fr][fc] = 0;
    for (var i = 0; i < m.caps.length; i++) b[m.caps[i][0]][m.caps[i][1]] = 0;
    var lr = m.path[m.path.length - 1][0];
    if (!isKing(v) && ((v === 1 && lr === 0) || (v === -1 && lr === N - 1))) v = v * 2; // crown
    b[lr][m.path[m.path.length - 1][1]] = v;
  }
  function count(color) {
    var n = 0;
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) if (colorOf(board[r][c]) === color) n++;
    return n;
  }
  function mode() { var el = g('mode'); return el ? el.value : 'ai'; }
  function status(t) { var el = g('status'); if (el) el.textContent = t; }
  function turnLabel() {
    if (mode() === 'ai') return turn === 1 ? 'You' : 'Computer';
    return turn === 1 ? 'Dark' : 'Light';
  }
  function render() {
    var bd = g('board'); if (!bd) return;
    bd.innerHTML = '';
    var all = mustContinue ? null : allMoves(board, turn);
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      (function (rr, cc) {
        var d = document.createElement('button');
        d.type = 'button';
        var dark = (rr + cc) % 2 === 1;
        d.style.cssText = 'width:100%;aspect-ratio:1;border:0;padding:0;cursor:' + (dark ? 'pointer' : 'default') + ';background:' + (dark ? '#3f6212' : '#ecfccb') + ';position:relative;font-size:26px;line-height:1;';
        d.setAttribute('aria-label', 'Square ' + (rr + 1) + ',' + (cc + 1));
        var v = board[rr][cc];
        if (v !== 0) {
          var king = isKing(v), you = colorOf(v) === 1;
          d.innerHTML = '<span style="display:inline-block;width:72%;height:72%;border-radius:50%;background:' + (you ? '#1c1917' : '#f5f5f4') + ';border:3px solid ' + (you ? '#a3e635' : '#b91c1c') + ';box-shadow:0 2px 4px rgba(0,0,0,.4);position:relative">' +
            (king ? '<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:' + (you ? '#fde047' : '#f59e0b') + ';font-size:15px">♛</span>' : '') + '</span>';
        }
        if (sel && sel[0] === rr && sel[1] === cc) d.style.outline = '3px solid #fde047';
        if (selMoves.length) {
          for (var i = 0; i < selMoves.length; i++) {
            var dest = selMoves[i].path[0];
            if (dest[0] === rr && dest[1] === cc) {
              d.innerHTML = '<span style="display:inline-block;width:34%;height:34%;border-radius:50%;background:#fde047;opacity:.85"></span>';
            }
          }
        }
        if (dark && !over) d.addEventListener('click', function () { onSquare(rr, cc); });
        bd.appendChild(d);
      })(r, c);
    }
    var y = g('you'), o = g('opp'), t = g('turn');
    if (y) y.textContent = String(count(1));
    if (o) o.textContent = String(count(-1));
    if (t) t.textContent = over ? '—' : turnLabel();
  }
  function legalDests() {
    if (mustContinue) {
      var out = [], v = board[mustContinue[0]][mustContinue[1]];
      var seqs = [];
      capSeqs(board, mustContinue[0], mustContinue[1], v, [], [], seqs);
      for (var i = 0; i < seqs.length; i++) out.push({ from: mustContinue, path: [seqs[i].path[0]], caps: [seqs[i].caps[0]], full: seqs[i] });
      return out;
    }
    return allMoves(board, turn).filter(function (m) { return sel && m.from[0] === sel[0] && m.from[1] === sel[1]; });
  }
  function onSquare(r, c) {
    if (over) return;
    if (mode() === 'ai' && turn !== 1) return;
    var v = board[r][c];
    if (selMoves.length) {
      for (var i = 0; i < selMoves.length; i++) {
        var dest = selMoves[i].path[0];
        if (dest[0] === r && dest[1] === c) { doMove(selMoves[i]); return; }
      }
    }
    if (colorOf(v) === turn && !(mustContinue && (mustContinue[0] !== r || mustContinue[1] !== c))) {
      sel = [r, c];
      selMoves = legalDests();
      if (!selMoves.length) { sel = null; status('That piece has no legal move.'); }
      else status(turnLabel() + ': choose a highlighted destination.');
      render();
    } else { sel = null; selMoves = []; render(); }
  }
  function doMove(m) {
    var wasCapture = m.caps.length > 0;
    applyMove(board, m);
    var lr = m.path[m.path.length - 1][0], lc = m.path[m.path.length - 1][1];
    sel = null; selMoves = [];
    // multi-jump continuation (forced) — but not if the piece was just crowned
    var v = board[lr][lc];
    var justCrowned = wasCapture && isKing(v) && m.full === undefined && false; // crowning ends the sequence anyway below
    var cont = [];
    if (wasCapture && !isKing(v)) capSeqs(board, lr, lc, v, [], [], cont);
    if (wasCapture && cont.length && !justCrowned) {
      mustContinue = [lr, lc];
      status(turnLabel() + ': keep jumping — another capture is forced!');
      render();
      return;
    }
    mustContinue = null;
    // win check
    var other = -turn;
    if (count(other) === 0 || allMoves(board, other).length === 0) {
      over = true;
      render();
      var w = mode() === 'ai' ? (turn === 1 ? '🎉 You win! All opponent pieces captured.' : '🤖 Computer wins. Try again!') : (turn === 1 ? '🎉 Dark wins!' : '🎉 Light wins!');
      status(w);
      return;
    }
    turn = other;
    render();
    status(turnLabel() + (turnLabel() === 'Computer' ? ' is thinking…' : ' to move.') + (allMoves(board, turn).length && allMoves(board, turn)[0].caps.length ? ' A capture is forced!' : ''));
    if (mode() === 'ai' && turn === -1 && !over) setTimeout(aiMove, 450);
  }
  function aiMove() {
    if (over || turn !== -1) return;
    var ms = allMoves(board, -1);
    if (!ms.length) { over = true; status('🎉 You win! Computer has no legal move.'); render(); return; }
    var caps = ms.filter(function (m) { return m.caps.length; });
    var pool = caps.length ? caps : ms;
    var best = pool[0], bestScore = -1;
    for (var i = 0; i < pool.length; i++) {
      var s = pool[i].caps.length * 10 + (isKing(board[pool[i].from[0]][pool[i].from[1]]) ? 0 : 1) + Math.random();
      if (s > bestScore) { bestScore = s; best = pool[i]; }
    }
    doMove(best);
  }
  function reset() {
    setup();
    TN.clearErr(P + 'error');
    status('Your move — dark pieces. Click a piece.');
    render();
  }
  try {
    if (!g('board')) return;
    TN.on(P + 'new', 'click', reset);
    TN.on(P + 'mode', 'change', reset);
    reset();
  } catch (e) { /* never throw on load */ }
})();
