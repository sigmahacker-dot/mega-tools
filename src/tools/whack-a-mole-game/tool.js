/* Whack-a-Mole — 30s timer, random spawns, scoring, high score. */
(function () {
  'use strict';
  var SLUG = 'whack-a-mole-game';
  var N = 9;
  var DURATION = 30;
  var score = 0, timeLeft = DURATION, best = 0;
  var running = false;
  var tickTimer = null, spawnTimer = null;
  var holes = []; // {el, mole: null | {golden, timeout}}

  function $(id) { return document.getElementById(id); }

  function loadBest() {
    try { best = parseInt(localStorage.getItem('whack-best') || '0', 10) || 0; } catch (e) { best = 0; }
    $('whack-a-mole-game-best').textContent = best;
  }

  function buildBoard() {
    var b = $('whack-a-mole-game-board');
    b.innerHTML = '';
    holes = [];
    for (var i = 0; i < N; i++) {
      (function (idx) {
        var d = document.createElement('button');
        d.style.cssText = 'aspect-ratio:1;border:2px solid #8d6e63;border-radius:50%;background:radial-gradient(circle at 50% 40%, #5d4037 0%, #3e2723 70%);font-size:40px;cursor:pointer;position:relative;overflow:hidden';
        d.setAttribute('aria-label', 'Hole ' + (idx + 1));
        d.addEventListener('click', function () { whack(idx); });
        b.appendChild(d);
        holes.push({ el: d, mole: null });
      })(i);
    }
  }

  function pop() {
    var h = Math.floor(Math.random() * 10);
    var golden = h < 9 ? false : true;
    if (!golden && Math.random() < 0.12) golden = true;
    var hole = holes[idx];
    if (hole.mole) return;
    var el = hole.el;
    el.textContent = golden ? '⭐' : '🐹';
    el.style.transform = 'scale(1)';
    var life = golden ? 650 : Math.max(500, 1100 - (DURATION - timeLeft) * 18);
    var to = setTimeout(function () { clear(idx); }, life);
    hole.mole = { golden: golden, timeout: to };
  }

  function clear(idx) {
    var hole = holes[idx];
    if (hole.mole) { clearTimeout(hole.mole.timeout); hole.mole = null; }
    hole.el.textContent = '';
  }

  function whack(idx) {
    if (!running) return;
    var hole = holes[idx];
    if (!hole.mole) return;
    var golden = hole.mole.golden;
    clear(idx);
    score += golden ? 3 : 1;
    $('whack-a-mole-game-score').textContent = score;
    hole.el.style.transform = 'scale(0.9)';
    setTimeout(function () { hole.el.style.transform = 'scale(1)'; }, 120);
  }

  function spawnLoop() {
    if (!running) return;
    pop();
    // speed up as time runs out; sometimes spawn two
    if (Math.random() < 0.25 + (DURATION - timeLeft) * 0.015) pop();
    var interval = Math.max(280, 750 - (DURATION - timeLeft) * 16);
    spawnTimer = setTimeout(spawnLoop, interval);
  }

  function end() {
    running = false;
    clearTimeout(tickTimer); clearTimeout(spawnTimer);
    for (var i = 0; i < N; i++) clear(i);
    $('whack-a-mole-game-msg').textContent = 'Time! You scored ' + score + ' point' + (score === 1 ? '' : 's') + '. Press Start to play again.';
    if (score > best) {
      best = score;
      try { localStorage.setItem('whack-best', String(best)); } catch (e) {}
      $('whack-a-mole-game-best').textContent = best;
    }
    $('whack-a-mole-game-start').disabled = false;
  }

  function start() {
    if (running) return;
    for (var i = 0; i < N; i++) clear(i);
    score = 0; timeLeft = DURATION; running = true;
    $('whack-a-mole-game-score').textContent = '0';
    $('whack-a-mole-game-time').textContent = DURATION;
    $('whack-a-mole-game-msg').textContent = 'Go! Whack those moles!';
    $('whack-a-mole-game-start').disabled = true;
    tickTimer = setInterval(function () {
      timeLeft--;
      $('whack-a-mole-game-time').textContent = timeLeft;
      if (timeLeft <= 0) end();
    }, 1000);
    spawnLoop();
  }

  try {
    buildBoard();
    loadBest();
    TN.on('whack-a-mole-game-start', 'click', start);
  } catch (e) { /* never throw on load */ }
})();
