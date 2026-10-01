/* Interval Trainer — WebAudio ear training with score and streak. */
(function () {
  'use strict';
  var SLUG = 'interval-trainer';
  var ERR = SLUG + '-error';

  var INTERVALS = [
    { n: 'Minor 2nd', s: 1 }, { n: 'Major 2nd', s: 2 },
    { n: 'Minor 3rd', s: 3 }, { n: 'Major 3rd', s: 4 },
    { n: 'Perfect 4th', s: 5 }, { n: 'Tritone', s: 6 },
    { n: 'Perfect 5th', s: 7 }, { n: 'Minor 6th', s: 8 },
    { n: 'Major 6th', s: 9 }, { n: 'Minor 7th', s: 10 },
    { n: 'Major 7th', s: 11 }, { n: 'Octave', s: 12 }
  ];

  var actx = null;
  var cur = null; // {semi, baseMidi}
  var correct = 0, total = 0, streak = 0, best = 0;
  var answered = true;

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

  function midiHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function playNote(midi, t0, dur) {
    var c = ctx();
    if (!c) return;
    var o1 = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
    o1.type = 'sine'; o2.type = 'triangle';
    o1.frequency.value = midiHz(midi);
    o2.frequency.value = midiHz(midi);
    var g2 = c.createGain(); g2.gain.value = 0.25;
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.03);
    g.gain.setValueAtTime(0.5, t0 + dur - 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o1.start(t0); o2.start(t0);
    o1.stop(t0 + dur + 0.05); o2.stop(t0 + dur + 0.05);
  }

  function playInterval() {
    if (!cur) return;
    var c = ctx();
    if (!c) return;
    var t = c.currentTime + 0.05;
    playNote(cur.base, t, 0.65);
    playNote(cur.base + cur.semi, t + 0.75, 0.8);
  }

  function updateStats() {
    document.getElementById(SLUG + '-score').textContent = correct + ' / ' + total;
    document.getElementById(SLUG + '-streak').textContent = streak;
    document.getElementById(SLUG + '-best').textContent = best;
  }

  function newRound() {
    TN.clearErr(ERR);
    var iv = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
    var base = 48 + Math.floor(Math.random() * 20); // C3..~G4
    cur = { semi: iv.s, base: base, name: iv.n };
    answered = false;
    document.getElementById(SLUG + '-status').textContent = 'Listen… which interval is it?';
    playInterval();
  }

  function guess(semi, name, btn) {
    if (!cur || answered) return;
    answered = true;
    total++;
    var st = document.getElementById(SLUG + '-status');
    if (semi === cur.semi) {
      correct++; streak++;
      if (streak > best) { best = streak; try { localStorage.setItem('tn-' + SLUG + '-best', String(best)); } catch (e) {} }
      st.textContent = '✓ Correct! That was a ' + cur.name + '.';
      st.style.color = '#166534';
    } else {
      streak = 0;
      st.textContent = '✗ Not quite — that was a ' + cur.name + '. You guessed ' + name + '.';
      st.style.color = '#b91c1c';
      if (btn) { btn.style.borderColor = '#b91c1c'; setTimeout(function () { btn.style.borderColor = ''; }, 900); }
    }
    updateStats();
  }

  try {
    if (!document.getElementById(SLUG + '-new')) return;
    try { best = parseInt(localStorage.getItem('tn-' + SLUG + '-best'), 10) || 0; } catch (e) {}
    var wrap = document.getElementById(SLUG + '-buttons');
    INTERVALS.forEach(function (iv) {
      var b = document.createElement('button');
      b.className = 'btn btn-outline';
      b.textContent = iv.n;
      b.style.marginBottom = '8px';
      b.onclick = function () { guess(iv.s, iv.n, b); };
      wrap.appendChild(b);
    });
    updateStats();
    TN.on(SLUG + '-new', 'click', newRound);
    TN.on(SLUG + '-replay', 'click', function () {
      if (!cur) { TN.setErr(ERR, 'Start a round first.'); return; }
      playInterval();
    });
    TN.on(SLUG + '-reset', 'click', function () {
      correct = 0; total = 0; streak = 0;
      document.getElementById(SLUG + '-status').textContent = 'Score reset. Press "New round" to begin.';
      document.getElementById(SLUG + '-status').style.color = '';
      updateStats();
    });
  } catch (e) {
    TN.setErr(ERR, 'This tool could not start: ' + (e && e.message || e));
  }
})();
