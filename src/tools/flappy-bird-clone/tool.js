(function () {
  'use strict';
  var P = 'flappy-bird-clone-';
  function g(id) { return document.getElementById(P + id); }
  var W = 400, H = 560, GRAV = 1500, FLAP = -430, PIPE_W = 64, GAP = 150, GROUND = 60;
  var cv, ctx, bird, pipes, score, best, state, raf, lastT, speed;
  var LS = 'tn-flappy-bird-clone-best';
  try { best = parseInt(localStorage.getItem(LS) || '0', 10) || 0; } catch (e) { best = 0; }
  function reset() {
    bird = { x: 90, y: H / 2 - 60, vy: 0, r: 14, wing: 0 };
    pipes = [];
    score = 0;
    speed = 170;
    state = 'ready';
    lastT = 0;
  }
  function setScore() {
    var s = g('score'); if (s) s.textContent = String(score);
    var b = g('best'); if (b) b.textContent = String(best);
  }
  function spawnPipe() {
    var margin = 70, minY = margin, maxY = H - GROUND - margin - GAP;
    var gapY = minY + Math.random() * (maxY - minY);
    pipes.push({ x: W + 10, gapY: gapY, passed: false });
  }
  function flap() {
    if (state === 'ready') { state = 'play'; }
    if (state !== 'play') return;
    bird.vy = FLAP;
    bird.wing = 1;
  }
  function die() {
    state = 'over';
    if (score > best) {
      best = score;
      try { localStorage.setItem(LS, String(best)); } catch (e) {}
    }
    setScore();
  }
  function step(dt) {
    bird.vy += GRAV * dt;
    bird.y += bird.vy * dt;
    bird.wing = Math.max(0, bird.wing - dt * 4);
    speed = 170 + score * 4;
    if (!pipes.length || pipes[pipes.length - 1].x < W - 220) spawnPipe();
    for (var i = 0; i < pipes.length; i++) {
      var p = pipes[i];
      p.x -= speed * dt;
      if (!p.passed && p.x + PIPE_W < bird.x - bird.r) { p.passed = true; score++; setScore(); }
      // collision
      var inX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + PIPE_W;
      if (inX && (bird.y - bird.r < p.gapY || bird.y + bird.r > p.gapY + GAP)) { die(); return; }
    }
    if (pipes.length && pipes[0].x < -PIPE_W - 10) pipes.shift();
    if (bird.y + bird.r >= H - GROUND || bird.y - bird.r <= 0) { die(); return; }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    // sky gradient
    var gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#70c5ce'); gr.addColorStop(1, '#a8e063');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);
    // clouds
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    var t = performance.now() / 1000;
    for (var ci = 0; ci < 3; ci++) {
      var cx = ((t * 18 * (ci + 1) + ci * 190) % (W + 120)) - 60;
      ctx.beginPath();
      ctx.arc(cx, 90 + ci * 55, 26, 0, 7); ctx.arc(cx + 24, 96 + ci * 55, 20, 0, 7); ctx.arc(cx - 24, 96 + ci * 55, 18, 0, 7);
      ctx.fill();
    }
    // pipes
    pipes.forEach(function (p) {
      ctx.fillStyle = '#2d9d46';
      ctx.fillRect(p.x, 0, PIPE_W, p.gapY);
      ctx.fillRect(p.x, p.gapY + GAP, PIPE_W, H - GROUND - p.gapY - GAP);
      ctx.fillStyle = '#37b354';
      ctx.fillRect(p.x - 4, p.gapY - 22, PIPE_W + 8, 22);
      ctx.fillRect(p.x - 4, p.gapY + GAP, PIPE_W + 8, 22);
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      ctx.fillRect(p.x + PIPE_W - 12, 0, 12, p.gapY);
      ctx.fillRect(p.x + PIPE_W - 12, p.gapY + GAP, 12, H - GROUND - p.gapY - GAP);
    });
    // ground
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, H - GROUND, W, GROUND);
    ctx.fillStyle = '#9ee37d';
    ctx.fillRect(0, H - GROUND, W, 14);
    // bird
    var tilt = Math.max(-0.4, Math.min(0.9, bird.vy / 900));
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(tilt);
    ctx.fillStyle = '#fbd343';
    ctx.beginPath(); ctx.arc(0, 0, bird.r, 0, 7); ctx.fill();
    ctx.fillStyle = '#f8a13a';
    var wa = bird.wing > 0.5 ? -0.9 : 0.5;
    ctx.save(); ctx.rotate(wa);
    ctx.beginPath(); ctx.ellipse(-4, -2, 9, 5, 0, 0, 7); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(6, -5, 4.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath(); ctx.arc(7.5, -5, 2, 0, 7); ctx.fill();
    ctx.fillStyle = '#fb923c';
    ctx.beginPath(); ctx.moveTo(bird.r - 2, 1); ctx.lineTo(bird.r + 9, 4); ctx.lineTo(bird.r - 2, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
    // overlays
    if (state === 'ready') {
      ctx.fillStyle = 'rgba(0,0,0,.45)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Tap / Space to flap', W / 2, H / 2 - 10);
      ctx.font = '16px sans-serif';
      ctx.fillText('Press Start, then flap!', W / 2, H / 2 + 22);
    } else if (state === 'over') {
      ctx.fillStyle = 'rgba(0,0,0,.5)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W / 2, H / 2 - 30);
      ctx.font = '20px sans-serif';
      ctx.fillText('Score: ' + score + '   Best: ' + best, W / 2, H / 2 + 8);
      ctx.font = '15px sans-serif';
      ctx.fillText('Press Start to play again', W / 2, H / 2 + 40);
    } else {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,.35)';
      ctx.lineWidth = 5;
      ctx.strokeText(String(score), W / 2, 80);
      ctx.fillText(String(score), W / 2, 80);
    }
  }
  function loop(ts) {
    if (state !== 'play') { draw(); raf = null; return; }
    if (!lastT) lastT = ts;
    var dt = Math.min(0.033, (ts - lastT) / 1000);
    lastT = ts;
    step(dt);
    draw();
    raf = requestAnimationFrame(loop);
  }
  function start() {
    reset();
    state = 'ready';
    setScore();
    draw();
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    lastT = 0;
  }
  function ensureLoop() {
    if (!raf && state === 'play') raf = requestAnimationFrame(loop);
    if (!raf && (state === 'ready' || state === 'over')) draw();
  }
  try {
    cv = g('canvas');
    if (!cv) return;
    ctx = cv.getContext('2d');
    reset();
    setScore();
    draw();
    TN.on(P + 'start', 'click', function () { start(); });
    cv.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (state === 'over') start();
      if (state === 'ready') state = 'play';
      flap();
      ensureLoop();
    });
    document.addEventListener('keydown', function (e) {
      if (!g('canvas')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (state === 'over') start();
        if (state === 'ready') state = 'play';
        flap();
        ensureLoop();
      }
    });
  } catch (e) { /* never throw on load */ }
})();
