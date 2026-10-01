/* Pig Dice — roll/hold, bust on 1, first to 100, vs computer (holds at 20). */
(function () {
  'use strict';
  var SLUG = 'pig-dice-game';
  var FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  var WIN = 100, CPU_HOLD = 20;
  var youTotal = 0, cpuTotal = 0, turnTotal = 0, yourTurn = true, over = false;

  function $(id) { return document.getElementById(id); }

  function log(msg) {
    var l = $('pig-dice-game-log');
    var d = document.createElement('div');
    d.textContent = msg;
    l.insertBefore(d, l.firstChild);
    while (l.children.length > 8) l.removeChild(l.lastChild);
  }

  function stats() {
    $('pig-dice-game-youtotal').textContent = youTotal;
    $('pig-dice-game-cputotal').textContent = cpuTotal;
    $('pig-dice-game-turntotal').textContent = turnTotal;
  }

  function setButtons(on) {
    $('pig-dice-game-roll').disabled = !on;
    $('pig-dice-game-hold').disabled = !on;
  }

  function endGame(youWin) {
    over = true;
    setButtons(false);
    stats();
    $('pig-dice-game-msg').textContent = youWin
      ? '🏆 YOU WIN ' + youTotal + '–' + cpuTotal + '! Press ↻ for a new game.'
      : '🤖 CPU WINS ' + cpuTotal + '–' + youTotal + '. Press ↻ to try again.';
    log(youWin ? '🏆 You reached 100 first!' : '🤖 CPU reached 100 first.');
  }

  function roll() {
    if (over || !yourTurn) return;
    var d = 1 + Math.floor(Math.random() * 6);
    $('pig-dice-game-die').textContent = FACES[d];
    if (d === 1) {
      turnTotal = 0;
      $('pig-dice-game-msg').textContent = '💥 Bust! Rolled a 1 — turn total lost. CPU\'s turn.';
      log('You rolled a 1 — busted!');
      endTurn();
    } else {
      turnTotal += d;
      $('pig-dice-game-msg').textContent = 'Rolled ' + d + ' — turn total ' + turnTotal + '. Roll again or Hold?';
      stats();
    }
  }

  function hold() {
    if (over || !yourTurn || turnTotal === 0) return;
    youTotal += turnTotal;
    log('You held — banked ' + turnTotal + ' (total ' + youTotal + ').');
    turnTotal = 0;
    stats();
    if (youTotal >= WIN) { endGame(true); return; }
    endTurn();
  }

  function endTurn() {
    yourTurn = false;
    setButtons(false);
    stats();
    setTimeout(cpuPlay, 800);
  }

  function cpuPlay() {
    if (over) return;
    turnTotal = 0;
    $('pig-dice-game-msg').textContent = '🤖 CPU is rolling…';
    var step = function () {
      if (over) return;
      var d = 1 + Math.floor(Math.random() * 6);
      $('pig-dice-game-die').textContent = FACES[d];
      if (d === 1) {
        turnTotal = 0;
        log('CPU rolled a 1 — busted!');
        $('pig-dice-game-msg').textContent = '💥 CPU busted on a 1! Your turn.';
        stats();
        yourTurn = true;
        setButtons(true);
        return;
      }
      turnTotal += d;
      stats();
      var projected = cpuTotal + turnTotal;
      if (projected >= WIN || turnTotal >= CPU_HOLD) {
        cpuTotal = projected;
        log('CPU held — banked ' + turnTotal + ' (total ' + cpuTotal + ').');
        turnTotal = 0;
        stats();
        if (cpuTotal >= WIN) { endGame(false); return; }
        $('pig-dice-game-msg').textContent = 'CPU held at ' + cpuTotal + '. Your turn — Roll or Hold!';
        yourTurn = true;
        setButtons(true);
        return;
      }
      $('pig-dice-game-msg').textContent = '🤖 CPU rolled ' + d + ' (turn total ' + turnTotal + ')…';
      setTimeout(step, 800);
    };
    setTimeout(step, 600);
  }

  function newGame() {
    youTotal = 0; cpuTotal = 0; turnTotal = 0;
    yourTurn = true; over = false;
    $('pig-dice-game-die').textContent = '🎲';
    $('pig-dice-game-log').innerHTML = '';
    $('pig-dice-game-msg').textContent = 'Your turn — Roll or Hold! First to 100 wins.';
    setButtons(true);
    stats();
  }

  try {
    TN.on('pig-dice-game-roll', 'click', roll);
    TN.on('pig-dice-game-hold', 'click', hold);
    TN.on('pig-dice-game-new', 'click', newGame);
    newGame();
  } catch (e) { /* never throw on load */ }
})();
