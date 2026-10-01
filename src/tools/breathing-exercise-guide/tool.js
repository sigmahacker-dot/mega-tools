/* Breathing exercise guide: animated pacer circle, phase labels, cycle counter. */
(function () {
  'use strict';
  var SLUG = 'breathing-exercise-guide';
  function $(id) { return document.getElementById(id); }
  var PATTERNS = {
    '478': [['Inhale', 4, 1], ['Hold', 7, 1], ['Exhale', 8, 0]],
    'box': [['Inhale', 4, 1], ['Hold', 4, 1], ['Exhale', 4, 0], ['Hold', 4, 0]],
    'energize': [['Inhale', 4, 1], ['Hold', 2, 1], ['Exhale', 6, 0]]
  };
  var timer = null, queue = [], qi = 0, left = 0, cycle = 0, totalCycles = 4, done = false;
  function circleSize(big) {
    var c = $(SLUG + '-circle');
    c.style.width = big ? '200px' : '110px';
    c.style.height = big ? '200px' : '110px';
  }
  function render() {
    var ph = queue[qi];
    $(SLUG + '-phase').textContent = ph[0] + '… ' + left + 's';
    $(SLUG + '-count').textContent = 'Cycle ' + Math.min(cycle + 1, totalCycles) + ' / ' + totalCycles;
    circleSize(ph[2] === 1);
  }
  function stopAll(msg) {
    if (timer) { clearInterval(timer); timer = null; }
    done = true;
    if (msg) {
      $(SLUG + '-phase').textContent = msg;
      $(SLUG + '-count').textContent = '';
    }
  }
  function tick() {
    if (done) return;
    left--;
    if (left <= 0) {
      qi++;
      if (qi >= queue.length) {
        cycle++;
        if (cycle >= totalCycles) { stopAll('🎉 Complete — notice how you feel.'); circleSize(false); return; }
        qi = 0;
      }
      left = queue[qi][1];
    }
    render();
  }
  function start() {
    stopAll();
    done = false;
    totalCycles = parseInt($(SLUG + '-cycles').value, 10);
    if (isNaN(totalCycles) || totalCycles < 1 || totalCycles > 30) {
      $(SLUG + '-error').textContent = 'Enter 1–30 cycles.';
      return;
    }
    $(SLUG + '-error').textContent = '';
    queue = PATTERNS[$(SLUG + '-pattern').value] || PATTERNS['478'];
    qi = 0; cycle = 0; left = queue[0][1];
    render();
    timer = setInterval(tick, 1000);
  }
  try {
    $(SLUG + '-start').addEventListener('click', start);
    $(SLUG + '-stop').addEventListener('click', function () { stopAll('Stopped. Press Start to begin again.'); circleSize(false); });
    $(SLUG + '-pattern').addEventListener('change', function () { stopAll('Ready'); circleSize(false); });
  } catch (e) { /* never throw on load */ }
})();
