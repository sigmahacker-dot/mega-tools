(function () {
  'use strict';
  var P = 'darts-score-tracker-';
  function g(id) { return document.getElementById(P + id); }
  // dart value -> canonical label(s)
  var VALS = {};
  (function () {
    var i;
    for (i = 1; i <= 20; i++) VALS[i] = VALS[i] || [];
    for (i = 1; i <= 20; i++) VALS[i].push('S' + i);
    for (i = 1; i <= 20; i++) { VALS[i * 2] = VALS[i * 2] || []; VALS[i * 2].push('D' + i); }
    for (i = 1; i <= 20; i++) { VALS[i * 3] = VALS[i * 3] || []; VALS[i * 3].push('T' + i); }
    VALS[25] = ['S25'];
    VALS[50] = ['Bull'];
  })();
  var DOUBLES = [];
  (function () {
    for (var i = 1; i <= 20; i++) DOUBLES.push({ v: i * 2, l: 'D' + i });
    DOUBLES.push({ v: 50, l: 'Bull' });
  })();
  var ALL_DARTS = [];
  (function () {
    for (var v = 0; v <= 60; v++) {
      if (VALS[v]) for (var i = 0; i < VALS[v].length; i++) ALL_DARTS.push({ v: v, l: VALS[v][i] });
    }
  })();
  // checkout table 2..170 computed with real darts math
  var CHECKOUTS = {};
  (function () {
    function singleLabel(v) {
      if (!VALS[v]) return null;
      // prefer triple, then single, then double for setup darts
      for (var i = 0; i < VALS[v].length; i++) if (VALS[v][i][0] === 'T') return VALS[v][i];
      return VALS[v][0];
    }
    for (var r = 2; r <= 170; r++) {
      var found = null;
      for (var d = DOUBLES.length - 1; d >= 0 && !found; d--) {
        var last = DOUBLES[d], rem = r - last.v;
        if (rem < 0) continue;
        if (rem === 0) { found = [last.l]; break; }
        var s1 = singleLabel(rem);
        if (s1) { found = [s1, last.l]; break; }
        for (var m = ALL_DARTS.length - 1; m >= 0 && !found; m--) {
          var mid = ALL_DARTS[m], rem2 = rem - mid.v;
          if (rem2 < 0) continue;
          var s2 = singleLabel(rem2);
          if (s2) found = [s2, mid.l, last.l];
        }
      }
      if (found) CHECKOUTS[r] = found.join(' ');
    }
  })();
  var startScore = 501, rem = [501, 501], legs = [0, 0], turn = 0, hist = [], legOver = false;
  function name(i) {
    var el = g(i === 0 ? 'p1' : 'p2');
    return el && el.value.trim() ? el.value.trim() : 'Player ' + (i + 1);
  }
  function status(t) { var el = g('status'); if (el) el.textContent = t; }
  function render() {
    for (var i = 0; i < 2; i++) {
      var n = g('n' + i), r = g('r' + i), l = g('l' + i), card = g('card' + i);
      if (n) n.textContent = name(i);
      if (r) r.textContent = String(rem[i]);
      if (l) l.textContent = String(legs[i]);
      if (card) card.style.outline = (turn === i && !legOver) ? '3px solid #4D7C0F' : 'none';
    }
    var co = g('checkout');
    if (co) {
      var c = CHECKOUTS[rem[turn]];
      co.textContent = (!legOver && c) ? ('🎯 ' + name(turn) + ' checkout: ' + c) : '';
    }
  }
  function log(msg) {
    var el = g('log');
    if (!el) return;
    var d = document.createElement('div');
    d.style.cssText = 'font-size:13px;background:#292524;border-radius:6px;padding:4px 10px';
    d.textContent = msg;
    el.insertBefore(d, el.firstChild);
  }
  function readDart(id) {
    var el = g(id);
    var v = el ? el.value.trim() : '';
    if (v === '') return 0;
    var n = parseInt(v, 10);
    return isNaN(n) ? -1 : n;
  }
  function submit() {
    if (legOver) { status('Leg over — press “New leg” to continue the match.'); return; }
    var ds = [readDart('d1'), readDart('d2'), readDart('d3')];
    for (var i = 0; i < 3; i++) {
      if (ds[i] < 0 || ds[i] > 60) { TN.setErr(P + 'error', 'Dart scores must be 0–60.'); return; }
    }
    TN.clearErr(P + 'error');
    var dbl = g('double') ? g('double').checked : false;
    var visit = ds[0] + ds[1] + ds[2];
    hist.push({ rem: rem.slice(), turn: turn, legs: legs.slice() });
    var before = rem[turn], after = before - visit, msg;
    if (visit > before || after === 1) {
      msg = name(turn) + ': ' + visit + ' — BUST! Stays on ' + before + '.';
      status('💥 Bust! ' + (visit > before ? 'Over-scored.' : 'Can\'t leave 1.') + ' ' + name(turn) + ' stays on ' + before + '.');
    } else if (after === 0) {
      if (dbl) {
        rem[turn] = 0;
        legs[turn]++;
        legOver = true;
        msg = name(turn) + ' checks out ' + visit + ' (' + before + ' → 0) to win the leg!';
        status('🏆 ' + name(turn) + ' wins the leg! Legs: ' + legs[0] + '–' + legs[1] + '. Press “New leg” for the next.');
      } else {
        msg = name(turn) + ': ' + visit + ' — BUST! Must finish on a double.';
        status('💥 Bust! You reached 0 but the final dart wasn\'t a double.');
      }
    } else {
      rem[turn] = after;
      msg = name(turn) + ': ' + visit + ' (' + before + ' → ' + after + ').';
      status(msg);
      turn = 1 - turn;
    }
    log(msg);
    for (var k = 1; k <= 3; k++) { var el = g('d' + k); if (el) el.value = ''; }
    var db = g('double'); if (db) db.checked = false;
    render();
  }
  function newMatch(newLegs) {
    startScore = g('game') ? parseInt(g('game').value, 10) : 501;
    rem = [startScore, startScore];
    if (newLegs) legs = [0, 0];
    turn = 0; hist = []; legOver = false;
    TN.clearErr(P + 'error');
    var el = g('log'); if (el) el.innerHTML = '';
    render();
    status(name(0) + ' to throw first. Game on!');
  }
  try {
    if (!g('submit')) return;
    TN.on(P + 'submit', 'click', submit);
    TN.on(P + 'undo', 'click', function () {
      var h = hist.pop();
      if (!h) { status('Nothing to undo.'); return; }
      rem = h.rem; turn = h.turn; legs = h.legs; legOver = false;
      render();
      status('Last visit undone.');
    });
    TN.on(P + 'new', 'click', function () { newMatch(true); });
    TN.on(P + 'leg', 'click', function () { newMatch(false); });
    TN.on(P + 'game', 'change', function () { newMatch(true); });
    render();
    status('Player 1 to throw first. Game on!');
  } catch (e) { /* never throw on load */ }
})();
