/* Drum Machine — synthesized kick/snare/hat/clap, 16-step sequencer, BPM control. */
(function () {
  'use strict';
  var SLUG = 'drum-machine';
  var STEPS = 16;
  var ROWS = [
    { name: 'Kick', short: 'K' },
    { name: 'Snare', short: 'S' },
    { name: 'Hat', short: 'H' },
    { name: 'Clap', short: 'C' }
  ];
  var pattern = [];
  var playing = false, ctx = null, timer = null, step = 0, nextTime = 0;

  function AC() { return window.AudioContext || window.webkitAudioContext; }
  function bpm() {
    var el = TN.el(SLUG + '-bpm');
    return el ? parseFloat(el.value) || 120 : 120;
  }

  function ensureCtx() {
    var Ctor = AC();
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    if (ctx.resume) ctx.resume();
    return ctx;
  }

  function noiseBuffer() {
    var len = ctx.sampleRate * 1;
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  var sharedNoise = null;

  function envGain(t, peak, decay) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + decay);
    return g;
  }

  function kick(t) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.3);
  }
  function snare(t) {
    var o = ctx.createOscillator(), og = envGain(t, 0.5, 0.12);
    o.type = 'triangle'; o.frequency.setValueAtTime(190, t);
    o.connect(og); og.connect(ctx.destination);
    o.start(t); o.stop(t + 0.14);
    var n = ctx.createBufferSource();
    n.buffer = sharedNoise;
    var f = ctx.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 1800;
    var ng = envGain(t, 0.6, 0.18);
    n.connect(f); f.connect(ng); ng.connect(ctx.destination);
    n.start(t, Math.random()); n.stop(t + 0.2);
  }
  function hat(t) {
    var n = ctx.createBufferSource();
    n.buffer = sharedNoise;
    var f = ctx.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 7000;
    var g = envGain(t, 0.35, 0.06);
    n.connect(f); f.connect(g); g.connect(ctx.destination);
    n.start(t, Math.random()); n.stop(t + 0.08);
  }
  function clap(t) {
    for (var k = 0; k < 3; k++) {
      var n = ctx.createBufferSource();
      n.buffer = sharedNoise;
      var f = ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 1.4;
      var tt = t + k * 0.018;
      var g = envGain(tt, 0.5, 0.09);
      n.connect(f); f.connect(g); g.connect(ctx.destination);
      n.start(tt, Math.random()); n.stop(tt + 0.12);
    }
  }
  var PLAYERS = [kick, snare, hat, clap];

  function playStep(s, t) {
    for (var r = 0; r < ROWS.length; r++) {
      if (pattern[r][s]) PLAYERS[r](t);
    }
  }

  function schedule() {
    var stepDur = 60 / bpm() / 4;
    while (nextTime < ctx.currentTime + 0.12) {
      playStep(step, nextTime);
      highlight(step);
      nextTime += stepDur;
      step = (step + 1) % STEPS;
    }
  }

  function start() {
    if (!ensureCtx()) { TN.setErr(SLUG + '-error', 'Your browser does not support Web Audio.'); return; }
    TN.clearErr(SLUG + '-error');
    sharedNoise = sharedNoise || noiseBuffer();
    playing = true;
    step = 0;
    nextTime = ctx.currentTime + 0.06;
    timer = setInterval(schedule, 30);
    var btn = TN.el(SLUG + '-play');
    if (btn) btn.textContent = '⏹ Stop';
  }
  function stop() {
    playing = false;
    if (timer) { clearInterval(timer); timer = null; }
    highlight(-1);
    var btn = TN.el(SLUG + '-play');
    if (btn) btn.textContent = '▶ Play';
  }

  function highlight(s) {
    var grid = TN.el(SLUG + '-grid');
    if (!grid) return;
    var cells = grid.querySelectorAll('[data-step]');
    for (var i = 0; i < cells.length; i++) {
      cells[i].style.boxShadow = (parseInt(cells[i].getAttribute('data-step'), 10) === s) ? '0 0 0 2px #ef4444' : 'none';
    }
  }

  function buildGrid() {
    var grid = TN.el(SLUG + '-grid');
    if (!grid) return;
    pattern = [];
    grid.innerHTML = '';
    for (var r = 0; r < ROWS.length; r++) {
      pattern.push(new Array(STEPS).fill(false));
      var label = document.createElement('div');
      label.textContent = ROWS[r].name;
      label.style.cssText = 'font-size:12px;text-align:right;padding-right:6px;color:#a1a1aa';
      grid.appendChild(label);
      for (var s = 0; s < STEPS; s++) {
        (function (rr, ss) {
          var b = document.createElement('button');
          b.className = 'btn';
          b.style.cssText = 'padding:0;height:34px;min-width:0;background:' + (ss % 4 === 0 ? '#1c1c22' : '#141419');
          b.setAttribute('data-step', ss);
          b.setAttribute('aria-label', ROWS[rr].name + ' step ' + (ss + 1));
          b.addEventListener('click', function () {
            pattern[rr][ss] = !pattern[rr][ss];
            b.style.background = pattern[rr][ss] ? '#ef4444' : (ss % 4 === 0 ? '#1c1c22' : '#141419');
          });
          grid.appendChild(b);
        })(r, s);
      }
    }
    // default beat: four-on-floor kick, snare on 5 & 13, hats offbeat
    pattern[0][0] = pattern[0][4] = pattern[0][8] = pattern[0][12] = true;
    pattern[1][4] = pattern[1][12] = true;
    for (var hh = 2; hh < STEPS; hh += 4) pattern[2][hh] = true;
    var cells = grid.querySelectorAll('[data-step]');
    for (var rr2 = 0; rr2 < ROWS.length; rr2++) {
      for (var ss2 = 0; ss2 < STEPS; ss2++) {
        if (pattern[rr2][ss2]) {
          var cell = cells[rr2 * STEPS + ss2];
          if (cell) cell.style.background = '#ef4444';
        }
      }
    }
  }

  buildGrid();
  TN.on(SLUG + '-bpm', 'input', function () {
    var el = TN.el(SLUG + '-bpm'), v = TN.el(SLUG + '-bpm-val');
    if (el && v) v.textContent = el.value;
  });
  TN.on(SLUG + '-play', 'click', function () { playing ? stop() : start(); });
  TN.on(SLUG + '-clear', 'click', function () {
    for (var r = 0; r < ROWS.length; r++) pattern[r] = new Array(STEPS).fill(false);
    var grid = TN.el(SLUG + '-grid');
    var cells = grid ? grid.querySelectorAll('[data-step]') : [];
    for (var i = 0; i < cells.length; i++) {
      var ss = parseInt(cells[i].getAttribute('data-step'), 10);
      cells[i].style.background = (ss % 4 === 0 ? '#1c1c22' : '#141419');
    }
  });
})();
