(function () {
  'use strict';
  var P = 'asteroid-shooter-';
  function g(id) { return document.getElementById(P + id); }
  var W = 600, H = 420;
  var cv, ctx, ship, bullets, rocks, parts, keys, raf, lastT;
  var score, lives, level, best, state, invuln, fireCd;
  var LS = 'tn-asteroid-shooter-best';
  try { best = parseInt(localStorage.getItem(LS) || '0', 10) || 0; } catch (e) { best = 0; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function wrap(o) {
    if (o.x < -30) o.x = W + 30; if (o.x > W + 30) o.x = -30;
    if (o.y < -30) o.y = H + 30; if (o.y > H + 30) o.y = -30;
  }
  function newShip() {
    return { x: W / 2, y: H / 2, vx: 0, vy: 0, a: -Math.PI / 2, r: 12 };
  }
  function spawnRocks(n, spd) {
    rocks = [];
    for (var i = 0; i < n; i++) {
      var x, y, tries = 0;
      do {
        x = rnd(0, W); y = rnd(0, H);
        tries++;
      } while (tries < 20 && Math.abs(x - W / 2) < 120 && Math.abs(y - H / 2) < 120);
      rocks.push({ x: x, y: y, vx: rnd(-spd, spd), vy: rnd(-spd, spd), r: rnd(30, 42), rot: rnd(0, 6.28), vr: rnd(-1, 1), verts: makeVerts() });
    }
  }
  function makeVerts() {
    var v = [], n = 9 + Math.floor(Math.random() * 4);
    for (var i = 0; i < n; i++) v.push(rnd(0.75, 1.15));
    return v;
  }
  function reset() {
    ship = newShip();
    bullets = []; parts = [];
    score = 0; lives = 3; level = 1;
    state = 'ready'; invuln = 0; fireCd = 0;
    spawnRocks(4, 40);
  }
  function setStats() {
    var s = g('score'); if (s) s.textContent = String(score);
    var l = g('lives'); if (l) l.textContent = String(lives);
    var lv = g('level'); if (lv) lv.textContent = String(level);
    var b = g('best'); if (b) b.textContent = String(best);
  }
  function fire() {
    if (fireCd > 0 || state !== 'play') return;
    fireCd = 0.22;
    bullets.push({
      x: ship.x + Math.cos(ship.a) * 16, y: ship.y + Math.sin(ship.a) * 16,
      vx: ship.vx + Math.cos(ship.a) * 420, vy: ship.vy + Math.sin(ship.a) * 420,
      life: 1.1
    });
  }
  function explode(x, y, n, col) {
    for (var i = 0; i < n; i++) {
      var a = rnd(0, 6.28), s = rnd(40, 160);
      parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.3, 0.8), col: col });
    }
  }
  function splitRock(idx) {
    var r = rocks[idx];
    rocks.splice(idx, 1);
    var pts = r.r > 26 ? 20 : (r.r > 15 ? 50 : 100);
    score += pts;
    explode(r.x, r.y, 10, '#fdba74');
    if (r.r > 26) {
      for (var i = 0; i < 2; i++) rocks.push({ x: r.x + rnd(-8, 8), y: r.y + rnd(-8, 8), vx: r.vx + rnd(-70, 70), vy: r.vy + rnd(-70, 70), r: r.r * 0.55, rot: 0, vr: rnd(-2, 2), verts: makeVerts() });
    } else if (r.r > 15) {
      for (var j = 0; j < 2; j++) rocks.push({ x: r.x + rnd(-6, 6), y: r.y + rnd(-6, 6), vx: r.vx + rnd(-90, 90), vy: r.vy + rnd(-90, 90), r: r.r * 0.5, rot: 0, vr: rnd(-3, 3), verts: makeVerts() });
    }
    setStats();
    if (!rocks.length) {
      level++;
      setStats();
      spawnRocks(3 + level, 35 + level * 12);
      ship.x = W / 2; ship.y = H / 2; ship.vx = 0; ship.vy = 0;
      invuln = 2;
    }
  }
  function hitShip() {
    if (invuln > 0) return;
    lives--;
    explode(ship.x, ship.y, 22, '#f87171');
    setStats();
    if (lives <= 0) {
      state = 'over';
      if (score > best) { best = score; try { localStorage.setItem(LS, String(best)); } catch (e) {} }
      setStats();
    } else {
      ship = newShip();
      invuln = 2.5;
    }
  }
  function step(dt) {
    fireCd = Math.max(0, fireCd - dt);
    invuln = Math.max(0, invuln - dt);
    if (keys.left) ship.a -= 3.4 * dt;
    if (keys.right) ship.a += 3.4 * dt;
    if (keys.up) {
      ship.vx += Math.cos(ship.a) * 320 * dt;
      ship.vy += Math.sin(ship.a) * 320 * dt;
      parts.push({ x: ship.x - Math.cos(ship.a) * 14, y: ship.y - Math.sin(ship.a) * 14, vx: rnd(-30, 30) - Math.cos(ship.a) * 80, vy: rnd(-30, 30) - Math.sin(ship.a) * 80, life: 0.35, col: '#fcd34d' });
    }
    if (keys.fire) fire();
    ship.vx *= (1 - 0.4 * dt); ship.vy *= (1 - 0.4 * dt);
    ship.x += ship.vx * dt; ship.y += ship.vy * dt;
    wrap(ship);
    for (var i = bullets.length - 1; i >= 0; i--) {
      var b = bullets[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      var dead = b.life <= 0 || b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20;
      if (!dead) {
        for (var j = rocks.length - 1; j >= 0; j--) {
          if (dist(b, rocks[j]) < rocks[j].r) { splitRock(j); dead = true; break; }
        }
      }
      if (dead) bullets.splice(i, 1);
    }
    for (var k = 0; k < rocks.length; k++) {
      var r = rocks[k];
      r.x += r.vx * dt; r.y += r.vy * dt; r.rot += r.vr * dt;
      wrap(r);
      if (state === 'play' && dist(ship, r) < r.r + ship.r - 4) { hitShip(); break; }
    }
    for (var m = parts.length - 1; m >= 0; m--) {
      var pt = parts[m];
      pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.life -= dt;
      if (pt.life <= 0) parts.splice(m, 1);
    }
  }
  function drawRock(r) {
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.rot);
    ctx.beginPath();
    var n = r.verts.length;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2, rad = r.r * r.verts[i];
      if (!i) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
      else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.strokeStyle = '#a8a29e'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
  function draw() {
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    for (var s = 0; s < 60; s++) {
      var sx = (s * 97) % W, sy = (s * 61) % H;
      ctx.globalAlpha = 0.25 + ((s * 13) % 10) / 22;
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1;
    rocks.forEach(drawRock);
    parts.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, p.life * 2);
      ctx.fillStyle = p.col;
      ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
    });
    ctx.globalAlpha = 1;
    bullets.forEach(function (b) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath(); ctx.arc(b.x, b.y, 2.5, 0, 7); ctx.fill();
    });
    if (state !== 'over') {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.a);
      if (invuln > 0 && Math.floor(invuln * 8) % 2 === 0) ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(16, 0); ctx.lineTo(-10, 10); ctx.lineTo(-6, 0); ctx.lineTo(-10, -10);
      ctx.closePath(); ctx.stroke();
      if (keys.up) {
        ctx.fillStyle = '#fb923c';
        ctx.beginPath(); ctx.moveTo(-8, 5); ctx.lineTo(-20 - Math.random() * 8, 0); ctx.lineTo(-8, -5); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    if (state === 'ready' || state === 'over') {
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      if (state === 'ready') {
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText('ASTEROID SHOOTER', W / 2, H / 2 - 30);
        ctx.font = '15px sans-serif';
        ctx.fillText('←/→ rotate · ↑ thrust · Space fire', W / 2, H / 2 + 4);
        ctx.fillText('Press Start to launch', W / 2, H / 2 + 32);
      } else {
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 30);
        ctx.font = '19px sans-serif';
        ctx.fillText('Score: ' + score + '   Best: ' + best, W / 2, H / 2 + 6);
        ctx.font = '15px sans-serif';
        ctx.fillText('Press Start to fly again', W / 2, H / 2 + 36);
      }
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
    if (!raf) { lastT = 0; raf = requestAnimationFrame(loop); }
  }
  try {
    cv = g('canvas');
    if (!cv) return;
    ctx = cv.getContext('2d');
    keys = { left: false, right: false, up: false, fire: false };
    reset();
    setStats();
    draw();
    TN.on(P + 'start', 'click', start);
    var keymap = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ' ': 'fire', a: 'left', d: 'right', w: 'up' };
    document.addEventListener('keydown', function (e) {
      if (!g('canvas')) return;
      var k = keymap[e.key];
      if (k) { keys[k] = true; e.preventDefault(); }
    });
    document.addEventListener('keyup', function (e) {
      var k = keymap[e.key];
      if (k) keys[k] = false;
    });
    var touch = g('touch');
    if (touch) {
      var btns = touch.querySelectorAll('button');
      for (var i = 0; i < btns.length; i++) {
        (function (b) {
          var k = b.getAttribute('data-k');
          function on(e) { e.preventDefault(); keys[k] = true; if (state === 'ready') start(); }
          function off(e) { e.preventDefault(); keys[k] = false; }
          b.addEventListener('pointerdown', on);
          b.addEventListener('pointerup', off);
          b.addEventListener('pointerleave', off);
        })(btns[i]);
      }
    }
  } catch (e) { /* never throw on load */ }
})();
