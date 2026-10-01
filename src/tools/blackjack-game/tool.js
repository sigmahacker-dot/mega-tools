/* Blackjack — real rules: hit/stand/double, dealer hits to 17, blackjack pays 3:2. */
(function () {
  'use strict';
  var SLUG = 'blackjack-game';
  var SUITS = ['♠', '♥', '♦', '♣'];
  var RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  var deck = [], player = [], dealer = [];
  var bank = 1000, bet = 0, playing = false, dealerHidden = true;

  function $(id) { return document.getElementById(id); }

  function buildDeck() {
    var d = [];
    SUITS.forEach(function (s) {
      RANKS.forEach(function (r) { d.push({ r: r, s: s }); });
    });
    for (var i = d.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = d[i]; d[i] = d[j]; d[j] = t;
    }
    return d;
  }

  function value(hand) {
    var total = 0, aces = 0;
    hand.forEach(function (c) {
      if (c.r === 'A') { aces++; total += 11; }
      else if (c.r === 'J' || c.r === 'Q' || c.r === 'K') total += 10;
      else total += parseInt(c.r, 10);
    });
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
  }

  function cardHTML(c, hidden) {
    var d = document.createElement('div');
    var red = (c.s === '♥' || c.s === '♦');
    d.style.cssText = 'width:52px;height:72px;border:1px solid #9e9e9e;border-radius:8px;background:' +
      (hidden ? '#1565c0' : '#fff') + ';display:flex;align-items:center;justify-content:center;' +
      'font-size:19px;font-weight:bold;color:' + (hidden ? '#fff' : (red ? '#d32f2f' : '#212121')) + ';box-shadow:0 1px 3px rgba(0,0,0,.2)';
    d.textContent = hidden ? '🂠' : (c.r + c.s);
    return d;
  }

  function render() {
    var pb = $('blackjack-game-player'), db = $('blackjack-game-dealer');
    pb.innerHTML = ''; db.innerHTML = '';
    player.forEach(function (c) { pb.appendChild(cardHTML(c, false)); });
    dealer.forEach(function (c, i) { db.appendChild(cardHTML(c, dealerHidden && i === 1)); });
    var pv = value(player), dv = value(dealer);
    $('blackjack-game-pval').textContent = player.length ? '(' + pv + ')' : '';
    $('blackjack-game-dval').textContent = dealer.length ? (dealerHidden ? '(' + value([dealer[0]]) + ' + ?)' : '(' + dv + ')') : '';
    $('blackjack-game-bank').textContent = bank;
    $('blackjack-game-bet').textContent = bet;
  }

  function setActions(on, canDouble) {
    $('blackjack-game-hit').disabled = !on;
    $('blackjack-game-stand').disabled = !on;
    $('blackjack-game-double').disabled = !(on && canDouble);
    $('blackjack-game-deal').disabled = on;
    $('blackjack-game-betsize').disabled = on;
  }

  function deal() {
    bet = parseInt($('blackjack-game-betsize').value, 10);
    if (bank <= 0) { bank = 1000; $('blackjack-game-msg').textContent = 'Out of credits — bankroll reset to 1,000. Good luck!'; }
    if (bet > bank) {
      $('blackjack-game-msg').textContent = '⚠ Bet exceeds your bankroll. Lower your bet.';
      return;
    }
    bank -= bet;
    deck = buildDeck();
    player = [deck.pop(), deck.pop()];
    dealer = [deck.pop(), deck.pop()];
    playing = true;
    dealerHidden = true;
    setActions(true, bank >= bet);
    render();
    var pv = value(player);
    if (pv === 21) {
      // natural blackjack
      dealerHidden = false;
      var dv = value(dealer);
      if (dv === 21) {
        bank += bet; // push
        $('blackjack-game-msg').textContent = 'Both have Blackjack — push! Bet returned.';
      } else {
        bank += bet + Math.floor(bet * 1.5);
        $('blackjack-game-msg').textContent = '🃏 BLACKJACK! Pays 3:2 — you win ' + Math.floor(bet * 1.5) + '!';
      }
      playing = false;
      setActions(false);
      render();
    } else {
      $('blackjack-game-msg').textContent = 'Your move: Hit, Stand, or Double Down.';
    }
  }

  function hit() {
    if (!playing) return;
    player.push(deck.pop());
    setActions(true, false);
    render();
    if (value(player) > 21) {
      $('blackjack-game-msg').textContent = '💥 Bust! You went over 21. Dealer wins.';
      playing = false;
      setActions(false);
      render();
    } else if (value(player) === 21) {
      stand();
    }
  }

  function stand() {
    if (!playing) return;
    playing = false;
    dealerHidden = false;
    setActions(false);
    while (value(dealer) < 17) dealer.push(deck.pop());
    var pv = value(player), dv = value(dealer);
    var msg;
    if (dv > 21) { bank += bet * 2; msg = 'Dealer busts! You win ' + bet + '.'; }
    else if (dv > pv) { msg = 'Dealer wins with ' + dv + ' vs your ' + pv + '.'; }
    else if (dv < pv) { bank += bet * 2; msg = '🎉 You win! ' + pv + ' beats ' + dv + '. +' + bet + '.'; }
    else { bank += bet; msg = 'Push — ' + pv + ' ties. Bet returned.'; }
    $('blackjack-game-msg').textContent = msg;
    render();
  }

  function doubleDown() {
    if (!playing || bank < bet) return;
    bank -= bet;
    bet *= 2;
    player.push(deck.pop());
    render();
    if (value(player) > 21) {
      $('blackjack-game-msg').textContent = '💥 Bust after doubling! Dealer wins.';
      playing = false;
      setActions(false);
      render();
    } else {
      stand();
    }
  }

  try {
    TN.on('blackjack-game-deal', 'click', deal);
    TN.on('blackjack-game-hit', 'click', hit);
    TN.on('blackjack-game-stand', 'click', stand);
    TN.on('blackjack-game-double', 'click', doubleDown);
    render();
  } catch (e) { /* never throw on load */ }
})();
