/* Higher or Lower — 52-card deck, streak scoring, reshuffle, best tracking. */
(function () {
  'use strict';
  var SLUG = 'higher-or-lower-game';
  var SUITS = ['♠', '♥', '♦', '♣'];
  var RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  var deck = [], idx = 0, current = null, streak = 0, best = 0, alive = true;

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

  function showCard(c) {
    var el = $('higher-or-lower-game-card');
    el.textContent = c.r + c.s;
    el.style.color = (c.s === '♥' || c.s === '♦') ? '#d32f2f' : '#212121';
    $('higher-or-lower-game-left').textContent = deck.length - idx;
  }

  function newRound() {
    deck = buildDeck();
    idx = 0;
    current = deck[idx++];
    streak = 0;
    alive = true;
    $('higher-or-lower-game-streak').textContent = '0';
    $('higher-or-lower-game-msg').textContent = 'Will the next card be higher or lower? (Aces high, ties lose)';
    showCard(current);
  }

  function guess(higher) {
    if (!alive) return;
    if (idx >= deck.length) {
      deck = buildDeck();
      idx = 0;
      $('higher-or-lower-game-msg').textContent = '🔀 Deck reshuffled — streak continues!';
    }
    var next = deck[idx++];
    var win = higher ? next.v > current.v : next.v < current.v;
    showCard(next);
    if (win) {
      streak++;
      if (streak > best) {
        best = streak;
        $('higher-or-lower-game-best').textContent = best;
      }
      $('higher-or-lower-game-streak').textContent = streak;
      $('higher-or-lower-game-msg').textContent = '✓ Correct! It was ' + next.r + next.s + '. Keep going!';
    } else {
      alive = false;
      var reason = next.v === current.v ? 'a tie' : 'wrong';
      $('higher-or-lower-game-msg').textContent = '✗ ' + (next.v === current.v ? 'Tie' : 'Wrong') +
        ' — ' + reason + '! It was ' + next.r + next.s + '. Final streak: ' + streak + '. Press ↻ for a new round.';
      showCard(next);
    }
    current = next;
  }

  try {
    TN.on('higher-or-lower-game-higher', 'click', function () { guess(true); });
    TN.on('higher-or-lower-game-lower', 'click', function () { guess(false); });
    TN.on('higher-or-lower-game-new', 'click', newRound);
    newRound();
  } catch (e) { /* never throw on load */ }
})();
