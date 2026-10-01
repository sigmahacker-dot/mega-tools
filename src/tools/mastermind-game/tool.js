(function () {
  'use strict';
  var P = 'mastermind-game-';
  function g(id) { return document.getElementById(P + id); }
  var COLORS = [
    { n: 'Red', c: '#dc2626' }, { n: 'Blue', c: '#2563eb' }, { n: 'Green', c: '#16a34a' },
    { n: 'Yellow', c: '#eab308' }, { n: 'Purple', c: '#9333ea' }, { n: 'Orange', c: '#ea580c' }
  ];
  var MAX = 10, secret = [], guess = [], attempts = 0, over = false;
  function peg(color, size) {
    return '<span title="' + color.n + '" style="display:inline-block;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color.c + ';border:2px solid rgba(0,0,0,.35);box-shadow:0 1px 3px rgba(0,0,0,.4)"></span>';
  }
  function emptyPeg(size) {
    return '<span style="display:inline-block;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:#292524;border:2px dashed #57534e"></span>';
  }
  function setup() {
    secret = [];
    for (var i = 0; i < 4; i++) secret.push(Math.floor(Math.random() * COLORS.length));
    guess = []; attempts = 0; over = false;
  }
  function status(t) { var el = g('status'); if (el) el.textContent = t; }
  function renderSecret(reveal) {
    var el = g('secret'); if (!el) return;
    var h = '';
    for (var i = 0; i < 4; i++) h += reveal ? peg(COLORS[secret[i]], 30) : '<span style="display:inline-block;width:30px;height:30px;border-radius:50%;background:#44403c;border:2px solid #57534e;color:#a8a29e;font-weight:800;line-height:28px">?</span>';
    el.innerHTML = h;
  }
  function renderPick() {
    var el = g('pick'); if (!el) return;
    var h = '';
    for (var i = 0; i < 4; i++) h += guess[i] === undefined ? emptyPeg(30) : peg(COLORS[guess[i]], 30);
    el.innerHTML = h;
  }
  function renderPalette() {
    var el = g('palette'); if (!el) return;
    el.innerHTML = '';
    for (var i = 0; i < COLORS.length; i++) {
      (function (idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.innerHTML = peg(COLORS[idx], 30);
        b.style.cssText = 'border:0;background:transparent;padding:2px;cursor:pointer;border-radius:50%';
        b.setAttribute('aria-label', 'Pick ' + COLORS[idx].n);
        b.addEventListener('click', function () {
          if (over) return;
          if (guess.length < 4) { guess.push(idx); TN.clearErr(P + 'error'); renderPick(); }
        });
        el.appendChild(b);
      })(i);
    }
  }
  function feedback() {
    var s = secret.slice(), gu = guess.slice(), black = 0, white = 0, i;
    for (i = 0; i < 4; i++) if (gu[i] === s[i]) { black++; s[i] = gu[i] = -1; }
    for (i = 0; i < 4; i++) {
      if (gu[i] === -1) continue;
      var j = s.indexOf(gu[i]);
      if (j !== -1) { white++; s[j] = -1; }
    }
    return { black: black, white: white };
  }
  function check() {
    if (over) return;
    if (guess.length < 4) { TN.setErr(P + 'error', 'Pick 4 colors first.'); return; }
    TN.clearErr(P + 'error');
    var fb = feedback();
    attempts++;
    var hist = g('history');
    if (hist) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:6px;justify-content:space-between;background:#292524;border-radius:8px;padding:6px 10px';
      var gh = '';
      for (var i = 0; i < 4; i++) gh += peg(COLORS[guess[i]], 22);
      var fh = '';
      for (var b = 0; b < fb.black; b++) fh += '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#fafaf9;margin:1px"></span>';
      for (var w = 0; w < fb.white; w++) fh += '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#78716c;margin:1px"></span>';
      row.innerHTML = '<span style="color:#a8a29e;font-size:12px;width:20px">#' + attempts + '</span><span style="display:flex;gap:4px">' + gh + '</span><span style="min-width:60px;text-align:right">' + (fh || '<span style="color:#57534e;font-size:12px">none</span>') + '</span>';
      hist.insertBefore(row, hist.firstChild);
    }
    guess = [];
    renderPick();
    if (fb.black === 4) {
      over = true; renderSecret(true);
      status('🎉 Code cracked in ' + attempts + ' ' + (attempts === 1 ? 'try' : 'tries') + '!');
    } else if (attempts >= MAX) {
      over = true; renderSecret(true);
      status('😞 Out of attempts — the code was revealed above.');
    } else {
      status('Attempt ' + attempts + '/' + MAX + ': ' + fb.black + ' black, ' + fb.white + ' white. Try again.');
    }
  }
  function reset() {
    setup();
    TN.clearErr(P + 'error');
    var hist = g('history'); if (hist) hist.innerHTML = '';
    renderSecret(false); renderPick();
    status('Guess the secret 4-color code. Colors may repeat.');
  }
  try {
    if (!g('pick')) return;
    renderPalette();
    TN.on(P + 'check', 'click', check);
    TN.on(P + 'clear', 'click', function () { guess = []; renderPick(); TN.clearErr(P + 'error'); });
    TN.on(P + 'new', 'click', reset);
    TN.on(P + 'reveal', 'click', function () { if (!over) { over = true; renderSecret(true); status('The code was revealed. Start a new game to play again.'); } });
    reset();
  } catch (e) { /* never throw on load */ }
})();
