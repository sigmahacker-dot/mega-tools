/* Pong — canvas, player vs AI paddle, first to 7, pause. */
(function () {
  'use strict';
  var SLUG = 'pong-game';
  var W = 480, H = 320, PH = 70, PW = 10;
  var you = { y: H / 2 - PH / 2, s: 0 };
  var ai = { y: H / 2 - PH / 2, s: 0 };
  var ball = { x: W / 2, y: H / 2, dx: 0, dy: 0, r: 8, speed: 5 };
  var running = false, paused = false, serveDir = 1, keys = {};

  function $(id) { return document.getElementById(id); }
  function canvas() { return $(SLUG + '-canvas'); }

  function serve() {
    ball.x = W / 2; ball.y = H / 2;
    ball.speed = 5;
    var ang = (Math.random() * 0.5 - 0.25) * Math.PI; // -45°..45°
    ball.dx = serveDir * ball.speed * Math.cos(ang);
    ball.dy = ball.speed * Math.sin(ang);
    serveDir = -serveDir;
  }

  function start() {
    you.s = 0; ai.s = 0;
    $('pong-game-you').textContent = '0';
    $('pong-game-ai').textContent = '0';
    $('pong-game-start').textContent = '↻ Restart';
    $('pong-game-pause').disabled = false;
    $('pong-game-pause').textContent = '⏸ Pause';
    paused = false;
    running = true;
    serveDir = Math.random() < 0.5 ? 1 : -1;
    serve();
    $('pong-game-msg').textContent = 'First to 7 wins — good luck!';
  }

  function point(winner) {
    if (winner === 'you') {
      you.s++;
      $('pong-game-you').textContent = you.s;
    } else {
      ai.s++;
      $('pong-game-ai').textContent = ai.s;
    }
    if (you.s >= 7 || ai.s >= 7) {
      running = false;
      $('pong-game-pause').disabled = true;
      $('pong-game-msg').textContent = you.s >= 7 ? '🏆 You win ' + you.s + '–' + ai.s + '!' : '🤖 Computer wins ' + ai.s + '–' + you.s + '. Try again!';
      return;
    }
    serve();
  }

  function bounce(paddleY, isLeft) {
    var rel = (ball.y - (paddleY + PH / 2)) / (PH / 2); // -1..1
    rel = Math.max(-1, Math.min(1, rel));
    ball.speed = Math.min(11, ball.speed * 1.06);
    var ang = rel * (Math.PI / 3.2);
    ball.dx = (isLeft ? 1 : -1) * ball.speed * Math.cos(ang);
    ball.dy = ball.speed * Math.sin(ang);
    ball.x = isLeft ? PW + ball.r + 1 : W - PW - ball.r - 1;
  }

  function update() {
    if (!running || paused) return;
    // player keyboard
    if (keys.up) you.y -= 6;
    if (keys.down) you.y += 6;
    you.y = Math.max(0, Math.min(H - PH, you.y));
    // AI: track ball with capped speed, only when ball approaches
    var aiSpeed = 4.6;
    var target = ai.y + PH / 2;
    if (ball.dx > 0) {
      var want = ball.y;
      if (Math.abs(want - target) > 8) ai.y += (want > target ? aiSpeed : -aiSpeed);
    } else {
      // drift to center when ball moves away
      if (Math.abs(H / 2 - target) > 10) ai.y += (H / 2 > target ? aiSpeed * 0.6 : -aiSpeed * 0.6);
    }
    ai.y = Math.max(0, Math.min(H - PH, ai.y));
    // ball
    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.y < ball.r) { ball.y = ball.r; ball.dy = Math.abs(ball.dy); }
    if (ball.y > H - ball.r) { ball.y = H - ball.r; ball.dy = -Math.abs(ball.dy); }
    // paddles
    if (ball.dx < 0 && ball.x - ball.r <= PW && ball.x > 0 && ball.y >= you.y - ball.r && ball.y <= you.y + PH + ball.r) {
      bounce(you.y, true);
    }
    if (ball.dx > 0 && ball.x + ball.r >= W - PW && ball.x < W && ball.y >= ai.y - ball.r && ball.y <= ai.y + PH + ball.r) {
      bounce(ai.y, false);
    }
    if (ball.x < -20) point('ai');
    if (ball.x > W + 20) point('you');
  }

  function draw() {
    var ctx = canvas().getContext('2d');
    ctx.fillStyle = '#101418';
    ctx.fillRect(0, 0, W, H);
    // center line
    ctx.strokeStyle = '#37474f';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);
    // paddles
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(0, you.y, PW, PH);
    ctx.fillStyle = '#f44336';
    ctx.fillRect(W - PW, ai.y, PW, PH);
    // ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    // score
    ctx.fillStyle = '#78909c';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(you.s, W / 2 - 50, 56);
    ctx.fillText(ai.s, W / 2 + 50, 56);
    if (!running) {
      ctx.fillStyle = '#90a4ae';
      ctx.font = '20px sans-serif';
      ctx.fillText('Press Start to play', W / 2, H / 2 + 60);
    }
    if (paused && running) {
      ctx.fillStyle = 'rgba(0,0,0,.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('PAUSED', W / 2, H / 2);
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function moveTo(clientY) {
    var r = canvas().getBoundingClientRect();
    var y = (clientY - r.top) * (H / r.height);
    you.y = Math.max(0, Math.min(H - PH, y - PH / 2));
  }

  try {
    var cv = canvas();
    cv.addEventListener('mousemove', function (e) { moveTo(e.clientY); });
    cv.addEventListener('touchstart', function (e) { e.preventDefault(); moveTo(e.touches[0].clientY); }, { passive: false });
    cv.addEventListener('touchmove', function (e) { e.preventDefault(); moveTo(e.touches[0].clientY); }, { passive: false });
    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      if (e.key === 'ArrowUp') { keys.up = true; e.preventDefault(); }
      else if (e.key === 'ArrowDown') { keys.down = true; e.preventDefault(); }
    });
    document.addEventListener('keyup', function (e) {
      if (e.key === 'ArrowUp') keys.up = false;
      if (e.key === 'ArrowDown') keys.down = false;
    });
    TN.on('pong-game-start', 'click', start);
    TN.on('pong-game-pause', 'click', function () {
      if (!running) return;
      paused = !paused;
      $('pong-game-pause').textContent = paused ? '▶ Resume' : '⏸ Pause';
    });
    loop();
  } catch (e) { /* never throw on load */ }
})();
