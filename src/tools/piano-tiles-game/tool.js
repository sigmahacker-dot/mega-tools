(function () {
  'use strict';
  var P = 'piano-tiles-game-';
  function g(id) { return document.getElementById(P + id); }
  var TILE_H = 110, STAGE_H = 440;
  var tiles = [], score = 0, best = 0, state = 'ready', raf = null, lastT = 0, speed = 0, spawnY = 0;
  var LS = 'tn-piano-tiles-game-best';
  try { best = parseInt(localStorage.getItem(LS) || '0', 10) || 0; } catch (e) { best = 0; }
  function setStats() {
    var s = g('score'); if (s) s.textContent = String(score);
    var b = g('best'); if (b) b.textContent = String(best);
  }
  function clearTiles() {
    var layer = g('tiles');
    if (layer) layer.innerHTML = '';
    tiles = [];
  }
  function spawnTile() {
    var layer = g('tiles');
    if (!layer) return;
    var col = Math.floor(Math.random() * 4);
    // avoid same column 3 times in a row
    var n = tiles.length;
    if (n >= 2 && tiles[n - 1].col === col && tiles[n - 2].col === col) col = (col + 1 + Math.floor(Math.random() * 3)) % 4;
    var d = document.createElement('div');
    d.style.cssText = 'position:absolute;top:' + spawnY + 'px;left:' + (col * 25) + '%;width:25%;height:' + TILE_H + 'px;background:#1c1917;border-radius:6px;cursor:pointer;box-sizing:border-box;border:1px solid #44403c';
    d.setAttribute('role', 'button');
    d.setAttribute('aria-label', 'Black tile');
    var t = { col: col, y: spawnY, el: d, hit: false };
    d.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      tapTile(t);
    });
    layer.appendChild(d);
    tiles.push(t);
    spawnY -= TILE_H;
  }
  function tapTile(t) {
    if (state !== 'play' || t.hit) return;
    t.hit = true;
    t.el.style.background = '#4D7C0F';
    score++;
    speed = 200 + score * 9;
    setStats();
    setTimeout(function () { if (t.el.parentNode) t.el.parentNode.removeChild(t.el); }, 180);
    tiles.splice(tiles.indexOf(t), 1);
  }
  function gameOver(reason) {
    state = 'over';
    if (score > best) { best = score; try { localStorage.setItem(LS, String(best)); } catch (e) {} }
    setStats();
    var stage = g('stage');
    if (stage) {
      var ov = document.createElement('div');
      ov.id = P + 'overlay';
      ov.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.65);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;z-index:5;gap:8px';
      ov.innerHTML = '<div style="font-size:26px;font-weight:800">Game Over</div><div style="font-size:14px">' + TN.esc(reason) + '</div><div style="font-size:18px">Score: ' + score + ' · Best: ' + best + '</div>';
      var b = document.createElement('button');
      b.className = 'btn btn-primary';
      b.textContent = 'Play again';
      b.addEventListener('click', function (e) { e.stopPropagation(); start(); });
      ov.appendChild(b);
      stage.appendChild(ov);
    }
  }
  function start() {
    var old = document.getElementById(P + 'overlay');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    clearTiles();
    score = 0; speed = 200; spawnY = -TILE_H / 2;
    state = 'play';
    setStats();
    spawnTile(); spawnTile(); spawnTile(); spawnTile();
    lastT = 0;
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function loop(ts) {
    if (!lastT) lastT = ts;
    var dt = Math.min(0.05, (ts - lastT) / 1000);
    lastT = ts;
    if (state === 'play') {
      for (var i = tiles.length - 1; i >= 0; i--) {
        var t = tiles[i];
        if (t.hit) continue;
        t.y += speed * dt;
        t.el.style.top = t.y + 'px';
        if (t.y > STAGE_H - 8) { gameOver('You missed a tile!'); break; }
      }
      var top = tiles.length ? tiles[tiles.length - 1].y : 0;
      while (top > -TILE_H * 2 && state === 'play') { spawnTile(); top = tiles[tiles.length - 1].y; }
      raf = requestAnimationFrame(loop);
    } else {
      raf = null;
    }
  }
  try {
    if (!g('stage')) return;
    setStats();
    TN.on(P + 'start', 'click', start);
    var stage = g('stage');
    stage.addEventListener('pointerdown', function () {
      if (state === 'play') gameOver('You tapped a white tile!');
    });
  } catch (e) { /* never throw on load */ }
})();
