/* Scratch Card — canvas foil with pointer scratching, weighted prizes, auto-reveal. */
(function () {
  'use strict';
  var SLUG = 'scratch-card-game';
  var W = 340, H = 170;
  var PRIZES = [
    { t: '😢 NO PRIZE', w: 60, win: false },
    { t: '🍬 SMALL PRIZE', w: 25, win: true },
    { t: '🎁 MEDIUM PRIZE', w: 10, win: true },
    { t: '💰 BIG PRIZE!', w: 4, win: true },
    { t: '🎰 JACKPOT!!!', w: 1, win: true }
  ];
  var prize = null, revealed = false, scratching = false, won = 0, played = 0;

  function $(id) { return document.getElementById(id); }
  function canvas() { return $(SLUG + '-canvas'); }

  function pickPrize() {
    var total = PRIZES.reduce(function (a, p) { return a + p.w; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < PRIZES.length; i++) {
      r -= PRIZES[i].w;
      if (r <= 0) return PRIZES[i];
    }
    return PRIZES[0];
  }

  function drawCard() {
    var c = canvas(), ctx = c.getContext('2d');
    // prize layer
    ctx.globalCompositeOperation = 'source-over';
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#fff8e1'); g.addColorStop(1, '#ffecb3');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#5d4037';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(prize.t, W / 2, H / 2 - 10);
    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#8d6e63';
    ctx.fillText('LUCKY SCRATCH', W / 2, H / 2 + 24);
    // foil layer
    var foil = ctx.createLinearGradient(0, 0, W, H);
    foil.addColorStop(0, '#b0bec5'); foil.addColorStop(0.5, '#eceff1'); foil.addColorStop(1, '#90a4ae');
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#546e7a';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('✨ SCRATCH HERE ✨', W / 2, H / 2);
  }

  function scratchAt(x, y) {
    var c = canvas(), ctx = c.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  function pos(e) {
    var c = canvas(), r = c.getBoundingClientRect();
    var p = e.touches && e.touches[0] ? e.touches[0] : e;
    return [(p.clientX - r.left) * (W / r.width), (p.clientY - r.top) * (H / r.height)];
  }

  function scratchedPct() {
    var c = canvas(), ctx = c.getContext('2d');
    var data = ctx.getImageData(0, 0, W, H).data;
    var clear = 0, total = data.length / 4;
    for (var i = 3; i < data.length; i += 16) {
      if (data[i] === 0) clear++;
    }
    return clear / (total / 4);
  }

  function finishReveal() {
    if (revealed) return;
    revealed = true;
    var c = canvas(), ctx = c.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, W, H);
    played++;
    $('scratch-card-game-played').textContent = played;
    var msg;
    if (prize.win) {
      won++;
      $('scratch-card-game-won').textContent = won;
      msg = '🎉 You won: ' + prize.t + ' Congratulations!';
    } else {
      msg = '😢 No prize this time — try a New Card!';
    }
    $('scratch-card-game-msg').textContent = msg;
  }

  var moveCount = 0;
  function onMove(e) {
    if (!scratching || revealed) return;
    e.preventDefault();
    var p = pos(e);
    scratchAt(p[0], p[1]);
    moveCount++;
    if (moveCount % 12 === 0 && scratchedPct() > 0.4) finishReveal();
  }

  function newCard() {
    prize = pickPrize();
    revealed = false; scratching = false; moveCount = 0;
    drawCard();
    $('scratch-card-game-msg').textContent = 'Rub the foil to reveal your prize!';
  }

  try {
    var c = canvas();
    c.addEventListener('pointerdown', function (e) {
      if (revealed) return;
      e.preventDefault();
      scratching = true;
      var p = pos(e);
      scratchAt(p[0], p[1]);
      try { c.setPointerCapture(e.pointerId); } catch (err) {}
    });
    c.addEventListener('pointermove', onMove);
    c.addEventListener('pointerup', function () {
      scratching = false;
      if (!revealed && scratchedPct() > 0.4) finishReveal();
    });
    c.addEventListener('pointercancel', function () { scratching = false; });
    TN.on('scratch-card-game-new', 'click', newCard);
    newCard();
  } catch (e) { /* never throw on load */ }
})();
