/* Chord Finder — root + type to notes, synthesized playback with WebAudio. */
(function () {
  'use strict';
  var SLUG = 'chord-finder';
  var ctx = null;
  var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var INTERVALS = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    '7': [0, 4, 7, 10],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    sus4: [0, 5, 7]
  };
  var TYPE_NAMES = {
    major: '', minor: 'm', '7': '7', maj7: 'maj7', min7: 'm7', dim: 'dim', aug: 'aug', sus4: 'sus4'
  };

  function AC() { return window.AudioContext || window.webkitAudioContext; }

  function root() {
    var el = TN.el(SLUG + '-root');
    return el ? el.selectedIndex : 0;
  }
  function type() {
    var el = TN.el(SLUG + '-type');
    return el ? el.value : 'major';
  }

  function update() {
    var r = root(), t = type();
    var iv = INTERVALS[t] || INTERVALS.major;
    var notes = iv.map(function (i) { return NAMES[(r + i) % 12]; });
    var nameEl = TN.el(SLUG + '-name'), notesEl = TN.el(SLUG + '-notes');
    if (nameEl) nameEl.textContent = NAMES[r] + (TYPE_NAMES[t] || '');
    if (notesEl) notesEl.textContent = notes.join(' – ');
  }

  function play() {
    var Ctor = AC();
    if (!Ctor) { TN.setErr(SLUG + '-error', 'Your browser does not support Web Audio.'); return; }
    TN.clearErr(SLUG + '-error');
    if (!ctx) ctx = new Ctor();
    if (ctx.resume) ctx.resume();
    var r = root(), t = type();
    var iv = INTERVALS[t] || INTERVALS.major;
    var now = ctx.currentTime;
    var base = 48 + r; // C3-ish octave
    iv.forEach(function (semi) {
      var midi = base + semi;
      var freq = 440 * Math.pow(2, (midi - 69) / 12);
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.35, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 1.9);
    });
  }

  update();
  TN.on(SLUG + '-root', 'change', update);
  TN.on(SLUG + '-type', 'change', update);
  TN.on(SLUG + '-play', 'click', play);
})();
