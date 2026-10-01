/* Piano Keyboard — two-octave playable piano, mouse + computer keyboard, WebAudio synthesis. */
(function () {
  'use strict';
  var SLUG = 'piano-keyboard';
  var ctx = null;

  // Two octaves C4..B5. midi numbers 60..83.
  var NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var KEYMAP = {
    a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, y: 68, h: 69, u: 70, j: 71, k: 72,
    o: 73, l: 74, p: 75, ';': 76, "'": 77
  };

  function AC() { return window.AudioContext || window.webkitAudioContext; }
  function volume() {
    var el = TN.el(SLUG + '-vol');
    return el ? (parseFloat(el.value) || 0) / 100 : 0.7;
  }
  function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function noteName(m) { return NOTES[m % 12] + (Math.floor(m / 12) - 1); }

  function ensureCtx() {
    var Ctor = AC();
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    if (ctx.resume) ctx.resume();
    return ctx;
  }

  function play(midi) {
    if (!ensureCtx()) { TN.setErr(SLUG + '-error', 'Your browser does not support Web Audio.'); return; }
    TN.clearErr(SLUG + '-error');
    var t = ctx.currentTime;
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = midiToFreq(midi);
    o2.type = 'sine'; o2.frequency.value = midiToFreq(midi) * 2;
    var g2 = ctx.createGain(); g2.gain.value = 0.25;
    var peak = 0.6 * volume();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(ctx.destination);
    o.start(t); o2.start(t);
    o.stop(t + 1.5); o2.stop(t + 1.5);
  }

  function buildKeys() {
    var wrap = TN.el(SLUG + '-keys');
    if (!wrap) return;
    var whiteW = 46, blackW = 30, H = 180;
    var whites = [];
    for (var m = 60; m <= 83; m++) {
      if (NOTES[m % 12].indexOf('#') === -1) whites.push(m);
    }
    wrap.style.width = (whites.length * whiteW) + 'px';
    var wi = 0, keyByMidi = {};
    whites.forEach(function (m) {
      var k = document.createElement('div');
      k.style.cssText = 'position:absolute;left:' + (wi * whiteW) + 'px;top:0;width:' + (whiteW - 2) + 'px;height:' + H + 'px;background:#fff;border:1px solid #999;border-radius:0 0 6px 6px;cursor:pointer;box-sizing:border-box';
      var lab = document.createElement('div');
      lab.textContent = noteName(m);
      lab.style.cssText = 'position:absolute;bottom:6px;width:100%;text-align:center;font-size:10px;color:#666';
      k.appendChild(lab);
      k.addEventListener('mousedown', function () { play(m); flash(k); });
      wrap.appendChild(k);
      keyByMidi[m] = k;
      wi++;
    });
    wi = 0;
    for (var m2 = 60; m2 <= 83; m2++) {
      var nm = NOTES[m2 % 12];
      if (nm.indexOf('#') === -1) { wi++; continue; }
      var b = document.createElement('div');
      b.style.cssText = 'position:absolute;left:' + (wi * whiteW - blackW / 2) + 'px;top:0;width:' + blackW + 'px;height:' + (H * 0.62) + 'px;background:#111;border-radius:0 0 5px 5px;cursor:pointer;z-index:2;box-sizing:border-box';
      b.title = noteName(m2);
      (function (kk, mm) {
        kk.addEventListener('mousedown', function () { play(mm); flash(kk); });
      })(b, m2);
      wrap.appendChild(b);
    }
    function flash(k) {
      var old = k.style.background;
      k.style.background = '#fbbf24';
      setTimeout(function () { k.style.background = old; }, 120);
    }
    document.addEventListener('keydown', function (e) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      var m3 = KEYMAP[e.key.toLowerCase()];
      if (m3 !== undefined) { play(m3); var kk = keyByMidi[m3]; if (kk) flash(kk); }
    });
  }

  buildKeys();
  TN.on(SLUG + '-vol', 'input', function () {
    var el = TN.el(SLUG + '-vol'), v = TN.el(SLUG + '-vol-val');
    if (el && v) v.textContent = el.value;
  });
})();
