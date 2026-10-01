/* Sliding 15-Puzzle — guaranteed-solvable shuffle via random valid moves, win detection. */
(function () {
  'use strict';
  var SLUG = 'sliding-puzzle-15';
  var tiles = [], blank = 15, moves = 0, won = false, best = null;

  function $(id) { return document.getElementById(id); }

  function solvedState() {
    var t = [];
    for (var i = 1; i <= 15; i++) t.push(i);
    t.push(0);
    return t;
  }

  function shuffle() {
    tiles = solvedState();
    blank = 15;
    var last = -1;
    for (var k = 0; k < 400; k++) {
      var r = Math.floor(blank / 4), c = blank % 4;
      var opts = [];
      if (r > 0 && blank - 4 !== last) opts.push(blank - 4);
      if (r < 3 && blank + 4 !== last) opts.push(blank + 4);
      if (c > 0 && blank - 1 !== last) opts.push(blank - 1);
      if (c < 3 && blank + 1 !== last) opts.push(blank + 1);
      var pick = opts[Math.floor(Math.random() * opts.length)];
      tiles[blank] = tiles[pick];
      tiles[pick] = 0;
      last = blank;
      blank = pick;
    }
    // ensure not accidentally solved
    var ok = true;
    for (var i = 0; i < 16; i++) if (tiles[i] !== (i === 15 ? 0 : i + 1)) { ok = false; break; }
    if (ok) shuffle();
  }

  function render() {
    var b = $('sliding-puzzle-15-board');
    b.innerHTML = '';
    tiles.forEach(function (v, i) {
      var d = document.createElement('button');
      d.style.cssText = 'width:72px;height:72px;font-size:26px;font-weight:bold;border:none;border-radius:8px;' +
        (v === 0 ? 'background:transparent;cursor:default' : 'background:#ffcc80;color:#4e342e;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,.25)') +
        ';touch-action:manipulation;padding:0';
      d.textContent = v === 0 ? '' : v;
      d.setAttribute('aria-label', v === 0 ? 'Empty space' : 'Tile ' + v);
      if (v !== 0) {
        (function (idx) {
          d.addEventListener('click', function () { tap(idx); });
        })(i);
      }
      b.appendChild(d);
    });
    $('sliding-puzzle-15-moves').textContent = moves;
  }

  function tap(i) {
    if (won) return;
    var r = Math.floor(i / 4), c = i % 4;
    var br = Math.floor(blank / 4), bc = blank % 4;
    if (Math.abs(r - br) + Math.abs(c - bc) !== 1) return;
    tiles[blank] = tiles[i];
    tiles[i] = 0;
    blank = i;
    moves++;
    render();
    checkWin();
  }

  function checkWin() {
    for (var i = 0; i < 15; i++) if (tiles[i] !== i + 1) return;
    won = true;
    if (best === null || moves < best) {
      best = moves;
      $('sliding-puzzle-15-best').textContent = best;
    }
    $('sliding-puzzle-15-msg').textContent = '🏆 Solved in ' + moves + ' moves! Press New game for another.';
  }

  function newGame() {
    shuffle();
    moves = 0;
    won = false;
    $('sliding-puzzle-15-msg').textContent = 'Tap a tile next to the gap to slide it.';
    render();
  }

  try {
    TN.on('sliding-puzzle-15-new', 'click', newGame);
    newGame();
  } catch (e) { /* never throw on load */ }
})();
