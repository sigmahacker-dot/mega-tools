/* Pitch Pipe — chromatic reference tones via WebAudio. */
(function () {
  'use strict';
  var SLUG = 'pitch-pipe-tool';
  var ERR = SLUG + '-error';
  var NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var actx = null, osc = null, gain = null, currentNote = '';

  function $(id) { return document.getElementById(id); }

  function freqFor(name, oct) {
    // oct: 0=C3 base, 1=C4, 2=C5
    var base = 48 + oct * 12; // MIDI for C of octave
    var midi = base + NOTES.indexOf(name);
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function ctx() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { TN.setErr(ERR, 'Web Audio is not supported in this browser.'); return null; }
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  function stop() {
    if (osc) {
      try {
        gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.15);
        osc.stop(actx.currentTime + 0.2);
      } catch (e) {}
      osc = null; gain = null;
    }
    currentNote = '';
    $('pitch-pipe-tool-now').textContent = '';
  }

  function play(name) {
    var c = ctx();
    if (!c) return;
    stop();
    var oct = parseInt($('pitch-pipe-tool-oct').value, 10) || 1;
    var f = freqFor(name, oct);
    osc = c.createOscillator();
    gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.4, c.currentTime + 0.03);
    osc.connect(gain); gain.connect(c.destination);
    osc.start();
    currentNote = name + (3 + oct);
    $('pitch-pipe-tool-now').textContent = '♪ Playing ' + currentNote + ' — ' + f.toFixed(2) + ' Hz';
    TN.clearErr(ERR);
  }

  function build() {
    var wrap = $('pitch-pipe-tool-notes');
    wrap.innerHTML = '';
    NOTES.forEach(function (n) {
      var b = document.createElement('button');
      b.className = 'btn' + (n.indexOf('#') >= 0 ? ' btn-outline' : '');
      b.style.cssText = 'padding:16px 0;font-size:18px;font-weight:700' + (n.indexOf('#') < 0 ? ';background:#212121;color:#fff;border:none' : '');
      b.textContent = n;
      b.addEventListener('click', function () { play(n); });
      wrap.appendChild(b);
    });
  }

  try {
    build();
    TN.on('pitch-pipe-tool-oct', 'change', function () { if (currentNote) { /* keep silent until next tap */ } });
    TN.on('pitch-pipe-tool-stop', 'click', stop);
  } catch (e) { /* never throw on load */ }
})();
