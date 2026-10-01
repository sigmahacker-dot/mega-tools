/* Slot Machine — 3 weighted emoji reels, real payout odds, credits + bet sizes. */
(function () {
  'use strict';
  var SLUG = 'slot-machine-game';
  var SYMS = [
    { e: '🍒', w: 30, pay: 2 },
    { e: '🍋', w: 25, pay: 3 },
    { e: '🔔', w: 20, pay: 5 },
    { e: '⭐', w: 12, pay: 10 },
    { e: '💎', w: 8, pay: 25 },
    { e: '7️⃣', w: 5, pay: 50 }
  ];
  var BAG = [];
  SYMS.forEach(function (s) { for (var i = 0; i < s.w; i++) BAG.push(s); });
  var credits = 100, totalWon = 0, spinning = false;

  function $(id) { return document.getElementById(id); }
  function draw() { return BAG[Math.floor(Math.random() * BAG.length)]; }

  function spin() {
    if (spinning) return;
    var bet = parseInt($('slot-machine-game-bet').value, 10);
    if (credits < bet) {
      $('slot-machine-game-msg').textContent = '⚠ Not enough credits — lower your bet or reset credits.';
      return;
    }
    credits -= bet;
    $('slot-machine-game-credits').textContent = credits;
    spinning = true;
    $('slot-machine-game-spin').disabled = true;
    $('slot-machine-game-msg').textContent = 'Spinning…';
    var results = [draw(), draw(), draw()];
    var timers = [];
    for (var r = 0; r < 3; r++) {
      (function (ri) {
        var ticks = 0;
        var iv = setInterval(function () {
          ticks++;
          $(SLUG + '-r' + ri).textContent = draw().e;
          if (ticks > 6 + ri * 4) {
            clearInterval(iv);
            $(SLUG + '-r' + ri).textContent = results[ri].e;
            if (ri === 2) finish(results, bet);
          }
        }, 90);
        timers.push(iv);
      })(r);
    }
  }

  function finish(results, bet) {
    spinning = false;
    $('slot-machine-game-spin').disabled = false;
    var a = results[0].e, b = results[1].e, c = results[2].e;
    var win = 0, msg;
    if (a === b && b === c) {
      win = bet * results[0].pay;
      msg = '🎉 JACKPOT! Three ' + a + ' — you win ' + win + ' credits (' + results[0].pay + '×)!';
    } else if (a === b || b === c || a === c) {
      win = bet;
      msg = 'Nice — two of a kind! Bet returned: +' + win + '.';
    } else {
      msg = 'No luck this time — try again!';
    }
    credits += win;
    totalWon += win;
    $('slot-machine-game-credits').textContent = credits;
    $('slot-machine-game-won').textContent = totalWon;
    $('slot-machine-game-msg').textContent = msg;
  }

  try {
    TN.on('slot-machine-game-spin', 'click', spin);
    TN.on('slot-machine-game-reset', 'click', function () {
      credits = 100; totalWon = 0;
      $('slot-machine-game-credits').textContent = '100';
      $('slot-machine-game-won').textContent = '0';
      $('slot-machine-game-msg').textContent = 'Credits reset to 100. Good luck!';
    });
  } catch (e) { /* never throw on load */ }
})();
