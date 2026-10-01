/* Battleship — 10x10, manual/auto placement, hunt-target AI, hit/miss/sunk. */
(function () {
  'use strict';
  var SLUG = 'battleship-game';
  var N = 10;
  var SHIPS = [
    { name: 'Carrier', size: 5 }, { name: 'Battleship', size: 4 }, { name: 'Cruiser', size: 3 },
    { name: 'Submarine', size: 3 }, { name: 'Destroyer', size: 2 }
  ];
  var own = [], foe = [];           // arrays of {ship: shipIdx|null, hit: bool}
  var ownShips = [], foeShips = []; // {name,size,cells:[],hits:0,sunk:false}
  var selShip = 0, horiz = true, phase = 'place', over = false;
  var shots = 0, hits = 0;
  var aiTargets = [], aiShots = {}; // computer targeting

  function $(id) { return document.getElementById(id); }
  function rc(i) { return [Math.floor(i / N), i % N]; }

  function emptySide() {
    var cells = [];
    for (var i = 0; i < N * N; i++) cells.push({ ship: null, hit: false });
    return { cells: cells, ships: [] };
  }

  function canPlace(cells, r, c, size, h) {
    if (h && c + size > N) return null;
    if (!h && r + size > N) return null;
    var list = [];
    for (var k = 0; k < size; k++) {
      var rr = h ? r : r + k, cc = h ? c + k : c;
      var i = rr * N + cc;
      if (cells[i].ship !== null) return null;
      list.push(i);
    }
    return list;
  }

  function doPlace(side, shipIdx, list) {
    var s = SHIPS[shipIdx];
    for (var k = 0; k < list.length; k++) side.cells[list[k]].ship = shipIdx;
    side.ships.push({ name: s.name, size: s.size, cells: list.slice(), hits: 0, sunk: false });
  }

  function autoPlace(side) {
    for (var si = 0; si < SHIPS.length; si++) {
      var guard = 0;
      while (guard++ < 500) {
        var h = Math.random() < 0.5;
        var r = Math.floor(Math.random() * N), c = Math.floor(Math.random() * N);
        var list = canPlace(side.cells, r, c, SHIPS[si].size, h);
        if (list) { doPlace(side, si, list); break; }
      }
    }
  }

  function log(msg) {
    var l = $('battleship-game-log');
    var d = document.createElement('div');
    d.textContent = msg;
    l.insertBefore(d, l.firstChild);
  }

  function render() {
    for (var i = 0; i < N * N; i++) {
      var o = $('battleship-game-own-' + i), f = $('battleship-game-foe-' + i);
      var oc = own.cells[i], fc = foe.cells[i];
      if (o) {
        if (oc.hit && oc.ship !== null) { o.textContent = '🔥'; o.style.background = '#ef9a9a'; }
        else if (oc.hit) { o.textContent = '·'; o.style.background = '#b3e5fc'; }
        else if (oc.ship !== null) { o.textContent = ''; o.style.background = '#78909c'; }
        else { o.textContent = ''; o.style.background = '#eceff1'; }
      }
      if (f) {
        if (fc.hit && fc.ship !== null) { f.textContent = '🔥'; f.style.background = '#ef9a9a'; }
        else if (fc.hit) { f.textContent = '·'; f.style.background = '#b3e5fc'; }
        else { f.textContent = ''; f.style.background = '#eceff1'; }
      }
    }
    var ys = ownShips.filter(function (s) { return !s.sunk; }).length;
    var fs = foeShips.filter(function (s) { return !s.sunk; }).length;
    $('battleship-game-youships').textContent = ys;
    $('battleship-game-foeships').textContent = fs;
    $('battleship-game-shots').textContent = shots;
    $('battleship-game-hits').textContent = hits;
  }

  function buildGrids() {
    var ob = $('battleship-game-own'), fb = $('battleship-game-foe');
    ob.innerHTML = ''; fb.innerHTML = '';
    for (var i = 0; i < N * N; i++) {
      (function (idx) {
        var d = document.createElement('div');
        d.id = 'battleship-game-own-' + idx;
        d.style.cssText = 'width:26px;height:26px;border-radius:3px;background:#eceff1;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;touch-action:manipulation';
        d.addEventListener('click', function () { placeClick(idx); });
        ob.appendChild(d);
        var e = document.createElement('div');
        e.id = 'battleship-game-foe-' + idx;
        e.style.cssText = 'width:26px;height:26px;border-radius:3px;background:#eceff1;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;touch-action:manipulation';
        e.addEventListener('click', function () { fire(idx); });
        fb.appendChild(e);
      })(i);
    }
  }

  function refreshShipList() {
    var box = $('battleship-game-shiplist');
    box.innerHTML = '';
    var allPlaced = ownShips.length === SHIPS.length;
    SHIPS.forEach(function (s, si) {
      var placed = ownShips.some(function (x) { return x.name === s.name; });
      var b = document.createElement('button');
      b.className = 'btn ' + (placed ? 'btn-outline' : (si === selShip ? 'btn-primary' : 'btn-outline'));
      b.style.cssText = 'font-size:13px;padding:6px 10px';
      b.textContent = (placed ? '✓ ' : '') + s.name + ' (' + s.size + ')';
      b.disabled = placed || allPlaced;
      b.addEventListener('click', function () { selShip = si; refreshShipList(); });
      box.appendChild(b);
    });
    $('battleship-game-start').disabled = !allPlaced;
  }

  function placeClick(idx) {
    if (phase !== 'place' || over) return;
    if (ownShips.some(function (x) { return x.name === SHIPS[selShip].name; })) return;
    var r = Math.floor(idx / N), c = idx % N;
    var list = canPlace(own.cells, r, c, SHIPS[selShip].size, horiz);
    if (!list) {
      $('battleship-game-msg').textContent = '⚠ Cannot place ' + SHIPS[selShip].name + ' there — try another spot or orientation.';
      return;
    }
    doPlace(own, selShip, list);
    log('Deployed your ' + SHIPS[selShip].name + '.');
    // select next unplaced ship
    for (var si = 0; si < SHIPS.length; si++) {
      if (!ownShips.some(function (x) { return x.name === SHIPS[si].name; })) { selShip = si; break; }
    }
    refreshShipList();
    render();
    if (ownShips.length === SHIPS.length) $('battleship-game-msg').textContent = 'Fleet ready! Press ⚔ Start Battle.';
  }

  function startBattle() {
    if (ownShips.length !== SHIPS.length) return;
    phase = 'battle';
    foeShips = foe.ships;
    $('battleship-game-setup').style.display = 'none';
    $('battleship-game-msg').textContent = '⚔ Battle! Tap enemy waters to fire.';
    log('Battle started. Good hunting!');
  }

  function fire(idx) {
    if (phase !== 'battle' || over) return;
    var cell = foe.cells[idx];
    if (cell.hit) return;
    cell.hit = true;
    shots++;
    if (cell.ship !== null) {
      hits++;
      var s = foeShips[cell.ship];
      s.hits++;
      log('🔥 HIT on enemy waters!' + (s.hits === s.size ? ' You SUNK the enemy ' + s.name + '!' : ''));
      if (s.hits === s.size) s.sunk = true;
    } else {
      log('· Miss.');
    }
    render();
    if (foeShips.every(function (s) { return s.sunk; })) return endGame(true);
    setTimeout(aiMove, 450);
  }

  function aiMove() {
    if (over || phase !== 'battle') return;
    var idx = -1;
    // target mode: pop queued neighbors
    while (aiTargets.length) {
      var t = aiTargets.pop();
      if (!own.cells[t].hit) { idx = t; break; }
    }
    // hunt mode: random unshot, checkerboard parity first
    if (idx < 0) {
      var cands = [], cands2 = [];
      for (var i = 0; i < N * N; i++) {
        if (own.cells[i].hit) continue;
        var r = Math.floor(i / N), c = i % N;
        if ((r + c) % 2 === 0) cands.push(i); else cands2.push(i);
      }
      var pool = cands.length ? cands : cands2;
      idx = pool[Math.floor(Math.random() * pool.length)];
    }
    var cell = own.cells[idx];
    cell.hit = true;
    aiShots[idx] = 1;
    if (cell.ship !== null) {
      var s = ownShips[cell.ship];
      s.hits++;
      // queue orthogonal neighbors
      var r2 = Math.floor(idx / N), c2 = idx % N;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var nr = r2 + d[0], nc = c2 + d[1];
        if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
          var ni = nr * N + nc;
          if (!own.cells[ni].hit && aiTargets.indexOf(ni) === -1) aiTargets.push(ni);
        }
      });
      if (s.hits === s.size) {
        s.sunk = true;
        // drop targets belonging to sunk ship area
        aiTargets = aiTargets.filter(function (t) { return s.cells.indexOf(t) === -1; });
        log('💥 Enemy SUNK your ' + s.name + '!');
      } else {
        log('🔥 Enemy hit your ship!');
      }
    } else {
      log('· Enemy missed.');
    }
    render();
    if (ownShips.every(function (s) { return s.sunk; })) return endGame(false);
  }

  function endGame(won) {
    over = true;
    // reveal enemy ships
    foe.cells.forEach(function (cell, i) {
      var el = $('battleship-game-foe-' + i);
      if (cell.ship !== null && !cell.hit && el) { el.style.background = '#b0bec5'; el.textContent = '▦'; }
    });
    $('battleship-game-msg').textContent = won
      ? '🏆 Victory! You sank the entire enemy fleet in ' + shots + ' shots.'
      : '💀 Defeat — your fleet was sunk. Press New game to try again.';
    log(won ? '🏆 Victory!' : '💀 Defeat.');
  }

  function newGame() {
    own = emptySide(); foe = emptySide();
    ownShips = own.ships;
    autoPlace(foe);
    foeShips = foe.ships;
    selShip = 0; horiz = true; phase = 'place'; over = false;
    shots = 0; hits = 0; aiTargets = []; aiShots = {};
    $('battleship-game-setup').style.display = '';
    $('battleship-game-log').innerHTML = '';
    $('battleship-game-orient').textContent = 'Orientation: Horizontal →';
    $('battleship-game-msg').textContent = 'Place your ships, then start the battle!';
    buildGrids();
    refreshShipList();
    render();
  }

  try {
    TN.on('battleship-game-new', 'click', newGame);
    TN.on('battleship-game-start', 'click', startBattle);
    TN.on('battleship-game-auto', 'click', function () {
      if (phase !== 'place') return;
      own = emptySide(); ownShips = own.ships;
      autoPlace(own);
      ownShips = own.ships;
      refreshShipList();
      render();
      $('battleship-game-msg').textContent = 'Fleet auto-deployed! Press ⚔ Start Battle.';
    });
    TN.on('battleship-game-orient', 'click', function () {
      horiz = !horiz;
      $('battleship-game-orient').textContent = 'Orientation: ' + (horiz ? 'Horizontal →' : 'Vertical ↓');
    });
    newGame();
  } catch (e) { /* never throw on load */ }
})();
