/* Guess the Number — higher/lower + hot/cold hints, per-difficulty best. */
(function () {
  'use strict';
  var SLUG = 'guess-the-number-game';
  var ERR = SLUG + '-error';
  var secret = 0, maxN = 100, tries = 0, done = false;

  function $(id) { return document.getElementById(id); }

  function bestKey() { return 'guessnum-best-' + maxN; }
  function loadBest() {
    var b = null;
    try { b = localStorage.getItem(bestKey()); } catch (e) {}
    $('guess-the-number-game-best').textContent = b || '–';
  }

  function newGame() {
    maxN = parseInt($('guess-the-number-game-diff').value, 10) || 100;
    secret = 1 + Math.floor(Math.random() * maxN);
    tries = 0; done = false;
    $('guess-the-number-game-tries').textContent = '0';
    $('guess-the-number-game-msg').textContent = "I'm thinking of a number between 1 and " + maxN + '…';
    $('guess-the-number-game-face').textContent = '🤔';
    $('guess-the-number-game-hist').innerHTML = '';
    $('guess-the-number-game-guess').value = '';
    $('guess-the-number-game-guess').max = maxN;
    loadBest();
    TN.clearErr(ERR);
  }

  function heat(diff) {
    var r = diff / maxN;
    if (r === 0) return '';
    if (r <= 0.02) return '🔥 Burning hot!';
    if (r <= 0.06) return '🥵 Very hot!';
    if (r <= 0.12) return '🌡️ Warm.';
    if (r <= 0.25) return '🧊 Cold.';
    return '🥶 Freezing!';
  }

  function guess() {
    if (done) { TN.setErr(ERR, 'Game over — press New game to play again.'); return; }
    var g = parseInt($('guess-the-number-game-guess').value, 10);
    if (!(g >= 1 && g <= maxN)) { TN.setErr(ERR, 'Enter a number between 1 and ' + maxN + '.'); return; }
    TN.clearErr(ERR);
    tries++;
    $('guess-the-number-game-tries').textContent = tries;
    var hist = $('guess-the-number-game-hist');
    var line = document.createElement('div');
    if (g === secret) {
      done = true;
      $('guess-the-number-game-face').textContent = '🎉';
      $('guess-the-number-game-msg').textContent = 'Correct! The number was ' + secret + ' — found in ' + tries + ' tries!';
      line.innerHTML = '<b>' + g + '</b> — ✓ correct!';
      var prev = null;
      try { prev = parseInt(localStorage.getItem(bestKey()) || '0', 10) || null; } catch (e) {}
      if (!prev || tries < prev) {
        try { localStorage.setItem(bestKey(), String(tries)); } catch (e) {}
        $('guess-the-number-game-best').textContent = tries;
        $('guess-the-number-game-msg').textContent += ' 🏆 New best!';
      }
    } else {
      var dir = g < secret ? 'Too low ⬆️' : 'Too high ⬇️';
      var h = heat(Math.abs(g - secret));
      $('guess-the-number-game-face').textContent = g < secret ? '📈' : '📉';
      $('guess-the-number-game-msg').textContent = dir + ' — ' + h;
      line.textContent = g + ' — ' + dir;
    }
    hist.insertBefore(line, hist.firstChild);
    $('guess-the-number-game-guess').value = '';
    $('guess-the-number-game-guess').focus();
  }

  try {
    TN.on('guess-the-number-game-go', 'click', guess);
    TN.on('guess-the-number-game-new', 'click', newGame);
    TN.on('guess-the-number-game-diff', 'change', newGame);
    TN.on('guess-the-number-game-guess', 'keydown', function (e) { if (e.key === 'Enter') guess(); });
    newGame();
  } catch (e) { /* never throw on load */ }
})();
