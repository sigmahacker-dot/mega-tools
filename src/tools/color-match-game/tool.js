/* Color Match (Stroop) — match the ink color, not the word. 45s rounds. */
(function () {
  'use strict';
  var SLUG = 'color-match-game';
  var DURATION = 45;
  var COLORS = [
    { name: 'RED', hex: '#e53935' },
    { name: 'BLUE', hex: '#1e88e5' },
    { name: 'GREEN', hex: '#43a047' },
    { name: 'YELLOW', hex: '#fdd835' },
    { name: 'PURPLE', hex: '#8e24aa' },
    { name: 'ORANGE', hex: '#fb8c00' }
  ];
  var running = false, score = 0, timeLeft = DURATION, best = 0, answer = 0, tickId = null;

  function $(id) { return document.getElementById(id); }

  function loadBest() {
    try { best = parseInt(localStorage.getItem('colormatch-best') || '0', 10) || 0; } catch (e) { best = 0; }
    $('color-match-game-best').textContent = best;
  }

  function buildButtons() {
    var wrap = $('color-match-game-btns');
    wrap.innerHTML = '';
    COLORS.forEach(function (c, i) {
      var b = document.createElement('button');
      b.className = 'btn';
      b.style.cssText = 'background:' + c.hex + ';color:#fff;border:none;padding:14px;font-weight:700;font-size:16px';
      b.textContent = c.name;
      b.addEventListener('click', function () { guess(i); });
      wrap.appendChild(b);
    });
  }

  function nextWord() {
    var wordIdx = Math.floor(Math.random() * COLORS.length);
    var inkIdx = Math.floor(Math.random() * COLORS.length);
    while (inkIdx === wordIdx && Math.random() < 0.7) inkIdx = Math.floor(Math.random() * COLORS.length);
    answer = inkIdx;
    var w = $('color-match-game-word');
    w.textContent = COLORS[wordIdx].name;
    w.style.color = COLORS[inkIdx].hex;
    if (COLORS[inkIdx].name === 'YELLOW') w.style.textShadow = '0 0 2px #888';
    else w.style.textShadow = 'none';
  }

  function guess(i) {
    if (!running) return;
    if (i === answer) { score++; $('color-match-game-msg').textContent = '✓ Correct!'; }
    else { score--; $('color-match-game-msg').textContent = '✗ Wrong — that was ' + COLORS[answer].name + '.'; }
    $('color-match-game-score').textContent = score;
    nextWord();
  }

  function end() {
    running = false;
    clearInterval(tickId);
    $('color-match-game-msg').textContent = 'Time! Final score: ' + score + '. Press Start to play again.';
    if (score > best) {
      best = score;
      try { localStorage.setItem('colormatch-best', String(best)); } catch (e) {}
      $('color-match-game-best').textContent = best;
    }
    $('color-match-game-start').disabled = false;
  }

  function start() {
    if (running) return;
    score = 0; timeLeft = DURATION; running = true;
    $('color-match-game-score').textContent = '0';
    $('color-match-game-time').textContent = DURATION;
    $('color-match-game-msg').textContent = 'Match the INK color!';
    $('color-match-game-start').disabled = true;
    nextWord();
    tickId = setInterval(function () {
      timeLeft--;
      $('color-match-game-time').textContent = timeLeft;
      if (timeLeft <= 0) end();
    }, 1000);
  }

  try {
    buildButtons();
    loadBest();
    TN.on('color-match-game-start', 'click', start);
  } catch (e) { /* never throw on load */ }
})();
