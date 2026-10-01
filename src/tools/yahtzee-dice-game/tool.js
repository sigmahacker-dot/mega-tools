/* Yahtzee — full rules: 5 dice, 3 rolls, 13 categories, upper bonus. */
(function () {
  'use strict';
  var SLUG = 'yahtzee-dice-game';
  var FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  var CATS = [
    { id: 'ones', name: 'Ones', upper: true },
    { id: 'twos', name: 'Twos', upper: true },
    { id: 'threes', name: 'Threes', upper: true },
    { id: 'fours', name: 'Fours', upper: true },
    { id: 'fives', name: 'Fives', upper: true },
    { id: 'sixes', name: 'Sixes', upper: true },
    { id: 'kind3', name: 'Three of a Kind' },
    { id: 'kind4', name: 'Four of a Kind' },
    { id: 'fh', name: 'Full House' },
    { id: 'ss', name: 'Small Straight' },
    { id: 'ls', name: 'Large Straight' },
    { id: 'yahtzee', name: 'Yahtzee' },
    { id: 'chance', name: 'Chance' }
  ];
  var dice = [1, 1, 1, 1, 1], held = [false, false, false, false, false];
  var rollsLeft = 3, scores = {}, over = false;

  function $(id) { return document.getElementById(id); }
  function counts() {
    var c = [0, 0, 0, 0, 0, 0, 0];
    dice.forEach(function (d) { c[d]++; });
    return c;
  }
  function sum() { return dice.reduce(function (a, b) { return a + b; }, 0); }

  function scoreFor(id) {
    var c = counts(), s = sum(), i;
    switch (id) {
      case 'ones': return c[1] * 1;
      case 'twos': return c[2] * 2;
      case 'threes': return c[3] * 3;
      case 'fours': return c[4] * 4;
      case 'fives': return c[5] * 5;
      case 'sixes': return c[6] * 6;
      case 'kind3':
        for (i = 1; i <= 6; i++) if (c[i] >= 3) return s;
        return 0;
      case 'kind4':
        for (i = 1; i <= 6; i++) if (c[i] >= 4) return s;
        return 0;
      case 'fh': {
        var has3 = false, has2 = false;
        for (i = 1; i <= 6; i++) { if (c[i] === 3) has3 = true; if (c[i] === 2) has2 = true; }
        return (has3 && has2) ? 25 : 0;
      }
      case 'ss': {
        var u = {};
        dice.forEach(function (d) { u[d] = 1; });
        var k = Object.keys(u).map(Number).sort();
        var run = 1;
        for (i = 1; i < k.length; i++) {
          if (k[i] === k[i - 1] + 1) { run++; if (run >= 4) return 30; }
          else run = 1;
        }
        return 0;
      }
      case 'ls': {
        var sorted = dice.slice().sort();
        var ok = true;
        for (i = 1; i < 5; i++) if (sorted[i] !== sorted[i - 1] + 1) ok = false;
        return ok ? 40 : 0;
      }
      case 'yahtzee':
        for (i = 1; i <= 6; i++) if (c[i] === 5) return 50;
        return 0;
      case 'chance': return s;
    }
    return 0;
  }

  function upperSubtotal() {
    var t = 0;
    CATS.forEach(function (ct) {
      if (ct.upper && scores[ct.id] !== undefined) t += scores[ct.id];
    });
    return t;
  }
  function grandTotal() {
    var t = 0, filled = 0;
    CATS.forEach(function (ct) {
      if (scores[ct.id] !== undefined) { t += scores[ct.id]; filled++; }
    });
    if (upperSubtotal() >= 63) t += 35;
    return { total: t, filled: filled };
  }

  function renderDice() {
    var box = $('yahtzee-dice-game-dice');
    box.innerHTML = '';
    dice.forEach(function (d, i) {
      var b = document.createElement('button');
      b.style.cssText = 'width:58px;height:58px;font-size:36px;border-radius:10px;border:3px solid ' +
        (held[i] ? '#2e7d32' : '#bdbdbd') + ';background:' + (held[i] ? '#e8f5e9' : '#fff') +
        ';cursor:pointer;line-height:1;padding:0;touch-action:manipulation';
      b.textContent = FACES[d - 1];
      b.setAttribute('aria-label', 'Die ' + (i + 1) + ': ' + d + (held[i] ? ' (held)' : ''));
      b.addEventListener('click', function () {
        if (over || rollsLeft === 3) return;
        held[i] = !held[i];
        renderDice();
      });
      box.appendChild(b);
    });
  }

  function renderCard() {
    var box = $('yahtzee-dice-game-card');
    box.innerHTML = '';
    var canScore = !over && rollsLeft < 3;
    CATS.forEach(function (ct) {
      var row = document.createElement('button');
      var filled = scores[ct.id] !== undefined;
      var preview = (!filled && canScore) ? ' <span style="color:#2e7d32">(' + scoreFor(ct.id) + ')</span>' : '';
      row.style.cssText = 'display:flex;justify-content:space-between;width:100%;padding:8px 12px;margin-bottom:4px;' +
        'border:1px solid #cfd8dc;border-radius:8px;background:' + (filled ? '#eceff1' : (canScore ? '#fff' : '#fafafa')) +
        ';cursor:' + (filled || !canScore ? 'default' : 'pointer') + ';font-size:15px';
      row.innerHTML = '<span>' + ct.name + '</span><strong>' + (filled ? scores[ct.id] : preview || '—') + '</strong>';
      if (!filled && canScore) {
        row.addEventListener('click', function () { choose(ct.id); });
      }
      box.appendChild(row);
    });
    var up = upperSubtotal(), gt = grandTotal();
    $('yahtzee-dice-game-upper').textContent = up + (up >= 63 ? ' (+35!)' : '');
    $('yahtzee-dice-game-total').textContent = gt.total;
    $('yahtzee-dice-game-rolls').textContent = rollsLeft;
    if (gt.filled === CATS.length && !over) {
      over = true;
      $('yahtzee-dice-game-msg').textContent = '🏁 Game over! Final score: ' + gt.total + '. Press New game to play again.';
    }
  }

  function roll() {
    if (over || rollsLeft <= 0) return;
    for (var i = 0; i < 5; i++) {
      if (!held[i]) dice[i] = 1 + Math.floor(Math.random() * 6);
    }
    rollsLeft--;
    $('yahtzee-dice-game-msg').textContent = rollsLeft > 0
      ? 'Tap dice to hold, roll again or pick a category.'
      : 'No rolls left — pick a category to score!';
    renderDice();
    renderCard();
  }

  function choose(id) {
    if (over || rollsLeft === 3 || scores[id] !== undefined) return;
    scores[id] = scoreFor(id);
    dice = [1, 1, 1, 1, 1];
    held = [false, false, false, false, false];
    rollsLeft = 3;
    $('yahtzee-dice-game-msg').textContent = 'Scored ' + scores[id] + ' in ' +
      CATS.filter(function (c) { return c.id === id; })[0].name + '. Roll for the next turn!';
    renderDice();
    renderCard();
  }

  function newGame() {
    dice = [1, 1, 1, 1, 1];
    held = [false, false, false, false, false];
    rollsLeft = 3; scores = {}; over = false;
    $('yahtzee-dice-game-msg').textContent = 'Press Roll Dice, tap dice to hold, then pick a category.';
    renderDice();
    renderCard();
  }

  try {
    TN.on('yahtzee-dice-game-roll', 'click', roll);
    TN.on('yahtzee-dice-game-new', 'click', newGame);
    newGame();
  } catch (e) { /* never throw on load */ }
})();
