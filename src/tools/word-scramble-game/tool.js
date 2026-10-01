/* Word Scramble — 110-word bank, 60s timer, scoring with streak bonuses. */
(function () {
  'use strict';
  var SLUG = 'word-scramble-game';
  var WORDS = ('APPLE BANANA ORANGE MANGO GRAPE LEMON PEACH CHERRY MELON PAPAYA ' +
    'TIGER LION ZEBRA GIRAFFE ELEPHANT MONKEY PANDA KOALA CAMEL HORSE ' +
    'EAGLE PARROT PENGUIN DOLPHIN SHARK WHALE OCTOPUS TURTLE RABBIT DEER ' +
    'CASTLE BRIDGE TOWER MARKET HARBOR DESERT ISLAND VOLCANO RIVER MOUNTAIN ' +
    'GUITAR PIANO DRUM VIOLIN TRUMPET FLUTE BANJO SITAR TABLA HARMONICA ' +
    'ROCKET PLANET COMET ASTEROID GALAXY SATURN VENUS MARS JUPITER METEOR ' +
    'BREAD CHEESE PIZZA PASTA HONEY SUGAR SPICE CURRY SALAD SOUP ' +
    'CHAIR TABLE LAMP MIRROR CLOCK CANDLE PILLOW BLANKET CURTAIN CARPET ' +
    'TRAIN PLANE SHIP TRUCK BICYCLE SCOOTER SUBWAY TAXI HELICOPTER BALLOON ' +
    'DOCTOR NURSE TEACHER PILOT CHEF JUDGE LAWYER ACTOR SINGER DANCER ' +
    'WINTER SUMMER SPRING AUTUMN RAINBOW STORM CLOUD THUNDER LIGHTNING SNOW').split(' ');
  var current = '', score = 0, streak = 0, timeLeft = 60, timerId = null, playing = false;

  function $(id) { return document.getElementById(id); }

  function scramble(w) {
    var a = w.split(''), guard = 0;
    do {
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      guard++;
    } while (a.join('') === w && guard < 50);
    return a.join('');
  }

  function nextWord() {
    current = WORDS[Math.floor(Math.random() * WORDS.length)];
    $('word-scramble-game-word').textContent = scramble(current);
    var g = $('word-scramble-game-guess');
    g.value = '';
    g.focus();
  }

  function setPlaying(on) {
    playing = on;
    $('word-scramble-game-guess').disabled = !on;
    $('word-scramble-game-submit').disabled = !on;
    $('word-scramble-game-skip').disabled = !on;
    $('word-scramble-game-start').textContent = on ? '↻ Restart' : '▶ Start';
  }

  function start() {
    if (timerId) clearInterval(timerId);
    score = 0; streak = 0; timeLeft = 60;
    $('word-scramble-game-score').textContent = '0';
    $('word-scramble-game-streak').textContent = '0';
    $('word-scramble-game-time').textContent = '60';
    $('word-scramble-game-msg').textContent = 'Go! Unscramble the word.';
    setPlaying(true);
    nextWord();
    timerId = setInterval(function () {
      timeLeft--;
      $('word-scramble-game-time').textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    clearInterval(timerId); timerId = null;
    setPlaying(false);
    $('word-scramble-game-word').textContent = '⏰';
    $('word-scramble-game-msg').textContent = "Time's up! Final score: " + score + '. Press Start to play again.';
  }

  function guess() {
    if (!playing) return;
    var g = $('word-scramble-game-guess').value.trim().toUpperCase();
    if (!g) return;
    if (g === current) {
      streak++;
      var pts = 10 + (streak - 1) * 2;
      score += pts;
      $('word-scramble-game-score').textContent = score;
      $('word-scramble-game-streak').textContent = streak;
      $('word-scramble-game-msg').textContent = '✓ Correct! +' + pts + ' points.';
      nextWord();
    } else {
      streak = 0;
      $('word-scramble-game-streak').textContent = '0';
      $('word-scramble-game-msg').textContent = '✗ Not quite — try again!';
    }
  }

  function skip() {
    if (!playing) return;
    streak = 0;
    $('word-scramble-game-streak').textContent = '0';
    $('word-scramble-game-msg').textContent = 'Skipped — streak reset. The word was ' + current + '.';
    nextWord();
  }

  try {
    TN.on('word-scramble-game-start', 'click', start);
    TN.on('word-scramble-game-submit', 'click', guess);
    TN.on('word-scramble-game-skip', 'click', skip);
    TN.on('word-scramble-game-guess', 'keydown', function (e) { if (e.key === 'Enter') guess(); });
  } catch (e) { /* never throw on load */ }
})();
