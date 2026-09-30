(function () {
  'use strict';
  var P = 'coin-flip-';
  function g(id) { return document.getElementById(P + id); }

  var coin = g('coin'), flipBtn = g('flip');
  if (!coin || !flipBtn) return;

  var heads = 0, tails = 0, flipping = false;

  function updateTally() {
    var h = g('heads'), t = g('tails'), f = g('flips');
    if (h) h.textContent = heads;
    if (t) t.textContent = tails;
    if (f) f.textContent = heads + tails;
  }

  function flip() {
    if (flipping) return;
    TN.clearErr(P + 'error');
    flipping = true;
    flipBtn.disabled = true;
    TN.hide(P + 'result');
    var isHeads = Math.random() < 0.5;
    var duration = 1200;
    var start = null;
    var spins = 5;

    function frame(ts) {
      if (start === null) start = ts;
      var p = (ts - start) / duration;
      if (p > 1) p = 1;
      var angle = p * 360 * spins;
      coin.style.transform = 'rotateY(' + angle + 'deg)';
      // Swap visible face roughly each half-turn so it looks like a real toss.
      var half = Math.floor(angle / 180) % 2;
      coin.textContent = half === 0 ? 'H' : 'T';
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        coin.style.transform = 'rotateY(0deg)';
        coin.textContent = isHeads ? 'H' : 'T';
        if (isHeads) heads++; else tails++;
        updateTally();
        var out = g('outcome');
        if (out) out.textContent = isHeads ? 'Heads!' : 'Tails!';
        TN.show(P + 'result');
        flipping = false;
        flipBtn.disabled = false;
      }
    }
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(frame);
    } else {
      // Fallback for very old browsers: instant result.
      coin.textContent = isHeads ? 'H' : 'T';
      if (isHeads) heads++; else tails++;
      updateTally();
      var out2 = g('outcome');
      if (out2) out2.textContent = isHeads ? 'Heads!' : 'Tails!';
      TN.show(P + 'result');
      flipping = false;
      flipBtn.disabled = false;
    }
  }

  TN.on(flipBtn, 'click', flip);
  TN.on(g('reset'), 'click', function () {
    heads = 0;
    tails = 0;
    coin.textContent = '?';
    coin.style.transform = 'rotateY(0deg)';
    updateTally();
    TN.hide(P + 'result');
    TN.clearErr(P + 'error');
  });
  updateTally();
})();
