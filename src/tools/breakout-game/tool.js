/* Breakout — canvas, ball physics, brick rows, lives, score, levels. */
(function () {
  'use strict';
  var SLUG = 'breakout-game';
  var W = 480, H = 360;
  var paddle = { w: 76, h: 12, x: (W - 76) / 2 };
  var ball = { x: 0, y: 0, dx: 0, dy: 0, r: 8, speed: 5 };
  var bricks = [], score = 0, lives = 3, level = 1;
  var state = 'idle'; // idle | ready | play | over | win
  var keys = {};
  var BRICK_ROWS = 5, BRICK_COLS = 8;
  var COLORS = ['#ef5350', '#ff9800', '#ffeb3b', '#66bb6a', '#42a5f5'];

  function $(id) { return document.getElementById(id); }
  function canvas() { return $(SLUG + '-canvas'); }

  function buildBricks() {
    bricks = [];
    var bw = (W - 20) / BRICK_COLS, bh = 22;
    for (var r = 0; r < BRICK_ROWS; r++) for (var c = 0; c < BRICK_COLS; c++) {
      bricks.push({ x: 10 + c * bw, y: 44 + r * (bh + 6), w: bw - 6, h: bh, alive: true, color: COLORS[r % COLORS.length] });
    }
  }

  function resetBall() {
    ball.x = paddle.x + paddle.w / 2;
    ball.y = H - 40;
    ball.dx = 0; ball.dy = 0;
    ball.speed = 4.5 + (level - 1) * 0.7;
    state = 'ready';
    $('breakout-game-msg').textContent = 'Tap / Space to launch the ball!';
  }

  function launch() {
    if (state !== 'ready') return;
    var ang = (Math.random() * 0.6 + 0.2) * Math.PI; // 36°..144° upward
    ball.dx = ball.speed * Math.cos(ang) * (Math.random() < 0.5 ? 1 : -1);
    ball.dy = -Math.abs(ball.speed * Math.sin(ang));
    state = 'play';
    $('breakout-game-msg').textContent = 'Go!';
  }

  function start() {
    score = 0; lives = 3; level = 1;
    $('breakout-game-score').textContent = '0';
    $('breakout-game-lives').textContent = '3';
    $('breakout-game-level').textContent = '1';
    $('breakout-game-start').textContent = '↻ Restart';
    buildBricks();
    paddle.x = (W - paddle.w) / 2;
    resetBall();
  }

  function loseLife() {
    lives--;
    $('breakout-game-lives').textContent = lives;
    if (lives <= 0) {
      state = 'over';
      $('breakout-game-msg').textContent = '💀 Game over! Score: ' + score + '. Press Restart.';
    } else {
      $('breakout-game-msg').textContent = 'Lost a ball — ' + lives + ' ' + (lives === 1 ? 'life' : 'lives') + ' left.';
      resetBall();
    }
  }

  function update() {
    if (state !== 'play') return;
    // paddle keyboard
    if (keys.left) paddle.x -= 7;
    if (keys.right) paddle.x += 7;
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
    // ball
    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.x < ball.r) { ball.x = ball.r; ball.dx = Math.abs(ball.dx); }
    if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.dx = -Math.abs(ball.dx); }
    if (ball.y < ball.r) { ball.y = ball.r; ball.dy = Math.abs(ball.dy); }
    // paddle collision
    var py = H - 28;
    if (ball.dy > 0 && ball.y + ball.r >= py && ball.y + ball.r <= py + paddle.h + 8 &&
        ball.x >= paddle.x - ball.r && ball.x <= paddle.x + paddle.w + ball.r) {
      var rel = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2); // -1..1
      var ang = rel * (Math.PI / 3); // max 60°
      var sp = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dx = sp * Math.sin(ang);
      ball.dy = -Math.abs(sp * Math.cos(ang));
      ball.y = py - ball.r;
    }
    // brick collision
    for (var i = 0; i < bricks.length; i++) {
      var b = bricks[i];
      if (!b.alive) continue;
      if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
          ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
        b.alive = false;
        score += 10;
        $('breakout-game-score').textContent = score;
        // bounce: determine side by overlap
        var ox = Math.min(ball.x + ball.r - b.x, b.x + b.w - (ball.x - ball.r));
        var oy = Math.min(ball.y + ball.r - b.y, b.y + b.h - (ball.y - ball.r));
        if (ox < oy) ball.dx = -ball.dx; else ball.dy = -ball.dy;
        break;
      }
    }
    if (bricks.every(function (b) { return !b.alive; })) {
      level++;
      $('breakout-game-level').textContent = level;
      $('breakout-game-msg').textContent = '🏆 Level ' + level + '! Faster ball — keep going!';
      buildBricks();
      paddle.x = (W - paddle.w) / 2;
      resetBall();
      return;
    }
    if (ball.y - ball.r > H) loseLife();
  }

  function draw() {
    var ctx = canvas().getContext('2d');
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(0, 0, W, H);
    bricks.forEach(function (b) {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = 'rgba(255,255,255,.25)';
      ctx.fillRect(b.x, b.y, b.w, 4);
    });
    // paddle
    ctx.fillStyle = '#eceff1';
    var py = H - 28;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(paddle.x, py, paddle.w, paddle.h, 6); else ctx.rect(paddle.x, py, paddle.w, paddle.h);
    ctx.fill();
    // ball
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    if (state === 'idle') {
      ctx.fillStyle = '#90a4ae';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Press Start to play', W / 2, H / 2);
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function paddleTo(clientX) {
    var r = canvas().getBoundingClientRect();
    var x = (clientX - r.left) * (W / r.width);
    paddle.x = Math.max(0, Math.min(W - paddle.w, x - paddle.w / 2));
  }

  try {
    var cv = canvas();
    cv.addEventListener('mousemove', function (e) { paddleTo(e.clientX); });
    cv.addEventListener('touchstart', function (e) {
      e.preventDefault();
      paddleTo(e.touches[0].clientX);
      launch();
    }, { passive: false });
    cv.addEventListener('touchmove', function (e) {
      e.preventDefault();
      paddleTo(e.touches[0].clientX);
    }, { passive: false });
    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      if (e.key === 'ArrowLeft') { keys.left = true; e.preventDefault(); }
      else if (e.key === 'ArrowRight') { keys.right = true; e.preventDefault(); }
      else if (e.key === ' ') { e.preventDefault(); launch(); }
    });
    document.addEventListener('keyup', function (e) {
      if (e.key === 'ArrowLeft') keys.left = false;
      if (e.key === 'ArrowRight') keys.right = false;
    });
    TN.on('breakout-game-start', 'click', start);
    buildBricks();
    paddle.x = (W - paddle.w) / 2;
    ball.x = W / 2; ball.y = H / 2;
    loop();
  } catch (e) { /* never throw on load */ }
})();
