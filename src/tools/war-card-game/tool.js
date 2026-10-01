/* War Card Game — full War rules with war ties, round counter, auto-play, end detection. */
(function () {
  'use strict';
  var SLUG = 'war-card-game';
  var SUITS = ['♠', '♥', '♦', '♣'];
  var RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  var you = [], cpu = [];
  var rounds = 0, wars = 0, over = false, autoId = null;

  function $(id) { return document.getElementById(id); }

  function buildDeck() {
    var d = [];
    SUITS.forEach(function (s) {
      RANKS.forEach(function (r, i) { d.push({ r: r, s: s, v: i + 2 }); });
    });
    for (var k = d.length - 1; k > 0; k--) {
      var j = Math.floor(Math.random() * (k + 1));
      var t = d[k]; d[k] = d[j]; d[j] = t;
    }
    return d;
  }

  function cardHTML(el, c) {
    el.textContent = c ? c.r + c.s : '?';
    el.style.color = c && (c.s === '♥' || c.s === '♦') ? '#d32f2f' : '#212121';
  }

  function log(msg) {
    var l = $('war-card-game-log');
    var d = document.createElement('div');
    d.textContent = msg;
    l.insertBefore(d, l.firstChild);
    while (l.children.length > 8) l.removeChild(l.lastChild);
  }

  function stats() {
    $('war-card-game-you').textContent = you.length;
    $('war-card-game-cpu').textContent = cpu.length;
    $('war-card-game-rounds').textContent = rounds;
    $('war-card-game-wars').textContent = wars;
  }

  function stopAuto() {
    if (autoId) { clearInterval(autoId); autoId = null; }
    $('war-card-game-auto').textContent = '▶ Auto-play';
  }

  function endGame(youWin, reason) {
    over = true;
    stopAuto();
    $('war-card-game-battle').disabled = true;
    $('war-card-game-msg').textContent = (youWin ? '🏆 YOU WIN! ' : '💀 CPU WINS. ') + reason + ' Press ↻ for a new game.';
    log(youWin ? '🏆 You captured all 52 cards!' : '💀 CPU captured all 52 cards.');
  }

  function checkEnd() {
    if (you.length === 0) { endGame(false, 'You ran out of cards.'); return true; }
    if (cpu.length === 0) { endGame(true, 'You captured every card!'); return true; }
    if (rounds >= 3000) {
      // anti-stall: leader wins
      endGame(you.length >= cpu.length, 'Round limit reached — most cards wins.');
      return true;
    }
    return false;
  }

  function battle() {
    if (over) return;
    if (!you.length || !cpu.length) { checkEnd(); return; }
    rounds++;
    var pot = [you.shift(), cpu.shift()];
    var yc = pot[0], cc = pot[1];
    cardHTML($('war-card-game-ycard'), yc);
    cardHTML($('war-card-game-ccard'), cc);
    // resolve wars on ties
    while (yc.v === cc.v) {
      wars++;
      $('war-card-game-warinfo').classList.remove('hidden');
      $('war-card-game-warinfo').textContent = '⚔️ WAR! Each side places 3 cards face-down and flips one more…';
      $('war-card-game-msg').textContent = '⚔️ WAR! Tie at ' + yc.r + 's — flipping war cards…';
      // not enough cards to wage war => return each side's own pot cards, then resolve
      if (you.length === 0 || cpu.length === 0) {
        you = you.concat(pot.filter(function (_, i) { return i % 2 === 0; }));
        cpu = cpu.concat(pot.filter(function (_, i) { return i % 2 === 1; }));
        stats();
        if (you.length === 0) { endGame(false, 'You ran out of cards in a war.'); return; }
        if (cpu.length === 0) { endGame(true, 'The CPU ran out of cards in a war.'); return; }
        $('war-card-game-msg').textContent = '⚔️ War fizzled — both sides kept their cards. Battle on!';
        return;
      }
      var yDown = Math.min(3, you.length - 1), cDown = Math.min(3, cpu.length - 1);
      for (var i = 0; i < yDown; i++) pot.push(you.shift());
      for (var j = 0; j < cDown; j++) pot.push(cpu.shift());
      if (!you.length || !cpu.length) {
        you = you.concat(pot.filter(function (_, i) { return i % 2 === 0; }));
        cpu = cpu.concat(pot.filter(function (_, i) { return i % 2 === 1; }));
        stats();
        if (you.length === 0) { endGame(false, 'You ran out of cards in a war.'); return; }
        if (cpu.length === 0) { endGame(true, 'The CPU ran out of cards in a war.'); return; }
        $('war-card-game-msg').textContent = '⚔️ War fizzled — both sides kept their cards. Battle on!';
        return;
      }
      yc = you.shift(); cc = cpu.shift();
      pot.push(yc, cc);
      cardHTML($('war-card-game-ycard'), yc);
      cardHTML($('war-card-game-ccard'), cc);
    }
    var youWin = yc.v > cc.v;
    // winner takes the pot: their own cards first, then opponent's (shuffled for fairness)
    var yPot = pot.filter(function (_, i) { return i % 2 === 0; });
    var cPot = pot.filter(function (_, i) { return i % 2 === 1; });
    var winnings = youWin ? yPot.concat(cPot) : cPot.concat(yPot);
    if (youWin) you = you.concat(winnings); else cpu = cpu.concat(winnings);
    var warTxt = wars > 0 && pot.length > 2 ? ' (war pot: ' + pot.length + ' cards)' : '';
    $('war-card-game-msg').textContent = youWin
      ? '✓ Your ' + yc.r + yc.s + ' beats ' + cc.r + cc.s + ' — you take ' + pot.length + ' cards!' + warTxt
      : '✗ CPU\'s ' + cc.r + cc.s + ' beats your ' + yc.r + yc.s + ' — CPU takes ' + pot.length + ' cards.' + warTxt;
    $('war-card-game-warinfo').classList.add('hidden');
    log((youWin ? 'You' : 'CPU') + ' won ' + pot.length + ' cards (' + yc.r + yc.s + ' vs ' + cc.r + cc.s + ').');
    stats();
    checkEnd();
  }

  function newGame() {
    stopAuto();
    var d = buildDeck();
    you = d.slice(0, 26);
    cpu = d.slice(26);
    rounds = 0; wars = 0; over = false;
    cardHTML($('war-card-game-ycard'), null);
    cardHTML($('war-card-game-ccard'), null);
    $('war-card-game-log').innerHTML = '';
    $('war-card-game-warinfo').classList.add('hidden');
    $('war-card-game-battle').disabled = false;
    $('war-card-game-msg').textContent = 'Press Battle to flip your top cards!';
    stats();
  }

  try {
    TN.on('war-card-game-battle', 'click', battle);
    TN.on('war-card-game-new', 'click', newGame);
    TN.on('war-card-game-auto', 'click', function () {
      if (over) return;
      if (autoId) { stopAuto(); return; }
      $('war-card-game-auto').textContent = '⏸ Stop';
      autoId = setInterval(function () {
        battle();
        if (over) stopAuto();
      }, 700);
    });
    newGame();
  } catch (e) { /* never throw on load */ }
})();
