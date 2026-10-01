(function () {
  'use strict';
  var P = 'mancala-game-';
  function g(id) { return document.getElementById(P + id); }
  // pits 0-5 you, 6 your store, 7-12 computer, 13 computer store
  var pits = [], turn = 0, over = false; // turn 0 = you, 1 = computer
  function setup() {
    pits = [];
    for (var i = 0; i < 14; i++) pits.push((i === 6 || i === 13) ? 0 : 4);
    turn = 0; over = false;
  }
  function status(t) { var el = g('status'); if (el) el.textContent = t; }
  function sideEmpty(side) {
    var s = side === 0 ? 0 : 7;
    for (var i = 0; i < 6; i++) if (pits[s + i] > 0) return false;
    return true;
  }
  function sweep() {
    for (var i = 0; i < 6; i++) { pits[6] += pits[i]; pits[i] = 0; }
    for (var j = 7; j < 13; j++) { pits[13] += pits[j]; pits[j] = 0; }
  }
  // returns {extra:boolean} — mutates pits
  function sow(side, pitIdx) {
    var stones = pits[pitIdx];
    pits[pitIdx] = 0;
    var i = pitIdx, store = side === 0 ? 6 : 13, skip = side === 0 ? 13 : 6;
    while (stones > 0) {
      i = (i + 1) % 14;
      if (i === skip) continue;
      pits[i]++;
      stones--;
    }
    var extra = (i === store);
    // capture
    var ownStart = side === 0 ? 0 : 7;
    if (!extra && i >= ownStart && i < ownStart + 6 && pits[i] === 1) {
      var opp = 12 - i;
      if (pits[opp] > 0) {
        pits[store] += pits[opp] + 1;
        pits[opp] = 0; pits[i] = 0;
      }
    }
    return { extra: extra };
  }
  function legal(side) {
    var s = side === 0 ? 0 : 7, out = [];
    for (var i = 0; i < 6; i++) if (pits[s + i] > 0) out.push(s + i);
    return out;
  }
  function aiPick() {
    var moves = legal(1), best = moves[0], bestS = -1e9;
    for (var k = 0; k < moves.length; k++) {
      var m = moves[k];
      var stones = pits[m], land = m + stones;
      var s = Math.random() * 2;
      // extra turn?
      var sim = pits.slice(), idx = m, st = sim[m];
      sim[m] = 0; var ii = idx;
      while (st > 0) { ii = (ii + 1) % 14; if (ii === 6) continue; sim[ii]++; st--; }
      if (ii === 13) s += 12; // extra turn
      var ownStart = 7;
      if (ii >= 7 && ii < 13 && sim[ii] === 1 && sim[12 - ii] > 0) s += 6 + sim[12 - ii]; // capture value
      s += sim[13] * 0.1;
      if (s > bestS) { bestS = s; best = m; }
    }
    return best;
  }
  function render() {
    var ry = g('row-you'), ra = g('row-ai'), sy = g('store-you'), sa = g('store-ai');
    if (!ry) return;
    ry.innerHTML = ''; ra.innerHTML = '';
    function pitBtn(idx, clickable) {
      var b = document.createElement('button');
      b.type = 'button';
      b.style.cssText = 'aspect-ratio:1;border:0;border-radius:50%;background:' + (pits[idx] ? '#a16207' : '#573d1c') + ';color:#fef3c7;font-weight:800;font-size:18px;cursor:' + (clickable ? 'pointer' : 'default') + ';box-shadow:inset 0 3px 6px rgba(0,0,0,.5);';
      b.textContent = String(pits[idx]);
      b.setAttribute('aria-label', 'Pit with ' + pits[idx] + ' stones');
      if (clickable) b.addEventListener('click', function () { onPit(idx); });
      return b;
    }
    for (var i = 0; i < 6; i++) ry.appendChild(pitBtn(i, !over && turn === 0 && pits[i] > 0));
    for (var j = 5; j >= 0; j--) ra.appendChild(pitBtn(7 + j, false));
    if (sy) { sy.innerHTML = '<span style="font-size:11px;font-weight:600">YOU</span><span>' + pits[6] + '</span>'; }
    if (sa) { sa.innerHTML = '<span style="font-size:11px;font-weight:600">CPU</span><span>' + pits[13] + '</span>'; }
    var syy = g('sy'), saa = g('sa');
    if (syy) syy.textContent = String(pits[6]);
    if (saa) saa.textContent = String(pits[13]);
  }
  function onPit(idx) {
    if (over || turn !== 0 || !pits[idx]) return;
    playMove(0, idx);
  }
  function playMove(side, idx) {
    var res = sow(side, idx);
    if (sideEmpty(0) || sideEmpty(1)) {
      sweep(); over = true; render();
      var y = pits[6], a = pits[13];
      status(y > a ? '🎉 You win ' + y + '–' + a + '!' : (a > y ? '🤖 Computer wins ' + a + '–' + y + '.' : '🤝 Draw, ' + y + '–' + a + '!'));
      return;
    }
    if (!res.extra) turn = 1 - side; else turn = side;
    render();
    if (!over && turn === 1) {
      status(res.extra && side === 1 ? 'Computer earned a free turn…' : 'Computer is thinking…');
      setTimeout(aiTurn, 500);
    } else if (!over) {
      status(res.extra ? 'Free turn! Move again.' : 'Your move — pick a pit.');
    }
  }
  function aiTurn() {
    if (over || turn !== 1) return;
    var m = aiPick();
    if (m === undefined) { // no legal move — game ends
      sweep(); over = true; render();
      var y = pits[6], a = pits[13];
      status(y > a ? '🎉 You win ' + y + '–' + a + '!' : (a > y ? '🤖 Computer wins ' + a + '–' + y + '.' : '🤝 Draw, ' + y + '–' + a + '!'));
      return;
    }
    playMove(1, m);
  }
  function reset() {
    setup();
    TN.clearErr(P + 'error');
    render();
    status('Your move — click one of your pits (bottom row).');
  }
  try {
    if (!g('row-you')) return;
    TN.on(P + 'new', 'click', reset);
    reset();
  } catch (e) { /* never throw on load */ }
})();
