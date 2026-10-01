/* Simon Says — real sequence playback, input checking, high score. */
(function () {
  'use strict';
  var SLUG = 'simon-says-game';
  var seq = [];
  var pos = 0;
  var accepting = false;
  var playing = false;
  var best = 0;
  var FREQS = [329.63, 261.63, 392.0, 440.0]; // E4 C4 G4 A4
  var actx = null;

  function $(id) { return document.getElementById(id); }
  function pad(i) { return $('simon-says-game-p' + i); }

  function loadBest() {
    try { best = parseInt(localStorage.getItem('simon-best') || '0', 10) || 0; } catch (e) { best = 0; }
    $('simon-says-game-best').textContent = best;
  }

  function beep(i, dur) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = FREQS[i];
      g.gain.setValueAtTime(0.25, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + (dur || 0.3));
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + (dur || 0.3));
    } catch (e) { /* audio optional */ }
  }

  function flash(i, dur) {
    var p = pad(i);
    p.style.opacity = '1';
    p.style.transform = 'scale(1.05)';
    beep(i, dur);
    setTimeout(function () { p.style.opacity = '.55'; p.style.transform = 'scale(1)'; }, (dur || 0.35) * 1000);
  }

  function playSeq() {
    accepting = false;
    $('simon-says-game-msg').textContent = 'Watch…';
    var speed = Math.max(220, 520 - seq.length * 18);
    var i = 0;
    (function step() {
      if (i >= seq.length) {
        pos = 0;
        accepting = true;
        $('simon-says-game-msg').textContent = 'Your turn — repeat the sequence.';
        return;
      }
      flash(seq[i], 0.32);
      i++;
      setTimeout(step, speed);
    })();
  }

  function start() {
    seq = [];
    pos = 0;
    playing = true;
    nextRound();
  }

  function nextRound() {
    seq.push(Math.floor(Math.random() * 4));
    $('simon-says-game-level').textContent = seq.length;
    setTimeout(playSeq, 500);
  }

  function press(i) {
    if (!accepting || !playing) return;
    flash(i, 0.22);
    if (i !== seq[pos]) { gameOver(); return; }
    pos++;
    if (pos === seq.length) {
      accepting = false;
      $('simon-says-game-msg').textContent = 'Correct! Get ready…';
      if (seq.length > best) {
        best = seq.length;
        try { localStorage.setItem('simon-best', String(best)); } catch (e) {}
        $('simon-says-game-best').textContent = best;
      }
      setTimeout(nextRound, 800);
    }
  }

  function gameOver() {
    playing = false;
    accepting = false;
    $('simon-says-game-msg').textContent = 'Wrong! You reached level ' + seq.length + '. Press Start to try again.';
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 140;
      g.gain.setValueAtTime(0.2, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.5);
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + 0.5);
    } catch (e) {}
    for (var i = 0; i < 4; i++) flash(i, 0.15);
  }

  try {
    loadBest();
    TN.on('simon-says-game-start', 'click', start);
    for (var k = 0; k < 4; k++) {
      (function (i) { pad(i).addEventListener('click', function () { press(i); }); })(k);
    }
  } catch (e) { /* never throw on load */ }
})();
