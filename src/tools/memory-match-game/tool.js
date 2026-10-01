(function () {
  'use strict';
  var P = 'memory-match-game-';
  var ERR = P + 'error';
  var EMOJI = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
  var deck = [], cards = [], flipped = [], matched = 0, moves = 0;
  var lock = false, started = false, won = false, timerId = null, startTs = 0;
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i];
      a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function fmtTime(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }
  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }
  function startTimer() {
    startTs = Date.now();
    stopTimer();
    timerId = setInterval(function () { set('time', fmtTime(Date.now() - startTs)); }, 500);
  }
  function buildCards() {
    var grid = g('grid');
    if (!grid) return;
    grid.innerHTML = '';
    cards = [];
    deck.forEach(function (e, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mm-card';
      b.setAttribute('aria-label', 'Card ' + (i + 1));
      b.innerHTML = '<span class="mm-back">?</span><span class="mm-front">' + e + '</span>';
      b.addEventListener('click', function () { flip(i); });
      grid.appendChild(b);
      cards.push(b);
    });
  }
  function newGame() {
    stopTimer();
    deck = shuffle(EMOJI.concat(EMOJI));
    flipped = []; matched = 0; moves = 0;
    lock = false; started = false; won = false;
    set('moves', '0'); set('time', '0:00'); set('matched', '0/16');
    TN.clearErr(ERR);
    var res = g('result');
    if (res) { res.innerHTML = ''; res.classList.add('hidden'); }
    buildCards();
  }
  function flip(i) {
    if (lock || won || !cards[i]) return;
    if (flipped.indexOf(i) !== -1 || cards[i].classList.contains('mm-done')) return;
    if (!started) { started = true; startTimer(); }
    cards[i].classList.add('mm-flip');
    flipped.push(i);
    if (flipped.length < 2) return;
    moves++;
    set('moves', String(moves));
    var a = flipped[0], b = flipped[1];
    if (deck[a] === deck[b]) {
      cards[a].classList.add('mm-done');
      cards[b].classList.add('mm-done');
      flipped = [];
      matched += 2;
      set('matched', matched + '/16');
      if (matched === 16) win();
    } else {
      lock = true;
      setTimeout(function () {
        if (cards[a]) cards[a].classList.remove('mm-flip');
        if (cards[b]) cards[b].classList.remove('mm-flip');
        flipped = [];
        lock = false;
      }, 700);
    }
  }
  function win() {
    won = true;
    stopTimer();
    var secs = fmtTime(Date.now() - startTs);
    var res = g('result');
    if (res) {
      res.innerHTML = '<p>🎉 <strong>You matched them all!</strong><br>Time: ' + secs + ' &nbsp;•&nbsp; Moves: ' + moves + '</p>';
      res.classList.remove('hidden');
    }
  }
  try {
    TN.on(P + 'restart', 'click', newGame);
    newGame();
  } catch (e) { /* never throw on load */ }
})();
