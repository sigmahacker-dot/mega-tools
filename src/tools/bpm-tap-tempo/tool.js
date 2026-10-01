/* BPM Tap Tempo — live BPM from tap intervals, space bar supported. */
(function () {
  'use strict';
  var SLUG = 'bpm-tap-tempo';
  var MAX_TAPS = 16;
  var RESET_MS = 3000;
  var taps = [];

  function $(id) { return document.getElementById(id); }

  function tap() {
    var now = performance.now();
    if (taps.length && now - taps[taps.length - 1] > RESET_MS) taps = [];
    taps.push(now);
    if (taps.length > MAX_TAPS) taps.shift();
    update();
    // pulse animation
    var b = $('bpm-tap-tempo-tap');
    b.style.transform = 'scale(0.97)';
    setTimeout(function () { b.style.transform = 'scale(1)'; }, 80);
  }

  function update() {
    $('bpm-tap-tempo-count').textContent = taps.length;
    if (taps.length < 2) {
      $('bpm-tap-tempo-bpm').textContent = '–';
      $('bpm-tap-tempo-avg').textContent = '–';
      $('bpm-tap-tempo-range').textContent = '–';
      return;
    }
    var intervals = [];
    for (var i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);
    var sum = intervals.reduce(function (a, b) { return a + b; }, 0);
    var avg = sum / intervals.length;
    var bpm = 60000 / avg;
    $('bpm-tap-tempo-bpm').textContent = Math.round(bpm);
    $('bpm-tap-tempo-avg').textContent = Math.round(avg) + ' ms';
    var bpms = intervals.map(function (ms) { return 60000 / ms; });
    var lo = Math.min.apply(null, bpms), hi = Math.max.apply(null, bpms);
    $('bpm-tap-tempo-range').textContent = Math.round(lo) + '–' + Math.round(hi);
  }

  function reset() {
    taps = [];
    update();
  }

  try {
    TN.on('bpm-tap-tempo-tap', 'click', tap);
    TN.on('bpm-tap-tempo-reset', 'click', reset);
    document.addEventListener('keydown', function (e) {
      if (e.code === 'Space' && !$('bpm-tap-tempo-tap').offsetParent) return;
      if (e.code === 'Space') {
        var board = $('bpm-tap-tempo-tap');
        if (board && board.offsetParent && document.activeElement !== board) {
          e.preventDefault();
          tap();
        }
      }
    });
  } catch (e) { /* never throw on load */ }
})();
