/* Odd One Out — find the differing emoji; levels grow harder, timer shrinks. */
(function () {
  'use strict';
  var SLUG = 'odd-one-out-game';
  var PAIRS = [
    ['😀', '😃'], ['🍎', '🍏'], ['🐶', '🐱'], ['🌞', '🌝'], ['🍩', '🍪'],
    ['⚽', '🏀'], ['🚗', '🚙'], ['🐢', '🐇'], ['🌹', '🌷'], ['🍕', '🍔'],
    ['👍', '👎'], ['❤️', '💙'], ['⭐', '🌟'], ['🎈', '🎀'], ['🐝', '🐞'],
    ['🍇', '🫐'], ['🥑', '🍐'], ['🐘', '🦣'], ['🦁', '🐯'], ['🌙', '☀️']
  ];
  var level = 1, timeLeft = 0, best = 0, tickId = null, running = false, oddIdx = -1;

  function $(id) { return document.getElementById(id); }

  function loadBest() {
    try { best = parseInt(localStorage.getItem('oddone-best') || '0', 10) || 0; } catch (e) { best = 0; }
    $('odd-one-out-game-best').textContent = best;
  }

  function gridSize() { return Math.min(8, 3 + Math.floor((level - 1) / 2)); }

  function buildLevel() {
    var size = gridSize();
    var total = size * size;
    var pair = PAIRS[(level - 1) % PAIRS.length];
    // shuffle which emoji is the "odd" sometimes the rarer-looking one
    var main = pair[0], odd = pair[1];
    if (Math.random() < 0.5) { main = pair[1]; odd = pair[0]; }
    oddIdx = Math.floor(Math.random() * total);
    var board = $('odd-one-out-game-board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';
    for (var i = 0; i < total; i++) {
      (function (idx) {
        var b = document.createElement('button');
        b.textContent = idx === oddIdx ? odd : main;
        b.style.cssText = 'aspect-ratio:1;font-size:28px;background:#fff;border:1px solid #ddd;border-radius:10px;cursor:pointer';
        b.setAttribute('aria-label', 'Tile ' + (idx + 1));
        b.addEventListener('click', function () { tap(idx); });
        board.appendChild(b);
      })(i);
    }
    timeLeft = Math.max(6, 16 - Math.floor(level / 2));
    $('odd-one-out-game-time').textContent = timeLeft;
    $('odd-one-out-game-level').textContent = level;
    $('odd-one-out-game-msg').textContent = 'Level ' + level + ' — find the odd one!';
  }

  function tap(idx) {
    if (!running) return;
    if (idx === oddIdx) {
      level++;
      if (level - 1 > best) {
        best = level - 1;
        try { localStorage.setItem('oddone-best', String(best)); } catch (e) {}
        $('odd-one-out-game-best').textContent = best;
      }
      $('odd-one-out-game-msg').textContent = '✓ Found it! Level ' + level + '…';
      buildLevel();
    } else {
      timeLeft = Math.max(0, timeLeft - 2);
      $('odd-one-out-game-time').textContent = timeLeft;
      $('odd-one-out-game-msg').textContent = '✗ Wrong — minus 2 seconds!';
      if (timeLeft <= 0) gameOver();
    }
  }

  function gameOver() {
    running = false;
    clearInterval(tickId);
    $('odd-one-out-game-msg').textContent = '⏰ Time up! You reached level ' + level + '. Press Start to try again.';
    $('odd-one-out-game-start').disabled = false;
  }

  function start() {
    if (running) return;
    level = 1; running = true;
    $('odd-one-out-game-start').disabled = true;
    buildLevel();
    clearInterval(tickId);
    tickId = setInterval(function () {
      timeLeft--;
      $('odd-one-out-game-time').textContent = timeLeft;
      if (timeLeft <= 0) gameOver();
    }, 1000);
  }

  try {
    loadBest();
    TN.on('odd-one-out-game-start', 'click', start);
  } catch (e) { /* never throw on load */ }
})();
