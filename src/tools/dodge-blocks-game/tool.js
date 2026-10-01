(function () {
  'use strict';
  var P = 'dodge-blocks-game-';
  function g(id) { return document.getElementById(P + id); }
  var W = 400, H = 520;
  var cv, ctx, player, blocks, state, raf, lastT, elapsed, spawnT, best, left, right;
  var LS = 'tn-dodge-blocks-game-best';
  try { best = parseFloat(localStorage.getItem(LS) || '0') || 0; } catch (e) { best = 0; }
  function reset() {
    player = { x: W / 2 - 16, y: H - 70, w: 32, h: 32, vx: 0 };
    blocks = [];
    elapsed = 0; spawnT = 0;
    state = 'ready';
    left = false; right = false;
  }
  function setStats() {
    var s = g('score'); if (s) s.textContent = elapsed.toFixed(1) + 's';
    var b = g('best'); if (b) b.textContent = best.toFixed(1) + 's';
  }
  function difficulty() {
    return {
      interval: Math.max(0.18, 0.7 - elapsed * 0.012),
      speed: Math.min(520, 150 + elapsed * 9),
      size: [22, 46]
    };
  }
  function spawnBlock() {
    var d = difficulty();
    var w = d.size[0] + Math.random() * (d.size[1] - d.size[0]);
    blocks.push({
      x: Math.random() * (W - w), y: -50, w: w, h: w * (0.6 + Math.random() * 0.8),
      vy: d.speed * (0.8 + Math.random() * 0.5), hue: Math.floor(Math.random() * 360)
    });
  }
  function die() {
    state = 'over';
    if (elapsed > best) {
      best = elapsed;
      try { localStorage.setItem(LS, String(best)); } catch (e) {}
    }
    setStats();
  }
  function step(dt) {
    elapsed += dt;
    var d = difficulty();
    spawnT -= dt;
    if (spawnT <= 0) { spawnBlock(); spawnT = d.interval; }
    var acc = 2400, maxV = 420;
    if (left) player.vx = Math.max(-maxV, player.vx - acc * dt);
    if (right) player.vx = Math.min(maxV, player.vx + acc * dt);
    if (!left && !right) player.vx *= (1 - Math.min(1, 8 * dt));
    player.x += player.vx * dt;
    if (player.x < 0) { player.x = 0; player.vx = 0; }
    if (player.x + player.w > W) { player.x = W - player.w; player.vx = 0; }
    for (var i = blocks.length - 1; i >= 0; i--) {
      var b = blocks[i];
      b.y += b.vy * dt;
      if (b.y > H + 60) { blocks.splice(i, 1); continue; }
      if (b.x < player.x + player.w - 4 && b.x + b.w > player.x + 4 &&
          b.y < player.y + player.h - 4 && b.y + b.h > player.y + 4) {
        die();
        return;
      }
    }
    setStats();
  }
  function draw() {
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, W, H);
    // subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,.04)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx <= W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (var gy = 0; gy <= H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
    blocks.forEach(function (b) {
      var gr = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
      gr.addColorStop(0, 'hsl(' + b.hue + ',70%,55%)');
      gr.addColorStop(1, 'hsl(' + b.hue + ',70%,40%)');
      ctx.fillStyle = gr;
      var r = 6;
      ctx.beginPath();
      ctx.moveTo(b.x + r, b.y);
      ctx.arcTo(b.x + b.w, b.y, b.x + b.w, b.y + b.h, r);
      ctx.arcTo(b.x + b.w, b.y + b.h, b.x, b.y + b.h, r);
      ctx.arcTo(b.x, b.y + b.h, b.x, b.y, r);
      ctx.arcTo(b.x, b.y, b.x + b.w, b.y, r);
      ctx.closePath();
      ctx.fill();
    });
    // player
    if (state !== 'over') {
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      var px = player.x, py = player.y, pw = player.w, ph = player.h, pr = 8;
      ctx.moveTo(px + pr, py);
      ctx.arcTo(px + pw, py, px + pw, py + ph, pr);
      ctx.arcTo(px + pw, py + ph, px, py + ph, pr);
      ctx.arcTo(px, py + ph, px, py, pr);
      ctx.arcTo(px, py, px + pw, py, pr);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#166534';
      ctx.beginPath(); ctx.arc(px + pw / 2, py + ph / 2, 6, 0, 7); ctx.fill();
    } else {
      // explosion particles (simple)
      ctx.fillStyle = 'rgba(248,113,113,.8)';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
      ctx.fillStyle = '#fff';
      ctx.font = '19px sans-serif';
      ctx.fillText('Survived ' + elapsed.toFixed(1) + 's   Best ' + best.toFixed(1) + 's', W / 2, H / 2 + 14);
      ctx.font = '15px sans-serif';
      ctx.fillText('Press Start to retry', W / 2, H / 2 + 42);
    }
    if (state === 'ready') {
      ctx.fillStyle = 'rgba(0,0,0,.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('DODGE BLOCKS', W / 2, H / 2 - 20);
      ctx.font = '15px sans-serif';
      ctx.fillText('←/→ move · drag on touch', W / 2, H / 2 + 12);
      ctx.fillText('Press Start', W / 2, H / 2 + 38);
    }
  }
  function loop(ts) {
    if (!lastT) lastT = ts;
    var dt = Math.min(0.033, (ts - lastT) / 1000);
    lastT = ts;
    if (state === 'play') step(dt);
    draw();
    raf = requestAnimationFrame(loop);
  }
  function start() {
    reset();
    state = 'play';
    setStats();
    lastT = 0;
    if (!raf) raf = requestAnimationFrame(loop);
  }
  try {
    cv = g('canvas');
    if (!cv) return;
    ctx = cv.getContext('2d');
    reset();
    setStats();
    draw();
    TN.on(P + 'start', 'click', start);
    document.addEventListener('keydown', function (e) {
      if (!g('canvas')) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { left = true; e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { right = true; e.preventDefault(); }
    });
    document.addEventListener('keyup', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') right = false;
    });
    var dragging = false;
    function moveTo(clientX) {
      var rect = cv.getBoundingClientRect();
      var x = (clientX - rect.left) * (W / rect.width);
      player.x = Math.max(0, Math.min(W - player.w, x - player.w / 2));
      player.vx = 0;
    }
    cv.addEventListener('pointerdown', function (e) {
      if (state !== 'play') return;
      dragging = true;
      moveTo(e.clientX);
    });
    cv.addEventListener('pointermove', function (e) { if (dragging && state === 'play') moveTo(e.clientX); });
    cv.addEventListener('pointerup', function () { dragging = false; });
    cv.addEventListener('pointercancel', function () { dragging = false; });
  } catch (e) { /* never throw on load */ }
})();
