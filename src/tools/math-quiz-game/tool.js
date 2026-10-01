/* Math Quiz — 60s adaptive arithmetic sprint; level ramps with streaks. */
(function () {
  'use strict';
  var SLUG = 'math-quiz-game';
  var answer = 0, score = 0, streak = 0, level = 1, timeLeft = 60, timerId = null, playing = false;

  function $(id) { return document.getElementById(id); }
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function newQuestion() {
    var a, b, op, txt;
    var roll = Math.random();
    if (level === 1) {
      if (roll < 0.6) { a = ri(2, 20); b = ri(2, 20); op = '+'; answer = a + b; }
      else { a = ri(5, 25); b = ri(1, a); op = '−'; answer = a - b; }
    } else if (level === 2) {
      if (roll < 0.4) { a = ri(10, 99); b = ri(10, 99); op = '+'; answer = a + b; }
      else if (roll < 0.7) { a = ri(20, 99); b = ri(10, a); op = '−'; answer = a - b; }
      else if (roll < 0.9) { a = ri(2, 12); b = ri(2, 12); op = '×'; answer = a * b; }
      else { b = ri(2, 12); answer = ri(2, 12); a = b * answer; op = '÷'; }
    } else {
      if (roll < 0.3) { a = ri(2, 20); b = ri(2, 20); op = '×'; answer = a * b; }
      else if (roll < 0.55) { b = ri(3, 15); answer = ri(3, 15); a = b * answer; op = '÷'; }
      else if (roll < 0.8) { a = ri(-50, 50); b = ri(-50, 50); op = '+'; answer = a + b; }
      else { a = ri(-50, 50); b = ri(-50, 50); op = '−'; answer = a - b; }
    }
    txt = a + ' ' + op + ' ' + b + ' = ?';
    $('math-quiz-game-q').textContent = txt;
    var inp = $('math-quiz-game-ans');
    inp.value = '';
    inp.focus();
  }

  function start() {
    if (timerId) clearInterval(timerId);
    score = 0; streak = 0; level = 1; timeLeft = 60;
    $('math-quiz-game-score').textContent = '0';
    $('math-quiz-game-streak').textContent = '0';
    $('math-quiz-game-level').textContent = '1';
    $('math-quiz-game-time').textContent = '60';
    $('math-quiz-game-msg').textContent = 'Go! Level 1 — warm up.';
    $('math-quiz-game-ans').disabled = false;
    $('math-quiz-game-submit').disabled = false;
    $('math-quiz-game-start').textContent = '↻ Restart';
    playing = true;
    newQuestion();
    timerId = setInterval(function () {
      timeLeft--;
      $('math-quiz-game-time').textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    clearInterval(timerId); timerId = null;
    playing = false;
    $('math-quiz-game-ans').disabled = true;
    $('math-quiz-game-submit').disabled = true;
    $('math-quiz-game-q').textContent = '⏰';
    $('math-quiz-game-msg').textContent = "Time's up! Final score: " + score + ' (best level ' + level + '). Play again?';
  }

  function submit() {
    if (!playing) return;
    var raw = $('math-quiz-game-ans').value.trim();
    if (raw === '' || isNaN(Number(raw))) return;
    if (Number(raw) === answer) {
      streak++;
      var newLevel = Math.min(3, 1 + Math.floor(streak / 5));
      if (newLevel > level) {
        level = newLevel;
        $('math-quiz-game-level').textContent = level;
        $('math-quiz-game-msg').textContent = '⬆ Level up! Now Level ' + level + ' — harder questions.';
      } else {
        $('math-quiz-game-msg').textContent = '✓ Correct! +' + (10 * level) + ' points.';
      }
      score += 10 * level;
      $('math-quiz-game-score').textContent = score;
      $('math-quiz-game-streak').textContent = streak;
      newQuestion();
    } else {
      streak = 0; level = 1;
      $('math-quiz-game-streak').textContent = '0';
      $('math-quiz-game-level').textContent = '1';
      $('math-quiz-game-msg').textContent = '✗ Wrong — the answer was ' + answer + '. Streak reset.';
      newQuestion();
    }
  }

  try {
    TN.on('math-quiz-game-start', 'click', start);
    TN.on('math-quiz-game-submit', 'click', submit);
    TN.on('math-quiz-game-ans', 'keydown', function (e) { if (e.key === 'Enter') submit(); });
  } catch (e) { /* never throw on load */ }
})();
