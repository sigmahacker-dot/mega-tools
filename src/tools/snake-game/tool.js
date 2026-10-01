(function () {
  'use strict';
  var P = 'snake-game-';
  var ERR = P + 'error';
  var GRID = 20, CELL = 20, BEST_KEY = 'tn-snake-best';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  var canvas = g('canvas'), ctx = canvas ? canvas.getContext('2d') : null;
  var snake, dir, nextDir, food, score, speed, timer, running, best;
  function loadBest() {
    best = 0;
    try { best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) { best = 0; }
    set('best', String(best));
  }
  function saveBest() {
    try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) { /* ignore */ }
  }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function placeFood() {
    var i, f, clash;
    while (true) {
      f = { x: rnd(GRID), y: rnd(GRID) };
      clash = false;
      for (i = 0; i < snake.length; i++) {
        if (snake[i].x === f.x && snake[i].y === f.y) { clash = true; break; }
      }
      if (!clash) { food = f; return; }
    }
  }
  function draw() {
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);
    if (food) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
    }
    for (var i = snake.length - 1; i >= 0; i--) {
      ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
      var x = snake[i].x * CELL, y = snake[i].y * CELL;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x + 1, y + 1, CELL - 2, CELL - 2, 5);
      else ctx.rect(x + 1, y + 1, CELL - 2, CELL - 2);
      ctx.fill();
    }
  }
  function step() {
    dir = nextDir;
    var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    var growing = food && head.x === food.x && head.y === food.y;
    var body = growing ? snake : snake.slice(0, -1), i;
    if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) { gameOver(); return; }
    for (i = 0; i < body.length; i++) {
      if (body[i].x === head.x && body[i].y === head.y) { gameOver(); return; }
    }
    snake.unshift(head);
    if (growing) {
      score += 10;
      speed = Math.max(70, speed - 4);
      placeFood();
    } else snake.pop();
    set('score', String(score));
    draw();
  }
  function loop() {
    if (!running) return;
    clearTimeout(timer);
    timer = setTimeout(function () { step(); loop(); }, speed);
  }
  function start() {
    if (!ctx) { TN.setErr(ERR, 'Canvas is not available in this browser.'); return; }
    TN.clearErr(ERR);
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 }; nextDir = dir;
    score = 0; speed = 150; running = true;
    set('score', '0');
    TN.hide(P + 'overlay');
    placeFood();
    draw();
    loop();
  }
  function gameOver() {
    running = false;
    clearTimeout(timer);
    var isBest = score > best;
    if (isBest) { best = score; saveBest(); set('best', String(best)); }
    var msg = g('omsg');
    if (msg) msg.textContent = 'Score: ' + score + (isBest ? ' — new best!' : '');
    TN.show(P + 'overlay');
  }
  function steer(dx, dy) {
    if (!running) return;
    if (dx === -dir.x && dy === -dir.y) return;
    if (dx === dir.x && dy === dir.y) return;
    nextDir = { x: dx, y: dy };
  }
  try {
    loadBest();
    TN.on(P + 'start', 'click', start);
    TN.on(P + 'restart', 'click', start);
    var pad = g('pad');
    if (pad) {
      var btns = pad.querySelectorAll('button');
      for (var i = 0; i < btns.length; i++) {
        (function (b) {
          b.addEventListener('click', function () {
            steer(parseInt(b.getAttribute('data-dx'), 10), parseInt(b.getAttribute('data-dy'), 10));
          });
        })(btns[i]);
      }
    }
    document.addEventListener('keydown', function (e) {
      var k = e.key, handled = true;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') steer(0, -1);
      else if (k === 'ArrowDown' || k === 's' || k === 'S') steer(0, 1);
      else if (k === 'ArrowLeft' || k === 'a' || k === 'A') steer(-1, 0);
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') steer(1, 0);
      else handled = false;
      if (handled) e.preventDefault();
    });
    draw();
  } catch (e) { /* never throw on load */ }
})();
