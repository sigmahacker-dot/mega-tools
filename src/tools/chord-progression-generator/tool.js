/* Chord Progression Generator — progressions by key/mood with WebAudio chord playback. */
(function () {
  'use strict';
  var SLUG = 'chord-progression-generator';
  var ERR = SLUG + '-error';

  var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var QUALITY_IV = {
    maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6],
    maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10], dom7: [0, 4, 7, 10], sus4: [0, 5, 7]
  };
  var QUALITY_SUF = { maj: '', min: 'm', dim: 'dim', maj7: 'maj7', min7: 'm7', dom7: '7', sus4: 'sus4' };
  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  // chords: {r: semitones above key root, q: quality}
  var MOODS = {
    happy: [
      { name: 'Pop classic', chords: [{ r: 0, q: 'maj' }, { r: 7, q: 'maj' }, { r: 9, q: 'min' }, { r: 5, q: 'maj' }], num: 'I – V – vi – IV' },
      { name: 'Sunshine', chords: [{ r: 0, q: 'maj' }, { r: 5, q: 'maj' }, { r: 7, q: 'maj' }, { r: 5, q: 'maj' }], num: 'I – IV – V – IV' },
      { name: 'Uplift', chords: [{ r: 9, q: 'min' }, { r: 5, q: 'maj' }, { r: 0, q: 'maj' }, { r: 7, q: 'maj' }], num: 'vi – IV – I – V' }
    ],
    sad: [
      { name: 'Heartbreak', chords: [{ r: 9, q: 'min' }, { r: 5, q: 'maj' }, { r: 0, q: 'maj' }, { r: 7, q: 'maj' }], num: 'vi – IV – I – V' },
      { name: 'Minor lament', chords: [{ r: 0, q: 'min' }, { r: 8, q: 'maj' }, { r: 3, q: 'maj' }, { r: 10, q: 'maj' }], num: 'i – ♭VI – ♭III – ♭VII' },
      { name: 'Rainy day', chords: [{ r: 0, q: 'min' }, { r: 5, q: 'min' }, { r: 8, q: 'maj' }, { r: 7, q: 'min' }], num: 'i – iv – ♭VI – v' }
    ],
    epic: [
      { name: 'Anthem', chords: [{ r: 0, q: 'min' }, { r: 8, q: 'maj' }, { r: 3, q: 'maj' }, { r: 10, q: 'maj' }], num: 'i – ♭VI – ♭III – ♭VII' },
      { name: 'Rise', chords: [{ r: 8, q: 'maj' }, { r: 10, q: 'maj' }, { r: 0, q: 'min' }, { r: 0, q: 'min' }], num: '♭VI – ♭VII – i – i' },
      { name: 'Heroic major', chords: [{ r: 0, q: 'maj' }, { r: 7, q: 'maj' }, { r: 9, q: 'min' }, { r: 7, q: 'maj' }], num: 'I – V – vi – V' }
    ],
    chill: [
      { name: 'Lo-fi', chords: [{ r: 0, q: 'maj7' }, { r: 9, q: 'min7' }, { r: 5, q: 'maj7' }, { r: 7, q: 'dom7' }], num: 'Imaj7 – vi7 – IVmaj7 – V7' },
      { name: 'Drift', chords: [{ r: 2, q: 'min7' }, { r: 7, q: 'dom7' }, { r: 0, q: 'maj7' }, { r: 9, q: 'min7' }], num: 'ii7 – V7 – Imaj7 – vi7' },
      { name: 'Mellow', chords: [{ r: 0, q: 'maj' }, { r: 9, q: 'min' }, { r: 2, q: 'min' }, { r: 5, q: 'maj' }], num: 'I – vi – ii – IV' }
    ],
    jazzy: [
      { name: 'ii–V–I', chords: [{ r: 2, q: 'min7' }, { r: 7, q: 'dom7' }, { r: 0, q: 'maj7' }, { r: 0, q: 'maj7' }], num: 'ii7 – V7 – Imaj7' },
      { name: 'Turnaround', chords: [{ r: 0, q: 'maj7' }, { r: 9, q: 'min7' }, { r: 2, q: 'min7' }, { r: 7, q: 'dom7' }], num: 'Imaj7 – vi7 – ii7 – V7' },
      { name: 'Minor swing', chords: [{ r: 0, q: 'min7' }, { r: 2, q: 'dim' }, { r: 7, q: 'dom7' }, { r: 0, q: 'min7' }], num: 'i7 – ii° – V7 – i7' }
    ],
    dark: [
      { name: 'Phrygian', chords: [{ r: 0, q: 'min' }, { r: 1, q: 'maj' }, { r: 0, q: 'min' }, { r: 10, q: 'maj' }], num: 'i – ♭II – i – ♭VII' },
      { name: 'Ominous', chords: [{ r: 0, q: 'min' }, { r: 8, q: 'maj' }, { r: 10, q: 'maj' }, { r: 8, q: 'maj' }], num: 'i – ♭VI – ♭VII – ♭VI' },
      { name: 'Tension', chords: [{ r: 0, q: 'dim' }, { r: 0, q: 'min' }, { r: 1, q: 'maj' }, { r: 0, q: 'min' }], num: 'i° – i – ♭II – i' }
    ]
  };

  var actx = null, stopFlag = false;
  function AC() { return window.AudioContext || window.webkitAudioContext; }
  function ctx() {
    if (!actx) {
      var Ctor = AC();
      if (!Ctor) { TN.setErr(ERR, 'Your browser does not support Web Audio.'); return null; }
      actx = new Ctor();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function playChord(midis, t0, dur) {
    var c = ctx();
    if (!c) return;
    midis.forEach(function (m) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle';
      o.frequency.value = hz(m);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.28, t0 + 0.04);
      g.gain.setValueAtTime(0.28, t0 + dur - 0.15);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t0); o.stop(t0 + dur + 0.05);
    });
  }

  function currentChords() {
    var key = parseInt(document.getElementById(SLUG + '-key').value, 10) || 0;
    var mood = document.getElementById(SLUG + '-mood').value;
    var pi = parseInt(document.getElementById(SLUG + '-pattern').value, 10) || 0;
    var pat = (MOODS[mood] || MOODS.happy)[pi] || MOODS.happy[0];
    return pat.chords.map(function (ch) {
      var rootPc = (key + ch.r) % 12;
      var midis = QUALITY_IV[ch.q].map(function (iv) { return 48 + ch.r + iv; });
      return {
        name: NAMES[rootPc] + QUALITY_SUF[ch.q],
        midis: midis, num: pat.num
      };
    });
  }

  function render() {
    TN.clearErr(ERR);
    var wrap = document.getElementById(SLUG + '-chords');
    var num = document.getElementById(SLUG + '-numerals');
    if (!wrap) return;
    wrap.innerHTML = '';
    var chords = currentChords();
    chords.forEach(function (ch) {
      var b = document.createElement('button');
      b.className = 'btn btn-outline';
      b.style.cssText = 'font-size:20px;font-weight:bold;padding:12px 18px;';
      b.textContent = '♪ ' + ch.name;
      b.title = 'Play ' + ch.name;
      b.onclick = function () {
        var c = ctx(); if (!c) return;
        playChord(ch.midis, c.currentTime + 0.03, 1.4);
      };
      wrap.appendChild(b);
    });
    if (num) num.textContent = 'Roman numerals: ' + chords[0].num + '   ·   Key of ' + NAMES[parseInt(document.getElementById(SLUG + '-key').value, 10) || 0];
  }

  function refreshPatterns() {
    var mood = document.getElementById(SLUG + '-mood').value;
    var sel = document.getElementById(SLUG + '-pattern');
    sel.innerHTML = '';
    (MOODS[mood] || []).forEach(function (p, i) {
      var o = document.createElement('option');
      o.value = i; o.textContent = p.name + '  (' + p.num + ')';
      sel.appendChild(o);
    });
    render();
  }

  try {
    if (!document.getElementById(SLUG + '-key')) return;
    var keySel = document.getElementById(SLUG + '-key');
    NAMES.forEach(function (n, i) {
      var o = document.createElement('option');
      o.value = i; o.textContent = n;
      keySel.appendChild(o);
    });
    keySel.value = '0';
    refreshPatterns();
    TN.on(SLUG + '-key', 'change', render);
    TN.on(SLUG + '-mood', 'change', refreshPatterns);
    TN.on(SLUG + '-pattern', 'change', render);
    TN.on(SLUG + '-stop', 'click', function () { stopFlag = true; });
    TN.on(SLUG + '-playall', 'click', function () {
      TN.clearErr(ERR);
      var c = ctx(); if (!c) return;
      stopFlag = false;
      var chords = currentChords();
      var t = c.currentTime + 0.05;
      chords.forEach(function (ch, i) {
        setTimeout(function () {
          if (!stopFlag) playChord(ch.midis, ctx().currentTime + 0.03, 1.1);
        }, i * 1050);
      });
      void t;
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
